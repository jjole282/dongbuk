document.addEventListener('DOMContentLoaded', () => {
  (() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ===== Section dots (1~4): 클릭 이동 + 스크롤 활성화 =====
    const dots = Array.from(document.querySelectorAll('.section-dots .dot'))
    const sections = dots
      .map((d) => document.querySelector(d.dataset.target))
      .filter(Boolean)

    function setActive(targetId) {
      dots.forEach((d) => {
        const active = d.dataset.target === targetId
        d.classList.toggle('is-active', active)
        if (active) d.setAttribute('aria-current', 'true')
        else d.removeAttribute('aria-current')
      })
    }

    function moveTo(targetId) {
      const el = document.querySelector(targetId)
      if (!el) return

      const header = document.getElementById('header')
      const headerHeight = header ? header.offsetHeight : 80
      const targetTop = el.getBoundingClientRect().top + window.pageYOffset - headerHeight

      window.scrollTo({
        top: targetTop,
        behavior: reduceMotion ? 'auto' : 'smooth',
      })

      history.pushState(null, '', targetId)

      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
      el.focus({ preventScroll: true })
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault()
        moveTo(dot.dataset.target)
      })
    })

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (!visible) return
        setActive('#' + visible.target.id)
      },
      { threshold: [0.35, 0.55, 0.75] }
    )

    sections.forEach((sec) => io.observe(sec))

    if (location.hash && document.querySelector(location.hash)) {
      setTimeout(() => moveTo(location.hash), 0)
    }

    // ===== mainquick scroll down 버튼 -> s2 =====
    const scrollToS2 = document.getElementById('scrollToS2')
    scrollToS2?.addEventListener('click', (e) => {
      e.preventDefault()
      moveTo('#s2')
    })

    // ===== 역 드롭다운(샘플) =====
    const stationBtn = document.getElementById('stationBtn')
    const stationList = document.getElementById('stationList')

    if (stationBtn && stationList) {
      const open = () => {
        stationBtn.setAttribute('aria-expanded', 'true')
        stationList.hidden = false
        stationList.focus()
      }

      const close = () => {
        stationBtn.setAttribute('aria-expanded', 'false')
        stationList.hidden = true
        stationBtn.focus()
      }

      stationBtn.addEventListener('click', () => {
        const expanded = stationBtn.getAttribute('aria-expanded') === 'true'
        expanded ? close() : open()
      })

      document.addEventListener('keydown', (e) => {
        if (stationList.hidden) return
        if (e.key === 'Escape') {
          e.preventDefault()
          close()
        }
      })

      stationList.addEventListener('click', (e) => {
        const b = e.target.closest('button')
        if (!b) return
        const stationName = stationBtn.querySelector('.station-name')
        if (stationName) stationName.textContent = b.textContent.trim()
        close()
      })
    }

    // ===== 미디어 prev/next =====
    document.getElementById('mediaPrev')?.addEventListener('click', (e) => {
      e.preventDefault()
      moveTo('#s3')
    })

    document.getElementById('mediaNext')?.addEventListener('click', (e) => {
      e.preventDefault()
      moveTo('#s4')
    })
  })()
})