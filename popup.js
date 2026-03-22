const defaultSettings = {
  spanish: true,
  video: true,
  broadcast: true,
  photo: true,
  license: true,
  balance: true,
  chrome: true,
  bouquet: true
};

document.addEventListener("DOMContentLoaded", async () => {
  const settings = await chrome.storage.sync.get(defaultSettings);

  for (const key in defaultSettings) {
    const checkbox = document.getElementById(key);
    if (!checkbox) continue;

    checkbox.checked = settings[key];

    checkbox.addEventListener("change", async () => {
      await chrome.storage.sync.set({
        [key]: checkbox.checked
      });
    });
  }
});