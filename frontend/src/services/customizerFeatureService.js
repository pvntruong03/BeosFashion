// Feature switch for BEO Custom Lab (Product Customizer)
const STORAGE_KEY = 'beo_customizer_feature_enabled';

export const isCustomizerEnabled = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Default to true so client can preview and test
    return saved === null ? true : saved === 'true';
  } catch (e) {
    return true;
  }
};

export const setCustomizerEnabled = (enabled) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
    window.dispatchEvent(new CustomEvent('beo_customizer_toggled', { detail: { enabled } }));
  } catch (e) {
    console.error('Error saving customizer feature state:', e);
  }
};

export const toggleCustomizerFeature = () => {
  const current = isCustomizerEnabled();
  const next = !current;
  setCustomizerEnabled(next);
  return next;
};
