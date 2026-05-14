(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    let allSettled2 = function(promises$2) {
      return Promise.all(promises$2.map((p) => Promise.resolve(p).then((value$1) => ({
        status: "fulfilled",
        value: value$1
      }), (reason) => ({
        status: "rejected",
        reason
      }))));
    };
    var allSettled = allSettled2;
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
    const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
    promise = allSettled2(deps.map((dep) => {
      dep = assetsURL(dep);
      if (dep in seen) return;
      seen[dep] = true;
      const isCss = dep.endsWith(".css");
      const cssSelector = isCss ? '[rel="stylesheet"]' : "";
      if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
      const link = document.createElement("link");
      link.rel = isCss ? "stylesheet" : scriptRel;
      if (!isCss) link.as = "script";
      link.crossOrigin = "";
      link.href = dep;
      if (cspNonce) link.setAttribute("nonce", cspNonce);
      document.head.appendChild(link);
      if (isCss) return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
      });
    }));
  }
  function handlePreloadError(err$2) {
    const e$1 = new Event("vite:preloadError", { cancelable: true });
    e$1.payload = err$2;
    window.dispatchEvent(e$1);
    if (!e$1.defaultPrevented) throw err$2;
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
function initGnb() {
  const menuItems = document.querySelectorAll(".gnb-list > li");
  menuItems.forEach((menuItem, index) => {
    const link = menuItem.querySelector(".gnb-link");
    const submenu = menuItem.querySelector(".gnb-submenu-wrap");
    if (!submenu || !link) return;
    const submenuId = `gnb-submenu-${index}`;
    submenu.id = submenuId;
    link.setAttribute("aria-haspopup", "true");
    link.setAttribute("aria-controls", submenuId);
    submenu.setAttribute("aria-hidden", "true");
    const open = () => {
      menuItem.classList.add("active");
      submenu.style.maxHeight = submenu.scrollHeight + "px";
      submenu.style.opacity = "1";
      submenu.style.pointerEvents = "auto";
      submenu.setAttribute("aria-hidden", "false");
    };
    const close = () => {
      menuItem.classList.remove("active");
      submenu.style.maxHeight = "0px";
      submenu.style.opacity = "0";
      submenu.style.pointerEvents = "none";
      submenu.setAttribute("aria-hidden", "true");
    };
    menuItem.addEventListener("mouseenter", open);
    menuItem.addEventListener("mouseleave", close);
    menuItem.addEventListener("focusin", open);
    menuItem.addEventListener("focusout", (e) => {
      if (!menuItem.contains(e.relatedTarget)) close();
    });
    const depth2List = submenu.querySelectorAll(".gnb-depth2-list > li");
    depth2List.forEach((tile) => {
      const panel = tile.querySelector(".gnb-depth3-list");
      if (!panel) return;
      panel.addEventListener("mouseenter", () => {
        tile.classList.add("is-hover");
      });
      panel.addEventListener("mouseleave", () => {
        tile.classList.remove("is-hover");
      });
      panel.addEventListener("focusin", () => {
        tile.classList.add("is-hover");
      });
      panel.addEventListener("focusout", (e) => {
        if (!panel.contains(e.relatedTarget)) {
          tile.classList.remove("is-hover");
        }
      });
    });
  });
}
function initMobileGnb() {
  const btn = document.querySelector(".btn-gnb-toggle");
  const modal = document.getElementById("mobile-menu");
  const closeBtn = document.querySelector(".modal-btn-close");
  if (!btn || !modal) return;
  if (!btn.hasAttribute("aria-controls")) btn.setAttribute("aria-controls", "mobile-menu");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  const lockScroll = (on) => {
    document.documentElement.style.overflow = on ? "hidden" : "";
    document.body.style.overflow = on ? "hidden" : "";
  };
  const openMenu = () => {
    btn.style.display = "none";
    closeBtn.style.display = "block";
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
    modal.classList.add("open");
    lockScroll(true);
  };
  const closeMenu = () => {
    modal.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    btn.style.display = "block";
    modal.setAttribute("aria-hidden", "true");
    closeBtn.style.display = "none";
    const end = () => {
      modal.hidden = true;
      modal.removeEventListener("transitionend", end);
    };
    if (getComputedStyle(modal).transitionDuration !== "0s") {
      modal.addEventListener("transitionend", end, { once: true });
    } else {
      end();
    }
    lockScroll(false);
  };
  const toggleMenu = () => modal.hidden ? openMenu() : closeMenu();
  btn.addEventListener("click", toggleMenu);
  closeBtn?.addEventListener("click", closeMenu);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeMenu();
  });
}
function initMobileGnbTabsAccordion() {
  const mobList = document.querySelectorAll(".mobile-depth1-list > li");
  const mobLink = document.querySelectorAll(".mobile-depth1-list > li > a");
  document.querySelectorAll(".mobile-depth2-list > li");
  const mobDepth2Link = document.querySelectorAll(".mobile-depth2-list > li > a");
  document.querySelectorAll(".mobile-depth3-list > li");
  const clearDepth2BranchSelection = (depth2Li) => {
    const a = depth2Li.querySelector(":scope > a");
    if (a) {
      a.setAttribute("aria-selected", "false");
      a.removeAttribute("aria-current");
    }
    depth2Li.querySelectorAll(".mobile-depth3-list a[aria-current], .mobile-depth3-list a[aria-selected]").forEach((el) => {
      el.setAttribute("aria-selected", "false");
      el.removeAttribute("aria-current");
    });
  };
  mobLink.forEach((link) => {
    link.addEventListener("click", (e) => {
      const li = link.closest("li");
      const panel = li.querySelector(".mobile-depth2-list");
      if (panel) e.preventDefault();
      mobList.forEach((item) => item.classList.remove("is-open"));
      li.classList.add("is-open");
      clearSelected(mobLink);
      link.setAttribute("aria-selected", "true");
      link.setAttribute("aria-current", "page");
      mobList.forEach((item) => {
        if (item === li) return;
        item.querySelectorAll(".mobile-depth2-list > li.on").forEach((d2li) => {
          d2li.classList.remove("on");
          clearDepth2BranchSelection(d2li);
        });
      });
    });
  });
  mobDepth2Link.forEach((link) => {
    link.addEventListener("click", (e) => {
      const li = link.closest("li");
      const panel = li.querySelector(".mobile-depth3-list");
      const depth1Li = link.closest(".mobile-depth1-list > li");
      if (!depth1Li) return;
      if (panel) {
        e.preventDefault();
        const willOpen = !li.classList.contains("on");
        li.classList.toggle("on", willOpen);
        if (willOpen) {
          clearSelected(mobDepth2Link);
          link.setAttribute("aria-selected", "true");
          link.setAttribute("aria-current", "page");
        } else {
          clearDepth2BranchSelection(li);
        }
        return;
      }
      clearSelected(mobDepth2Link);
      link.setAttribute("aria-selected", "true");
      link.setAttribute("aria-current", "page");
    });
  });
}
function initTabs() {
  const mainTabLists = document.querySelectorAll(
    '[role="tablist"][data-tab-level="main"], [role="tablist"]:not([data-tab-level])'
  );
  mainTabLists.forEach((tabList) => {
    const tabBtns = tabList.querySelectorAll('[role="tab"]');
    initMainTabGroup(tabBtns);
    const activeIndex = getActiveIndex(tabBtns);
    afterMainActivated(tabBtns, activeIndex);
  });
  const subTabLists = document.querySelectorAll('[data-tab-level="sub"]');
  subTabLists.forEach((subList) => {
    const subBtns = subList.querySelectorAll("button[aria-controls]");
    initSubTabGroup(subList, subBtns);
  });
}
function initMainTabGroup(tabBtns) {
  if (!tabBtns.length) return;
  activateMainTab(tabBtns, getActiveIndex(tabBtns));
  tabBtns.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      activateMainTab(tabBtns, index);
      afterMainActivated(tabBtns, index);
    });
    btn.addEventListener("keydown", (e) => {
      handleMainTabKeydown(e, tabBtns, index);
    });
  });
}
function activateMainTab(tabBtns, activeIndex) {
  tabBtns.forEach((btn, i) => {
    const panelId = btn.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);
    const isActive = i === activeIndex;
    btn.setAttribute("aria-selected", isActive);
    btn.setAttribute("tabindex", isActive ? "0" : "-1");
    btn.classList.toggle("is-active", isActive);
    if (panel) {
      panel.hidden = !isActive;
      panel.toggleAttribute("inert", !isActive);
    }
  });
}
function handleMainTabKeydown(e, tabBtns, currentIndex) {
  let targetIndex = currentIndex;
  switch (e.key) {
    case "ArrowRight":
      e.preventDefault();
      targetIndex = (currentIndex + 1) % tabBtns.length;
      break;
    case "ArrowLeft":
      e.preventDefault();
      targetIndex = (currentIndex - 1 + tabBtns.length) % tabBtns.length;
      break;
    case "Home":
      e.preventDefault();
      targetIndex = 0;
      break;
    case "End":
      e.preventDefault();
      targetIndex = tabBtns.length - 1;
      break;
    case "Enter":
    case " ":
      e.preventDefault();
      activateMainTab(tabBtns, currentIndex);
      afterMainActivated(tabBtns, currentIndex);
      return;
    default:
      return;
  }
  tabBtns[targetIndex].focus();
  activateMainTab(tabBtns, targetIndex);
  afterMainActivated(tabBtns, targetIndex);
}
function afterMainActivated(tabBtns, activeIndex) {
  const activeBtn = tabBtns[activeIndex];
  const activePanelId = activeBtn && activeBtn.getAttribute("aria-controls");
  const activePanel = document.getElementById(activePanelId);
  if (!activePanel) return;
  const subLists = activePanel.querySelectorAll('[data-tab-level="sub"]');
  subLists.forEach((subList) => {
    const subBtns = subList.querySelectorAll("button[aria-controls]");
    if (!subList.__ready) {
      initSubTabGroup(subList, subBtns);
      subList.__ready = true;
    }
    ensureSubHasActive(subBtns);
  });
  const siblings = activePanel.parentElement ? [...activePanel.parentElement.children] : [];
  siblings.forEach((panel) => {
    if (panel === activePanel) return;
    panel.querySelectorAll('[data-tab-level="sub"]').forEach((subList) => {
      const subBtns = subList.querySelectorAll('[role="button"][aria-controls]');
      subBtns.forEach((btn) => {
        const pid = btn.getAttribute("aria-controls");
        const pel = document.getElementById(pid);
        if (pel) {
          pel.hidden = true;
          pel.toggleAttribute("inert", true);
        }
      });
    });
  });
}
function initSubTabGroup(subList, subBtns) {
  if (!subBtns.length) return;
  subList.setAttribute("role", "tablist");
  subBtns.forEach((btn) => {
    btn.setAttribute("role", "tab");
    btn.setAttribute("type", btn.getAttribute("type") || "button");
  });
  const activeIndex = getActiveIndex(subBtns);
  activateSubTab(subBtns, activeIndex);
  subBtns.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      activateSubTab(subBtns, index);
    });
    btn.addEventListener("keydown", (e) => {
      handleSubTabKeydown(e, subBtns, index);
    });
  });
}
function activateSubTab(subBtns, activeIndex) {
  subBtns.forEach((btn, i) => {
    const panelId = btn.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);
    const isActive = i === activeIndex;
    btn.setAttribute("aria-selected", String(isActive));
    btn.setAttribute("tabindex", isActive ? "0" : "-1");
    btn.classList.toggle("is-active", isActive);
    if (panel) {
      panel.hidden = !isActive;
      panel.toggleAttribute("inert", !isActive);
    }
  });
}
function handleSubTabKeydown(e, subBtns, currentIndex) {
  let targetIndex = currentIndex;
  switch (e.key) {
    case "ArrowRight":
      e.preventDefault();
      targetIndex = (currentIndex + 1) % subBtns.length;
      break;
    case "ArrowLeft":
      e.preventDefault();
      targetIndex = (currentIndex - 1 + subBtns.length) % subBtns.length;
      break;
    case "Home":
      e.preventDefault();
      targetIndex = 0;
      break;
    case "End":
      e.preventDefault();
      targetIndex = subBtns.length - 1;
      break;
    case "Enter":
    case " ":
      e.preventDefault();
      activateSubTab(subBtns, currentIndex);
      return;
    default:
      return;
  }
  subBtns[targetIndex].focus();
  activateSubTab(subBtns, targetIndex);
}
function getActiveIndex(btns) {
  const idx = [...btns].findIndex((b) => b.classList.contains("is-active"));
  return idx >= 0 ? idx : 0;
}
function ensureSubHasActive(btns) {
  if (!btns.length) return;
  const any = [...btns].some((b) => b.classList.contains("is-active"));
  if (!any) activateSubTab(btns, 0);
}
function initLnb() {
  const lnbList = document.querySelectorAll(".lnb-list > li");
  const lnbLink = document.querySelectorAll(".lnb-list > li > a");
  const lnbDepthList = document.querySelectorAll(".lnb-depth2-list > li");
  const lnbDepthLinks = document.querySelectorAll(".lnb-depth2-list > li > a");
  lnbLink.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      lnbList.forEach((li) => {
        li.classList.remove("is-active");
        li.querySelector("a").removeAttribute("aria-current");
      });
      lnbDepthList.forEach((li) => {
        li.classList.remove("is-active");
        li.classList.remove("on");
      });
      const parentLi = link.closest("li");
      parentLi.classList.add("is-active");
      link.setAttribute("aria-current", "page");
      const depthLi = parentLi.querySelector(".lnb-depth2-list > li");
      if (depthLi) {
        depthLi.classList.add("on");
      }
    });
    lnbDepthLinks.forEach((link2) => {
      link2.addEventListener("click", (e) => {
        e.preventDefault();
        lnbDepthList.forEach((li) => {
          li.classList.remove("on");
          li.querySelector("a")?.removeAttribute("aria-current");
        });
        const parentLi = link2.closest("li");
        parentLi.classList.add("on");
        link2.setAttribute("aria-current", "page");
      });
    });
  });
}
function initSelect() {
  const selectBoxes = document.querySelectorAll(".select-box");
  const selectBtns = document.querySelectorAll(".select-box .select-btn");
  const selectLists = document.querySelectorAll(".select-box .select-list");
  function closeAllSelects() {
    selectBtns.forEach((btn) => {
      btn.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    });
    selectLists.forEach((list) => {
      list.classList.remove("is-open");
      list.hidden = true;
    });
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".select-box")) {
      closeAllSelects();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const openBtn = document.querySelector(".select-box .select-btn.is-open");
    closeAllSelects();
    if (openBtn) openBtn.focus();
  });
  selectBoxes.forEach((box, i) => {
    const btn = box.querySelector(".select-btn");
    const list = box.querySelector(".select-list");
    if (!btn || !list) return;
    const btnSpan = btn.querySelector("span");
    const options = list.querySelectorAll("button");
    list.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    if (!list.id) {
      list.id = `select-list-${i + 1}`;
    }
    btn.setAttribute("aria-controls", list.id);
    {
      btnSpan.textContent = btnSpan.textContent.trim();
    }
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = btn.classList.contains("is-open");
      closeAllSelects();
      if (!isOpen) {
        btn.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        list.classList.add("is-open");
        list.hidden = false;
        const firstOptionBtn = list.querySelector("button:not([disabled])");
        if (firstOptionBtn) firstOptionBtn.focus();
      }
    });
    options.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const value = option.textContent.trim();
        if (value && btnSpan) {
          btnSpan.textContent = value;
        }
        btn.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        list.classList.remove("is-open");
        list.hidden = true;
        btn.focus();
      });
    });
  });
}
function initAccordion() {
  const accBtns = document.querySelectorAll(".acc-list .acc-btn");
  accBtns.forEach((btn) => {
    const panelId = btn.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!isOpen));
      btn.classList.toggle("is-open", !isOpen);
      panel.classList.toggle("is-open", !isOpen);
      if (isOpen) {
        panel.style.maxHeight = panel.scrollHeight + "px";
        requestAnimationFrame(() => {
          panel.style.maxHeight = "0";
        });
      } else {
        panel.removeAttribute("hidden");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
      panel.addEventListener(
        "transitionend",
        () => {
          if (!panel.classList.contains("is-open")) {
            panel.setAttribute("hidden", "");
          }
        },
        { once: true }
      );
    });
  });
}
function initFooterMenu() {
  const footer = document.querySelector("#footer");
  if (!footer) return;
  const trigger = footer.querySelector(".select-btn");
  const menu = footer.querySelector(".select-list");
  if (!trigger || !menu) return;
  const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
  if (items.length === 0) return;
  let open = false;
  let active = 0;
  const setRovingTabindex = (idx) => {
    items.forEach((el, i) => el.tabIndex = i === idx ? 0 : -1);
  };
  const openMenu = () => {
    open = true;
    trigger.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    setRovingTabindex(active);
    items[active].focus({ preventScroll: true });
  };
  const closeMenu = () => {
    open = false;
    trigger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
    trigger.focus({ preventScroll: true });
  };
  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    open ? closeMenu() : openMenu();
  });
  trigger.addEventListener("keydown", (e) => {
    const k = e.key;
    if (k === "Enter" || k === " ") {
      e.preventDefault();
      open ? closeMenu() : openMenu();
    } else if ((k === "ArrowDown" || k === "ArrowUp") && !open) {
      e.preventDefault();
      active = 0;
      openMenu();
    }
  });
  menu.addEventListener("keydown", (e) => {
    if (!open) return;
    const k = e.key;
    const max = items.length - 1;
    if (k === "ArrowDown") {
      e.preventDefault();
      active = active >= max ? 0 : active + 1;
      setRovingTabindex(active);
      items[active].focus({ preventScroll: true });
    } else if (k === "ArrowUp") {
      e.preventDefault();
      active = active <= 0 ? max : active - 1;
      setRovingTabindex(active);
      items[active].focus({ preventScroll: true });
    } else if (k === "Home") {
      e.preventDefault();
      active = 0;
      setRovingTabindex(active);
      items[active].focus({ preventScroll: true });
    } else if (k === "End") {
      e.preventDefault();
      active = max;
      setRovingTabindex(active);
      items[active].focus({ preventScroll: true });
    } else if (k === "Escape") {
      e.preventDefault();
      closeMenu();
    } else if (k === "Tab") {
      closeMenu();
    } else if (k === " ") {
      e.preventDefault();
    }
  });
  items.forEach((item, idx) => {
    item.addEventListener("click", (e) => {
      if (item.tagName === "A" && (item.getAttribute("href") || "#") === "#") {
        e.preventDefault();
      }
      active = idx;
      closeMenu();
    });
  });
  document.addEventListener(
    "click",
    (e) => {
      if (!open) return;
      if (!footer.contains(e.target)) closeMenu();
    },
    { capture: true }
  );
}
function initFooterModal() {
  const modal = document.getElementById("footerPop");
  if (!modal) return;
  const dialog = modal.querySelector(".modal-dialog");
  const closeBtn = modal.querySelector(".modal-btn-close");
  const triggers = document.querySelectorAll('a[href="#footerPop"], [data-target="#footerPop"]');
  let lastFocused = null;
  const getFocusable = () => {
    const focusableElements = modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    return Array.from(focusableElements).filter((el) => {
      return modal.contains(el) && el.offsetParent !== null && !el.disabled && el.tabIndex !== -1;
    });
  };
  const open = (e) => {
    if (e) e.preventDefault();
    lastFocused = document.activeElement;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-hidden", "false");
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    if (closeBtn) {
      closeBtn.focus();
    } else {
      const focusables = getFocusable();
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        dialog.focus();
      }
    }
    modal.addEventListener("keydown", onKeyDown);
  };
  const close = () => {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modal.removeEventListener("keydown", onKeyDown);
    document.body.style.overflow = "auto";
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };
  const onKeyDown = (ev) => {
    if (ev.key === "Escape") {
      ev.preventDefault();
      close();
      return;
    }
    if (ev.key === "Tab") {
      const focusables = getFocusable();
      if (focusables.length === 0) {
        ev.preventDefault();
        if (closeBtn) closeBtn.focus();
        return;
      }
      if (focusables.length === 1) {
        ev.preventDefault();
        focusables[0].focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;
      if (!modal.contains(current)) {
        ev.preventDefault();
        first.focus();
        return;
      }
      if (ev.shiftKey) {
        if (current === first) {
          ev.preventDefault();
          last.focus();
        }
      } else {
        if (current === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    }
  };
  triggers.forEach((t) => t.addEventListener("click", open));
  if (closeBtn) closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  return { open, close };
}
function initAllMenu() {
  const btn = document.querySelector(".btn-total-menu");
  const modal = document.getElementById("allMenuPop");
  const mq = window.matchMedia("(max-width: 1200px)");
  if (!btn || !modal) return;
  const closeBtn = modal.querySelector(".all-menu-close");
  let lastFocused = null;
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "allMenuPop");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  function handleEsc(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    }
  }
  function handleBackdrop(e) {
    if (e.target === modal) {
      closeMenu();
    }
  }
  function openMenu() {
    lastFocused = document.activeElement;
    modal.setAttribute("aria-hidden", "false");
    modal.removeAttribute("hidden");
    btn.setAttribute("aria-expanded", "true");
    document.body.classList.add("scroll-lock");
    const focusTarget = closeBtn || modal;
    if (focusTarget) focusTarget.focus();
    document.addEventListener("keydown", handleEsc);
    modal.addEventListener("mousedown", handleBackdrop);
  }
  function closeMenu() {
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("hidden", "");
    btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("scroll-lock");
    document.removeEventListener("keydown", handleEsc);
    modal.removeEventListener("mousedown", handleBackdrop);
    if (lastFocused) {
      lastFocused.focus();
      lastFocused = null;
    }
  }
  function applyResponsiveState() {
    if (mq.matches) {
      if (btn.getAttribute("aria-expanded") === "true") {
        closeMenu();
      }
    }
  }
  btn.addEventListener("click", openMenu);
  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }
  mq.addEventListener("change", applyResponsiveState);
  applyResponsiveState();
}
function initScrollTop() {
  const btn = document.getElementById("btnTop");
  if (!btn) return;
  const toggleVisibility = () => {
    if (window.scrollY > 200) {
      btn.classList.add("is-visible");
    } else {
      btn.classList.remove("is-visible");
    }
  };
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("scroll", toggleVisibility);
  toggleVisibility();
}
document.addEventListener("DOMContentLoaded", initScrollTop);
function initHeaderScroll() {
  const header = document.getElementById("header");
  if (!header) return;
  const toggleHeader = () => {
    if (window.scrollY > 0) {
      header.classList.add("is-scroll");
    } else {
      header.classList.remove("is-scroll");
    }
  };
  window.addEventListener("scroll", toggleHeader);
  toggleHeader();
}
function initCommon$1() {
  initGnb();
  initMobileGnb();
  initMobileGnbTabsAccordion();
  initTabs();
  initLnb();
  initSelect();
  initAccordion();
  initFooterMenu();
  initFooterModal();
  initAllMenu();
  initScrollTop();
  initHeaderScroll();
}
document.addEventListener("DOMContentLoaded", initCommon$1);
document.addEventListener("DOMContentLoaded", () => {
  (() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dots = Array.from(document.querySelectorAll(".section-dots .dot"));
    const sections = dots.map((d) => document.querySelector(d.dataset.target)).filter(Boolean);
    function setActive(targetId) {
      dots.forEach((d) => {
        const active = d.dataset.target === targetId;
        d.classList.toggle("is-active", active);
        if (active) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
    }
    function moveTo(targetId) {
      const el = document.querySelector(targetId);
      if (!el) return;
      const header = document.getElementById("header");
      const headerHeight = header ? header.offsetHeight : 80;
      const targetTop = el.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({
        top: targetTop,
        behavior: reduceMotion ? "auto" : "smooth"
      });
      history.pushState(null, "", targetId);
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }
    dots.forEach((dot) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        moveTo(dot.dataset.target);
      });
    });
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActive("#" + visible.target.id);
      },
      { threshold: [0.35, 0.55, 0.75] }
    );
    sections.forEach((sec) => io.observe(sec));
    if (location.hash && document.querySelector(location.hash)) {
      setTimeout(() => moveTo(location.hash), 0);
    }
    const scrollToS2 = document.getElementById("scrollToS2");
    scrollToS2?.addEventListener("click", (e) => {
      e.preventDefault();
      moveTo("#s2");
    });
    const stationBtn = document.getElementById("stationBtn");
    const stationList = document.getElementById("stationList");
    if (stationBtn && stationList) {
      const open = () => {
        stationBtn.setAttribute("aria-expanded", "true");
        stationList.hidden = false;
        stationList.focus();
      };
      const close = () => {
        stationBtn.setAttribute("aria-expanded", "false");
        stationList.hidden = true;
        stationBtn.focus();
      };
      stationBtn.addEventListener("click", () => {
        const expanded = stationBtn.getAttribute("aria-expanded") === "true";
        expanded ? close() : open();
      });
      document.addEventListener("keydown", (e) => {
        if (stationList.hidden) return;
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        }
      });
      stationList.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        const stationName = stationBtn.querySelector(".station-name");
        if (stationName) stationName.textContent = b.textContent.trim();
        close();
      });
    }
    document.getElementById("mediaPrev")?.addEventListener("click", (e) => {
      e.preventDefault();
      moveTo("#s3");
    });
    document.getElementById("mediaNext")?.addEventListener("click", (e) => {
      e.preventDefault();
      moveTo("#s4");
    });
  })();
});
const home = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: "Module" }));
(() => {
  function initTabs2(root = document) {
    const wraps = root.querySelectorAll(".tab-wrap");
    wraps.forEach((wrap) => {
      const tablists = Array.from(
        wrap.querySelectorAll('.tabs[role="tablist"], .tabs')
      );
      tablists.forEach((tablist) => {
        const tabs = Array.from(
          tablist.querySelectorAll('[role="tab"], .tab-btn')
        );
        if (tabs.length === 0) return;
        const panelIds = tabs.map((t) => t.getAttribute("aria-controls")).filter(Boolean);
        const panels = panelIds.map((id) => wrap.querySelector(`#${CSS.escape(id)}`)).filter(Boolean);
        if (panels.length === 0) return;
        if (!tablist.hasAttribute("role")) tablist.setAttribute("role", "tablist");
        tabs.forEach((tab) => {
          if (!tab.hasAttribute("role")) tab.setAttribute("role", "tab");
          tab.setAttribute("type", tab.getAttribute("type") || "button");
        });
        panels.forEach((panel, i) => {
          if (!panel.hasAttribute("role")) panel.setAttribute("role", "tabpanel");
          if (!panel.hasAttribute("aria-labelledby") && tabs[i]?.id) {
            panel.setAttribute("aria-labelledby", tabs[i].id);
          }
        });
        let startIndex = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
        if (startIndex < 0) startIndex = tabs.findIndex((t) => t.classList.contains("is-active"));
        if (startIndex < 0) startIndex = 0;
        function setActive(index, { focus = false } = {}) {
          tabs.forEach((tab, i) => {
            const selected = i === index;
            tab.setAttribute("aria-selected", String(selected));
            tab.setAttribute("tabindex", selected ? "0" : "-1");
            tab.classList.toggle("is-active", selected);
            const panelId = tab.getAttribute("aria-controls");
            if (!panelId) return;
            const panel = wrap.querySelector(`#${CSS.escape(panelId)}`);
            if (!panel) return;
            if (selected) {
              panel.removeAttribute("hidden");
              panel.setAttribute("aria-hidden", "false");
            } else {
              panel.setAttribute("hidden", "");
              panel.setAttribute("aria-hidden", "true");
            }
          });
          const addBtn = wrap.querySelector(".add-btn");
          if (addBtn) {
            const span = addBtn.querySelector("span");
            if (span) {
              const currentTabText = tabs[index].textContent.trim();
              span.textContent = `${currentTabText} 더보기`;
              addBtn.setAttribute("aria-label", `${currentTabText} 더보기`);
            }
          }
          if (focus) tabs[index]?.focus();
        }
        function moveFocus(currentIndex, dir) {
          const total = tabs.length;
          let next = currentIndex;
          if (dir === "first") next = 0;
          else if (dir === "last") next = total - 1;
          else next = (currentIndex + dir + total) % total;
          tabs[next]?.focus();
        }
        setActive(startIndex);
        tabs.forEach((tab, index) => {
          tab.addEventListener("click", (e) => {
            e.preventDefault();
            setActive(index, { focus: true });
          });
          tab.addEventListener("keydown", (e) => {
            const currentIndex = tabs.indexOf(document.activeElement);
            if (currentIndex < 0) return;
            switch (e.key) {
              case "ArrowLeft":
              case "Left":
              case "ArrowUp":
              case "Up":
                e.preventDefault();
                moveFocus(currentIndex, -1);
                break;
              case "ArrowRight":
              case "Right":
              case "ArrowDown":
              case "Down":
                e.preventDefault();
                moveFocus(currentIndex, 1);
                break;
              case "Home":
                e.preventDefault();
                moveFocus(currentIndex, "first");
                break;
              case "End":
                e.preventDefault();
                moveFocus(currentIndex, "last");
                break;
              case "Enter":
              case " ":
                e.preventDefault();
                setActive(currentIndex, { focus: true });
                break;
            }
          });
        });
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initTabs2());
  } else {
    initTabs2();
  }
})();
var HOOKS = [
  "onChange",
  "onClose",
  "onDayCreate",
  "onDestroy",
  "onKeyDown",
  "onMonthChange",
  "onOpen",
  "onParseConfig",
  "onReady",
  "onValueUpdate",
  "onYearChange",
  "onPreCalendarPosition"
];
var defaults = {
  _disable: [],
  allowInput: false,
  allowInvalidPreload: false,
  altFormat: "F j, Y",
  altInput: false,
  altInputClass: "form-control input",
  animate: typeof window === "object" && window.navigator.userAgent.indexOf("MSIE") === -1,
  ariaDateFormat: "F j, Y",
  autoFillDefaultTime: true,
  clickOpens: true,
  closeOnSelect: true,
  conjunction: ", ",
  dateFormat: "Y-m-d",
  defaultHour: 12,
  defaultMinute: 0,
  defaultSeconds: 0,
  disable: [],
  disableMobile: false,
  enableSeconds: false,
  enableTime: false,
  errorHandler: function(err) {
    return typeof console !== "undefined" && console.warn(err);
  },
  getWeek: function(givenDate) {
    var date = new Date(givenDate.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 864e5 - 3 + (week1.getDay() + 6) % 7) / 7);
  },
  hourIncrement: 1,
  ignoredFocusElements: [],
  inline: false,
  locale: "default",
  minuteIncrement: 5,
  mode: "single",
  monthSelectorType: "dropdown",
  nextArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z' /></svg>",
  noCalendar: false,
  now: /* @__PURE__ */ new Date(),
  onChange: [],
  onClose: [],
  onDayCreate: [],
  onDestroy: [],
  onKeyDown: [],
  onMonthChange: [],
  onOpen: [],
  onParseConfig: [],
  onReady: [],
  onValueUpdate: [],
  onYearChange: [],
  onPreCalendarPosition: [],
  plugins: [],
  position: "auto",
  positionElement: void 0,
  prevArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z' /></svg>",
  shorthandCurrentMonth: false,
  showMonths: 1,
  static: false,
  time_24hr: false,
  weekNumbers: false,
  wrap: false
};
var english = {
  weekdays: {
    shorthand: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    longhand: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ]
  },
  months: {
    shorthand: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    longhand: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ]
  },
  daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  firstDayOfWeek: 0,
  ordinal: function(nth) {
    var s = nth % 100;
    if (s > 3 && s < 21)
      return "th";
    switch (s % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  },
  rangeSeparator: " to ",
  weekAbbreviation: "Wk",
  scrollTitle: "Scroll to increment",
  toggleTitle: "Click to toggle",
  amPM: ["AM", "PM"],
  yearAriaLabel: "Year",
  monthAriaLabel: "Month",
  hourAriaLabel: "Hour",
  minuteAriaLabel: "Minute",
  time_24hr: false
};
var pad = function(number, length) {
  if (length === void 0) {
    length = 2;
  }
  return ("000" + number).slice(length * -1);
};
var int = function(bool) {
  return bool === true ? 1 : 0;
};
function debounce(fn, wait) {
  var t;
  return function() {
    var _this = this;
    var args = arguments;
    clearTimeout(t);
    t = setTimeout(function() {
      return fn.apply(_this, args);
    }, wait);
  };
}
var arrayify = function(obj) {
  return obj instanceof Array ? obj : [obj];
};
function toggleClass(elem, className, bool) {
  if (bool === true)
    return elem.classList.add(className);
  elem.classList.remove(className);
}
function createElement(tag, className, content) {
  var e = window.document.createElement(tag);
  className = className || "";
  content = content || "";
  e.className = className;
  if (content !== void 0)
    e.textContent = content;
  return e;
}
function clearNode(node) {
  while (node.firstChild)
    node.removeChild(node.firstChild);
}
function findParent(node, condition) {
  if (condition(node))
    return node;
  else if (node.parentNode)
    return findParent(node.parentNode, condition);
  return void 0;
}
function createNumberInput(inputClassName, opts) {
  var wrapper = createElement("div", "numInputWrapper"), numInput = createElement("input", "numInput " + inputClassName), arrowUp = createElement("span", "arrowUp"), arrowDown = createElement("span", "arrowDown");
  if (navigator.userAgent.indexOf("MSIE 9.0") === -1) {
    numInput.type = "number";
  } else {
    numInput.type = "text";
    numInput.pattern = "\\d*";
  }
  if (opts !== void 0)
    for (var key in opts)
      numInput.setAttribute(key, opts[key]);
  wrapper.appendChild(numInput);
  wrapper.appendChild(arrowUp);
  wrapper.appendChild(arrowDown);
  return wrapper;
}
function getEventTarget(event) {
  try {
    if (typeof event.composedPath === "function") {
      var path = event.composedPath();
      return path[0];
    }
    return event.target;
  } catch (error) {
    return event.target;
  }
}
var doNothing = function() {
  return void 0;
};
var monthToStr = function(monthNumber, shorthand, locale) {
  return locale.months[shorthand ? "shorthand" : "longhand"][monthNumber];
};
var revFormat = {
  D: doNothing,
  F: function(dateObj, monthName, locale) {
    dateObj.setMonth(locale.months.longhand.indexOf(monthName));
  },
  G: function(dateObj, hour) {
    dateObj.setHours((dateObj.getHours() >= 12 ? 12 : 0) + parseFloat(hour));
  },
  H: function(dateObj, hour) {
    dateObj.setHours(parseFloat(hour));
  },
  J: function(dateObj, day) {
    dateObj.setDate(parseFloat(day));
  },
  K: function(dateObj, amPM, locale) {
    dateObj.setHours(dateObj.getHours() % 12 + 12 * int(new RegExp(locale.amPM[1], "i").test(amPM)));
  },
  M: function(dateObj, shortMonth, locale) {
    dateObj.setMonth(locale.months.shorthand.indexOf(shortMonth));
  },
  S: function(dateObj, seconds) {
    dateObj.setSeconds(parseFloat(seconds));
  },
  U: function(_, unixSeconds) {
    return new Date(parseFloat(unixSeconds) * 1e3);
  },
  W: function(dateObj, weekNum, locale) {
    var weekNumber = parseInt(weekNum);
    var date = new Date(dateObj.getFullYear(), 0, 2 + (weekNumber - 1) * 7, 0, 0, 0, 0);
    date.setDate(date.getDate() - date.getDay() + locale.firstDayOfWeek);
    return date;
  },
  Y: function(dateObj, year) {
    dateObj.setFullYear(parseFloat(year));
  },
  Z: function(_, ISODate) {
    return new Date(ISODate);
  },
  d: function(dateObj, day) {
    dateObj.setDate(parseFloat(day));
  },
  h: function(dateObj, hour) {
    dateObj.setHours((dateObj.getHours() >= 12 ? 12 : 0) + parseFloat(hour));
  },
  i: function(dateObj, minutes) {
    dateObj.setMinutes(parseFloat(minutes));
  },
  j: function(dateObj, day) {
    dateObj.setDate(parseFloat(day));
  },
  l: doNothing,
  m: function(dateObj, month) {
    dateObj.setMonth(parseFloat(month) - 1);
  },
  n: function(dateObj, month) {
    dateObj.setMonth(parseFloat(month) - 1);
  },
  s: function(dateObj, seconds) {
    dateObj.setSeconds(parseFloat(seconds));
  },
  u: function(_, unixMillSeconds) {
    return new Date(parseFloat(unixMillSeconds));
  },
  w: doNothing,
  y: function(dateObj, year) {
    dateObj.setFullYear(2e3 + parseFloat(year));
  }
};
var tokenRegex = {
  D: "",
  F: "",
  G: "(\\d\\d|\\d)",
  H: "(\\d\\d|\\d)",
  J: "(\\d\\d|\\d)\\w+",
  K: "",
  M: "",
  S: "(\\d\\d|\\d)",
  U: "(.+)",
  W: "(\\d\\d|\\d)",
  Y: "(\\d{4})",
  Z: "(.+)",
  d: "(\\d\\d|\\d)",
  h: "(\\d\\d|\\d)",
  i: "(\\d\\d|\\d)",
  j: "(\\d\\d|\\d)",
  l: "",
  m: "(\\d\\d|\\d)",
  n: "(\\d\\d|\\d)",
  s: "(\\d\\d|\\d)",
  u: "(.+)",
  w: "(\\d\\d|\\d)",
  y: "(\\d{2})"
};
var formats = {
  Z: function(date) {
    return date.toISOString();
  },
  D: function(date, locale, options) {
    return locale.weekdays.shorthand[formats.w(date, locale, options)];
  },
  F: function(date, locale, options) {
    return monthToStr(formats.n(date, locale, options) - 1, false, locale);
  },
  G: function(date, locale, options) {
    return pad(formats.h(date, locale, options));
  },
  H: function(date) {
    return pad(date.getHours());
  },
  J: function(date, locale) {
    return locale.ordinal !== void 0 ? date.getDate() + locale.ordinal(date.getDate()) : date.getDate();
  },
  K: function(date, locale) {
    return locale.amPM[int(date.getHours() > 11)];
  },
  M: function(date, locale) {
    return monthToStr(date.getMonth(), true, locale);
  },
  S: function(date) {
    return pad(date.getSeconds());
  },
  U: function(date) {
    return date.getTime() / 1e3;
  },
  W: function(date, _, options) {
    return options.getWeek(date);
  },
  Y: function(date) {
    return pad(date.getFullYear(), 4);
  },
  d: function(date) {
    return pad(date.getDate());
  },
  h: function(date) {
    return date.getHours() % 12 ? date.getHours() % 12 : 12;
  },
  i: function(date) {
    return pad(date.getMinutes());
  },
  j: function(date) {
    return date.getDate();
  },
  l: function(date, locale) {
    return locale.weekdays.longhand[date.getDay()];
  },
  m: function(date) {
    return pad(date.getMonth() + 1);
  },
  n: function(date) {
    return date.getMonth() + 1;
  },
  s: function(date) {
    return date.getSeconds();
  },
  u: function(date) {
    return date.getTime();
  },
  w: function(date) {
    return date.getDay();
  },
  y: function(date) {
    return String(date.getFullYear()).substring(2);
  }
};
var createDateFormatter = function(_a) {
  var _b = _a.config, config = _b === void 0 ? defaults : _b, _c = _a.l10n, l10n = _c === void 0 ? english : _c, _d = _a.isMobile, isMobile = _d === void 0 ? false : _d;
  return function(dateObj, frmt, overrideLocale) {
    var locale = overrideLocale || l10n;
    if (config.formatDate !== void 0 && !isMobile) {
      return config.formatDate(dateObj, frmt, locale);
    }
    return frmt.split("").map(function(c, i, arr) {
      return formats[c] && arr[i - 1] !== "\\" ? formats[c](dateObj, locale, config) : c !== "\\" ? c : "";
    }).join("");
  };
};
var createDateParser = function(_a) {
  var _b = _a.config, config = _b === void 0 ? defaults : _b, _c = _a.l10n, l10n = _c === void 0 ? english : _c;
  return function(date, givenFormat, timeless, customLocale) {
    if (date !== 0 && !date)
      return void 0;
    var locale = customLocale || l10n;
    var parsedDate;
    var dateOrig = date;
    if (date instanceof Date)
      parsedDate = new Date(date.getTime());
    else if (typeof date !== "string" && date.toFixed !== void 0)
      parsedDate = new Date(date);
    else if (typeof date === "string") {
      var format = givenFormat || (config || defaults).dateFormat;
      var datestr = String(date).trim();
      if (datestr === "today") {
        parsedDate = /* @__PURE__ */ new Date();
        timeless = true;
      } else if (config && config.parseDate) {
        parsedDate = config.parseDate(date, format);
      } else if (/Z$/.test(datestr) || /GMT$/.test(datestr)) {
        parsedDate = new Date(date);
      } else {
        var matched = void 0, ops = [];
        for (var i = 0, matchIndex = 0, regexStr = ""; i < format.length; i++) {
          var token = format[i];
          var isBackSlash = token === "\\";
          var escaped = format[i - 1] === "\\" || isBackSlash;
          if (tokenRegex[token] && !escaped) {
            regexStr += tokenRegex[token];
            var match = new RegExp(regexStr).exec(date);
            if (match && (matched = true)) {
              ops[token !== "Y" ? "push" : "unshift"]({
                fn: revFormat[token],
                val: match[++matchIndex]
              });
            }
          } else if (!isBackSlash)
            regexStr += ".";
        }
        parsedDate = !config || !config.noCalendar ? new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1, 0, 0, 0, 0) : new Date((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0));
        ops.forEach(function(_a2) {
          var fn = _a2.fn, val = _a2.val;
          return parsedDate = fn(parsedDate, val, locale) || parsedDate;
        });
        parsedDate = matched ? parsedDate : void 0;
      }
    }
    if (!(parsedDate instanceof Date && !isNaN(parsedDate.getTime()))) {
      config.errorHandler(new Error("Invalid date provided: " + dateOrig));
      return void 0;
    }
    if (timeless === true)
      parsedDate.setHours(0, 0, 0, 0);
    return parsedDate;
  };
};
function compareDates(date1, date2, timeless) {
  if (timeless === void 0) {
    timeless = true;
  }
  if (timeless !== false) {
    return new Date(date1.getTime()).setHours(0, 0, 0, 0) - new Date(date2.getTime()).setHours(0, 0, 0, 0);
  }
  return date1.getTime() - date2.getTime();
}
var isBetween = function(ts, ts1, ts2) {
  return ts > Math.min(ts1, ts2) && ts < Math.max(ts1, ts2);
};
var calculateSecondsSinceMidnight = function(hours, minutes, seconds) {
  return hours * 3600 + minutes * 60 + seconds;
};
var parseSeconds = function(secondsSinceMidnight) {
  var hours = Math.floor(secondsSinceMidnight / 3600), minutes = (secondsSinceMidnight - hours * 3600) / 60;
  return [hours, minutes, secondsSinceMidnight - hours * 3600 - minutes * 60];
};
var duration = {
  DAY: 864e5
};
function getDefaultHours(config) {
  var hours = config.defaultHour;
  var minutes = config.defaultMinute;
  var seconds = config.defaultSeconds;
  if (config.minDate !== void 0) {
    var minHour = config.minDate.getHours();
    var minMinutes = config.minDate.getMinutes();
    var minSeconds = config.minDate.getSeconds();
    if (hours < minHour) {
      hours = minHour;
    }
    if (hours === minHour && minutes < minMinutes) {
      minutes = minMinutes;
    }
    if (hours === minHour && minutes === minMinutes && seconds < minSeconds)
      seconds = config.minDate.getSeconds();
  }
  if (config.maxDate !== void 0) {
    var maxHr = config.maxDate.getHours();
    var maxMinutes = config.maxDate.getMinutes();
    hours = Math.min(hours, maxHr);
    if (hours === maxHr)
      minutes = Math.min(maxMinutes, minutes);
    if (hours === maxHr && minutes === maxMinutes)
      seconds = config.maxDate.getSeconds();
  }
  return { hours, minutes, seconds };
}
if (typeof Object.assign !== "function") {
  Object.assign = function(target) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }
    if (!target) {
      throw TypeError("Cannot convert undefined or null to object");
    }
    var _loop_1 = function(source2) {
      if (source2) {
        Object.keys(source2).forEach(function(key) {
          return target[key] = source2[key];
        });
      }
    };
    for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
      var source = args_1[_a];
      _loop_1(source);
    }
    return target;
  };
}
var __assign = function() {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var __spreadArrays = function() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
      r[k] = a[j];
  return r;
};
var DEBOUNCED_CHANGE_MS = 300;
function FlatpickrInstance(element, instanceConfig) {
  var self = {
    config: __assign(__assign({}, defaults), flatpickr.defaultConfig),
    l10n: english
  };
  self.parseDate = createDateParser({ config: self.config, l10n: self.l10n });
  self._handlers = [];
  self.pluginElements = [];
  self.loadedPlugins = [];
  self._bind = bind;
  self._setHoursFromDate = setHoursFromDate;
  self._positionCalendar = positionCalendar;
  self.changeMonth = changeMonth;
  self.changeYear = changeYear;
  self.clear = clear;
  self.close = close;
  self.onMouseOver = onMouseOver;
  self._createElement = createElement;
  self.createDay = createDay;
  self.destroy = destroy;
  self.isEnabled = isEnabled;
  self.jumpToDate = jumpToDate;
  self.updateValue = updateValue;
  self.open = open;
  self.redraw = redraw;
  self.set = set;
  self.setDate = setDate;
  self.toggle = toggle;
  function setupHelperFunctions() {
    self.utils = {
      getDaysInMonth: function(month, yr) {
        if (month === void 0) {
          month = self.currentMonth;
        }
        if (yr === void 0) {
          yr = self.currentYear;
        }
        if (month === 1 && (yr % 4 === 0 && yr % 100 !== 0 || yr % 400 === 0))
          return 29;
        return self.l10n.daysInMonth[month];
      }
    };
  }
  function init() {
    self.element = self.input = element;
    self.isOpen = false;
    parseConfig();
    setupLocale();
    setupInputs();
    setupDates();
    setupHelperFunctions();
    if (!self.isMobile)
      build();
    bindEvents();
    if (self.selectedDates.length || self.config.noCalendar) {
      if (self.config.enableTime) {
        setHoursFromDate(self.config.noCalendar ? self.latestSelectedDateObj : void 0);
      }
      updateValue(false);
    }
    setCalendarWidth();
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (!self.isMobile && isSafari) {
      positionCalendar();
    }
    triggerEvent("onReady");
  }
  function getClosestActiveElement() {
    var _a;
    return ((_a = self.calendarContainer) === null || _a === void 0 ? void 0 : _a.getRootNode()).activeElement || document.activeElement;
  }
  function bindToInstance(fn) {
    return fn.bind(self);
  }
  function setCalendarWidth() {
    var config = self.config;
    if (config.weekNumbers === false && config.showMonths === 1) {
      return;
    } else if (config.noCalendar !== true) {
      window.requestAnimationFrame(function() {
        if (self.calendarContainer !== void 0) {
          self.calendarContainer.style.visibility = "hidden";
          self.calendarContainer.style.display = "block";
        }
        if (self.daysContainer !== void 0) {
          var daysWidth = (self.days.offsetWidth + 1) * config.showMonths;
          self.daysContainer.style.width = daysWidth + "px";
          self.calendarContainer.style.width = daysWidth + (self.weekWrapper !== void 0 ? self.weekWrapper.offsetWidth : 0) + "px";
          self.calendarContainer.style.removeProperty("visibility");
          self.calendarContainer.style.removeProperty("display");
        }
      });
    }
  }
  function updateTime(e) {
    if (self.selectedDates.length === 0) {
      var defaultDate = self.config.minDate === void 0 || compareDates(/* @__PURE__ */ new Date(), self.config.minDate) >= 0 ? /* @__PURE__ */ new Date() : new Date(self.config.minDate.getTime());
      var defaults2 = getDefaultHours(self.config);
      defaultDate.setHours(defaults2.hours, defaults2.minutes, defaults2.seconds, defaultDate.getMilliseconds());
      self.selectedDates = [defaultDate];
      self.latestSelectedDateObj = defaultDate;
    }
    if (e !== void 0 && e.type !== "blur") {
      timeWrapper(e);
    }
    var prevValue = self._input.value;
    setHoursFromInputs();
    updateValue();
    if (self._input.value !== prevValue) {
      self._debouncedChange();
    }
  }
  function ampm2military(hour, amPM) {
    return hour % 12 + 12 * int(amPM === self.l10n.amPM[1]);
  }
  function military2ampm(hour) {
    switch (hour % 24) {
      case 0:
      case 12:
        return 12;
      default:
        return hour % 12;
    }
  }
  function setHoursFromInputs() {
    if (self.hourElement === void 0 || self.minuteElement === void 0)
      return;
    var hours = (parseInt(self.hourElement.value.slice(-2), 10) || 0) % 24, minutes = (parseInt(self.minuteElement.value, 10) || 0) % 60, seconds = self.secondElement !== void 0 ? (parseInt(self.secondElement.value, 10) || 0) % 60 : 0;
    if (self.amPM !== void 0) {
      hours = ampm2military(hours, self.amPM.textContent);
    }
    var limitMinHours = self.config.minTime !== void 0 || self.config.minDate && self.minDateHasTime && self.latestSelectedDateObj && compareDates(self.latestSelectedDateObj, self.config.minDate, true) === 0;
    var limitMaxHours = self.config.maxTime !== void 0 || self.config.maxDate && self.maxDateHasTime && self.latestSelectedDateObj && compareDates(self.latestSelectedDateObj, self.config.maxDate, true) === 0;
    if (self.config.maxTime !== void 0 && self.config.minTime !== void 0 && self.config.minTime > self.config.maxTime) {
      var minBound = calculateSecondsSinceMidnight(self.config.minTime.getHours(), self.config.minTime.getMinutes(), self.config.minTime.getSeconds());
      var maxBound = calculateSecondsSinceMidnight(self.config.maxTime.getHours(), self.config.maxTime.getMinutes(), self.config.maxTime.getSeconds());
      var currentTime = calculateSecondsSinceMidnight(hours, minutes, seconds);
      if (currentTime > maxBound && currentTime < minBound) {
        var result = parseSeconds(minBound);
        hours = result[0];
        minutes = result[1];
        seconds = result[2];
      }
    } else {
      if (limitMaxHours) {
        var maxTime = self.config.maxTime !== void 0 ? self.config.maxTime : self.config.maxDate;
        hours = Math.min(hours, maxTime.getHours());
        if (hours === maxTime.getHours())
          minutes = Math.min(minutes, maxTime.getMinutes());
        if (minutes === maxTime.getMinutes())
          seconds = Math.min(seconds, maxTime.getSeconds());
      }
      if (limitMinHours) {
        var minTime = self.config.minTime !== void 0 ? self.config.minTime : self.config.minDate;
        hours = Math.max(hours, minTime.getHours());
        if (hours === minTime.getHours() && minutes < minTime.getMinutes())
          minutes = minTime.getMinutes();
        if (minutes === minTime.getMinutes())
          seconds = Math.max(seconds, minTime.getSeconds());
      }
    }
    setHours(hours, minutes, seconds);
  }
  function setHoursFromDate(dateObj) {
    var date = dateObj || self.latestSelectedDateObj;
    if (date && date instanceof Date) {
      setHours(date.getHours(), date.getMinutes(), date.getSeconds());
    }
  }
  function setHours(hours, minutes, seconds) {
    if (self.latestSelectedDateObj !== void 0) {
      self.latestSelectedDateObj.setHours(hours % 24, minutes, seconds || 0, 0);
    }
    if (!self.hourElement || !self.minuteElement || self.isMobile)
      return;
    self.hourElement.value = pad(!self.config.time_24hr ? (12 + hours) % 12 + 12 * int(hours % 12 === 0) : hours);
    self.minuteElement.value = pad(minutes);
    if (self.amPM !== void 0)
      self.amPM.textContent = self.l10n.amPM[int(hours >= 12)];
    if (self.secondElement !== void 0)
      self.secondElement.value = pad(seconds);
  }
  function onYearInput(event) {
    var eventTarget = getEventTarget(event);
    var year = parseInt(eventTarget.value) + (event.delta || 0);
    if (year / 1e3 > 1 || event.key === "Enter" && !/[^\d]/.test(year.toString())) {
      changeYear(year);
    }
  }
  function bind(element2, event, handler, options) {
    if (event instanceof Array)
      return event.forEach(function(ev) {
        return bind(element2, ev, handler, options);
      });
    if (element2 instanceof Array)
      return element2.forEach(function(el) {
        return bind(el, event, handler, options);
      });
    element2.addEventListener(event, handler, options);
    self._handlers.push({
      remove: function() {
        return element2.removeEventListener(event, handler, options);
      }
    });
  }
  function triggerChange() {
    triggerEvent("onChange");
  }
  function bindEvents() {
    if (self.config.wrap) {
      ["open", "close", "toggle", "clear"].forEach(function(evt) {
        Array.prototype.forEach.call(self.element.querySelectorAll("[data-" + evt + "]"), function(el) {
          return bind(el, "click", self[evt]);
        });
      });
    }
    if (self.isMobile) {
      setupMobile();
      return;
    }
    var debouncedResize = debounce(onResize, 50);
    self._debouncedChange = debounce(triggerChange, DEBOUNCED_CHANGE_MS);
    if (self.daysContainer && !/iPhone|iPad|iPod/i.test(navigator.userAgent))
      bind(self.daysContainer, "mouseover", function(e) {
        if (self.config.mode === "range")
          onMouseOver(getEventTarget(e));
      });
    bind(self._input, "keydown", onKeyDown);
    if (self.calendarContainer !== void 0) {
      bind(self.calendarContainer, "keydown", onKeyDown);
    }
    if (!self.config.inline && !self.config.static)
      bind(window, "resize", debouncedResize);
    if (window.ontouchstart !== void 0)
      bind(window.document, "touchstart", documentClick);
    else
      bind(window.document, "mousedown", documentClick);
    bind(window.document, "focus", documentClick, { capture: true });
    if (self.config.clickOpens === true) {
      bind(self._input, "focus", self.open);
      bind(self._input, "click", self.open);
    }
    if (self.daysContainer !== void 0) {
      bind(self.monthNav, "click", onMonthNavClick);
      bind(self.monthNav, ["keyup", "increment"], onYearInput);
      bind(self.daysContainer, "click", selectDate);
    }
    if (self.timeContainer !== void 0 && self.minuteElement !== void 0 && self.hourElement !== void 0) {
      var selText = function(e) {
        return getEventTarget(e).select();
      };
      bind(self.timeContainer, ["increment"], updateTime);
      bind(self.timeContainer, "blur", updateTime, { capture: true });
      bind(self.timeContainer, "click", timeIncrement);
      bind([self.hourElement, self.minuteElement], ["focus", "click"], selText);
      if (self.secondElement !== void 0)
        bind(self.secondElement, "focus", function() {
          return self.secondElement && self.secondElement.select();
        });
      if (self.amPM !== void 0) {
        bind(self.amPM, "click", function(e) {
          updateTime(e);
        });
      }
    }
    if (self.config.allowInput) {
      bind(self._input, "blur", onBlur);
    }
  }
  function jumpToDate(jumpDate, triggerChange2) {
    var jumpTo = jumpDate !== void 0 ? self.parseDate(jumpDate) : self.latestSelectedDateObj || (self.config.minDate && self.config.minDate > self.now ? self.config.minDate : self.config.maxDate && self.config.maxDate < self.now ? self.config.maxDate : self.now);
    var oldYear = self.currentYear;
    var oldMonth = self.currentMonth;
    try {
      if (jumpTo !== void 0) {
        self.currentYear = jumpTo.getFullYear();
        self.currentMonth = jumpTo.getMonth();
      }
    } catch (e) {
      e.message = "Invalid date supplied: " + jumpTo;
      self.config.errorHandler(e);
    }
    if (triggerChange2 && self.currentYear !== oldYear) {
      triggerEvent("onYearChange");
      buildMonthSwitch();
    }
    if (triggerChange2 && (self.currentYear !== oldYear || self.currentMonth !== oldMonth)) {
      triggerEvent("onMonthChange");
    }
    self.redraw();
  }
  function timeIncrement(e) {
    var eventTarget = getEventTarget(e);
    if (~eventTarget.className.indexOf("arrow"))
      incrementNumInput(e, eventTarget.classList.contains("arrowUp") ? 1 : -1);
  }
  function incrementNumInput(e, delta, inputElem) {
    var target = e && getEventTarget(e);
    var input = inputElem || target && target.parentNode && target.parentNode.firstChild;
    var event = createEvent("increment");
    event.delta = delta;
    input && input.dispatchEvent(event);
  }
  function build() {
    var fragment = window.document.createDocumentFragment();
    self.calendarContainer = createElement("div", "flatpickr-calendar");
    self.calendarContainer.tabIndex = -1;
    if (!self.config.noCalendar) {
      fragment.appendChild(buildMonthNav());
      self.innerContainer = createElement("div", "flatpickr-innerContainer");
      if (self.config.weekNumbers) {
        var _a = buildWeeks(), weekWrapper = _a.weekWrapper, weekNumbers = _a.weekNumbers;
        self.innerContainer.appendChild(weekWrapper);
        self.weekNumbers = weekNumbers;
        self.weekWrapper = weekWrapper;
      }
      self.rContainer = createElement("div", "flatpickr-rContainer");
      self.rContainer.appendChild(buildWeekdays());
      if (!self.daysContainer) {
        self.daysContainer = createElement("div", "flatpickr-days");
        self.daysContainer.tabIndex = -1;
      }
      buildDays();
      self.rContainer.appendChild(self.daysContainer);
      self.innerContainer.appendChild(self.rContainer);
      fragment.appendChild(self.innerContainer);
    }
    if (self.config.enableTime) {
      fragment.appendChild(buildTime());
    }
    toggleClass(self.calendarContainer, "rangeMode", self.config.mode === "range");
    toggleClass(self.calendarContainer, "animate", self.config.animate === true);
    toggleClass(self.calendarContainer, "multiMonth", self.config.showMonths > 1);
    self.calendarContainer.appendChild(fragment);
    var customAppend = self.config.appendTo !== void 0 && self.config.appendTo.nodeType !== void 0;
    if (self.config.inline || self.config.static) {
      self.calendarContainer.classList.add(self.config.inline ? "inline" : "static");
      if (self.config.inline) {
        if (!customAppend && self.element.parentNode)
          self.element.parentNode.insertBefore(self.calendarContainer, self._input.nextSibling);
        else if (self.config.appendTo !== void 0)
          self.config.appendTo.appendChild(self.calendarContainer);
      }
      if (self.config.static) {
        var wrapper = createElement("div", "flatpickr-wrapper");
        if (self.element.parentNode)
          self.element.parentNode.insertBefore(wrapper, self.element);
        wrapper.appendChild(self.element);
        if (self.altInput)
          wrapper.appendChild(self.altInput);
        wrapper.appendChild(self.calendarContainer);
      }
    }
    if (!self.config.static && !self.config.inline)
      (self.config.appendTo !== void 0 ? self.config.appendTo : window.document.body).appendChild(self.calendarContainer);
  }
  function createDay(className, date, _dayNumber, i) {
    var dateIsEnabled = isEnabled(date, true), dayElement = createElement("span", className, date.getDate().toString());
    dayElement.dateObj = date;
    dayElement.$i = i;
    dayElement.setAttribute("aria-label", self.formatDate(date, self.config.ariaDateFormat));
    if (className.indexOf("hidden") === -1 && compareDates(date, self.now) === 0) {
      self.todayDateElem = dayElement;
      dayElement.classList.add("today");
      dayElement.setAttribute("aria-current", "date");
    }
    if (dateIsEnabled) {
      dayElement.tabIndex = -1;
      if (isDateSelected(date)) {
        dayElement.classList.add("selected");
        self.selectedDateElem = dayElement;
        if (self.config.mode === "range") {
          toggleClass(dayElement, "startRange", self.selectedDates[0] && compareDates(date, self.selectedDates[0], true) === 0);
          toggleClass(dayElement, "endRange", self.selectedDates[1] && compareDates(date, self.selectedDates[1], true) === 0);
          if (className === "nextMonthDay")
            dayElement.classList.add("inRange");
        }
      }
    } else {
      dayElement.classList.add("flatpickr-disabled");
    }
    if (self.config.mode === "range") {
      if (isDateInRange(date) && !isDateSelected(date))
        dayElement.classList.add("inRange");
    }
    if (self.weekNumbers && self.config.showMonths === 1 && className !== "prevMonthDay" && i % 7 === 6) {
      self.weekNumbers.insertAdjacentHTML("beforeend", "<span class='flatpickr-day'>" + self.config.getWeek(date) + "</span>");
    }
    triggerEvent("onDayCreate", dayElement);
    return dayElement;
  }
  function focusOnDayElem(targetNode) {
    targetNode.focus();
    if (self.config.mode === "range")
      onMouseOver(targetNode);
  }
  function getFirstAvailableDay(delta) {
    var startMonth = delta > 0 ? 0 : self.config.showMonths - 1;
    var endMonth = delta > 0 ? self.config.showMonths : -1;
    for (var m = startMonth; m != endMonth; m += delta) {
      var month = self.daysContainer.children[m];
      var startIndex = delta > 0 ? 0 : month.children.length - 1;
      var endIndex = delta > 0 ? month.children.length : -1;
      for (var i = startIndex; i != endIndex; i += delta) {
        var c = month.children[i];
        if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj))
          return c;
      }
    }
    return void 0;
  }
  function getNextAvailableDay(current, delta) {
    var givenMonth = current.className.indexOf("Month") === -1 ? current.dateObj.getMonth() : self.currentMonth;
    var endMonth = delta > 0 ? self.config.showMonths : -1;
    var loopDelta = delta > 0 ? 1 : -1;
    for (var m = givenMonth - self.currentMonth; m != endMonth; m += loopDelta) {
      var month = self.daysContainer.children[m];
      var startIndex = givenMonth - self.currentMonth === m ? current.$i + delta : delta < 0 ? month.children.length - 1 : 0;
      var numMonthDays = month.children.length;
      for (var i = startIndex; i >= 0 && i < numMonthDays && i != (delta > 0 ? numMonthDays : -1); i += loopDelta) {
        var c = month.children[i];
        if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj) && Math.abs(current.$i - i) >= Math.abs(delta))
          return focusOnDayElem(c);
      }
    }
    self.changeMonth(loopDelta);
    focusOnDay(getFirstAvailableDay(loopDelta), 0);
    return void 0;
  }
  function focusOnDay(current, offset) {
    var activeElement = getClosestActiveElement();
    var dayFocused = isInView(activeElement || document.body);
    var startElem = current !== void 0 ? current : dayFocused ? activeElement : self.selectedDateElem !== void 0 && isInView(self.selectedDateElem) ? self.selectedDateElem : self.todayDateElem !== void 0 && isInView(self.todayDateElem) ? self.todayDateElem : getFirstAvailableDay(offset > 0 ? 1 : -1);
    if (startElem === void 0) {
      self._input.focus();
    } else if (!dayFocused) {
      focusOnDayElem(startElem);
    } else {
      getNextAvailableDay(startElem, offset);
    }
  }
  function buildMonthDays(year, month) {
    var firstOfMonth = (new Date(year, month, 1).getDay() - self.l10n.firstDayOfWeek + 7) % 7;
    var prevMonthDays = self.utils.getDaysInMonth((month - 1 + 12) % 12, year);
    var daysInMonth = self.utils.getDaysInMonth(month, year), days = window.document.createDocumentFragment(), isMultiMonth = self.config.showMonths > 1, prevMonthDayClass = isMultiMonth ? "prevMonthDay hidden" : "prevMonthDay", nextMonthDayClass = isMultiMonth ? "nextMonthDay hidden" : "nextMonthDay";
    var dayNumber = prevMonthDays + 1 - firstOfMonth, dayIndex = 0;
    for (; dayNumber <= prevMonthDays; dayNumber++, dayIndex++) {
      days.appendChild(createDay("flatpickr-day " + prevMonthDayClass, new Date(year, month - 1, dayNumber), dayNumber, dayIndex));
    }
    for (dayNumber = 1; dayNumber <= daysInMonth; dayNumber++, dayIndex++) {
      days.appendChild(createDay("flatpickr-day", new Date(year, month, dayNumber), dayNumber, dayIndex));
    }
    for (var dayNum = daysInMonth + 1; dayNum <= 42 - firstOfMonth && (self.config.showMonths === 1 || dayIndex % 7 !== 0); dayNum++, dayIndex++) {
      days.appendChild(createDay("flatpickr-day " + nextMonthDayClass, new Date(year, month + 1, dayNum % daysInMonth), dayNum, dayIndex));
    }
    var dayContainer = createElement("div", "dayContainer");
    dayContainer.appendChild(days);
    return dayContainer;
  }
  function buildDays() {
    if (self.daysContainer === void 0) {
      return;
    }
    clearNode(self.daysContainer);
    if (self.weekNumbers)
      clearNode(self.weekNumbers);
    var frag = document.createDocumentFragment();
    for (var i = 0; i < self.config.showMonths; i++) {
      var d = new Date(self.currentYear, self.currentMonth, 1);
      d.setMonth(self.currentMonth + i);
      frag.appendChild(buildMonthDays(d.getFullYear(), d.getMonth()));
    }
    self.daysContainer.appendChild(frag);
    self.days = self.daysContainer.firstChild;
    if (self.config.mode === "range" && self.selectedDates.length === 1) {
      onMouseOver();
    }
  }
  function buildMonthSwitch() {
    if (self.config.showMonths > 1 || self.config.monthSelectorType !== "dropdown")
      return;
    var shouldBuildMonth = function(month2) {
      if (self.config.minDate !== void 0 && self.currentYear === self.config.minDate.getFullYear() && month2 < self.config.minDate.getMonth()) {
        return false;
      }
      return !(self.config.maxDate !== void 0 && self.currentYear === self.config.maxDate.getFullYear() && month2 > self.config.maxDate.getMonth());
    };
    self.monthsDropdownContainer.tabIndex = -1;
    self.monthsDropdownContainer.innerHTML = "";
    for (var i = 0; i < 12; i++) {
      if (!shouldBuildMonth(i))
        continue;
      var month = createElement("option", "flatpickr-monthDropdown-month");
      month.value = new Date(self.currentYear, i).getMonth().toString();
      month.textContent = monthToStr(i, self.config.shorthandCurrentMonth, self.l10n);
      month.tabIndex = -1;
      if (self.currentMonth === i) {
        month.selected = true;
      }
      self.monthsDropdownContainer.appendChild(month);
    }
  }
  function buildMonth() {
    var container = createElement("div", "flatpickr-month");
    var monthNavFragment = window.document.createDocumentFragment();
    var monthElement;
    if (self.config.showMonths > 1 || self.config.monthSelectorType === "static") {
      monthElement = createElement("span", "cur-month");
    } else {
      self.monthsDropdownContainer = createElement("select", "flatpickr-monthDropdown-months");
      self.monthsDropdownContainer.setAttribute("aria-label", self.l10n.monthAriaLabel);
      bind(self.monthsDropdownContainer, "change", function(e) {
        var target = getEventTarget(e);
        var selectedMonth = parseInt(target.value, 10);
        self.changeMonth(selectedMonth - self.currentMonth);
        triggerEvent("onMonthChange");
      });
      buildMonthSwitch();
      monthElement = self.monthsDropdownContainer;
    }
    var yearInput = createNumberInput("cur-year", { tabindex: "-1" });
    var yearElement = yearInput.getElementsByTagName("input")[0];
    yearElement.setAttribute("aria-label", self.l10n.yearAriaLabel);
    if (self.config.minDate) {
      yearElement.setAttribute("min", self.config.minDate.getFullYear().toString());
    }
    if (self.config.maxDate) {
      yearElement.setAttribute("max", self.config.maxDate.getFullYear().toString());
      yearElement.disabled = !!self.config.minDate && self.config.minDate.getFullYear() === self.config.maxDate.getFullYear();
    }
    var currentMonth = createElement("div", "flatpickr-current-month");
    currentMonth.appendChild(monthElement);
    currentMonth.appendChild(yearInput);
    monthNavFragment.appendChild(currentMonth);
    container.appendChild(monthNavFragment);
    return {
      container,
      yearElement,
      monthElement
    };
  }
  function buildMonths() {
    clearNode(self.monthNav);
    self.monthNav.appendChild(self.prevMonthNav);
    if (self.config.showMonths) {
      self.yearElements = [];
      self.monthElements = [];
    }
    for (var m = self.config.showMonths; m--; ) {
      var month = buildMonth();
      self.yearElements.push(month.yearElement);
      self.monthElements.push(month.monthElement);
      self.monthNav.appendChild(month.container);
    }
    self.monthNav.appendChild(self.nextMonthNav);
  }
  function buildMonthNav() {
    self.monthNav = createElement("div", "flatpickr-months");
    self.yearElements = [];
    self.monthElements = [];
    self.prevMonthNav = createElement("span", "flatpickr-prev-month");
    self.prevMonthNav.innerHTML = self.config.prevArrow;
    self.nextMonthNav = createElement("span", "flatpickr-next-month");
    self.nextMonthNav.innerHTML = self.config.nextArrow;
    buildMonths();
    Object.defineProperty(self, "_hidePrevMonthArrow", {
      get: function() {
        return self.__hidePrevMonthArrow;
      },
      set: function(bool) {
        if (self.__hidePrevMonthArrow !== bool) {
          toggleClass(self.prevMonthNav, "flatpickr-disabled", bool);
          self.__hidePrevMonthArrow = bool;
        }
      }
    });
    Object.defineProperty(self, "_hideNextMonthArrow", {
      get: function() {
        return self.__hideNextMonthArrow;
      },
      set: function(bool) {
        if (self.__hideNextMonthArrow !== bool) {
          toggleClass(self.nextMonthNav, "flatpickr-disabled", bool);
          self.__hideNextMonthArrow = bool;
        }
      }
    });
    self.currentYearElement = self.yearElements[0];
    updateNavigationCurrentMonth();
    return self.monthNav;
  }
  function buildTime() {
    self.calendarContainer.classList.add("hasTime");
    if (self.config.noCalendar)
      self.calendarContainer.classList.add("noCalendar");
    var defaults2 = getDefaultHours(self.config);
    self.timeContainer = createElement("div", "flatpickr-time");
    self.timeContainer.tabIndex = -1;
    var separator = createElement("span", "flatpickr-time-separator", ":");
    var hourInput = createNumberInput("flatpickr-hour", {
      "aria-label": self.l10n.hourAriaLabel
    });
    self.hourElement = hourInput.getElementsByTagName("input")[0];
    var minuteInput = createNumberInput("flatpickr-minute", {
      "aria-label": self.l10n.minuteAriaLabel
    });
    self.minuteElement = minuteInput.getElementsByTagName("input")[0];
    self.hourElement.tabIndex = self.minuteElement.tabIndex = -1;
    self.hourElement.value = pad(self.latestSelectedDateObj ? self.latestSelectedDateObj.getHours() : self.config.time_24hr ? defaults2.hours : military2ampm(defaults2.hours));
    self.minuteElement.value = pad(self.latestSelectedDateObj ? self.latestSelectedDateObj.getMinutes() : defaults2.minutes);
    self.hourElement.setAttribute("step", self.config.hourIncrement.toString());
    self.minuteElement.setAttribute("step", self.config.minuteIncrement.toString());
    self.hourElement.setAttribute("min", self.config.time_24hr ? "0" : "1");
    self.hourElement.setAttribute("max", self.config.time_24hr ? "23" : "12");
    self.hourElement.setAttribute("maxlength", "2");
    self.minuteElement.setAttribute("min", "0");
    self.minuteElement.setAttribute("max", "59");
    self.minuteElement.setAttribute("maxlength", "2");
    self.timeContainer.appendChild(hourInput);
    self.timeContainer.appendChild(separator);
    self.timeContainer.appendChild(minuteInput);
    if (self.config.time_24hr)
      self.timeContainer.classList.add("time24hr");
    if (self.config.enableSeconds) {
      self.timeContainer.classList.add("hasSeconds");
      var secondInput = createNumberInput("flatpickr-second");
      self.secondElement = secondInput.getElementsByTagName("input")[0];
      self.secondElement.value = pad(self.latestSelectedDateObj ? self.latestSelectedDateObj.getSeconds() : defaults2.seconds);
      self.secondElement.setAttribute("step", self.minuteElement.getAttribute("step"));
      self.secondElement.setAttribute("min", "0");
      self.secondElement.setAttribute("max", "59");
      self.secondElement.setAttribute("maxlength", "2");
      self.timeContainer.appendChild(createElement("span", "flatpickr-time-separator", ":"));
      self.timeContainer.appendChild(secondInput);
    }
    if (!self.config.time_24hr) {
      self.amPM = createElement("span", "flatpickr-am-pm", self.l10n.amPM[int((self.latestSelectedDateObj ? self.hourElement.value : self.config.defaultHour) > 11)]);
      self.amPM.title = self.l10n.toggleTitle;
      self.amPM.tabIndex = -1;
      self.timeContainer.appendChild(self.amPM);
    }
    return self.timeContainer;
  }
  function buildWeekdays() {
    if (!self.weekdayContainer)
      self.weekdayContainer = createElement("div", "flatpickr-weekdays");
    else
      clearNode(self.weekdayContainer);
    for (var i = self.config.showMonths; i--; ) {
      var container = createElement("div", "flatpickr-weekdaycontainer");
      self.weekdayContainer.appendChild(container);
    }
    updateWeekdays();
    return self.weekdayContainer;
  }
  function updateWeekdays() {
    if (!self.weekdayContainer) {
      return;
    }
    var firstDayOfWeek = self.l10n.firstDayOfWeek;
    var weekdays = __spreadArrays(self.l10n.weekdays.shorthand);
    if (firstDayOfWeek > 0 && firstDayOfWeek < weekdays.length) {
      weekdays = __spreadArrays(weekdays.splice(firstDayOfWeek, weekdays.length), weekdays.splice(0, firstDayOfWeek));
    }
    for (var i = self.config.showMonths; i--; ) {
      self.weekdayContainer.children[i].innerHTML = "\n      <span class='flatpickr-weekday'>\n        " + weekdays.join("</span><span class='flatpickr-weekday'>") + "\n      </span>\n      ";
    }
  }
  function buildWeeks() {
    self.calendarContainer.classList.add("hasWeeks");
    var weekWrapper = createElement("div", "flatpickr-weekwrapper");
    weekWrapper.appendChild(createElement("span", "flatpickr-weekday", self.l10n.weekAbbreviation));
    var weekNumbers = createElement("div", "flatpickr-weeks");
    weekWrapper.appendChild(weekNumbers);
    return {
      weekWrapper,
      weekNumbers
    };
  }
  function changeMonth(value, isOffset) {
    if (isOffset === void 0) {
      isOffset = true;
    }
    var delta = isOffset ? value : value - self.currentMonth;
    if (delta < 0 && self._hidePrevMonthArrow === true || delta > 0 && self._hideNextMonthArrow === true)
      return;
    self.currentMonth += delta;
    if (self.currentMonth < 0 || self.currentMonth > 11) {
      self.currentYear += self.currentMonth > 11 ? 1 : -1;
      self.currentMonth = (self.currentMonth + 12) % 12;
      triggerEvent("onYearChange");
      buildMonthSwitch();
    }
    buildDays();
    triggerEvent("onMonthChange");
    updateNavigationCurrentMonth();
  }
  function clear(triggerChangeEvent, toInitial) {
    if (triggerChangeEvent === void 0) {
      triggerChangeEvent = true;
    }
    if (toInitial === void 0) {
      toInitial = true;
    }
    self.input.value = "";
    if (self.altInput !== void 0)
      self.altInput.value = "";
    if (self.mobileInput !== void 0)
      self.mobileInput.value = "";
    self.selectedDates = [];
    self.latestSelectedDateObj = void 0;
    if (toInitial === true) {
      self.currentYear = self._initialDate.getFullYear();
      self.currentMonth = self._initialDate.getMonth();
    }
    if (self.config.enableTime === true) {
      var _a = getDefaultHours(self.config), hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
      setHours(hours, minutes, seconds);
    }
    self.redraw();
    if (triggerChangeEvent)
      triggerEvent("onChange");
  }
  function close() {
    self.isOpen = false;
    if (!self.isMobile) {
      if (self.calendarContainer !== void 0) {
        self.calendarContainer.classList.remove("open");
      }
      if (self._input !== void 0) {
        self._input.classList.remove("active");
      }
    }
    triggerEvent("onClose");
  }
  function destroy() {
    if (self.config !== void 0)
      triggerEvent("onDestroy");
    for (var i = self._handlers.length; i--; ) {
      self._handlers[i].remove();
    }
    self._handlers = [];
    if (self.mobileInput) {
      if (self.mobileInput.parentNode)
        self.mobileInput.parentNode.removeChild(self.mobileInput);
      self.mobileInput = void 0;
    } else if (self.calendarContainer && self.calendarContainer.parentNode) {
      if (self.config.static && self.calendarContainer.parentNode) {
        var wrapper = self.calendarContainer.parentNode;
        wrapper.lastChild && wrapper.removeChild(wrapper.lastChild);
        if (wrapper.parentNode) {
          while (wrapper.firstChild)
            wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
          wrapper.parentNode.removeChild(wrapper);
        }
      } else
        self.calendarContainer.parentNode.removeChild(self.calendarContainer);
    }
    if (self.altInput) {
      self.input.type = "text";
      if (self.altInput.parentNode)
        self.altInput.parentNode.removeChild(self.altInput);
      delete self.altInput;
    }
    if (self.input) {
      self.input.type = self.input._type;
      self.input.classList.remove("flatpickr-input");
      self.input.removeAttribute("readonly");
    }
    [
      "_showTimeInput",
      "latestSelectedDateObj",
      "_hideNextMonthArrow",
      "_hidePrevMonthArrow",
      "__hideNextMonthArrow",
      "__hidePrevMonthArrow",
      "isMobile",
      "isOpen",
      "selectedDateElem",
      "minDateHasTime",
      "maxDateHasTime",
      "days",
      "daysContainer",
      "_input",
      "_positionElement",
      "innerContainer",
      "rContainer",
      "monthNav",
      "todayDateElem",
      "calendarContainer",
      "weekdayContainer",
      "prevMonthNav",
      "nextMonthNav",
      "monthsDropdownContainer",
      "currentMonthElement",
      "currentYearElement",
      "navigationCurrentMonth",
      "selectedDateElem",
      "config"
    ].forEach(function(k) {
      try {
        delete self[k];
      } catch (_) {
      }
    });
  }
  function isCalendarElem(elem) {
    return self.calendarContainer.contains(elem);
  }
  function documentClick(e) {
    if (self.isOpen && !self.config.inline) {
      var eventTarget_1 = getEventTarget(e);
      var isCalendarElement = isCalendarElem(eventTarget_1);
      var isInput = eventTarget_1 === self.input || eventTarget_1 === self.altInput || self.element.contains(eventTarget_1) || e.path && e.path.indexOf && (~e.path.indexOf(self.input) || ~e.path.indexOf(self.altInput));
      var lostFocus = !isInput && !isCalendarElement && !isCalendarElem(e.relatedTarget);
      var isIgnored = !self.config.ignoredFocusElements.some(function(elem) {
        return elem.contains(eventTarget_1);
      });
      if (lostFocus && isIgnored) {
        if (self.config.allowInput) {
          self.setDate(self._input.value, false, self.config.altInput ? self.config.altFormat : self.config.dateFormat);
        }
        if (self.timeContainer !== void 0 && self.minuteElement !== void 0 && self.hourElement !== void 0 && self.input.value !== "" && self.input.value !== void 0) {
          updateTime();
        }
        self.close();
        if (self.config && self.config.mode === "range" && self.selectedDates.length === 1)
          self.clear(false);
      }
    }
  }
  function changeYear(newYear) {
    if (!newYear || self.config.minDate && newYear < self.config.minDate.getFullYear() || self.config.maxDate && newYear > self.config.maxDate.getFullYear())
      return;
    var newYearNum = newYear, isNewYear = self.currentYear !== newYearNum;
    self.currentYear = newYearNum || self.currentYear;
    if (self.config.maxDate && self.currentYear === self.config.maxDate.getFullYear()) {
      self.currentMonth = Math.min(self.config.maxDate.getMonth(), self.currentMonth);
    } else if (self.config.minDate && self.currentYear === self.config.minDate.getFullYear()) {
      self.currentMonth = Math.max(self.config.minDate.getMonth(), self.currentMonth);
    }
    if (isNewYear) {
      self.redraw();
      triggerEvent("onYearChange");
      buildMonthSwitch();
    }
  }
  function isEnabled(date, timeless) {
    var _a;
    if (timeless === void 0) {
      timeless = true;
    }
    var dateToCheck = self.parseDate(date, void 0, timeless);
    if (self.config.minDate && dateToCheck && compareDates(dateToCheck, self.config.minDate, timeless !== void 0 ? timeless : !self.minDateHasTime) < 0 || self.config.maxDate && dateToCheck && compareDates(dateToCheck, self.config.maxDate, timeless !== void 0 ? timeless : !self.maxDateHasTime) > 0)
      return false;
    if (!self.config.enable && self.config.disable.length === 0)
      return true;
    if (dateToCheck === void 0)
      return false;
    var bool = !!self.config.enable, array = (_a = self.config.enable) !== null && _a !== void 0 ? _a : self.config.disable;
    for (var i = 0, d = void 0; i < array.length; i++) {
      d = array[i];
      if (typeof d === "function" && d(dateToCheck))
        return bool;
      else if (d instanceof Date && dateToCheck !== void 0 && d.getTime() === dateToCheck.getTime())
        return bool;
      else if (typeof d === "string") {
        var parsed = self.parseDate(d, void 0, true);
        return parsed && parsed.getTime() === dateToCheck.getTime() ? bool : !bool;
      } else if (typeof d === "object" && dateToCheck !== void 0 && d.from && d.to && dateToCheck.getTime() >= d.from.getTime() && dateToCheck.getTime() <= d.to.getTime())
        return bool;
    }
    return !bool;
  }
  function isInView(elem) {
    if (self.daysContainer !== void 0)
      return elem.className.indexOf("hidden") === -1 && elem.className.indexOf("flatpickr-disabled") === -1 && self.daysContainer.contains(elem);
    return false;
  }
  function onBlur(e) {
    var isInput = e.target === self._input;
    var valueChanged = self._input.value.trimEnd() !== getDateStr();
    if (isInput && valueChanged && !(e.relatedTarget && isCalendarElem(e.relatedTarget))) {
      self.setDate(self._input.value, true, e.target === self.altInput ? self.config.altFormat : self.config.dateFormat);
    }
  }
  function onKeyDown(e) {
    var eventTarget = getEventTarget(e);
    var isInput = self.config.wrap ? element.contains(eventTarget) : eventTarget === self._input;
    var allowInput = self.config.allowInput;
    var allowKeydown = self.isOpen && (!allowInput || !isInput);
    var allowInlineKeydown = self.config.inline && isInput && !allowInput;
    if (e.keyCode === 13 && isInput) {
      if (allowInput) {
        self.setDate(self._input.value, true, eventTarget === self.altInput ? self.config.altFormat : self.config.dateFormat);
        self.close();
        return eventTarget.blur();
      } else {
        self.open();
      }
    } else if (isCalendarElem(eventTarget) || allowKeydown || allowInlineKeydown) {
      var isTimeObj = !!self.timeContainer && self.timeContainer.contains(eventTarget);
      switch (e.keyCode) {
        case 13:
          if (isTimeObj) {
            e.preventDefault();
            updateTime();
            focusAndClose();
          } else
            selectDate(e);
          break;
        case 27:
          e.preventDefault();
          focusAndClose();
          break;
        case 8:
        case 46:
          if (isInput && !self.config.allowInput) {
            e.preventDefault();
            self.clear();
          }
          break;
        case 37:
        case 39:
          if (!isTimeObj && !isInput) {
            e.preventDefault();
            var activeElement = getClosestActiveElement();
            if (self.daysContainer !== void 0 && (allowInput === false || activeElement && isInView(activeElement))) {
              var delta_1 = e.keyCode === 39 ? 1 : -1;
              if (!e.ctrlKey)
                focusOnDay(void 0, delta_1);
              else {
                e.stopPropagation();
                changeMonth(delta_1);
                focusOnDay(getFirstAvailableDay(1), 0);
              }
            }
          } else if (self.hourElement)
            self.hourElement.focus();
          break;
        case 38:
        case 40:
          e.preventDefault();
          var delta = e.keyCode === 40 ? 1 : -1;
          if (self.daysContainer && eventTarget.$i !== void 0 || eventTarget === self.input || eventTarget === self.altInput) {
            if (e.ctrlKey) {
              e.stopPropagation();
              changeYear(self.currentYear - delta);
              focusOnDay(getFirstAvailableDay(1), 0);
            } else if (!isTimeObj)
              focusOnDay(void 0, delta * 7);
          } else if (eventTarget === self.currentYearElement) {
            changeYear(self.currentYear - delta);
          } else if (self.config.enableTime) {
            if (!isTimeObj && self.hourElement)
              self.hourElement.focus();
            updateTime(e);
            self._debouncedChange();
          }
          break;
        case 9:
          if (isTimeObj) {
            var elems = [
              self.hourElement,
              self.minuteElement,
              self.secondElement,
              self.amPM
            ].concat(self.pluginElements).filter(function(x) {
              return x;
            });
            var i = elems.indexOf(eventTarget);
            if (i !== -1) {
              var target = elems[i + (e.shiftKey ? -1 : 1)];
              e.preventDefault();
              (target || self._input).focus();
            }
          } else if (!self.config.noCalendar && self.daysContainer && self.daysContainer.contains(eventTarget) && e.shiftKey) {
            e.preventDefault();
            self._input.focus();
          }
          break;
      }
    }
    if (self.amPM !== void 0 && eventTarget === self.amPM) {
      switch (e.key) {
        case self.l10n.amPM[0].charAt(0):
        case self.l10n.amPM[0].charAt(0).toLowerCase():
          self.amPM.textContent = self.l10n.amPM[0];
          setHoursFromInputs();
          updateValue();
          break;
        case self.l10n.amPM[1].charAt(0):
        case self.l10n.amPM[1].charAt(0).toLowerCase():
          self.amPM.textContent = self.l10n.amPM[1];
          setHoursFromInputs();
          updateValue();
          break;
      }
    }
    if (isInput || isCalendarElem(eventTarget)) {
      triggerEvent("onKeyDown", e);
    }
  }
  function onMouseOver(elem, cellClass) {
    if (cellClass === void 0) {
      cellClass = "flatpickr-day";
    }
    if (self.selectedDates.length !== 1 || elem && (!elem.classList.contains(cellClass) || elem.classList.contains("flatpickr-disabled")))
      return;
    var hoverDate = elem ? elem.dateObj.getTime() : self.days.firstElementChild.dateObj.getTime(), initialDate = self.parseDate(self.selectedDates[0], void 0, true).getTime(), rangeStartDate = Math.min(hoverDate, self.selectedDates[0].getTime()), rangeEndDate = Math.max(hoverDate, self.selectedDates[0].getTime());
    var containsDisabled = false;
    var minRange = 0, maxRange = 0;
    for (var t = rangeStartDate; t < rangeEndDate; t += duration.DAY) {
      if (!isEnabled(new Date(t), true)) {
        containsDisabled = containsDisabled || t > rangeStartDate && t < rangeEndDate;
        if (t < initialDate && (!minRange || t > minRange))
          minRange = t;
        else if (t > initialDate && (!maxRange || t < maxRange))
          maxRange = t;
      }
    }
    var hoverableCells = Array.from(self.rContainer.querySelectorAll("*:nth-child(-n+" + self.config.showMonths + ") > ." + cellClass));
    hoverableCells.forEach(function(dayElem) {
      var date = dayElem.dateObj;
      var timestamp = date.getTime();
      var outOfRange = minRange > 0 && timestamp < minRange || maxRange > 0 && timestamp > maxRange;
      if (outOfRange) {
        dayElem.classList.add("notAllowed");
        ["inRange", "startRange", "endRange"].forEach(function(c) {
          dayElem.classList.remove(c);
        });
        return;
      } else if (containsDisabled && !outOfRange)
        return;
      ["startRange", "inRange", "endRange", "notAllowed"].forEach(function(c) {
        dayElem.classList.remove(c);
      });
      if (elem !== void 0) {
        elem.classList.add(hoverDate <= self.selectedDates[0].getTime() ? "startRange" : "endRange");
        if (initialDate < hoverDate && timestamp === initialDate)
          dayElem.classList.add("startRange");
        else if (initialDate > hoverDate && timestamp === initialDate)
          dayElem.classList.add("endRange");
        if (timestamp >= minRange && (maxRange === 0 || timestamp <= maxRange) && isBetween(timestamp, initialDate, hoverDate))
          dayElem.classList.add("inRange");
      }
    });
  }
  function onResize() {
    if (self.isOpen && !self.config.static && !self.config.inline)
      positionCalendar();
  }
  function open(e, positionElement) {
    if (positionElement === void 0) {
      positionElement = self._positionElement;
    }
    if (self.isMobile === true) {
      if (e) {
        e.preventDefault();
        var eventTarget = getEventTarget(e);
        if (eventTarget) {
          eventTarget.blur();
        }
      }
      if (self.mobileInput !== void 0) {
        self.mobileInput.focus();
        self.mobileInput.click();
      }
      triggerEvent("onOpen");
      return;
    } else if (self._input.disabled || self.config.inline) {
      return;
    }
    var wasOpen = self.isOpen;
    self.isOpen = true;
    if (!wasOpen) {
      self.calendarContainer.classList.add("open");
      self._input.classList.add("active");
      triggerEvent("onOpen");
      positionCalendar(positionElement);
    }
    if (self.config.enableTime === true && self.config.noCalendar === true) {
      if (self.config.allowInput === false && (e === void 0 || !self.timeContainer.contains(e.relatedTarget))) {
        setTimeout(function() {
          return self.hourElement.select();
        }, 50);
      }
    }
  }
  function minMaxDateSetter(type) {
    return function(date) {
      var dateObj = self.config["_" + type + "Date"] = self.parseDate(date, self.config.dateFormat);
      var inverseDateObj = self.config["_" + (type === "min" ? "max" : "min") + "Date"];
      if (dateObj !== void 0) {
        self[type === "min" ? "minDateHasTime" : "maxDateHasTime"] = dateObj.getHours() > 0 || dateObj.getMinutes() > 0 || dateObj.getSeconds() > 0;
      }
      if (self.selectedDates) {
        self.selectedDates = self.selectedDates.filter(function(d) {
          return isEnabled(d);
        });
        if (!self.selectedDates.length && type === "min")
          setHoursFromDate(dateObj);
        updateValue();
      }
      if (self.daysContainer) {
        redraw();
        if (dateObj !== void 0)
          self.currentYearElement[type] = dateObj.getFullYear().toString();
        else
          self.currentYearElement.removeAttribute(type);
        self.currentYearElement.disabled = !!inverseDateObj && dateObj !== void 0 && inverseDateObj.getFullYear() === dateObj.getFullYear();
      }
    };
  }
  function parseConfig() {
    var boolOpts = [
      "wrap",
      "weekNumbers",
      "allowInput",
      "allowInvalidPreload",
      "clickOpens",
      "time_24hr",
      "enableTime",
      "noCalendar",
      "altInput",
      "shorthandCurrentMonth",
      "inline",
      "static",
      "enableSeconds",
      "disableMobile"
    ];
    var userConfig = __assign(__assign({}, JSON.parse(JSON.stringify(element.dataset || {}))), instanceConfig);
    var formats2 = {};
    self.config.parseDate = userConfig.parseDate;
    self.config.formatDate = userConfig.formatDate;
    Object.defineProperty(self.config, "enable", {
      get: function() {
        return self.config._enable;
      },
      set: function(dates) {
        self.config._enable = parseDateRules(dates);
      }
    });
    Object.defineProperty(self.config, "disable", {
      get: function() {
        return self.config._disable;
      },
      set: function(dates) {
        self.config._disable = parseDateRules(dates);
      }
    });
    var timeMode = userConfig.mode === "time";
    if (!userConfig.dateFormat && (userConfig.enableTime || timeMode)) {
      var defaultDateFormat = flatpickr.defaultConfig.dateFormat || defaults.dateFormat;
      formats2.dateFormat = userConfig.noCalendar || timeMode ? "H:i" + (userConfig.enableSeconds ? ":S" : "") : defaultDateFormat + " H:i" + (userConfig.enableSeconds ? ":S" : "");
    }
    if (userConfig.altInput && (userConfig.enableTime || timeMode) && !userConfig.altFormat) {
      var defaultAltFormat = flatpickr.defaultConfig.altFormat || defaults.altFormat;
      formats2.altFormat = userConfig.noCalendar || timeMode ? "h:i" + (userConfig.enableSeconds ? ":S K" : " K") : defaultAltFormat + (" h:i" + (userConfig.enableSeconds ? ":S" : "") + " K");
    }
    Object.defineProperty(self.config, "minDate", {
      get: function() {
        return self.config._minDate;
      },
      set: minMaxDateSetter("min")
    });
    Object.defineProperty(self.config, "maxDate", {
      get: function() {
        return self.config._maxDate;
      },
      set: minMaxDateSetter("max")
    });
    var minMaxTimeSetter = function(type) {
      return function(val) {
        self.config[type === "min" ? "_minTime" : "_maxTime"] = self.parseDate(val, "H:i:S");
      };
    };
    Object.defineProperty(self.config, "minTime", {
      get: function() {
        return self.config._minTime;
      },
      set: minMaxTimeSetter("min")
    });
    Object.defineProperty(self.config, "maxTime", {
      get: function() {
        return self.config._maxTime;
      },
      set: minMaxTimeSetter("max")
    });
    if (userConfig.mode === "time") {
      self.config.noCalendar = true;
      self.config.enableTime = true;
    }
    Object.assign(self.config, formats2, userConfig);
    for (var i = 0; i < boolOpts.length; i++)
      self.config[boolOpts[i]] = self.config[boolOpts[i]] === true || self.config[boolOpts[i]] === "true";
    HOOKS.filter(function(hook) {
      return self.config[hook] !== void 0;
    }).forEach(function(hook) {
      self.config[hook] = arrayify(self.config[hook] || []).map(bindToInstance);
    });
    self.isMobile = !self.config.disableMobile && !self.config.inline && self.config.mode === "single" && !self.config.disable.length && !self.config.enable && !self.config.weekNumbers && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    for (var i = 0; i < self.config.plugins.length; i++) {
      var pluginConf = self.config.plugins[i](self) || {};
      for (var key in pluginConf) {
        if (HOOKS.indexOf(key) > -1) {
          self.config[key] = arrayify(pluginConf[key]).map(bindToInstance).concat(self.config[key]);
        } else if (typeof userConfig[key] === "undefined")
          self.config[key] = pluginConf[key];
      }
    }
    if (!userConfig.altInputClass) {
      self.config.altInputClass = getInputElem().className + " " + self.config.altInputClass;
    }
    triggerEvent("onParseConfig");
  }
  function getInputElem() {
    return self.config.wrap ? element.querySelector("[data-input]") : element;
  }
  function setupLocale() {
    if (typeof self.config.locale !== "object" && typeof flatpickr.l10ns[self.config.locale] === "undefined")
      self.config.errorHandler(new Error("flatpickr: invalid locale " + self.config.locale));
    self.l10n = __assign(__assign({}, flatpickr.l10ns.default), typeof self.config.locale === "object" ? self.config.locale : self.config.locale !== "default" ? flatpickr.l10ns[self.config.locale] : void 0);
    tokenRegex.D = "(" + self.l10n.weekdays.shorthand.join("|") + ")";
    tokenRegex.l = "(" + self.l10n.weekdays.longhand.join("|") + ")";
    tokenRegex.M = "(" + self.l10n.months.shorthand.join("|") + ")";
    tokenRegex.F = "(" + self.l10n.months.longhand.join("|") + ")";
    tokenRegex.K = "(" + self.l10n.amPM[0] + "|" + self.l10n.amPM[1] + "|" + self.l10n.amPM[0].toLowerCase() + "|" + self.l10n.amPM[1].toLowerCase() + ")";
    var userConfig = __assign(__assign({}, instanceConfig), JSON.parse(JSON.stringify(element.dataset || {})));
    if (userConfig.time_24hr === void 0 && flatpickr.defaultConfig.time_24hr === void 0) {
      self.config.time_24hr = self.l10n.time_24hr;
    }
    self.formatDate = createDateFormatter(self);
    self.parseDate = createDateParser({ config: self.config, l10n: self.l10n });
  }
  function positionCalendar(customPositionElement) {
    if (typeof self.config.position === "function") {
      return void self.config.position(self, customPositionElement);
    }
    if (self.calendarContainer === void 0)
      return;
    triggerEvent("onPreCalendarPosition");
    var positionElement = customPositionElement || self._positionElement;
    var calendarHeight = Array.prototype.reduce.call(self.calendarContainer.children, (function(acc, child) {
      return acc + child.offsetHeight;
    }), 0), calendarWidth = self.calendarContainer.offsetWidth, configPos = self.config.position.split(" "), configPosVertical = configPos[0], configPosHorizontal = configPos.length > 1 ? configPos[1] : null, inputBounds = positionElement.getBoundingClientRect(), distanceFromBottom = window.innerHeight - inputBounds.bottom, showOnTop = configPosVertical === "above" || configPosVertical !== "below" && distanceFromBottom < calendarHeight && inputBounds.top > calendarHeight;
    var top = window.pageYOffset + inputBounds.top + (!showOnTop ? positionElement.offsetHeight + 2 : -calendarHeight - 2);
    toggleClass(self.calendarContainer, "arrowTop", !showOnTop);
    toggleClass(self.calendarContainer, "arrowBottom", showOnTop);
    if (self.config.inline)
      return;
    var left = window.pageXOffset + inputBounds.left;
    var isCenter = false;
    var isRight = false;
    if (configPosHorizontal === "center") {
      left -= (calendarWidth - inputBounds.width) / 2;
      isCenter = true;
    } else if (configPosHorizontal === "right") {
      left -= calendarWidth - inputBounds.width;
      isRight = true;
    }
    toggleClass(self.calendarContainer, "arrowLeft", !isCenter && !isRight);
    toggleClass(self.calendarContainer, "arrowCenter", isCenter);
    toggleClass(self.calendarContainer, "arrowRight", isRight);
    var right = window.document.body.offsetWidth - (window.pageXOffset + inputBounds.right);
    var rightMost = left + calendarWidth > window.document.body.offsetWidth;
    var centerMost = right + calendarWidth > window.document.body.offsetWidth;
    toggleClass(self.calendarContainer, "rightMost", rightMost);
    if (self.config.static)
      return;
    self.calendarContainer.style.top = top + "px";
    if (!rightMost) {
      self.calendarContainer.style.left = left + "px";
      self.calendarContainer.style.right = "auto";
    } else if (!centerMost) {
      self.calendarContainer.style.left = "auto";
      self.calendarContainer.style.right = right + "px";
    } else {
      var doc = getDocumentStyleSheet();
      if (doc === void 0)
        return;
      var bodyWidth = window.document.body.offsetWidth;
      var centerLeft = Math.max(0, bodyWidth / 2 - calendarWidth / 2);
      var centerBefore = ".flatpickr-calendar.centerMost:before";
      var centerAfter = ".flatpickr-calendar.centerMost:after";
      var centerIndex = doc.cssRules.length;
      var centerStyle = "{left:" + inputBounds.left + "px;right:auto;}";
      toggleClass(self.calendarContainer, "rightMost", false);
      toggleClass(self.calendarContainer, "centerMost", true);
      doc.insertRule(centerBefore + "," + centerAfter + centerStyle, centerIndex);
      self.calendarContainer.style.left = centerLeft + "px";
      self.calendarContainer.style.right = "auto";
    }
  }
  function getDocumentStyleSheet() {
    var editableSheet = null;
    for (var i = 0; i < document.styleSheets.length; i++) {
      var sheet = document.styleSheets[i];
      if (!sheet.cssRules)
        continue;
      try {
        sheet.cssRules;
      } catch (err) {
        continue;
      }
      editableSheet = sheet;
      break;
    }
    return editableSheet != null ? editableSheet : createStyleSheet();
  }
  function createStyleSheet() {
    var style = document.createElement("style");
    document.head.appendChild(style);
    return style.sheet;
  }
  function redraw() {
    if (self.config.noCalendar || self.isMobile)
      return;
    buildMonthSwitch();
    updateNavigationCurrentMonth();
    buildDays();
  }
  function focusAndClose() {
    self._input.focus();
    if (window.navigator.userAgent.indexOf("MSIE") !== -1 || navigator.msMaxTouchPoints !== void 0) {
      setTimeout(self.close, 0);
    } else {
      self.close();
    }
  }
  function selectDate(e) {
    e.preventDefault();
    e.stopPropagation();
    var isSelectable = function(day) {
      return day.classList && day.classList.contains("flatpickr-day") && !day.classList.contains("flatpickr-disabled") && !day.classList.contains("notAllowed");
    };
    var t = findParent(getEventTarget(e), isSelectable);
    if (t === void 0)
      return;
    var target = t;
    var selectedDate = self.latestSelectedDateObj = new Date(target.dateObj.getTime());
    var shouldChangeMonth = (selectedDate.getMonth() < self.currentMonth || selectedDate.getMonth() > self.currentMonth + self.config.showMonths - 1) && self.config.mode !== "range";
    self.selectedDateElem = target;
    if (self.config.mode === "single")
      self.selectedDates = [selectedDate];
    else if (self.config.mode === "multiple") {
      var selectedIndex = isDateSelected(selectedDate);
      if (selectedIndex)
        self.selectedDates.splice(parseInt(selectedIndex), 1);
      else
        self.selectedDates.push(selectedDate);
    } else if (self.config.mode === "range") {
      if (self.selectedDates.length === 2) {
        self.clear(false, false);
      }
      self.latestSelectedDateObj = selectedDate;
      self.selectedDates.push(selectedDate);
      if (compareDates(selectedDate, self.selectedDates[0], true) !== 0)
        self.selectedDates.sort(function(a, b) {
          return a.getTime() - b.getTime();
        });
    }
    setHoursFromInputs();
    if (shouldChangeMonth) {
      var isNewYear = self.currentYear !== selectedDate.getFullYear();
      self.currentYear = selectedDate.getFullYear();
      self.currentMonth = selectedDate.getMonth();
      if (isNewYear) {
        triggerEvent("onYearChange");
        buildMonthSwitch();
      }
      triggerEvent("onMonthChange");
    }
    updateNavigationCurrentMonth();
    buildDays();
    updateValue();
    if (!shouldChangeMonth && self.config.mode !== "range" && self.config.showMonths === 1)
      focusOnDayElem(target);
    else if (self.selectedDateElem !== void 0 && self.hourElement === void 0) {
      self.selectedDateElem && self.selectedDateElem.focus();
    }
    if (self.hourElement !== void 0)
      self.hourElement !== void 0 && self.hourElement.focus();
    if (self.config.closeOnSelect) {
      var single = self.config.mode === "single" && !self.config.enableTime;
      var range = self.config.mode === "range" && self.selectedDates.length === 2 && !self.config.enableTime;
      if (single || range) {
        focusAndClose();
      }
    }
    triggerChange();
  }
  var CALLBACKS = {
    locale: [setupLocale, updateWeekdays],
    showMonths: [buildMonths, setCalendarWidth, buildWeekdays],
    minDate: [jumpToDate],
    maxDate: [jumpToDate],
    positionElement: [updatePositionElement],
    clickOpens: [
      function() {
        if (self.config.clickOpens === true) {
          bind(self._input, "focus", self.open);
          bind(self._input, "click", self.open);
        } else {
          self._input.removeEventListener("focus", self.open);
          self._input.removeEventListener("click", self.open);
        }
      }
    ]
  };
  function set(option, value) {
    if (option !== null && typeof option === "object") {
      Object.assign(self.config, option);
      for (var key in option) {
        if (CALLBACKS[key] !== void 0)
          CALLBACKS[key].forEach(function(x) {
            return x();
          });
      }
    } else {
      self.config[option] = value;
      if (CALLBACKS[option] !== void 0)
        CALLBACKS[option].forEach(function(x) {
          return x();
        });
      else if (HOOKS.indexOf(option) > -1)
        self.config[option] = arrayify(value);
    }
    self.redraw();
    updateValue(true);
  }
  function setSelectedDate(inputDate, format) {
    var dates = [];
    if (inputDate instanceof Array)
      dates = inputDate.map(function(d) {
        return self.parseDate(d, format);
      });
    else if (inputDate instanceof Date || typeof inputDate === "number")
      dates = [self.parseDate(inputDate, format)];
    else if (typeof inputDate === "string") {
      switch (self.config.mode) {
        case "single":
        case "time":
          dates = [self.parseDate(inputDate, format)];
          break;
        case "multiple":
          dates = inputDate.split(self.config.conjunction).map(function(date) {
            return self.parseDate(date, format);
          });
          break;
        case "range":
          dates = inputDate.split(self.l10n.rangeSeparator).map(function(date) {
            return self.parseDate(date, format);
          });
          break;
      }
    } else
      self.config.errorHandler(new Error("Invalid date supplied: " + JSON.stringify(inputDate)));
    self.selectedDates = self.config.allowInvalidPreload ? dates : dates.filter(function(d) {
      return d instanceof Date && isEnabled(d, false);
    });
    if (self.config.mode === "range")
      self.selectedDates.sort(function(a, b) {
        return a.getTime() - b.getTime();
      });
  }
  function setDate(date, triggerChange2, format) {
    if (triggerChange2 === void 0) {
      triggerChange2 = false;
    }
    if (format === void 0) {
      format = self.config.dateFormat;
    }
    if (date !== 0 && !date || date instanceof Array && date.length === 0)
      return self.clear(triggerChange2);
    setSelectedDate(date, format);
    self.latestSelectedDateObj = self.selectedDates[self.selectedDates.length - 1];
    self.redraw();
    jumpToDate(void 0, triggerChange2);
    setHoursFromDate();
    if (self.selectedDates.length === 0) {
      self.clear(false);
    }
    updateValue(triggerChange2);
    if (triggerChange2)
      triggerEvent("onChange");
  }
  function parseDateRules(arr) {
    return arr.slice().map(function(rule) {
      if (typeof rule === "string" || typeof rule === "number" || rule instanceof Date) {
        return self.parseDate(rule, void 0, true);
      } else if (rule && typeof rule === "object" && rule.from && rule.to)
        return {
          from: self.parseDate(rule.from, void 0),
          to: self.parseDate(rule.to, void 0)
        };
      return rule;
    }).filter(function(x) {
      return x;
    });
  }
  function setupDates() {
    self.selectedDates = [];
    self.now = self.parseDate(self.config.now) || /* @__PURE__ */ new Date();
    var preloadedDate = self.config.defaultDate || ((self.input.nodeName === "INPUT" || self.input.nodeName === "TEXTAREA") && self.input.placeholder && self.input.value === self.input.placeholder ? null : self.input.value);
    if (preloadedDate)
      setSelectedDate(preloadedDate, self.config.dateFormat);
    self._initialDate = self.selectedDates.length > 0 ? self.selectedDates[0] : self.config.minDate && self.config.minDate.getTime() > self.now.getTime() ? self.config.minDate : self.config.maxDate && self.config.maxDate.getTime() < self.now.getTime() ? self.config.maxDate : self.now;
    self.currentYear = self._initialDate.getFullYear();
    self.currentMonth = self._initialDate.getMonth();
    if (self.selectedDates.length > 0)
      self.latestSelectedDateObj = self.selectedDates[0];
    if (self.config.minTime !== void 0)
      self.config.minTime = self.parseDate(self.config.minTime, "H:i");
    if (self.config.maxTime !== void 0)
      self.config.maxTime = self.parseDate(self.config.maxTime, "H:i");
    self.minDateHasTime = !!self.config.minDate && (self.config.minDate.getHours() > 0 || self.config.minDate.getMinutes() > 0 || self.config.minDate.getSeconds() > 0);
    self.maxDateHasTime = !!self.config.maxDate && (self.config.maxDate.getHours() > 0 || self.config.maxDate.getMinutes() > 0 || self.config.maxDate.getSeconds() > 0);
  }
  function setupInputs() {
    self.input = getInputElem();
    if (!self.input) {
      self.config.errorHandler(new Error("Invalid input element specified"));
      return;
    }
    self.input._type = self.input.type;
    self.input.type = "text";
    self.input.classList.add("flatpickr-input");
    self._input = self.input;
    if (self.config.altInput) {
      self.altInput = createElement(self.input.nodeName, self.config.altInputClass);
      self._input = self.altInput;
      self.altInput.placeholder = self.input.placeholder;
      self.altInput.disabled = self.input.disabled;
      self.altInput.required = self.input.required;
      self.altInput.tabIndex = self.input.tabIndex;
      self.altInput.type = "text";
      self.input.setAttribute("type", "hidden");
      if (!self.config.static && self.input.parentNode)
        self.input.parentNode.insertBefore(self.altInput, self.input.nextSibling);
    }
    if (!self.config.allowInput)
      self._input.setAttribute("readonly", "readonly");
    updatePositionElement();
  }
  function updatePositionElement() {
    self._positionElement = self.config.positionElement || self._input;
  }
  function setupMobile() {
    var inputType = self.config.enableTime ? self.config.noCalendar ? "time" : "datetime-local" : "date";
    self.mobileInput = createElement("input", self.input.className + " flatpickr-mobile");
    self.mobileInput.tabIndex = 1;
    self.mobileInput.type = inputType;
    self.mobileInput.disabled = self.input.disabled;
    self.mobileInput.required = self.input.required;
    self.mobileInput.placeholder = self.input.placeholder;
    self.mobileFormatStr = inputType === "datetime-local" ? "Y-m-d\\TH:i:S" : inputType === "date" ? "Y-m-d" : "H:i:S";
    if (self.selectedDates.length > 0) {
      self.mobileInput.defaultValue = self.mobileInput.value = self.formatDate(self.selectedDates[0], self.mobileFormatStr);
    }
    if (self.config.minDate)
      self.mobileInput.min = self.formatDate(self.config.minDate, "Y-m-d");
    if (self.config.maxDate)
      self.mobileInput.max = self.formatDate(self.config.maxDate, "Y-m-d");
    if (self.input.getAttribute("step"))
      self.mobileInput.step = String(self.input.getAttribute("step"));
    self.input.type = "hidden";
    if (self.altInput !== void 0)
      self.altInput.type = "hidden";
    try {
      if (self.input.parentNode)
        self.input.parentNode.insertBefore(self.mobileInput, self.input.nextSibling);
    } catch (_a) {
    }
    bind(self.mobileInput, "change", function(e) {
      self.setDate(getEventTarget(e).value, false, self.mobileFormatStr);
      triggerEvent("onChange");
      triggerEvent("onClose");
    });
  }
  function toggle(e) {
    if (self.isOpen === true)
      return self.close();
    self.open(e);
  }
  function triggerEvent(event, data) {
    if (self.config === void 0)
      return;
    var hooks = self.config[event];
    if (hooks !== void 0 && hooks.length > 0) {
      for (var i = 0; hooks[i] && i < hooks.length; i++)
        hooks[i](self.selectedDates, self.input.value, self, data);
    }
    if (event === "onChange") {
      self.input.dispatchEvent(createEvent("change"));
      self.input.dispatchEvent(createEvent("input"));
    }
  }
  function createEvent(name) {
    var e = document.createEvent("Event");
    e.initEvent(name, true, true);
    return e;
  }
  function isDateSelected(date) {
    for (var i = 0; i < self.selectedDates.length; i++) {
      var selectedDate = self.selectedDates[i];
      if (selectedDate instanceof Date && compareDates(selectedDate, date) === 0)
        return "" + i;
    }
    return false;
  }
  function isDateInRange(date) {
    if (self.config.mode !== "range" || self.selectedDates.length < 2)
      return false;
    return compareDates(date, self.selectedDates[0]) >= 0 && compareDates(date, self.selectedDates[1]) <= 0;
  }
  function updateNavigationCurrentMonth() {
    if (self.config.noCalendar || self.isMobile || !self.monthNav)
      return;
    self.yearElements.forEach(function(yearElement, i) {
      var d = new Date(self.currentYear, self.currentMonth, 1);
      d.setMonth(self.currentMonth + i);
      if (self.config.showMonths > 1 || self.config.monthSelectorType === "static") {
        self.monthElements[i].textContent = monthToStr(d.getMonth(), self.config.shorthandCurrentMonth, self.l10n) + " ";
      } else {
        self.monthsDropdownContainer.value = d.getMonth().toString();
      }
      yearElement.value = d.getFullYear().toString();
    });
    self._hidePrevMonthArrow = self.config.minDate !== void 0 && (self.currentYear === self.config.minDate.getFullYear() ? self.currentMonth <= self.config.minDate.getMonth() : self.currentYear < self.config.minDate.getFullYear());
    self._hideNextMonthArrow = self.config.maxDate !== void 0 && (self.currentYear === self.config.maxDate.getFullYear() ? self.currentMonth + 1 > self.config.maxDate.getMonth() : self.currentYear > self.config.maxDate.getFullYear());
  }
  function getDateStr(specificFormat) {
    var format = specificFormat || (self.config.altInput ? self.config.altFormat : self.config.dateFormat);
    return self.selectedDates.map(function(dObj) {
      return self.formatDate(dObj, format);
    }).filter(function(d, i, arr) {
      return self.config.mode !== "range" || self.config.enableTime || arr.indexOf(d) === i;
    }).join(self.config.mode !== "range" ? self.config.conjunction : self.l10n.rangeSeparator);
  }
  function updateValue(triggerChange2) {
    if (triggerChange2 === void 0) {
      triggerChange2 = true;
    }
    if (self.mobileInput !== void 0 && self.mobileFormatStr) {
      self.mobileInput.value = self.latestSelectedDateObj !== void 0 ? self.formatDate(self.latestSelectedDateObj, self.mobileFormatStr) : "";
    }
    self.input.value = getDateStr(self.config.dateFormat);
    if (self.altInput !== void 0) {
      self.altInput.value = getDateStr(self.config.altFormat);
    }
    if (triggerChange2 !== false)
      triggerEvent("onValueUpdate");
  }
  function onMonthNavClick(e) {
    var eventTarget = getEventTarget(e);
    var isPrevMonth = self.prevMonthNav.contains(eventTarget);
    var isNextMonth = self.nextMonthNav.contains(eventTarget);
    if (isPrevMonth || isNextMonth) {
      changeMonth(isPrevMonth ? -1 : 1);
    } else if (self.yearElements.indexOf(eventTarget) >= 0) {
      eventTarget.select();
    } else if (eventTarget.classList.contains("arrowUp")) {
      self.changeYear(self.currentYear + 1);
    } else if (eventTarget.classList.contains("arrowDown")) {
      self.changeYear(self.currentYear - 1);
    }
  }
  function timeWrapper(e) {
    e.preventDefault();
    var isKeyDown = e.type === "keydown", eventTarget = getEventTarget(e), input = eventTarget;
    if (self.amPM !== void 0 && eventTarget === self.amPM) {
      self.amPM.textContent = self.l10n.amPM[int(self.amPM.textContent === self.l10n.amPM[0])];
    }
    var min = parseFloat(input.getAttribute("min")), max = parseFloat(input.getAttribute("max")), step = parseFloat(input.getAttribute("step")), curValue = parseInt(input.value, 10), delta = e.delta || (isKeyDown ? e.which === 38 ? 1 : -1 : 0);
    var newValue = curValue + step * delta;
    if (typeof input.value !== "undefined" && input.value.length === 2) {
      var isHourElem = input === self.hourElement, isMinuteElem = input === self.minuteElement;
      if (newValue < min) {
        newValue = max + newValue + int(!isHourElem) + (int(isHourElem) && int(!self.amPM));
        if (isMinuteElem)
          incrementNumInput(void 0, -1, self.hourElement);
      } else if (newValue > max) {
        newValue = input === self.hourElement ? newValue - max - int(!self.amPM) : min;
        if (isMinuteElem)
          incrementNumInput(void 0, 1, self.hourElement);
      }
      if (self.amPM && isHourElem && (step === 1 ? newValue + curValue === 23 : Math.abs(newValue - curValue) > step)) {
        self.amPM.textContent = self.l10n.amPM[int(self.amPM.textContent === self.l10n.amPM[0])];
      }
      input.value = pad(newValue);
    }
  }
  init();
  return self;
}
function _flatpickr(nodeList, config) {
  var nodes = Array.prototype.slice.call(nodeList).filter(function(x) {
    return x instanceof HTMLElement;
  });
  var instances = [];
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    try {
      if (node.getAttribute("data-fp-omit") !== null)
        continue;
      if (node._flatpickr !== void 0) {
        node._flatpickr.destroy();
        node._flatpickr = void 0;
      }
      node._flatpickr = FlatpickrInstance(node, config || {});
      instances.push(node._flatpickr);
    } catch (e) {
      console.error(e);
    }
  }
  return instances.length === 1 ? instances[0] : instances;
}
if (typeof HTMLElement !== "undefined" && typeof HTMLCollection !== "undefined" && typeof NodeList !== "undefined") {
  HTMLCollection.prototype.flatpickr = NodeList.prototype.flatpickr = function(config) {
    return _flatpickr(this, config);
  };
  HTMLElement.prototype.flatpickr = function(config) {
    return _flatpickr([this], config);
  };
}
var flatpickr = function(selector, config) {
  if (typeof selector === "string") {
    return _flatpickr(window.document.querySelectorAll(selector), config);
  } else if (selector instanceof Node) {
    return _flatpickr([selector], config);
  } else {
    return _flatpickr(selector, config);
  }
};
flatpickr.defaultConfig = {};
flatpickr.l10ns = {
  en: __assign({}, english),
  default: __assign({}, english)
};
flatpickr.localize = function(l10n) {
  flatpickr.l10ns.default = __assign(__assign({}, flatpickr.l10ns.default), l10n);
};
flatpickr.setDefaults = function(config) {
  flatpickr.defaultConfig = __assign(__assign({}, flatpickr.defaultConfig), config);
};
flatpickr.parseDate = createDateParser({});
flatpickr.formatDate = createDateFormatter({});
flatpickr.compareDates = compareDates;
if (typeof jQuery !== "undefined" && typeof jQuery.fn !== "undefined") {
  jQuery.fn.flatpickr = function(config) {
    return _flatpickr(this, config);
  };
}
Date.prototype.fp_incr = function(days) {
  return new Date(this.getFullYear(), this.getMonth(), this.getDate() + (typeof days === "string" ? parseInt(days, 10) : days));
};
if (typeof window !== "undefined") {
  window.flatpickr = flatpickr;
}
var ko$1 = { exports: {} };
var ko = ko$1.exports;
var hasRequiredKo;
function requireKo() {
  if (hasRequiredKo) return ko$1.exports;
  hasRequiredKo = 1;
  (function(module, exports$1) {
    (function(global, factory) {
      factory(exports$1);
    })(ko, (function(exports$12) {
      var fp = typeof window !== "undefined" && window.flatpickr !== void 0 ? window.flatpickr : {
        l10ns: {}
      };
      var Korean = {
        weekdays: {
          shorthand: ["일", "월", "화", "수", "목", "금", "토"],
          longhand: [
            "일요일",
            "월요일",
            "화요일",
            "수요일",
            "목요일",
            "금요일",
            "토요일"
          ]
        },
        months: {
          shorthand: [
            "1월",
            "2월",
            "3월",
            "4월",
            "5월",
            "6월",
            "7월",
            "8월",
            "9월",
            "10월",
            "11월",
            "12월"
          ],
          longhand: [
            "1월",
            "2월",
            "3월",
            "4월",
            "5월",
            "6월",
            "7월",
            "8월",
            "9월",
            "10월",
            "11월",
            "12월"
          ]
        },
        ordinal: function() {
          return "일";
        },
        rangeSeparator: " ~ ",
        amPM: ["오전", "오후"]
      };
      fp.l10ns.ko = Korean;
      var ko2 = fp.l10ns;
      exports$12.Korean = Korean;
      exports$12.default = ko2;
      Object.defineProperty(exports$12, "__esModule", { value: true });
    }));
  })(ko$1, ko$1.exports);
  return ko$1.exports;
}
requireKo();
function initStationCardInteractions() {
  const selectBtns = Array.from(document.querySelectorAll(".station-select"));
  if (!selectBtns.length) return;
  let openedBtn = null;
  let openedList = null;
  const setOpen = (btn, list, open, { focusBack = false } = {}) => {
    btn.classList.toggle("is-active", open);
    list.classList.toggle("is-active", open);
    btn.setAttribute("aria-expanded", String(open));
    list.hidden = !open;
    if (!open && focusBack) btn.focus({ preventScroll: true });
  };
  const closeOpened = ({ focusBack = false } = {}) => {
    if (openedBtn && openedList) {
      setOpen(openedBtn, openedList, false, { focusBack });
      openedBtn = null;
      openedList = null;
    }
  };
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Node)) return;
    if (!openedBtn || !openedList) return;
    const inside = openedBtn.contains(t) || openedList.contains(t);
    if (!inside) closeOpened({ focusBack: false });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!openedBtn || !openedList) return;
    closeOpened({ focusBack: true });
  });
  selectBtns.forEach((btn) => {
    const listId = btn.getAttribute("aria-controls");
    const list = listId ? document.getElementById(listId) : null;
    if (!list) return;
    btn.setAttribute("aria-expanded", String(!list.hidden));
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (openedBtn && openedBtn !== btn) closeOpened({ focusBack: false });
      const willOpen = list.hidden;
      setOpen(btn, list, willOpen);
      if (willOpen) {
        openedBtn = btn;
        openedList = list;
        list.querySelector("button:not([disabled])")?.focus({ preventScroll: true });
      } else {
        openedBtn = null;
        openedList = null;
      }
    });
    list.querySelectorAll("ul li button").forEach((item) => {
      item.addEventListener("click", () => {
        const code = item.querySelector(".station-value")?.textContent?.trim();
        const name = item.querySelector(".station-text")?.textContent?.trim();
        btn.querySelector(".station-select-value") && (btn.querySelector(".station-select-value").textContent = code || "");
        btn.querySelector(".station-select-txt") && (btn.querySelector(".station-select-txt").textContent = name || "");
        setOpen(btn, list, false, { focusBack: true });
        openedBtn = null;
        openedList = null;
      });
    });
  });
}
function initQuickMenuSlide() {
  const panel = document.querySelector(".main-quickmenu-pannel");
  if (!panel) return;
  if (panel.hasAttribute("data-initialized")) {
    return;
  }
  panel.setAttribute("data-initialized", "true");
  const toggleBtn = panel.querySelector(".main-quickmenu-toggle");
  const nav = panel.querySelector("#mainQuickMenuPanel");
  const txt = toggleBtn?.querySelector(".txt-hide");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasOpened = sessionStorage.getItem("quickMenuOpened") === "true";
  const syncA11y = (isOpen) => {
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    if (txt) txt.textContent = isOpen ? "퀵메뉴 닫기" : "퀵메뉴 열기";
    const reduce2 = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isOpen) {
      nav.hidden = false;
      nav.toggleAttribute("inert", false);
      if (!reduce2) {
        requestAnimationFrame(() => {
        });
      }
    } else {
      nav.toggleAttribute("inert", true);
      if (reduce2) {
        nav.hidden = true;
      } else {
        const onEnd = (e) => {
          if (e.propertyName !== "transform") return;
          nav.hidden = true;
          nav.removeEventListener("transitionend", onEnd);
        };
        nav.addEventListener("transitionend", onEnd);
      }
      if (nav.contains(document.activeElement)) toggleBtn.focus();
    }
  };
  panel.classList.add("is-mounted");
  if (hasOpened) {
    panel.style.transition = "none";
    toggleBtn.style.transition = "none";
    panel.classList.add("is-open");
    toggleBtn?.setAttribute("aria-expanded", "true");
    syncA11y(true);
    requestAnimationFrame(() => {
      panel.classList.add("is-mounted");
      panel.style.transition = "";
    });
  } else {
    panel.classList.add("is-mounted");
    toggleBtn?.setAttribute("aria-expanded", "false");
    syncA11y(false);
  }
  let timerId = null;
  const openNow = () => {
    panel.classList.add("is-open");
    toggleBtn?.setAttribute("aria-expanded", "true");
    syncA11y(true);
    sessionStorage.setItem("quickMenuOpened", "true");
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
  if (!hasOpened) {
    if (!reduce) {
      requestAnimationFrame(() => {
        timerId = setTimeout(openNow, 700);
      });
    } else {
      panel.style.transition = "none";
      openNow();
    }
  }
  const initialOpen = panel.classList.contains("is-open");
  syncA11y(initialOpen);
  const handleToggle = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    const isOpen = panel.classList.toggle("is-open");
    syncA11y(isOpen);
    sessionStorage.setItem("quickMenuOpened", String(isOpen));
  };
  toggleBtn?.removeEventListener("click", handleToggle);
  toggleBtn?.addEventListener("click", handleToggle);
}
function initSelectFilter() {
  const root = document.querySelector(".search-bar.filter");
  if (!root) return;
  const fieldBox = root.querySelector('.select-box[data-filter="field"]');
  const bidBox = root.querySelector(".select-box.bid");
  const inputBox = root.querySelector(".input-box");
  if (!fieldBox || !bidBox || !inputBox) return;
  const fieldBtnLabel = fieldBox.querySelector(".select-btn span");
  const list = fieldBox.querySelector(".select-list");
  const options = list.querySelectorAll("button");
  options.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      const btn = e.target.closest('li[role="option"] button');
      if (!btn) return;
      const value = btn.textContent.trim();
      if (fieldBtnLabel) fieldBtnLabel.textContent = value;
      const isBidField = value === "입찰종류";
      bidBox.classList.toggle("is-active", isBidField);
      inputBox.classList.toggle("is-hidden", isBidField);
      fieldBox.setAttribute("aria-expanded", "false");
    });
  });
}
function initSelectEmail() {
  const root = document.querySelector(".email-box");
  if (!root) return;
  const EmailBox = root.querySelector('.select-box[data-filter="email"]');
  const emailDomainBox = root.querySelector("#emailDomain");
  if (!EmailBox || !emailDomainBox) return;
  const list = EmailBox.querySelector(".select-list");
  list.querySelectorAll("button");
}
function initDatePicker(selector, options = {}) {
  const defaultOptions = {
    locale: "Korean",
    dateFormat: "Y-m-d",
    minDate: (/* @__PURE__ */ new Date()).fp_incr(1),
    // 내일부터 선택 가능
    enableTime: false,
    // 시간선택
    time_24hr: true,
    mode: "single",
    // 단일선택
    inline: false,
    //  클릭 시 팝업
    onChange: function(selectedDates, dateStr) {
      console.log("선택된 날짜:", dateStr);
    }
  };
  const finalOptions = { ...defaultOptions, ...options };
  return flatpickr(selector, finalOptions);
}
if (typeof window !== "undefined") window.initDatePicker = initDatePicker;
function initScrollAnimation(customOptions = {}, container = document) {
  const main = document.querySelector("#wrap[data-main]");
  const defaultOptions = {
    duration: 500,
    // 2026-12-29 : 900값을 수정
    easing: "ease",
    once: true,
    offset: 80,
    disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches || false,
    storageKey: "scrollAnimationPlayed_main"
    // 실행 기록 저장 key
  };
  const options = { ...defaultOptions, ...customOptions };
  const elements = container.querySelectorAll("[data-animation]");
  const playedIndexes = main ? JSON.parse(sessionStorage.getItem(options.storageKey) || "[]") : [];
  if (options.disable) {
    elements.forEach((el) => {
      el.classList.add("animate");
      el.style.transition = "none";
    });
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const index = [...elements].indexOf(target);
          const delay = index * 80;
          target.style.transition = `
          opacity ${options.duration}ms ${options.easing},
          transform ${options.duration}ms ${options.easing}
        `;
          target.style.transitionDelay = `${delay}ms`;
          target.classList.add("animate");
          if (main && !playedIndexes.includes(index)) {
            playedIndexes.push(index);
            sessionStorage.setItem(options.storageKey, JSON.stringify(playedIndexes));
          }
          if (options.once) observer.unobserve(target);
        }
      });
    },
    {
      threshold: 0,
      rootMargin: `0px 0px -${options.offset}px 0px`
    }
  );
  elements.forEach((el, i) => {
    if (main && playedIndexes.includes(i)) {
      el.classList.add("animate");
      el.style.transition = "none";
    } else {
      observer.observe(el);
    }
  });
}
if (typeof window !== "undefined") window.initScrollAnimation = initScrollAnimation;
function initAccordionToggleAll() {
  const toggleAllBtn = document.querySelector('[data-accordion="toggle-all"]');
  const accBtns = document.querySelectorAll(".acc-list .acc-btn");
  if (!toggleAllBtn || !accBtns.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  toggleAllBtn.setAttribute("aria-pressed", "false");
  toggleAllBtn.setAttribute("aria-expanded", "false");
  Array.from(accBtns).forEach((btn) => {
    const panelId = btn.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    panel.style.overflow = "hidden";
    panel.style.transition = panel.style.transition || "max-height 300ms ease";
    panel.style.maxHeight = isOpen ? "none" : "0";
    if (!isOpen) panel.setAttribute("hidden", "");
  });
  const allOpen = () => Array.from(accBtns).every((btn) => btn.getAttribute("aria-expanded") === "true");
  toggleAllBtn.addEventListener("click", () => {
    const shouldOpen = !allOpen();
    Array.from(accBtns).forEach((btn) => {
      const panelId = btn.getAttribute("aria-controls");
      const panel = document.getElementById(panelId);
      if (!panel) return;
      if (shouldOpen) {
        btn.setAttribute("aria-expanded", "true");
        btn.classList.add("is-open");
        panel.classList.add("is-open");
        panel.removeAttribute("hidden");
        if (reduce) {
          panel.style.maxHeight = "none";
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
          panel.addEventListener(
            "transitionend",
            () => {
              if (panel.classList.contains("is-open")) {
                panel.style.maxHeight = "none";
              }
            },
            { once: true }
          );
        }
      } else {
        btn.setAttribute("aria-expanded", "false");
        btn.classList.remove("is-open");
        panel.classList.remove("is-open");
        if (reduce) {
          panel.style.maxHeight = "0";
          panel.setAttribute("hidden", "");
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
          requestAnimationFrame(() => {
            panel.style.maxHeight = "0";
          });
          panel.addEventListener(
            "transitionend",
            () => {
              if (!panel.classList.contains("is-open")) {
                panel.setAttribute("hidden", "");
              }
            },
            { once: true }
          );
        }
      }
    });
    toggleAllBtn.setAttribute("aria-pressed", String(shouldOpen));
    toggleAllBtn.setAttribute("aria-expanded", String(shouldOpen));
    toggleAllBtn.classList.toggle("is-open", shouldOpen);
    const label = toggleAllBtn.querySelector("span");
    if (label) label.textContent = shouldOpen ? "전체 닫기" : "전체 보기";
  });
}
function initCommon() {
  initStationCardInteractions();
  initQuickMenuSlide();
  initSelectFilter();
  initSelectEmail();
  initScrollAnimation();
  initAccordionToggleAll();
  initDatePicker("#date");
}
document.addEventListener("DOMContentLoaded", initCommon);
const isHome = document.body.dataset.page === "home";
if (isHome) {
  __vitePreload(() => Promise.resolve().then(() => home), true ? void 0 : void 0);
}
