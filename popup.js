const defaultSettings = {
  spanish: true,
  english: true,
  bilingual: true,
  video: true,
  broadcast: true,
  photo: true,
  license: true,
  own_officiant: true,
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
  mendocino: true,
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

const slider = document.getElementById("emojiSize");
const valueLabel = document.getElementById("emojiSizeValue");

// Load saved value
chrome.storage.sync.get(["emojiSize"], (result) => {
  const size = result.emojiSize || 22;
  slider.value = size;
  valueLabel.textContent = size + "px";
});

// Update on change
slider.addEventListener("input", () => {
  const size = slider.value;
  valueLabel.textContent = size + "px";

  chrome.storage.sync.set({ emojiSize: size });
});