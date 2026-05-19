// Presentation-style site for Cognition Partnership Strategy
// - Citation footnote resolver
// - Archetype chip selector + aspect tab switcher (deep-dive section)
// - Pipeline inbound/outbound toggle + click-to-expand flow steps
// - Archetype grid cards jump to deep-dive and select archetype
// - Scroll-spy active section highlighting in TOC
// - Mobile sidebar slide-in

(function () {
  let citationData = null;
  const citationUseOrder = [];

  // ============ CITATIONS ============
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
    container.appendChild(list);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  // ============ ARCHETYPE SELECTOR + TABS ============
  function setupArchetypeExplorer() {
    const explorer = document.querySelector('.archetype-explorer');
    if (!explorer) return;

    const chips = explorer.querySelectorAll('.archetype-chip');
    const contents = explorer.querySelectorAll('.archetype-content');
    const tabs = explorer.querySelectorAll('.aspect-tab');

    function selectArchetype(arch) {
      chips.forEach((c) => c.classList.toggle('active', c.dataset.arch === arch));
      contents.forEach((c) => c.classList.toggle('active', c.dataset.arch === arch));
    }

    function selectTab(tab) {
      tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
      // Within EVERY archetype content block, activate the matching panel
      explorer.querySelectorAll('.aspect-panel').forEach((p) => {
        p.classList.toggle('active', p.dataset.tab === tab);
      });
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        selectArchetype(chip.dataset.arch);
      });
    });

    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        selectTab(tab.dataset.tab);
      });
    });

    // Expose for external triggers (archetype-grid card clicks)
    window.__selectArchetype = selectArchetype;
  }

  function setupArchetypeGridJump() {
    document.querySelectorAll('.archetype-card[data-jump]').forEach((card) => {
      card.addEventListener('click', (e) => {
        const arch = card.dataset.jump;
        if (window.__selectArchetype) {
          setTimeout(() => window.__selectArchetype(arch), 50);
        }
        // Native href jumps to #deep-dive; archetype selection happens after smooth-scroll starts
      });
    });
  }

  // ============ PIPELINE TOGGLE + EXPAND ============
  function setupPipelineToggle() {
    const toggle = document.querySelector('.pipeline-toggle');
    if (!toggle) return;
    const buttons = toggle.querySelectorAll('button');
    const flows = document.querySelectorAll('.flow[data-flow]');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.flow;
        buttons.forEach((b) => b.classList.toggle('active', b === btn));
        flows.forEach((f) => f.classList.toggle('active', f.dataset.flow === target));
      });
    });
  }

  function setupFlowExpand() {
    document.querySelectorAll('.flow > li').forEach((step) => {
      step.addEventListener('click', () => {
        step.classList.toggle('expanded');
      });
    });
  }

  // ============ SCROLL-SPY ============
  function setupScrollSpy() {
    const tocLinks = document.querySelectorAll('aside.toc a[href^="#"]');
    const tocMap = new Map();
    tocLinks.forEach((a) => tocMap.set(a.getAttribute('href').slice(1), a));
    if (tocMap.size === 0) return;

    const sections = Array.from(document.querySelectorAll('section[id]')).filter((s) => tocMap.has(s.id));
    let currentActive = null;

    function update() {
      const navHeight = document.querySelector('nav.site')?.offsetHeight || 56;
      const probeY = navHeight + 80;
      let active = null;
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= probeY) active = sec;
        else break;
      }
      if (active && active !== currentActive) {
        currentActive = active;
        document.querySelectorAll('aside.toc a.active').forEach((a) => a.classList.remove('active'));
        const link = tocMap.get(active.id);
        if (link) link.classList.add('active');
      }
    }

    update();
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { update(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
  }

  // ============ MOBILE SIDEBAR ============
  function setupMobileToc() {
    const toggle = document.querySelector('nav.site .toc-toggle');
    const aside = document.querySelector('aside.toc');
    if (!toggle || !aside) return;
    toggle.addEventListener('click', () => {
      aside.classList.toggle('open');
      toggle.setAttribute('aria-expanded', aside.classList.contains('open') ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (window.innerWidth > 960) return;
      if (!aside.contains(e.target) && !toggle.contains(e.target) && aside.classList.contains('open')) {
        aside.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
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
    setupArchetypeExplorer();
    setupArchetypeGridJump();
    setupPipelineToggle();
    setupFlowExpand();
    setupScrollSpy();
    setupMobileToc();
  });
})();
