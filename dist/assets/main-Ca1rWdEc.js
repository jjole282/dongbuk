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
function initScrollAnimation(customOptions = {}, container = document) {
  const main = document.querySelector("#wrap[data-main]");
  const defaultOptions = {
    duration: 500,
    // 2025-12-29 : 900값을 수정
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
  initAccordionToggleAll();
}
document.addEventListener("DOMContentLoaded", initCommon);
const isHome = document.body.dataset.page === "home";
if (isHome) {
  __vitePreload(() => Promise.resolve().then(() => home), true ? void 0 : void 0);
}
