// tab.js
(() => {
  function initTabs(root = document) {
    const wraps = root.querySelectorAll('.tab-wrap');

    wraps.forEach((wrap) => {
      // ✅ 탭리스트 후보: role=tablist가 있으면 그걸 우선, 없으면 .tabs 사용
      const tablists = Array.from(
        wrap.querySelectorAll('.tabs[role="tablist"], .tabs')
      );

      tablists.forEach((tablist) => {
        // ✅ 탭 후보: role=tab 우선, 없으면 button.tab-btn
        const tabs = Array.from(
          tablist.querySelectorAll('[role="tab"], .tab-btn')
        );
        if (tabs.length === 0) return;

        // ✅ 이 tablist가 컨트롤하는 패널들을 찾기:
        // aria-controls로 지정된 패널 id들을 기준으로, wrap 내부에서만 찾는다.
        const panelIds = tabs
          .map((t) => t.getAttribute('aria-controls'))
          .filter(Boolean);

        const panels = panelIds
          .map((id) => wrap.querySelector(`#${CSS.escape(id)}`))
          .filter(Boolean);

        if (panels.length === 0) return;

        // ✅ 역할/속성 보정: role/tablist, role/tab, role/tabpanel, aria-labelledby
        if (!tablist.hasAttribute('role')) tablist.setAttribute('role', 'tablist');

        tabs.forEach((tab) => {
          if (!tab.hasAttribute('role')) tab.setAttribute('role', 'tab');
          tab.setAttribute('type', tab.getAttribute('type') || 'button');
        });

        panels.forEach((panel, i) => {
          if (!panel.hasAttribute('role')) panel.setAttribute('role', 'tabpanel');
          // aria-labelledby가 없으면 탭 id 연결
          if (!panel.hasAttribute('aria-labelledby') && tabs[i]?.id) {
            panel.setAttribute('aria-labelledby', tabs[i].id);
          }
        });

        // ✅ 초기 활성 탭 결정:
        // 1) aria-selected="true" 우선
        // 2) .is-active 우선
        // 3) 없으면 0
        let startIndex = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
        if (startIndex < 0) startIndex = tabs.findIndex((t) => t.classList.contains('is-active'));
        if (startIndex < 0) startIndex = 0;

        function setActive(index, { focus = false } = {}) {
          tabs.forEach((tab, i) => {
            const selected = i === index;

            tab.setAttribute('aria-selected', String(selected));
            tab.setAttribute('tabindex', selected ? '0' : '-1');
            tab.classList.toggle('is-active', selected);

            const panelId = tab.getAttribute('aria-controls');
            if (!panelId) return;

            const panel = wrap.querySelector(`#${CSS.escape(panelId)}`);
            if (!panel) return;

            // ✅ 패널 토글: hidden + aria-hidden 둘 다 맞춰줌
            if (selected) {
              panel.removeAttribute('hidden');
              panel.setAttribute('aria-hidden', 'false');
            } else {
              panel.setAttribute('hidden', '');
              panel.setAttribute('aria-hidden', 'true');
            }
          });

          // ✅ "알림마당 더보기" 같은 UI는 .add-btn이 있을 때만 갱신
          // (서브탭에도 .add-btn이 있을 수 있으면 같이 잘 동작함)
          const addBtn = wrap.querySelector('.add-btn');
          if (addBtn) {
            const span = addBtn.querySelector('span');
            if (span) {
              const currentTabText = tabs[index].textContent.trim();
              span.textContent = `${currentTabText} 더보기`;
              addBtn.setAttribute('aria-label', `${currentTabText} 더보기`);
            }
          }

          if (focus) tabs[index]?.focus();
        }

        function moveFocus(currentIndex, dir) {
          const total = tabs.length;
          let next = currentIndex;

          if (dir === 'first') next = 0;
          else if (dir === 'last') next = total - 1;
          else next = (currentIndex + dir + total) % total;

          tabs[next]?.focus();
        }

        // ✅ 초기 반영
        setActive(startIndex);

        // ✅ 클릭/키보드 바인딩
        tabs.forEach((tab, index) => {
          tab.addEventListener('click', (e) => {
            e.preventDefault();
            setActive(index, { focus: true });
          });

          tab.addEventListener('keydown', (e) => {
            const currentIndex = tabs.indexOf(document.activeElement);
            if (currentIndex < 0) return;

            switch (e.key) {
              case 'ArrowLeft':
              case 'Left':
              case 'ArrowUp':
              case 'Up':
                e.preventDefault();
                moveFocus(currentIndex, -1);
                break;

              case 'ArrowRight':
              case 'Right':
              case 'ArrowDown':
              case 'Down':
                e.preventDefault();
                moveFocus(currentIndex, +1);
                break;

              case 'Home':
                e.preventDefault();
                moveFocus(currentIndex, 'first');
                break;

              case 'End':
                e.preventDefault();
                moveFocus(currentIndex, 'last');
                break;

              case 'Enter':
              case ' ':
                e.preventDefault();
                setActive(currentIndex, { focus: true });
                break;
            }
          });
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initTabs());
  } else {
    initTabs();
  }
})();