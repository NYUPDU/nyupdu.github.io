(function () {
  const tournaments = {
    cuny: {
      deadline: '2026-02-24T04:59:00Z'
    },
    georgetown: {
      deadline: '2026-03-04T04:59:00Z'
    },
    northeastern: {
      deadline: '2026-03-10T03:59:00Z'
    }
  };

  const now = new Date();

  Object.entries(tournaments).forEach(([key, config]) => {
    const isClosed = now >= new Date(config.deadline);

    document.querySelectorAll(`[data-signup-status="${key}"]`).forEach((statusEl) => {
      statusEl.textContent = isClosed ? 'Sign-ups closed' : 'Open now';
      statusEl.classList.remove('open', 'pending');
      statusEl.classList.add(isClosed ? 'pending' : 'open');
    });

    document.querySelectorAll(`[data-signup-link="${key}"]`).forEach((linkEl) => {
      if (!isClosed) return;
      linkEl.textContent = 'Sign-ups closed';
      linkEl.classList.remove('btn-primary', 'link-chip');
      linkEl.classList.add('link-chip');
      linkEl.removeAttribute('href');
      linkEl.removeAttribute('target');
      linkEl.removeAttribute('rel');
      linkEl.setAttribute('aria-disabled', 'true');
      linkEl.style.pointerEvents = 'none';
      linkEl.style.opacity = '.7';
    });
  });
})();
