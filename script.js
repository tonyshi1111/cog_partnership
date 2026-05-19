// Single-page scroll site for Cognition Partnership Strategy
// - Resolves [data-cite="id"] into numbered footnotes from citations.json
// - Scroll-spy: highlights active TOC entries based on viewport
// - Toggle: collapse/expand subsection lists in the right sidebar
// - Mobile: open/close right sidebar via top-nav button

(function () {
  let citationData = null;
  const citationUseOrder = [];

  async function loadCitations() {
    try {
      const res = await fetch('assets/citations.json');
      if (!res.ok) throw new Error('citations fetch failed');
      const json = await res.json();
      citationData = json.citations;
      resolveCitations();
    } catch (err) {
      console.warn('Citations failed to load:', err);
    }
  }

  function resolveCitations() {
    if (!citationData) return;
    const refs = document.querySelectorAll('[data-cite]');
    refs.forEach((el) => {
      const id = el.getAttribute('data-cite');
      if (!citationData[id]) {
        el.classList.add('citation-missing');
        el.textContent = '[??]';
        return;
      }
      if (!citationUseOrder.includes(id)) citationUseOrder.push(id);
      const num = citationUseOrder.indexOf(id) + 1;
      el.textContent = `[${num}]`;
      el.setAttribute('href', `#cite-${id}`);
      el.setAttribute('title', `${citationData[id].title} — ${citationData[id].publisher} (${citationData[id].date})`);
    });
    renderCitationsFooter();
  }

  function renderCitationsFooter() {
    const container = document.querySelector('[data-citations-footer]');
    if (!container || citationUseOrder.length === 0) return;
    const list = document.createElement('ol');
    citationUseOrder.forEach((id) => {
      const c = citationData[id];
      const li = document.createElement('li');
      li.id = `cite-${id}`;
      li.innerHTML = `<a href="${c.url}" target="_blank" rel="noopener">${escapeHtml(c.title)}</a> — ${escapeHtml(c.publisher)} (${escapeHtml(c.date)})`;
      list.appendChild(li);
    });
    const heading = document.createElement('h3');
    heading.textContent = 'Sources';
    container.appendChild(heading);
    container.appendChild(list);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  // Build map: section id -> TOC link element
  function buildTocMap() {
    const map = new Map();
    document.querySelectorAll('aside.toc a[href^="#"]').forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      map.set(id, a);
    });
    return map;
  }

  // Scroll-spy: highlight the topmost section currently in view
  function setupScrollSpy() {
    const tocMap = buildTocMap();
    if (tocMap.size === 0) return;

    const sections = Array.from(document.querySelectorAll('section[id]'));
    if (sections.length === 0) return;

    let currentActive = null;

    function update() {
      const navHeight = document.querySelector('nav.site')?.offsetHeight || 56;
      const probeY = navHeight + 60;
      let active = null;
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= probeY) {
          active = sec;
        } else {
          break;
        }
      }
      if (active && active !== currentActive) {
        currentActive = active;
        // Clear prior actives
        document.querySelectorAll('aside.toc a.active').forEach((a) => a.classList.remove('active'));
        // Highlight this section and its ancestors (so parent + child both active)
        let node = active;
        while (node) {
          if (node.id && tocMap.has(node.id)) {
            tocMap.get(node.id).classList.add('active');
          }
          node = node.parentElement?.closest('section[id]') || null;
        }
        // Auto-expand the parent group if collapsed
        const link = tocMap.get(active.id);
        if (link) {
          const parentSection = link.closest('.toc-section');
          if (parentSection) {
            const subitems = parentSection.querySelector('.toc-subitems');
            const toggleBtn = parentSection.querySelector('.toc-toggle-btn');
            if (subitems && subitems.hasAttribute('hidden')) {
              subitems.removeAttribute('hidden');
              if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
            }
          }
        }
      }
    }

    update();
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // TOC subsection toggles
  function setupTocToggles() {
    document.querySelectorAll('aside.toc .toc-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const subitems = btn.closest('.toc-section')?.querySelector('.toc-subitems');
        if (!subitems) return;
        const isHidden = subitems.hasAttribute('hidden');
        if (isHidden) {
          subitems.removeAttribute('hidden');
          btn.setAttribute('aria-expanded', 'true');
        } else {
          subitems.setAttribute('hidden', '');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // Mobile: open/close right sidebar
  function setupMobileToc() {
    const toggle = document.querySelector('nav.site .toc-toggle');
    const aside = document.querySelector('aside.toc');
    if (!toggle || !aside) return;
    toggle.addEventListener('click', () => {
      aside.classList.toggle('open');
      toggle.setAttribute('aria-expanded', aside.classList.contains('open') ? 'true' : 'false');
    });
    // Close on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (window.innerWidth > 960) return;
      if (!aside.contains(e.target) && !toggle.contains(e.target) && aside.classList.contains('open')) {
        aside.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    // Close after a nav link is clicked on mobile
    aside.addEventListener('click', (e) => {
      if (window.innerWidth > 960) return;
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        aside.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadCitations();
    setupTocToggles();
    setupScrollSpy();
    setupMobileToc();
  });
})();
