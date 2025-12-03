// Lightweight theme switcher for generated examples
// Controls `data-theme` on <html> and persists choice to localStorage.
(function () {
  const STORAGE_KEY = 'mdparsercf:theme';
  const SELECT_ID = 'theme-select';

  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* ignore */
    }
  }

  function applyThemeValue(value) {
    const root = document.documentElement;
    if (value === 'system') {
      const prefersDark =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      // Accept any explicit theme name (e.g., 'light', 'dark', 'sepia')
      root.setAttribute('data-theme', value);
    }
  }

  function setupSystemListener(selectEl) {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener &&
      mq.addEventListener('change', () => {
        const saved = getSavedTheme();
        if (saved === 'system') applyThemeValue('system');
      });
  }

  function init() {
    try {
      const select = document.getElementById(SELECT_ID);
      if (!select) return;

      const saved = getSavedTheme() || 'system';
      // Prefer saved if it's one of the available options, otherwise fallback to 'system'
      const available = Array.from(select.options).map((o) => o.value);
      const value = available.includes(saved) ? saved : 'system';

      // Apply initial
      applyThemeValue(value);

      // Update select UI
      select.value = value;

      // Listen for user changes
      select.addEventListener('change', (e) => {
        const v = e.target.value;
        saveTheme(v);
        applyThemeValue(v);
      });

      // React to system changes when user prefers system
      setupSystemListener(select);
    } catch (e) {
      console.warn('Theme switcher error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
