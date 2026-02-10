(() => {
  const tz = 'America/New_York';
  const meetingSlots = [
    {
      weekday: 1,
      label: 'Monday',
      location: 'John Paulson Center Room 243'
    },
    {
      weekday: 3,
      label: 'Wednesday',
      location: 'Global Center for Academic and Spiritual Life 284'
    }
  ];

  function getNowPartsInTZ(timeZone) {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      weekday: 'short'
    });
    const parts = dtf.formatToParts(new Date());
    const map = {};
    for (const p of parts) map[p.type] = p.value;
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(map.weekday);
    return {
      year: +map.year,
      month: +map.month,
      day: +map.day,
      hour: +map.hour,
      minute: +map.minute,
      second: +map.second,
      weekday
    };
  }

  function zonedNYToDate(y, m, d, h, mi, s) {
    if (Intl.DateTimeFormat().resolvedOptions().timeZone === tz) {
      return new Date(y, m - 1, d, h, mi, s || 0);
    }
    const wall = new Date(Date.UTC(y, m - 1, d, h, mi, s || 0));
    const inv = new Date(wall.toLocaleString('en-US', { timeZone: tz }));
    const diff = inv.getTime() - wall.getTime();
    return new Date(wall.getTime() - diff);
  }

  function getNextMeeting(nowParts, nowDate) {
    let best = null;
    for (const slot of meetingSlots) {
      let offset = (slot.weekday - nowParts.weekday + 7) % 7;
      const afterMeetingTime =
        offset === 0 &&
        (nowParts.hour > 19 ||
          (nowParts.hour === 19 && (nowParts.minute > 0 || nowParts.second > 0)));
      if (afterMeetingTime) {
        offset = 7;
      }
      const target = new Date(nowDate);
      target.setDate(nowDate.getDate() + offset);
      target.setHours(19, 0, 0, 0);
      if (!best || target.getTime() < best.date.getTime()) {
        best = { ...slot, date: target };
      }
    }
    return best;
  }

  function ensureGlobalCountdown() {
    let el = document.getElementById('globalCountdown');
    if (!el) {
      el = document.createElement('div');
      el.id = 'globalCountdown';
      el.className = 'global-countdown';
      el.setAttribute('aria-live', 'polite');
      el.textContent = 'Calculating next meeting…';

      const homeHeroCard = document.querySelector('.hero-home .hero-content');
      const heroDivider = document.querySelector('.hero-divider');
      const heroSection = document.querySelector('.hero-section');

      if (homeHeroCard && homeHeroCard.parentNode) {
        homeHeroCard.insertAdjacentElement('afterend', el);
      } else if (heroDivider && heroDivider.parentNode) {
        heroDivider.insertAdjacentElement('afterend', el);
      } else if (heroSection && heroSection.parentNode) {
        heroSection.insertAdjacentElement('afterend', el);
      } else {
        document.body.prepend(el);
      }
    }
    return el;
  }

  function formatCountdown(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  function updateCountdown() {
    const nowParts = getNowPartsInTZ(tz);
    const nowDate = zonedNYToDate(
      nowParts.year,
      nowParts.month,
      nowParts.day,
      nowParts.hour,
      nowParts.minute,
      nowParts.second
    );
    const next = getNextMeeting(nowParts, nowDate);
    if (!next) return;

    const diff = next.date - nowDate;
    let message = '';
    if (diff <= 0) {
      message = `Meeting happening now · ${next.label} 7:00 PM ET · ${next.location}`;
    } else {
      const dateLabel = next.date.toLocaleDateString('en-US', {
        timeZone: tz,
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
      message = `Next meeting: ${next.label} ${dateLabel} · 7:00 PM ET · ${next.location} — in ${formatCountdown(diff)}`;
    }

    const targets = [
      ensureGlobalCountdown(),
      ...document.querySelectorAll('[data-meeting-countdown]')
    ];
    for (const target of targets) {
      target.textContent = message;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateCountdown();
      setInterval(updateCountdown, 1000);
    });
  } else {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
})();
