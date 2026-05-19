// Minimal interactivity for the Cognition Partnership site
// Loads citations.json once and resolves [data-cite="citation-id"] elements into footnote anchors.

(function () {
  let citationData = null;
  let citationUseOrder = [];

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

  // Mark active nav link
  function markActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav.site .links a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === path || (path === 'index.html' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    markActiveNav();
    loadCitations();
  });
})();
