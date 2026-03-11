// datepicker
/*
import flatpickr from 'flatpickr'
import { Korean } from 'flatpickr/dist/l10n/ko.js'
import 'flatpickr/dist/flatpickr.min.css'
// swiper
import Swiper from 'swiper'
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'*/

// 웹접근성 2026-01-27 : 전체적 수정
export function initStationCardInteractions() {
  const selectBtns = Array.from(document.querySelectorAll('.station-select'))
  if (!selectBtns.length) return

  // 현재 열려있는 버튼/리스트 추적
  let openedBtn = null
  let openedList = null

  const setOpen = (btn, list, open, { focusBack = false } = {}) => {
    btn.classList.toggle('is-active', open)
    list.classList.toggle('is-active', open)
    btn.setAttribute('aria-expanded', String(open))
    list.hidden = !open

    if (!open && focusBack) btn.focus({ preventScroll: true })
  }

  const closeOpened = ({ focusBack = false } = {}) => {
    if (openedBtn && openedList) {
      setOpen(openedBtn, openedList, false, { focusBack })
      openedBtn = null
      openedList = null
    }
  }

  // ✅ 전역: 바깥 클릭 시 닫기 (1회만)
  document.addEventListener('click', (e) => {
    const t = e.target
    if (!(t instanceof Node)) return
    if (!openedBtn || !openedList) return

    const inside = openedBtn.contains(t) || openedList.contains(t)
    if (!inside) closeOpened({ focusBack: false })
  })

  // ✅ 전역: ESC로 닫기 (1회만)
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    if (!openedBtn || !openedList) return
    closeOpened({ focusBack: true })
  })

  // 각 셀렉트 초기화
  selectBtns.forEach((btn) => {
    const listId = btn.getAttribute('aria-controls')
    const list = listId ? document.getElementById(listId) : null
    if (!list) return

    // 초기상태 정리
    btn.setAttribute('aria-expanded', String(!list.hidden))

    btn.addEventListener('click', (e) => {
      e.preventDefault()

      // 다른 셀렉트가 열려있으면 닫기 (포커스는 뺏지 않음)
      if (openedBtn && openedBtn !== btn) closeOpened({ focusBack: false })

      const willOpen = list.hidden
      setOpen(btn, list, willOpen)

      if (willOpen) {
        openedBtn = btn
        openedList = list

        // 열리면 첫 옵션으로 포커스(선택사항)
        list.querySelector('button:not([disabled])')?.focus({ preventScroll: true })
      } else {
        openedBtn = null
        openedList = null
      }
    })

    // 옵션 선택
    list.querySelectorAll('ul li button').forEach((item) => {
      item.addEventListener('click', () => {
        // 값 반영(네 마크업에 맞춤)
        const code = item.querySelector('.station-value')?.textContent?.trim()
        const name = item.querySelector('.station-text')?.textContent?.trim()
        btn.querySelector('.station-select-value') && (btn.querySelector('.station-select-value').textContent = code || '')
        btn.querySelector('.station-select-txt') && (btn.querySelector('.station-select-txt').textContent = name || '')

        // 닫고 트리거로 포커스 복귀
        setOpen(btn, list, false, { focusBack: true })
        openedBtn = null
        openedList = null
      })
    })
  })
}


// main swiper (임시)
/*
export function initMainBannerSwiper() {
  const container = document.querySelector('.main-swiper')
  if (!container) return

  // ✅ 재생/정지 버튼(슬라이더 영역 안에 있다고 가정)
  const toggleBtn = container.querySelector('.swiper-autoplay-toggle')

  // ✅ 메인 배너 슬라이드 개수 확인
  const slides = container.querySelectorAll('.swiper-slide')
  const canLoop = slides.length > 1 // 2장 이상일 때만 loop

  const swiper = new Swiper('.main-swiper', {
    // modules: [Navigation, Pagination, Autoplay, A11y], // (필요하면 추가)
    loop: canLoop,
    autoplay: {
      delay: 5000, // 더 긴 지연시간 (읽을 시간 확보)
      // 사용자 조작 시 자동재생 멈추게 하려면 true, 우리가 직접 제어할 거면 false
      disableOnInteraction: false,
    },

    // 접근성 설정
    a11y: {
      enabled: true,
      prevSlideMessage: '이전 슬라이드',
      nextSlideMessage: '다음 슬라이드',
      firstSlideMessage: '첫 번째 슬라이드입니다',
      lastSlideMessage: '마지막 슬라이드입니다',
      paginationBulletMessage: '{{index}}번째 슬라이드로 이동',
    },

    // 키보드 네비게이션
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },

    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  })

  // destroy 함수
  const destroy = () => {
    swiper?.destroy(true, true)
  }

  return {destroy }
}*/

export function initQuickMenuSlide() {
  const panel = document.querySelector('.main-quickmenu-pannel')
  if (!panel) return

  // 이미 초기화되었는지 확인
  if (panel.hasAttribute('data-initialized')) {
    return
  }
  panel.setAttribute('data-initialized', 'true')

  const toggleBtn = panel.querySelector('.main-quickmenu-toggle')
  const nav = panel.querySelector('#mainQuickMenuPanel')   // 웹접근성 2026-01-27 : 추가
  const txt = toggleBtn?.querySelector('.txt-hide') // 웹접근성 2026-01-27 : 추가
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const hasOpened = sessionStorage.getItem('quickMenuOpened') === 'true'

  // 웹접근성 2026-01-27 : 추가
  const syncA11y = (isOpen) => {
    toggleBtn.setAttribute('aria-expanded', String(isOpen))
    if (txt) txt.textContent = isOpen ? '퀵메뉴 닫기' : '퀵메뉴 열기'
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isOpen) {
      // ✅ 먼저 hidden 해제 → 다음 프레임에 열림 클래스 반영되며 애니메이션 시작
      nav.hidden = false
      nav.toggleAttribute('inert', false)

      if (!reduce) {
        requestAnimationFrame(() => {
          // nav가 DOM에 살아있는 상태에서 transition이 걸리게끔 한 프레임 늦춤
          // (panel.is-open 토글은 이미 handleToggle에서 함)
        })
      }
    } else {
      // ✅ 닫힐 때는 애니메이션 후 hidden 처리
      nav.toggleAttribute('inert', true)

      if (reduce) {
        nav.hidden = true
      } else {
        const onEnd = (e) => {
          if (e.propertyName !== 'transform') return
          nav.hidden = true
          nav.removeEventListener('transitionend', onEnd)
        }
        nav.addEventListener('transitionend', onEnd)
      }

      // 닫힐 때 내부 포커스 있으면 토글로 복귀
      if (nav.contains(document.activeElement)) toggleBtn.focus()
    }
  }


  panel.classList.add('is-mounted')

  // 새로고침해도 유지
  if (hasOpened) {
    panel.style.transition = 'none'
    toggleBtn.style.transition = 'none'
    panel.classList.add('is-open')
    toggleBtn?.setAttribute('aria-expanded', 'true')
    syncA11y(true) // 웹접근성 2026-01-27 : 추가

    // 다음 프레임에서 애니메이션 다시 활성화
    requestAnimationFrame(() => {
      panel.classList.add('is-mounted')
      panel.style.transition = ''
    })
  } else {
    panel.classList.add('is-mounted')
    toggleBtn?.setAttribute('aria-expanded', 'false')
    syncA11y(false) // 웹접근성 2026-01-27 : 추가
  }

  let timerId = null

  const openNow = () => {
    panel.classList.add('is-open')
    toggleBtn?.setAttribute('aria-expanded', 'true')
    syncA11y(true) // 웹접근성 2026-01-27 : 추가
    sessionStorage.setItem('quickMenuOpened', 'true')
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  // 0.7초 후 패널 자동열림 (한 번만 실행되도록)
  if (!hasOpened) {
    if (!reduce) {
      requestAnimationFrame(() => {
        timerId = setTimeout(openNow, 700)
      })
    } else {
      panel.style.transition = 'none'
      openNow()
    }
  }

  // 초기 상태 (열림 여부 기준) : 웹접근성 2026-01-27 : 추가
  const initialOpen = panel.classList.contains('is-open')
  syncA11y(initialOpen)

  // 토글 버튼 이벤트 (중복 등록 방지)
  const handleToggle = () => {
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
    const isOpen = panel.classList.toggle('is-open')
    syncA11y(isOpen) // 웹접근성 2026-01-27 : 추가

    // 상태를 세션 스토리지에 저장
    sessionStorage.setItem('quickMenuOpened', String(isOpen))

  }

  // 기존 이벤트 리스너 제거 후 새로 추가
  toggleBtn?.removeEventListener('click', handleToggle)
  toggleBtn?.addEventListener('click', handleToggle)
}
// 입찰건명 select
export function initSelectFilter() {
  const root = document.querySelector('.search-bar.filter')
  if (!root) return

  const fieldBox = root.querySelector('.select-box[data-filter="field"]')
  const bidBox = root.querySelector('.select-box.bid')
  const inputBox = root.querySelector('.input-box')

  if (!fieldBox || !bidBox || !inputBox) return

  const fieldBtnLabel = fieldBox.querySelector('.select-btn span')
  const list = fieldBox.querySelector('.select-list')
  const options = list.querySelectorAll('button')

  // 셀렉트(입찰건명)에서만 토글
  options.forEach((option) => {
    option.addEventListener('click', (e) => {
      e.stopPropagation()
      const btn = e.target.closest('li[role="option"] button')
      if (!btn) return

      const value = btn.textContent.trim()

      // 라벨 동기화
      if (fieldBtnLabel) fieldBtnLabel.textContent = value
      const isBidField = value === '입찰종류'
      bidBox.classList.toggle('is-active', isBidField)
      inputBox.classList.toggle('is-hidden', isBidField)

      fieldBox.setAttribute('aria-expanded', 'false')
    })
  })
}
// email select 선택
export function initSelectEmail() {
  const root = document.querySelector('.email-box')
  if (!root) return

  const EmailBox = root.querySelector('.select-box[data-filter="email"]')
  const emailDomainBox = root.querySelector('#emailDomain')

  if (!EmailBox || !emailDomainBox) return

  const list = EmailBox.querySelector('.select-list')
  const options = list.querySelectorAll('button')

  // email select list 선택시
  /*
  options.forEach((option) => {
    option.addEventListener('click', (e) => {
      e.stopPropagation()
      const btn = e.target.closest('li[role="option"] button')
      if (!btn) return

      const emailValue = btn.textContent.trim()
      emailDomainBox.value = emailValue
    })
  })*/
}
/*
// 날짜 선택
export function initDatePicker(selector, options = {}) {
  // 기본 설정
  const defaultOptions = {
    locale: 'ko',
    dateFormat: 'Y-m-d',
    minDate: new Date().fp_incr(1), // 내일부터 선택 가능
    enableTime: false, // 시간선택
    time_24hr: true,
    mode: 'single', // 단일선택
    inline: false, //  클릭 시 팝업

    onChange: function (selectedDates, dateStr) {
      console.log('선택된 날짜:', dateStr)
    },
  }

  // 옵션 병합 (사용자 옵션이 기본 옵션을 덮어씀)
  const finalOptions = { ...defaultOptions, ...options }

  // Flatpickr 인스턴스 생성 및 반환
  return flatpickr(selector, finalOptions)
}
// datepicker 전역 사용
if (typeof window !== 'undefined') window.initDatePicker = initDatePicker
// datepicker접근성 (임시)
export function initAccessibleDatePicker(selector, options = {}) {
  const accessibleOptions = {
    locale: 'ko',
    dateFormat: 'Y-m-d',
    ariaDateFormat: 'Y년 m월 d일',
    mode: 'single',
    enableTime: false,
    inline: false,

    onReady: function (selectedDates, dateStr, instance) {
      // 접근성 속성 추가
      instance.input.setAttribute('aria-describedby', selector.replace('#', '') + '-help')
      instance.input.setAttribute('aria-label', '날짜 선택')

      // 도움말 텍스트 추가
      const helpText = document.createElement('div')
      helpText.id = selector.replace('#', '') + '-help'
      helpText.className = 'sr-only' // 스크린 리더용
      helpText.textContent = '날짜 형식: 년-월-일, 예시: 2024-03-15'
      instance.input.parentNode.appendChild(helpText)
    },

    ...options,
  }

  return flatpickr(selector, accessibleOptions)
}*/

function initScrollAnimation(customOptions = {}, container = document) {
  const main = document.querySelector('#wrap[data-main]')
  // 1. 기본 옵션
  const defaultOptions = {
    duration: 500,// 2025-12-29 : 900값을 수정
    easing: 'ease',
    once: true,
    offset: 80,
    disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches || false,
    storageKey: 'scrollAnimationPlayed_main', // 실행 기록 저장 key
  }

  const options = { ...defaultOptions, ...customOptions }
  const elements = container.querySelectorAll('[data-animation]')
  const playedIndexes = main ? JSON.parse(sessionStorage.getItem(options.storageKey) || '[]') : [] // 다른 페이지는 항상 빈 배열 (매번 새로 실행)

  // 2. 접근성 또는 비활성화 조건
  if (options.disable) {
    elements.forEach((el) => {
      el.classList.add('animate')
      el.style.transition = 'none'
    })
    return
  }

  // 3. Intersection Observer 설정 (스크롤)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target
          const index = [...elements].indexOf(target)
          const delay = index * 80

          target.style.transition = `
          opacity ${options.duration}ms ${options.easing},
          transform ${options.duration}ms ${options.easing}
        `
          target.style.transitionDelay = `${delay}ms`
          target.classList.add('animate')

          // 메인페이지에서만 실행된 요소 기록 저장
          if (main && !playedIndexes.includes(index)) {
            playedIndexes.push(index)
            sessionStorage.setItem(options.storageKey, JSON.stringify(playedIndexes))
          }

          if (options.once) observer.unobserve(target)
        }
      })
    },
    {
      threshold: 0,
      rootMargin: `0px 0px -${options.offset}px 0px`,
    },
  )

  elements.forEach((el, i) => {
    if (main && playedIndexes.includes(i)) {
      el.classList.add('animate')
      el.style.transition = 'none'
    } else {
      observer.observe(el)
    }
  })
}
// 애니메이션 전역 사용
if (typeof window !== 'undefined') window.initScrollAnimation = initScrollAnimation

// 아코디언 토글
export function initAccordionToggleAll() {
  const toggleAllBtn = document.querySelector('[data-accordion="toggle-all"]')
  const accBtns = document.querySelectorAll('.acc-list .acc-btn')
  if (!toggleAllBtn || !accBtns.length) return

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  // 초기 버튼 접근성 속성
  toggleAllBtn.setAttribute('aria-pressed', 'false')
  toggleAllBtn.setAttribute('aria-expanded', 'false')

  // 패널 초기 트랜지션/오버플로우 셋업(중복 방지용)
  Array.from(accBtns).forEach((btn) => {
    const panelId = btn.getAttribute('aria-controls')
    const panel = document.getElementById(panelId)
    if (!panel) return

    const isOpen = btn.getAttribute('aria-expanded') === 'true'
    panel.style.overflow = 'hidden'
    panel.style.transition = panel.style.transition || 'max-height 300ms ease'
    panel.style.maxHeight = isOpen ? 'none' : '0'
    if (!isOpen) panel.setAttribute('hidden', '')
  })

  const allOpen = () =>
    Array.from(accBtns).every((btn) => btn.getAttribute('aria-expanded') === 'true')

  toggleAllBtn.addEventListener('click', () => {
    const shouldOpen = !allOpen()

    Array.from(accBtns).forEach((btn) => {
      const panelId = btn.getAttribute('aria-controls')
      const panel = document.getElementById(panelId)
      if (!panel) return

      if (shouldOpen) {
        // --- 열기 ---
        btn.setAttribute('aria-expanded', 'true')
        btn.classList.add('is-open')
        panel.classList.add('is-open')
        panel.removeAttribute('hidden')

        if (reduce) {
          panel.style.maxHeight = 'none'
        } else {
          // 높이 애니메이션: scrollHeight → none(자동)
          panel.style.maxHeight = panel.scrollHeight + 'px'
          panel.addEventListener(
            'transitionend',
            () => {
              if (panel.classList.contains('is-open')) {
                panel.style.maxHeight = 'none'
              }
            },
            { once: true },
          )
        }
      } else {
        // --- 닫기 ---
        btn.setAttribute('aria-expanded', 'false')
        btn.classList.remove('is-open')
        panel.classList.remove('is-open')

        if (reduce) {
          panel.style.maxHeight = '0'
          panel.setAttribute('hidden', '')
        } else {
          // auto일 수 있으니 현재 높이로 리셋 후 0으로 수축
          panel.style.maxHeight = panel.scrollHeight + 'px'
          requestAnimationFrame(() => {
            panel.style.maxHeight = '0'
          })
          panel.addEventListener(
            'transitionend',
            () => {
              if (!panel.classList.contains('is-open')) {
                panel.setAttribute('hidden', '')
              }
            },
            { once: true },
          )
        }
      }
    })

    // 전체 버튼 상태 동기화
    toggleAllBtn.setAttribute('aria-pressed', String(shouldOpen))
    toggleAllBtn.setAttribute('aria-expanded', String(shouldOpen))
    toggleAllBtn.classList.toggle('is-open', shouldOpen)

    // 라벨 토글(선택)
    const label = toggleAllBtn.querySelector('span')
    if (label) label.textContent = shouldOpen ? '전체 닫기' : '전체 보기'
  })
}

// 메인 자동 팝업 + Swiper
// 메인 자동 팝업 + Swiper
export function initAutoMainPopupSwiper() {
  const popup = document.querySelector('.main-popup')
  if (!popup) return

  const swiperEl = popup.querySelector('.main-popup-swiper')
  const closeBtn = popup.querySelector('[data-popup="mainPopup-close"]')
  const dim = popup.querySelector('[data-popup="mainPopup-dim"]')
  const hideTodayCheckbox = popup.querySelector('#mainPopup-hide-today')
  const pageRoot = document.getElementById('wrap')
  const toggleBtn = popup.querySelector('.swiper-autoplay-toggle')

  if (!swiperEl) return

  // 오늘 하루 안 보기 체크했는지 확인
  const todayKey = (() => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    return `mainPopupHide_${yyyy}-${mm}-${dd}`
  })()

  if (localStorage.getItem(todayKey) === 'true') {
    return
  }

  // ✅ 슬라이드 개수 확인(실제 슬라이드만)
  const realSlides = Array.from(swiperEl.querySelectorAll('.swiper-slide')).filter(
    (el) => !el.classList.contains('swiper-slide-duplicate'),
  )
  const hasMultipleSlides = realSlides.length > 1

  const swiperOptions = {
    modules: [Navigation, Pagination, Autoplay, A11y],
    slidesPerView: 1,

    autoplay: {
      delay: 3000, // 2026-01-15 : 자동재생으로 변경건
      disableOnInteraction: false, // 토글 버튼으로 제어할 거라 false
      pauseOnMouseEnter: true,
    },

    a11y: {
      enabled: true,
      prevSlideMessage: '이전 팝업',
      nextSlideMessage: '다음 팝업',
      firstSlideMessage: '첫 번째 팝업입니다',
      lastSlideMessage: '마지막 팝업입니다',
      paginationBulletMessage: '{{index}}번째 팝업으로 이동',
    },

    keyboard: {
      enabled: true,
      onlyInViewport: false,
    },

    pagination: {
      el: popup.querySelector('.swiper-pagination'),
      type: 'fraction',
      clickable: true,
    },

    navigation: {
      nextEl: popup.querySelector('.swiper-button-next'),
      prevEl: popup.querySelector('.swiper-button-prev'),
    },
  }

  // ✅ 여러 장일 때만 loop 켬 → 경고 없이 진짜 루프 동작
  if (hasMultipleSlides) {
    swiperOptions.loop = true
  }

  const swiper = new Swiper(swiperEl, swiperOptions)

  // ✅ 슬라이드 1장일 때: 컨트롤은 숨겨도 "탭이 막히지 않게" 트랩은 계속 동작
  if (!hasMultipleSlides) {
    // 원하는 방식대로 wrapper를 통째로 숨기고 싶으면 아래 둘 중 하나만 사용하세요.
    // 1) 컨트롤 영역이 .swiper-ctrl 인 경우:
    popup.querySelector('.swiper-ctrl')?.style.setProperty('display', 'none')
    // 2) 또는 요소별로 숨김:
    // popup.querySelector('.swiper-button-prev')?.setAttribute('hidden', '')
    // popup.querySelector('.swiper-button-next')?.setAttribute('hidden', '')
    // popup.querySelector('.swiper-pagination')?.setAttribute('hidden', '')

    if (toggleBtn) {
      toggleBtn.disabled = true
      toggleBtn.setAttribute('aria-disabled', 'true')
      toggleBtn.setAttribute('aria-label', '팝업 슬라이더가 1개라 자동재생을 사용할 수 없습니다')
    }
  }

  // ✅ 재생/정지 토글 버튼
  if (toggleBtn && hasMultipleSlides) {
    // 2026-01-15 : 자동재생 기본 ON
    toggleBtn.setAttribute('aria-pressed', 'true')
    toggleBtn.textContent = '||'
    toggleBtn.setAttribute('aria-label', '슬라이드 자동재생 정지')

    toggleBtn.addEventListener('click', () => {
      const isPlaying = toggleBtn.getAttribute('aria-pressed') === 'true'
      if (!swiper.autoplay || typeof swiper.autoplay.start !== 'function') return

      if (isPlaying) {
        swiper.autoplay.stop()
        toggleBtn.setAttribute('aria-pressed', 'false')
        toggleBtn.textContent = '▶'
        toggleBtn.setAttribute('aria-label', '슬라이드 자동재생 시작')
      } else {
        swiper.autoplay.start()
        toggleBtn.setAttribute('aria-pressed', 'true')
        toggleBtn.textContent = '||'
        toggleBtn.setAttribute('aria-label', '슬라이드 자동재생 정지')
      }
    })
  }

  let lastFocusedElement = null

  // ✅ "실제로 탭 가능한 요소"만 추출 (display:none/hidden/0rect 제외)
  const getFocusableElements = (root) => {
    const nodes = root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )

    return Array.from(nodes).filter((el) => {
      if (el.hasAttribute('hidden')) return false
      if (el.getAttribute('aria-hidden') === 'true') return false

      const style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden') return false

      // 화면에 실제 박스가 있는지
      return el.getClientRects().length > 0
    })
  }

  // ✅ 트랩은 popup가 아니라 "컨텐츠 루트" 기준으로 잡는 게 안정적
  const popupContent = popup.querySelector('.main-popup-content') || popup

  const trapFocus = (e) => {
    if (e.key !== 'Tab') return

    const focusable = getFocusableElements(popupContent)
    if (!focusable.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      // Shift+Tab: 첫 요소에서 뒤로 가면 마지막으로
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      // Tab: 마지막 요소에서 앞으로 가면 첫 요소로
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      closePopup()
    }
  }

// ✅ 마지막 입력이 키보드/마우스인지 추적 (자동팝업 UX 개선용)
let lastInputWasKeyboard = false
const markKeyboard = () => { lastInputWasKeyboard = true }
const markPointer  = () => { lastInputWasKeyboard = false }

document.addEventListener('keydown', markKeyboard, true)
document.addEventListener('pointerdown', markPointer, true)
document.addEventListener('mousedown', markPointer, true)

  // ✅ 닫힌 뒤 포커스를 보낼 "가장 자연스러운" 타겟 찾기
  const getReturnFocusTarget = () => {
    // 메인페이지 본문 시작은 #main-content
    const main = document.querySelector('#main-content')
    if (main) {
      const focusables = getFocusableElements(main)
      if (focusables.length) return focusables[0]

      // 본문에 포커스 가능한게 없으면 본문 자체로(키보드/스크린리더용)
      main.setAttribute('tabindex', '-1')
      return main
    }

    // 예외 fallback: gnb 첫 요소
    const gnb = document.querySelector('#gnb a[href], #gnb button:not([disabled])')
    if (gnb) return gnb

    // 최후: skiplink
    return document.querySelector('#skipnavi a')
  }

  // ✅ 팝업 닫힌 뒤 "페이지 최초 진입 상태"처럼 만들기 위한 포커스 리셋 지점
  const ensureFocusResetNode = () => {
    let node = document.getElementById('focus-reset')
    if (node) return node

    node = document.createElement('div')
    node.id = 'focus-reset'
    node.setAttribute('tabindex', '-1')

    node.style.position = 'fixed'
    node.style.width = '1px'
    node.style.height = '1px'
    node.style.left = '-9999px'
    node.style.top = '0'
    node.style.overflow = 'hidden'

    // skipnavi 앞에 넣어야 다음 Tab이 skip으로 감
    const skip = document.getElementById('skipnavi')
    if (skip && skip.parentNode) {
      skip.parentNode.insertBefore(node, skip)
    } else {
      document.body.insertBefore(node, document.body.firstChild)
    }

    return node
  }

  // open popup
  const openPopup = () => {
    if (popup.classList.contains('is-open')) return

    lastFocusedElement = document.activeElement

    popup.classList.add('is-open')
    popup.removeAttribute('hidden')
    document.body.classList.add('is-modal-open')

    // ✅ 배경은 aria-hidden(또는 inert) 처리
    if (pageRoot) pageRoot.setAttribute('aria-hidden', 'true')

    // ✅ 첫 포커스: 팝업 내부로 이동
    popupContent.setAttribute('tabindex', '-1')
    popupContent.focus()

    // ✅ 트랩/ESC는 "document"에 걸어도 되고, 기존처럼 popup에 걸어도 됨
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('keydown', trapFocus)

    // ✅ autoplay: 렌더 완료 후 시작(슬라이드 0부터)
    requestAnimationFrame(() => {
      if (swiper?.autoplay) {
        swiper.slideTo(0, 0)
        // 1장일 땐 autoplay 의미 없으니 굳이 시작하지 않음
        if (hasMultipleSlides) swiper.autoplay.start()
      }
    })
  }

  // 팝얻 닫기 후, 포커스
  const getReturnTarget = () => {
    // 1) 스킵 링크(네가 원하는 동작)
    const skip = document.querySelector('#skipnavi a, .skip-link')
    if (skip) return skip

    // 2) 없으면 페이지 내 첫 포커스 가능 요소
    return pageRoot?.querySelector(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
  }

  // 팝업 닫기
  const closePopup = () => {
    if (!popup.classList.contains('is-open')) return

    // ✅ [ADD] 닫기 직전 포커스가 팝업 안에 있었는지(닫기 버튼 클릭 직후 body로 떨어지는 것 방지)
    const activeWasInPopup = popup.contains(document.activeElement)

    // ✅ 배경 먼저 복구
    if (pageRoot) pageRoot.removeAttribute('aria-hidden')

    // ✅ 이벤트 제거/오토플레이 정지(생략 가능)
    if (swiper?.autoplay) swiper.autoplay.stop()
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('keydown', trapFocus)

    /*
    // ✅ (핵심) 닫기 전에/직후에 “명시적 포커스”를 준다
    const target = getReturnTarget()
    target?.focus({ preventScroll: true })*/

    // ✅ 그 다음 팝업 숨김
    popup.classList.remove('is-open')
    popup.setAttribute('hidden', '')
    document.body.classList.remove('is-modal-open')

    // ✅ 페이지 최초 진입 상태로 리셋
    const reset = ensureFocusResetNode()
    reset.focus({ preventScroll: true })
  }

  closeBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    if (hideTodayCheckbox && hideTodayCheckbox.checked) {
      localStorage.setItem(todayKey, 'true')
    }
    closePopup()
  })

  dim?.addEventListener('click', () => {
    if (hideTodayCheckbox && hideTodayCheckbox.checked) {
      localStorage.setItem(todayKey, 'true')
    }
    closePopup()
  })

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    openPopup()
  } else {
    setTimeout(openPopup, 500)
  }

  return { swiper, openPopup, closePopup }
  
}

function initCommon() {
  initStationCardInteractions()
  initQuickMenuSlide()
  initSelectFilter()
  initSelectEmail()
  //initScrollAnimation()
  initAccordionToggleAll()
  // initAutoMainPopupSwiper()메인 페이지 자동 팝업
}

document.addEventListener('DOMContentLoaded', initCommon)
