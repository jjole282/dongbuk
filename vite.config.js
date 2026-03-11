import { defineConfig } from 'vite'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import path from 'path'
import fg from 'fast-glob'

const SRC = path.resolve(__dirname, 'src')

function collectEntries() {
  const files = fg.sync(
    [
      'index.html', // 루트 인덱스
      'pages/**/*.html', // 모든 서브 페이지
      '!pages/**/_*.html', // _로 시작하는 파일 제외
    ],
    { cwd: SRC, dot: false },
  )

  const entries = {}
  for (const relRaw of files) {
    const rel = relRaw.replace(/\\/g, '/')
    // key 만들기: dist 출력 경로 결정
    let key
    if (rel === 'index.html') {
      key = 'index' // 루트 index
    } else {
      key = rel
        .replace(/^pages\//, '') // pages/ 제거 → AU/login.html
        .replace(/\.html$/, '') // 확장자 제거
        .replace(/\/index$/, '') // .../index.html → ...
    }
    if (!key) continue
    entries[key] = path.join(SRC, rel) // 절대 경로로 지정
  }

  // 🔑 엔트리가 0개면 undefined 반환 → Vite가 src/index.html 자동 사용
  return Object.keys(entries).length ? entries : undefined
}

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [
    ViteEjsPlugin(),

    // ⭐ HTML에서 링크된 CSS를 모두 제거
    // {
    //   name: 'remove-css-links',
    //   transformIndexHtml(html) {
    //     return html.replace(/<link[^>]+stylesheet[^>]+>/g, '')
    //   },
    // },
  ],

  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: false, // ⭐ JS 한 줄 압축 방지
    cssMinify: false,
    cssCodeSplit: true, // false 절대 쓰지마
    rollupOptions: {
      input: collectEntries(),
      output: {
        assetFileNames: (assetInfo) => {
          const filePath = assetInfo.name || ''

          // ⭐ 오직 style.scss 에서 나온 CSS만 style.css 로 출력
          if (filePath.includes('style.scss') && filePath.endsWith('.css')) {
            return 'assets/css/style.css'
          }

          // ⭐ 그 외 모든 CSS는 쓰레기 폴더로 보내고 실제로 dist에 포함되지 않게 처리
          if (filePath.endsWith('.css')) {
            return 'assets/css/[name][extname]'
          }

          return 'assets/[name].[ext]'
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': SRC,
      '@cmp': path.join(SRC, 'components'),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/scss/common/variable" as *;
          @use "@/scss/common/mixin" as *;
          @use "@/scss/common/color" as *;
        `,
      },
    },
  },
  server: {
    host: true, // or '0.0.0.0'
    port: 5173,
  },
})
