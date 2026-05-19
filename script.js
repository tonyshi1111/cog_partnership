// Cognition Partnership Strategy — interactions
// - Citation footnote resolver
// - Archetype chip selector + aspect tab switcher
// - Pipeline inbound/outbound toggle + click-to-expand flow steps
// - Archetype grid cards + prioritization bubbles → jump to deep-dive + select archetype
// - Venn diagram hover/focus tooltip
// - Partner logos (Clearbit → Google favicon fallback → letter fallback)
// - Explicit smooth scroll (600ms eased) on all anchor clicks
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

  // ============ SMOOTH SCROLL (eased, ~600ms) ============
  // Use easeInOutQuad easing for a visible animation regardless of CSS support.
  function smoothScrollTo(target) {
    if (typeof target === 'string') target = document.getElementById(target);
    if (!target) return;
    const navHeight = document.querySelector('nav.site')?.offsetHeight || 56;
    const startY = window.pageYOffset;
    const targetY = target.getBoundingClientRect().top + startY - navHeight - 24;
    const distance = targetY - startY;
    const duration = Math.min(900, Math.max(450, Math.abs(distance) * 0.45));
    let startTime = null;

    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function step(now) {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easeInOutQuad(t);
      window.scrollTo(0, startY + distance * eased);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function setupSmoothScrollLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href === '#' || !href.startsWith('#')) return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      // Update URL hash without jumping (history-state push)
      history.pushState(null, '', href);
      smoothScrollTo(target);
    });
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

    window.__selectArchetype = selectArchetype;
    // Default to Profile tab when an archetype is selected externally
    window.__selectArchetypeAndProfile = function (arch) {
      selectArchetype(arch);
      selectTab('profile');
    };
  }

  // ============ ARCHETYPE GRID CARDS JUMP ============
  function setupArchetypeGridJump() {
    document.querySelectorAll('.archetype-card[data-jump]').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const arch = card.dataset.jump;
        const deepDive = document.getElementById('deep-dive');
        if (window.__selectArchetypeAndProfile) window.__selectArchetypeAndProfile(arch);
        if (deepDive) smoothScrollTo(deepDive);
      });
    });
  }

  // ============ PRIORITIZATION BUBBLE → ARCHETYPE ============
  function setupBubbleClicks() {
    document.querySelectorAll('.bubble-group[data-arch]').forEach((group) => {
      const arch = group.dataset.arch;
      const handler = (e) => {
        e.preventDefault();
        const deepDive = document.getElementById('deep-dive');
        if (window.__selectArchetypeAndProfile) window.__selectArchetypeAndProfile(arch);
        if (deepDive) smoothScrollTo(deepDive);
      };
      group.addEventListener('click', handler);
      group.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') handler(e);
      });
    });
  }

  // ============ VENN TOOLTIP ============
  function setupVennTooltip() {
    const venn = document.querySelector('.venn-wrap');
    const tooltip = document.getElementById('venn-tooltip');
    if (!venn || !tooltip) return;

    const dots = venn.querySelectorAll('.venn-dot');
    let pinned = null;

    function showTooltip(dot) {
      const name = dot.dataset.name || '';
      const regions = dot.dataset.regions || '';
      const desc = dot.dataset.desc || '';
      tooltip.innerHTML = `
        <strong>${escapeHtml(name)}</strong>
        <div class="regions">${escapeHtml(regions)}</div>
        <div class="desc">${escapeHtml(desc)}</div>
      `;
      tooltip.classList.add('visible');
      const dotRect = dot.getBoundingClientRect();
      const wrapRect = venn.getBoundingClientRect();
      let left = dotRect.left - wrapRect.left + dotRect.width / 2 + 14;
      let top = dotRect.top - wrapRect.top + dotRect.height / 2 + 14;
      // Keep within container
      const tooltipWidth = 280;
      if (left + tooltipWidth > wrapRect.width - 12) {
        left = dotRect.left - wrapRect.left - tooltipWidth - 6;
      }
      if (left < 12) left = 12;
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    }

    function hideTooltip() {
      tooltip.classList.remove('visible');
    }

    dots.forEach((dot) => {
      dot.addEventListener('mouseenter', () => { if (!pinned) showTooltip(dot); });
      dot.addEventListener('mouseleave', () => { if (!pinned) hideTooltip(); });
      dot.addEventListener('focus', () => showTooltip(dot));
      dot.addEventListener('blur', () => { if (!pinned) hideTooltip(); });
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        if (pinned === dot) {
          pinned = null;
          hideTooltip();
        } else {
          pinned = dot;
          showTooltip(dot);
        }
      });
    });

    // Click outside venn → unpin
    document.addEventListener('click', (e) => {
      if (pinned && !venn.contains(e.target)) {
        pinned = null;
        hideTooltip();
      }
    });
  }

  // ============ PARTNER LOGOS ============
  function setupPartnerLogos() {
    document.querySelectorAll('.partner[data-domain]').forEach((partner) => {
      const domain = partner.getAttribute('data-domain');
      if (!domain) return;

      // Move existing partner content into .partner-content wrapper
      const contentWrap = document.createElement('div');
      contentWrap.className = 'partner-content';
      while (partner.firstChild) contentWrap.appendChild(partner.firstChild);

      // Build logo wrapper
      const logoWrap = document.createElement('div');
      logoWrap.className = 'partner-logo-wrap';

      const partnerNameEl = contentWrap.querySelector('.partner-name');
      const partnerName = partnerNameEl ? partnerNameEl.textContent : domain;

      const img = document.createElement('img');
      img.alt = partnerName + ' logo';
      img.loading = 'lazy';
      img.src = `https://logo.clearbit.com/${domain}`;
      let triedFavicon = false;
      img.addEventListener('error', () => {
        if (!triedFavicon) {
          triedFavicon = true;
          img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        } else {
          // Letter fallback
          img.remove();
          logoWrap.classList.add('fallback');
          logoWrap.textContent = partnerName.charAt(0).toUpperCase();
        }
      });
      logoWrap.appendChild(img);

      partner.appendChild(logoWrap);
      partner.appendChild(contentWrap);
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
    setupSmoothScrollLinks();
    setupArchetypeExplorer();
    setupArchetypeGridJump();
    setupBubbleClicks();
    setupVennTooltip();
    setupPartnerLogos();
    setupPipelineToggle();
    setupFlowExpand();
    setupScrollSpy();
    setupMobileToc();
  });
})();
