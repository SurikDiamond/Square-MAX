const defaultSettings = {
  spanish: true,
  english: true,
  video: true,
  broadcast: true,
  photo: true,
  license: true,
  balance: true,
  chrome: true,
  bouquet: true,
  cake: true,
  donut: true,
  carousel: true,
  pasta: true,
  seating_chart: true,
  extra_hour: true,
  alcohol: true,
  brunch: true,
  brisket: true,
  lovestation: true,
  tower: true,
  album: true,
  print: true
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