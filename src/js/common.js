// ---------------------

// 🔹 GNB
function initGnb() {
  const menuItems = document.querySelectorAll('.gnb-list > li')

  menuItems.forEach((menuItem, index) => {
    const link = menuItem.querySelector('.gnb-link')
    const submenu = menuItem.querySelector('.gnb-submenu-wrap')
    if (!submenu || !link) return

    const submenuId = `gnb-submenu-${index}`
    submenu.id = submenuId

    // 접근성 속성
    link.setAttribute('aria-haspopup', 'true')
    //link.setAttribute('aria-expanded', 'false') 웹접근성 2026-01-27 : 삭제
    link.setAttribute('aria-controls', submenuId)
    submenu.setAttribute('aria-hidden', 'true')

    // 인터랙션
    const open = () => {
      menuItem.classList.add('active')
      //link.setAttribute('aria-expanded', 'true') 웹접근성 2026-01-27 : 삭제
      submenu.style.maxHeight = submenu.scrollHeight + 'px'
      submenu.style.opacity = '1'
      submenu.style.pointerEvents = 'auto'
      submenu.setAttribute('aria-hidden', 'false')
    }

    const close = () => {
      menuItem.classList.remove('active')
      //link.setAttribute('aria-expanded', 'false') 웹접근성 2026-01-27 : 삭제
      submenu.style.maxHeight = '0px'
      submenu.style.opacity = '0'
      submenu.style.pointerEvents = 'none'
      submenu.setAttribute('aria-hidden', 'true')
    }

    menuItem.addEventListener('mouseenter', open)
    menuItem.addEventListener('mouseleave', close)
    menuItem.addEventListener('focusin', open)
    menuItem.addEventListener('focusout', (e) => {
      if (!menuItem.contains(e.relatedTarget)) close()
    })

    // hover
    const depth2List = submenu.querySelectorAll('.gnb-depth2-list > li')
    depth2List.forEach((tile) => {
      const panel = tile.querySelector('.gnb-depth3-list')
      if (!panel) return

      panel.addEventListener('mouseenter', () => {
        tile.classList.add('is-hover')
      })
      panel.addEventListener('mouseleave', () => {
        tile.classList.remove('is-hover')
      })

      panel.addEventListener('focusin', () => {
        tile.classList.add('is-hover')
      })
      panel.addEventListener('focusout', (e) => {
        if (!panel.contains(e.relatedTarget)) {
          tile.classList.remove('is-hover')
        }
      })
    })
  })
}
// ---------------------
// 🔹 GNB Mobile
function initMobileGnb() {
  const btn = document.querySelector('.btn-gnb-toggle')
  const modal = document.getElementById('mobile-menu')
  const closeBtn = document.querySelector('.modal-btn-close')

  if (!btn || !modal) return

  // 접근성 속성
  if (!btn.hasAttribute('aria-controls')) btn.setAttribute('aria-controls', 'mobile-menu')
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')

  const lockScroll = (on) => {
    document.documentElement.style.overflow = on ? 'hidden' : ''
    document.body.style.overflow = on ? 'hidden' : ''
  }

  const openMenu = () => {
    btn.style.display = 'none'
    closeBtn.style.display = 'block'
    modal.hidden = false
    modal.setAttribute('aria-hidden', 'false')
    btn.setAttribute('aria-expanded', 'true')
    modal.classList.add('open')
    lockScroll(true)
  }

  const closeMenu = () => {
    modal.classList.remove('open')
    btn.setAttribute('aria-expanded', 'false')
    btn.style.display = 'block'
    modal.setAttribute('aria-hidden', 'true')
    closeBtn.style.display = 'none'
    const end = () => {
      modal.hidden = true
      modal.removeEventListener('transitionend', end)
    }
    if (getComputedStyle(modal).transitionDuration !== '0s') {
      modal.addEventListener('transitionend', end, { once: true })
    } else {
      end()
    }
    lockScroll(false)
  }

  const toggleMenu = () => (modal.hidden ? openMenu() : closeMenu())

  btn.addEventListener('click', toggleMenu)
  closeBtn?.addEventListener('click', closeMenu)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeMenu()
  })
}
// ---------------------
function initMobileGnbTabsAccordion() {
  const mobList = document.querySelectorAll('.mobile-depth1-list > li')
  const mobLink = document.querySelectorAll('.mobile-depth1-list > li > a')
  const mobDepth2List = document.querySelectorAll('.mobile-depth2-list > li')
  const mobDepth2Link = document.querySelectorAll('.mobile-depth2-list > li > a')
  const mobDepth3List = document.querySelectorAll('.mobile-depth3-list > li')

  // 2025-12-19 : 추가
  // 공통: 선택 상태 초기화
  /* 웹접근성 2026-01-27 : 삭제
  const clearSelected = (links) => {
    links.forEach((a) => {
      a.setAttribute('aria-selected', 'false')
      a.removeAttribute('aria-current')
    })
  } */

  // 공통: depth2 li가 닫힐 때(= on 제거) 해당 a/자식까지 선택 상태 해제
  const clearDepth2BranchSelection = (depth2Li) => {
    // depth2 자신의 a
    const a = depth2Li.querySelector(':scope > a')
    if (a) {
      a.setAttribute('aria-selected', 'false')
      a.removeAttribute('aria-current')
    }

    // (선택사항) depth3 안에서 혹시 aria-current 등을 쓰고 있다면 같이 해제
    depth2Li.querySelectorAll('.mobile-depth3-list a[aria-current], .mobile-depth3-list a[aria-selected]')
      .forEach((el) => {
        el.setAttribute('aria-selected', 'false')
        el.removeAttribute('aria-current')
      })
  }

  // 탭 : 2025-12-19 수정
  mobLink.forEach((link) => {
    link.addEventListener('click', (e) => {
      const li = link.closest('li')
      const panel = li.querySelector('.mobile-depth2-list')
      if (panel) e.preventDefault()

      mobList.forEach((item) => item.classList.remove('is-open'))
      li.classList.add('is-open')

      clearSelected(mobLink)
      link.setAttribute('aria-selected', 'true')
      link.setAttribute('aria-current', 'page')

      // 2025-12-19 추가 : (선택사항) depth1 전환 시, 다른 depth1들의 depth2 열림/선택 상태도 정리
      mobList.forEach((item) => {
        if (item === li) return
        item.querySelectorAll('.mobile-depth2-list > li.on').forEach((d2li) => {
          d2li.classList.remove('on')
          clearDepth2BranchSelection(d2li)
        })
      })
    })
  })

  // depth2 아코디언 : 2025-12-19 수정
  mobDepth2Link.forEach((link) => {
    link.addEventListener('click', (e) => {
      const li = link.closest('li')
      const panel = li.querySelector('.mobile-depth3-list')
      const depth1Li = link.closest('.mobile-depth1-list > li') // ✅ 같은 depth1 범위
      if (!depth1Li) return

      // depth3가 있으면 아코디언 토글
      if (panel) {
        e.preventDefault()

        const willOpen = !li.classList.contains('on')
        li.classList.toggle('on', willOpen)

        if (willOpen) {
          // 열릴 때: depth2들 선택상태 초기화 후, 현재만 true
          clearSelected(mobDepth2Link)
          link.setAttribute('aria-selected', 'true')
          link.setAttribute('aria-current', 'page')
        } else {
          // ✅ 닫힐 때: on 제거 + aria도 같이 해제
          clearDepth2BranchSelection(li)
        }

        return
      }

      // depth3 없는 일반 링크면: 선택 표시만 (기존 로직 유지)
      clearSelected(mobDepth2Link)
      link.setAttribute('aria-selected', 'true')
      link.setAttribute('aria-current', 'page')
    })
  })
}
// 🔹 Tab
function initTabs() {
  // 메인 탭 (메인 / 메인+서브탭)
  const mainTabLists = document.querySelectorAll(
    '[role="tablist"][data-tab-level="main"], [role="tablist"]:not([data-tab-level])',
  )
  mainTabLists.forEach((tabList) => {
    const tabBtns = tabList.querySelectorAll('[role="tab"]')
    initMainTabGroup(tabBtns)
    const activeIndex = getActiveIndex(tabBtns)
    afterMainActivated(tabBtns, activeIndex)
  })

  // ✅ 독립 서브탭(또는 메인패널 안 서브탭) - "진짜 tab 패턴"으로 초기화
  const subTabLists = document.querySelectorAll('[data-tab-level="sub"]')
  subTabLists.forEach((subList) => {
    const subBtns = subList.querySelectorAll('button[aria-controls]')
    initSubTabGroup(subList, subBtns)
  })
}

/* ===== 메인 탭 (표준 a11y 유지) ===== */
function initMainTabGroup(tabBtns) {
  if (!tabBtns.length) return
  activateMainTab(tabBtns, getActiveIndex(tabBtns))

  tabBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      activateMainTab(tabBtns, index)
      afterMainActivated(tabBtns, index)
    })
    btn.addEventListener('keydown', (e) => {
      handleMainTabKeydown(e, tabBtns, index)
    })
  })
}

function activateMainTab(tabBtns, activeIndex) {
  tabBtns.forEach((btn, i) => {
    const panelId = btn.getAttribute('aria-controls')
    const panel = document.getElementById(panelId)
    const isActive = i === activeIndex

    btn.setAttribute('aria-selected', isActive)
    btn.setAttribute('tabindex', isActive ? '0' : '-1')
    btn.classList.toggle('is-active', isActive)

    if (panel) {
      panel.hidden = !isActive
      panel.toggleAttribute('inert', !isActive) // 포커스 배제
      //panel.setAttribute('aria-hidden', !isActive ? 'true' : 'false') // 메인은 그대로 둠 /  웹접근성 2026-01-06 : hidden과 중복이라 삭제
    }
  })
}

function handleMainTabKeydown(e, tabBtns, currentIndex) {
  let targetIndex = currentIndex
  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault()
      targetIndex = (currentIndex + 1) % tabBtns.length
      break
    case 'ArrowLeft':
      e.preventDefault()
      targetIndex = (currentIndex - 1 + tabBtns.length) % tabBtns.length
      break
    case 'Home':
      e.preventDefault()
      targetIndex = 0
      break
    case 'End':
      e.preventDefault()
      targetIndex = tabBtns.length - 1
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      activateMainTab(tabBtns, currentIndex)
      afterMainActivated(tabBtns, currentIndex)
      return
    default:
      return
  }
  tabBtns[targetIndex].focus()
  activateMainTab(tabBtns, targetIndex)
  afterMainActivated(tabBtns, targetIndex)
}
// 메인 활성화 후: 해당 패널 안의 서브탭만 초기화/표시
function afterMainActivated(tabBtns, activeIndex) {
  const activeBtn = tabBtns[activeIndex]
  const activePanelId = activeBtn && activeBtn.getAttribute('aria-controls')
  const activePanel = document.getElementById(activePanelId)
  if (!activePanel) return

  // 탭 전환후 애니메이션 재실행
  //initScrollAnimation({}, activePanel)

  // 현재 메인패널 내부 서브탭들을 "tab 패턴"으로 보장 초기화
  const subLists = activePanel.querySelectorAll('[data-tab-level="sub"]')
  subLists.forEach((subList) => {
    const subBtns = subList.querySelectorAll('button[aria-controls]')
    if (!subList.__ready) {
      initSubTabGroup(subList, subBtns)
      subList.__ready = true
    }
    ensureSubHasActive(subBtns)
  })

  // 형제 패널들 안의 서브패널은 숨김
  const siblings = activePanel.parentElement ? [...activePanel.parentElement.children] : []
  siblings.forEach((panel) => {
    if (panel === activePanel) return
    panel.querySelectorAll('[data-tab-level="sub"]').forEach((subList) => {
      const subBtns = subList.querySelectorAll('[role="button"][aria-controls]')
      subBtns.forEach((btn) => {
        const pid = btn.getAttribute('aria-controls')
        const pel = document.getElementById(pid)
        if (pel) {
          pel.hidden = true
          pel.toggleAttribute('inert', true) // 포커스 차단
        }
      })
    })
  })
}
/* ===== 서브 탭 (접근성 패턴 제거: 필터 버튼처럼 단순 토글) ===== */
function initSubTabGroup(subList, subBtns) {
  if (!subBtns.length) return

  // 1️⃣ 접근성 속성 세팅
  subList.setAttribute('role', 'tablist')

  subBtns.forEach((btn) => {
    btn.setAttribute('role', 'tab')
    btn.setAttribute('type', btn.getAttribute('type') || 'button')
  })

  // 2️⃣ 초기 활성 상태 설정
  const activeIndex = getActiveIndex(subBtns)
  activateSubTab(subBtns, activeIndex)

  // 3️⃣ 이벤트 등록
  subBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      activateSubTab(subBtns, index)
    })
    btn.addEventListener('keydown', (e) => {
      handleSubTabKeydown(e, subBtns, index)
    })
  })
}

function activateSubTab(subBtns, activeIndex) {
  subBtns.forEach((btn, i) => {
    const panelId = btn.getAttribute('aria-controls')
    const panel = document.getElementById(panelId)
    const isActive = i === activeIndex

     // ✅ [ADD] roving tabindex + aria-selected
    btn.setAttribute('aria-selected', String(isActive))
    btn.setAttribute('tabindex', isActive ? '0' : '-1')
    btn.classList.toggle('is-active', isActive)

    if (panel) {
      panel.hidden = !isActive
      panel.toggleAttribute('inert', !isActive)
    }
  })
}

function handleSubTabKeydown(e, subBtns, currentIndex) {
  let targetIndex = currentIndex
  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault()
      targetIndex = (currentIndex + 1) % subBtns.length
      break
    case 'ArrowLeft':
      e.preventDefault()
      targetIndex = (currentIndex - 1 + subBtns.length) % subBtns.length
      break
    case 'Home':
      e.preventDefault()
      targetIndex = 0
      break
    case 'End':
      e.preventDefault()
      targetIndex = subBtns.length - 1
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      activateSubTab(subBtns, currentIndex)
      return
    default:
      return
  }
  subBtns[targetIndex].focus()
  activateSubTab(subBtns, targetIndex)
}

/* ===== 유틸 ===== */

function getActiveIndex(btns) {
  const idx = [...btns].findIndex((b) => b.classList.contains('is-active'))
  return idx >= 0 ? idx : 0
}

function ensureSubHasActive(btns) {
  if (!btns.length) return
  const any = [...btns].some((b) => b.classList.contains('is-active'))
  if (!any) activateSubTab(btns, 0)
}
// ---------------------
// 🔹 LNB
function initLnb() {
  const lnbList = document.querySelectorAll('.lnb-list > li')
  const lnbLink = document.querySelectorAll('.lnb-list > li > a')
  const lnbDepthList = document.querySelectorAll('.lnb-depth2-list > li')
  const lnbDepthLinks = document.querySelectorAll('.lnb-depth2-list > li > a')

  lnbLink.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      // 모든 li에서 클래스 제거
      lnbList.forEach((li) => {
        li.classList.remove('is-active')
        li.querySelector('a').removeAttribute('aria-current')
      })
      lnbDepthList.forEach((li) => {
        li.classList.remove('is-active')
        li.classList.remove('on')
      })
      // 현재 li에만 is-active 추가 + aria-current
      const parentLi = link.closest('li')
      parentLi.classList.add('is-active')
      link.setAttribute('aria-current', 'page') // 스크린리더에 현재 위치 표시

      // depth2 list 클래스 추가
      const depthLi = parentLi.querySelector('.lnb-depth2-list > li')
      if (depthLi) {
        depthLi.classList.add('on')
      }
    })
    // depth2 list a 클릭이벤트
    lnbDepthLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        // 모든 li에서 클래스 제거
        lnbDepthList.forEach((li) => {
          li.classList.remove('on')
          li.querySelector('a')?.removeAttribute('aria-current')
        })
        // 현재 li에만 is-active 추가 + aria-current
        const parentLi = link.closest('li')
        parentLi.classList.add('on')
        link.setAttribute('aria-current', 'page')
      })
    })
  })
}
// ---------------------
// 🔹 SELECT
function initSelect() {
  const selectBoxes = document.querySelectorAll('.select-box')
  const selectBtns = document.querySelectorAll('.select-box .select-btn')
  const selectLists = document.querySelectorAll('.select-box .select-list')
  // 모든 select 닫기 함수
  function closeAllSelects() {
    selectBtns.forEach((btn) => {
      btn.classList.remove('is-open')
      btn.setAttribute('aria-expanded', 'false')
    })
    selectLists.forEach((list) => {
      list.classList.remove('is-open')
      list.hidden = true
    })
  }

  // 바깥클릭시 리스트 닫기
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.select-box')) {
      closeAllSelects()
    }
  })

  // ESC 키로 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    // 열려있는 셀렉트 트리거(버튼) 먼저 잡고
    const openBtn = document.querySelector('.select-box .select-btn.is-open')
    // 닫기
    closeAllSelects()
    // 열려있던 게 있으면 포커스 복귀
    if (openBtn) openBtn.focus()
  })

  selectBoxes.forEach((box, i) => {
    const btn = box.querySelector('.select-btn')
    const list = box.querySelector('.select-list')

    // ✅ [ADD] 구조 없는 select-box는 스킵
    if (!btn || !list) return
    const btnSpan = btn.querySelector('span')
    const options = list.querySelectorAll('button')

    // 버튼-리스트 연결
    //if (!btn.id) btn.id = `select-trigger-${i + 1}`웹접근성 2026-01-27: 삭제
    //if (!list.id) list.id = `select-list-${i + 1}`웹접근성 2026-01-27: 삭제
    //btn.setAttribute('aria-controls', list.id)웹접근성 2026-01-27: 삭제
    //list.setAttribute('role', 'listbox') 웹접근성 2026-01-06 : 삭제
    //list.setAttribute('aria-labelledby', btn.id) 웹접근성 2026-01-27: 삭제
    //list.tabIndex = -1  웹접근성 2026-01-06 : 삭제
    list.hidden = true

    btn.setAttribute('aria-expanded', 'false')

    // 초기 옵션 상태
    /*  웹접근성 2026-01-27 : 삭제
    options.forEach((option, idx) => {
      const optEl = option.closest('[role="option"]') || option
      if (!optEl.hasAttribute('role')) optEl.setAttribute('role', 'option')
      optEl.setAttribute('aria-selected', idx === 0 ? 'true' : 'false')
    }) */

    // 버튼-리스트 연결 (접근성 최소 요건만)
    if (!list.id) {
      list.id = `select-list-${i + 1}`
    }
    btn.setAttribute('aria-controls', list.id)

    //
    {
      btnSpan.textContent = btnSpan.textContent.trim()
    }

    // 버튼 클릭
    btn.addEventListener('click', (e) => {
      e.stopPropagation() // ✅ 열자마자 닫히는 문제 방지
      const isOpen = btn.classList.contains('is-open')
      closeAllSelects()

      if (!isOpen) {
        btn.classList.add('is-open')
        btn.setAttribute('aria-expanded', 'true')
        list.classList.add('is-open')
        list.hidden = false

        // ✅ list에 포커스 주고 싶을 때만
        /* if (!list.hasAttribute('tabindex')) list.tabIndex = -1
        list.focus()웹접근성 2026-01-27 : 삭제 */

        // ✅ 열리면 ul이 아니라 "첫 옵션 버튼"으로 포커스 이동
        // 2026-02-26 : 오류 수정
        const firstOptionBtn = list.querySelector('button:not([disabled])')
          if (firstOptionBtn) firstOptionBtn.focus()
        }
    })

    // 리스트 클릭
    options.forEach((option) => {
      option.addEventListener('click', (e) => {
        e.stopPropagation()
        // 선택한 값 버튼에
        const value = option.textContent.trim()
        if (value && btnSpan) {
          btnSpan.textContent = value
        }

        //const allOptions = list.querySelectorAll('[role="option"]') 웹접근성 2026-01-27 : 삭제
        //allOptions.forEach((opt) => opt.setAttribute('aria-selected', 'false')) 웹접근성 2026-01-27: 삭제
        //const clickedOpt = option.closest('[role="option"]') || option 웹접근성 2026-01-27: 삭제
        //clickedOpt.setAttribute('aria-selected', 'true') 웹접근성 2026-01-27: 삭제

        btn.classList.remove('is-open')
        btn.setAttribute('aria-expanded', 'false')
        list.classList.remove('is-open')
        list.hidden = true
        btn.focus()
      })
    })
  })
}

// ---------------------
// 🔹 Accordion
function initAccordion() {
  const accBtns = document.querySelectorAll('.acc-list .acc-btn')

  accBtns.forEach((btn) => {
    const panelId = btn.getAttribute('aria-controls')
    const panel = document.getElementById(panelId) // panel Id

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true'

      // 토글 상태 반영
      btn.setAttribute('aria-expanded', String(!isOpen))
      btn.classList.toggle('is-open', !isOpen)
      panel.classList.toggle('is-open', !isOpen)

      // 패널 보여주기/숨기기
      if (isOpen) {
        // 닫기
        panel.style.maxHeight = panel.scrollHeight + 'px' // 초기 높이 설정
        requestAnimationFrame(() => {
          panel.style.maxHeight = '0'
        })
      } else {
        // 열기
        panel.removeAttribute('hidden')
        panel.style.maxHeight = panel.scrollHeight + 'px'
      }

      // transition 끝나고 hidden 처리
      panel.addEventListener(
        'transitionend',
        () => {
          if (!panel.classList.contains('is-open')) {
            panel.setAttribute('hidden', '')
          }
        },
        { once: true },
      )
    })
  })
}
// ---------------------
// 🔹 FooterMenu
function initFooterMenu() {
  const footer = document.querySelector('#footer')
  if (!footer) return

  const trigger = footer.querySelector('.select-btn')
  const menu = footer.querySelector('.select-list')
  if (!trigger || !menu) return

  const items = Array.from(menu.querySelectorAll('[role="menuitem"]'))
  if (items.length === 0) return

  let open = false
  let active = 0

  const setRovingTabindex = (idx) => {
    items.forEach((el, i) => (el.tabIndex = i === idx ? 0 : -1))
  }

  const openMenu = () => {
    open = true
    trigger.setAttribute('aria-expanded', 'true')
    menu.hidden = false
    setRovingTabindex(active)
    // 포커스 이동 시 스크롤 방지
    items[active].focus({ preventScroll: true })
  }

  const closeMenu = () => {
    open = false
    trigger.setAttribute('aria-expanded', 'false')
    menu.hidden = true
    // 트리거로 포커스 되돌릴 때도 스크롤 방지
    trigger.focus({ preventScroll: true })
  }

  // 트리거: 클릭/키보드
  trigger.addEventListener('click', (e) => {
    e.preventDefault()
    open ? closeMenu() : openMenu()
  })

  trigger.addEventListener('keydown', (e) => {
    const k = e.key
    if (k === 'Enter' || k === ' ') {
      e.preventDefault()
      open ? closeMenu() : openMenu()
    } else if ((k === 'ArrowDown' || k === 'ArrowUp') && !open) {
      e.preventDefault()
      active = 0
      openMenu()
    }
  })

  // 메뉴 내부에서만 키보드 네비게이션 처리 (문서 전역 X)
  menu.addEventListener('keydown', (e) => {
    if (!open) return
    const k = e.key
    const max = items.length - 1

    if (k === 'ArrowDown') {
      e.preventDefault()
      active = active >= max ? 0 : active + 1
      setRovingTabindex(active)
      items[active].focus({ preventScroll: true })
    } else if (k === 'ArrowUp') {
      e.preventDefault()
      active = active <= 0 ? max : active - 1
      setRovingTabindex(active)
      items[active].focus({ preventScroll: true })
    } else if (k === 'Home') {
      e.preventDefault()
      active = 0
      setRovingTabindex(active)
      items[active].focus({ preventScroll: true })
    } else if (k === 'End') {
      e.preventDefault()
      active = max
      setRovingTabindex(active)
      items[active].focus({ preventScroll: true })
    } else if (k === 'Escape') {
      e.preventDefault()
      closeMenu()
    } else if (k === 'Tab') {
      // 탭으로 메뉴 벗어날 때 닫기
      closeMenu()
    } else if (k === ' ') {
      // 스페이스 기본 스크롤 방지
      e.preventDefault()
      // 필요하면 여기서 선택 확정 로직 실행
    }
  })

  // 메뉴 아이템 클릭 시 닫기 + 기본동작(링크 # 이동) 방지
  items.forEach((item, idx) => {
    item.addEventListener('click', (e) => {
      // a[href="#"] 같은 경우 기본 이동 막기
      if (item.tagName === 'A' && (item.getAttribute('href') || '#') === '#') {
        e.preventDefault()
      }
      active = idx
      closeMenu()
    })
  })

  // 외부 클릭 시 닫기 (푸터 범위 기준)
  document.addEventListener(
    'click',
    (e) => {
      if (!open) return
      if (!footer.contains(e.target)) closeMenu()
    },
    { capture: true },
  )
}

// ---------------------
// 🔹 FooterModal
function initFooterModal() {
  const modal = document.getElementById('footerPop')
  if (!modal) return

  const dialog = modal.querySelector('.modal-dialog')
  const closeBtn = modal.querySelector('.modal-btn-close')
  const triggers = document.querySelectorAll('a[href="#footerPop"], [data-target="#footerPop"]')

  let lastFocused = null

  // 접근 가능한 포커스 요소 수집
  const getFocusable = () => {
    const focusableElements = modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    )

    return Array.from(focusableElements).filter((el) => {
      return modal.contains(el) && el.offsetParent !== null && !el.disabled && el.tabIndex !== -1
    })
  }
  // 열기
  const open = (e) => {
    if (e) e.preventDefault()
    lastFocused = document.activeElement

    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-hidden', 'false')

    modal.hidden = false
    document.body.style.overflow = 'hidden'
    // 닫기버튼으로 포커스 이동
    if (closeBtn) {
      closeBtn.focus()
    } else {
      // 닫기버튼이 없으면 첫 번째 포커스 가능한 요소로
      const focusables = getFocusable()
      if (focusables.length > 0) {
        focusables[0].focus()
      } else {
        dialog.focus()
      }
    }

    // 키보드 핸들러 부착
    modal.addEventListener('keydown', onKeyDown)
  }

  // 닫기
  const close = () => {
    modal.hidden = true
    modal.setAttribute('aria-hidden', 'true')

    modal.removeEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'auto'
    // 열기 전 포커스로 복귀
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus()
    }
  }

  // 키보드 제어: ESC 닫기 + 포커스 트랩
  // 강력한 포커스 트랩 - 모달 내부에서만 순환
  const onKeyDown = (ev) => {
    if (ev.key === 'Escape') {
      ev.preventDefault()
      close()
      return
    }

    if (ev.key === 'Tab') {
      // 모달 내부의 포커스 가능한 요소들만 수집
      const focusables = getFocusable()

      // 포커스 가능한 요소가 없으면 닫기버튼에 고정
      if (focusables.length === 0) {
        ev.preventDefault()
        if (closeBtn) closeBtn.focus()
        return
      }

      // 포커스 가능한 요소가 1개면 그 자리에 고정
      if (focusables.length === 1) {
        ev.preventDefault()
        focusables[0].focus()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const current = document.activeElement

      // 현재 포커스가 모달 밖에 있으면 첫 번째 요소로
      if (!modal.contains(current)) {
        ev.preventDefault()
        first.focus()
        return
      }

      if (ev.shiftKey) {
        // Shift + Tab: 역순 이동
        if (current === first) {
          ev.preventDefault()
          last.focus()
        }
      } else {
        // Tab: 순차 이동
        if (current === last) {
          ev.preventDefault()
          first.focus()
        }
      }
    }
  }

  // 트리거 연결
  triggers.forEach((t) => t.addEventListener('click', open))

  // 닫기 버튼
  if (closeBtn) closeBtn.addEventListener('click', close)

  // 배경(오버레이) 클릭 닫기 — dialog 바깥 클릭만
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close()
  })

  return { open, close }
}
// ---------------------
// 🔹 AllMenu
function initAllMenu() {
  const btn = document.querySelector('.btn-total-menu')
  const modal = document.getElementById('allMenuPop')
  const mq = window.matchMedia('(max-width: 1200px)')
  if (!btn || !modal) return

  const closeBtn = modal.querySelector('.all-menu-close')
  let lastFocused = null

  // 접근성 속성 초기화
  btn.setAttribute('aria-expanded', 'false')
  btn.setAttribute('aria-controls', 'allMenuPop')
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')

  // 이벤트 핸들러 함수들 먼저 정의
  function handleEsc(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      closeMenu()
    }
  }

  function handleBackdrop(e) {
    if (e.target === modal) {
      closeMenu()
    }
  }

  function openMenu() {
    lastFocused = document.activeElement
    modal.setAttribute('aria-hidden', 'false')
    modal.removeAttribute('hidden')
    btn.setAttribute('aria-expanded', 'true')

    document.body.classList.add('scroll-lock')

    const focusTarget = closeBtn || modal
    if (focusTarget) focusTarget.focus()

    // ESC 키 이벤트와 백드롭 닫기 이벤트
    document.addEventListener('keydown', handleEsc)
    modal.addEventListener('mousedown', handleBackdrop)
  }

  function closeMenu() {
    modal.setAttribute('aria-hidden', 'true')
    modal.setAttribute('hidden', '')
    btn.setAttribute('aria-expanded', 'false')

    document.body.classList.remove('scroll-lock')

    // 이벤트 리스너 제거
    document.removeEventListener('keydown', handleEsc)
    modal.removeEventListener('mousedown', handleBackdrop)

    // 포커스 복원
    if (lastFocused) {
      lastFocused.focus()
      lastFocused = null
    }
  }

  // 미디어 쿼리에 따른 상태 적용
  function applyResponsiveState() {
    if (mq.matches) {
      // 모바일: 메뉴가 열려있다면 닫기
      if (btn.getAttribute('aria-expanded') === 'true') {
        closeMenu()
      }
    }
  }

  // 이벤트 리스너 등록
  btn.addEventListener('click', openMenu)

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu)
  }

  // 미디어 쿼리 변경 감지
  mq.addEventListener('change', applyResponsiveState)

  // 초기 상태 적용
  applyResponsiveState()
}
// ---------------------

// 🔹 initScrollTop
function initScrollTop() {
  const btn = document.getElementById('btnTop')
  if (!btn) return

  const toggleVisibility = () => {
    if (window.scrollY > 200) {
      btn.classList.add('is-visible')
    } else {
      btn.classList.remove('is-visible')
    }
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  window.addEventListener('scroll', toggleVisibility)
  toggleVisibility()
}

document.addEventListener('DOMContentLoaded', initScrollTop)


// 🔹 Header Scroll
function initHeaderScroll() {
  const header = document.getElementById('header')
  if (!header) return

  const toggleHeader = () => {
    if (window.scrollY > 0) {
      header.classList.add('is-scroll')
    } else {
      header.classList.remove('is-scroll')
    }
  }

  window.addEventListener('scroll', toggleHeader)
  toggleHeader() // 처음 로드 상태도 체크
}

// ---------------------
// 🔹 공통 초기화 함수
function initCommon() {
  initGnb()
  initMobileGnb()
  initMobileGnbTabsAccordion()
  initTabs()
  initLnb()
  initSelect()
  initAccordion()
  initFooterMenu()
  initFooterModal()
  initAllMenu()
  initScrollTop()
  initHeaderScroll()
}

// ---------------------
// 🔹 자동 실행
document.addEventListener('DOMContentLoaded', initCommon)
// 현재 포커스 이동할 때마다 대상 찍기
/* 포커스
document.addEventListener(
  'focusin',
  (e) => {
    console.log('[FOCUSIN]', e.target)
  },
  true,
) */
