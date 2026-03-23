console.log("extension injected");

let lastUrl = location.href;
(() => {
function runExtension() {
  //console.log("running extension on", location.href);

  // your code here
  injectStyles();
  reorderSections();
  resizeStuff();
  disablePrepay();
}

function waitForElement(selector, callback, options = {}) {
    const {
      root = document,
      maxAttempts = 40,
      interval = 250,
      once = true
    } = options;

    let attempts = 0;

    const timer = setInterval(() => {
      const el = root.querySelector(selector);
      attempts++;

      if (el) {
        if (once) clearInterval(timer);
        callback(el);
      } else if (attempts >= maxAttempts) {
        clearInterval(timer);
        //console.log("not found:", selector);
      }
    }, interval);

    return timer;
  }

function injectStyles() {
  if (document.getElementById("my-extension-styles")) return;

  const style = document.createElement("style");
  style.id = "my-extension-styles";
  style.textContent = `
    .ar-max-w-\\[1024px\\] {
      max-width: 1200px !important;
    }

    .ar-w-\\[600px\\] {
        width: 100000px !important;
    }

    .ar-w-auto {
        width: 400px !important;
    }
  `;
  document.head.appendChild(style);
}

function reorderSections() {
    waitForElement('.ar-flex-0.ar-w-\\[600px\\]', (parent) => {
      const children = Array.from(parent.children);

      //console.log("reorder parent found:", parent);
      //console.log("children count:", children.length);
      //console.log("children tags:",children.map(x => x.tagName));

      const title = document.querySelector(".ar-m-0.ar-mr-3").textContent;

    if (parent.dataset.myExtReordered === "true") return;

      if (children.length == 6) {

        if(title == "Create appointment") {
          parent.append(
            children[0],
            children[1],
            children[2],
            children[4],
            children[5],
            children[3] 
          );
        }else{
          parent.append(
            children[0],
            children[1],
            children[3],
            children[4],
            children[2],
            children[5] 
          );
        }
      }

      if (children.length == 7) {

        parent.append(
          children[0],
          children[4],
          children[5],
          children[1],
          children[2],
          children[3],
          children[6] 
        );
      }

      parent.dataset.myExtReordered = "true";
      //console.log("sections reordered");
    });
  }

function resizeStuff() {
    waitForElement('market-textarea', (el) => {
      //console.log("textarea found:", el);

      const text = el?.getAttribute("value");
      const lineCount = text.split("\n").length;

      // remove the old marker in case site recreated the element
      el.style.setProperty('max-height', lineCount*25+100 + 'px', 'important');
      el.style.setProperty('height', lineCount*25+99 + 'px', 'important');

      // if the visible height is actually controlled by a parent, do this too:
      if (el.parentElement) {
        el.parentElement.style.setProperty('max-height', lineCount*25+100 + 'px', 'important');
        el.parentElement.style.setProperty('height', lineCount*25+99 + 'px', 'important');
      }

      attachTemplateButton(el.parentElement, applyTemplateToNotes);

      //console.log("textarea resized");
    }, { once: false, maxAttempts: 60, interval: 300 });
  }

  function applyTemplateToNotes(text) {
    waitForElement('market-textarea', (el) => {
      //console.log("textarea found:", el);

      const note = el?.getAttribute("value");
      //el?.value = note + text;
      el?.setAttribute("value", text + note);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, { once: true, maxAttempts: 60, interval: 300 });
  }

function disablePrepay() {
  let tries = 0;

  const timer = setInterval(() => {
    tries++;

    const label = Array.from(document.querySelectorAll('label[slot="label"]'))
      .find(el => el.textContent.trim() === 'Prepay for this appointment');

    const row = label?.closest('market-row');
    const toggle = row?.querySelector('market-toggle');

    //console.log("try", tries, { label, row, toggle, checked: toggle?.hasAttribute('checked') });

    if (!toggle) {
      if (tries >= 20) clearInterval(timer);
      return;
    }

    if (toggle.hasAttribute('checked')) {
      toggle.click();
    } else {
      clearInterval(timer);
      //console.log("prepay is off");
    }

    if (tries >= 20) {
      clearInterval(timer);
    }
  }, 300);
}

/*function checkUrlChange() {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log("url changed:", lastUrl);

    setTimeout(runExtension, 300);
    setTimeout(runExtension, 1000);
  }
}*/

function startObserver() {
    const observer = new MutationObserver(() => {
      runExtension();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    //console.log("observer started");
  }

  function start() {
    runExtension();
    startObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  function watchCalendarEvents() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {

        if (!(node instanceof HTMLElement)) return;

        const event = node.matches('.fc-event')
          ? node
          : node.querySelector('.fc-event');

        if (!event) return;

        console.log("Event created:", event.dataset.testid);

        const titleEl = event.querySelector(".fc-event-title");

        addEmojis(event.dataset.testid, titleEl)
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  }

  async function addEmojis(id, titleEl) {
    const settings = await chrome.storage.sync.get({
      spanish: true,
      video: true,
      broadcast: true,
      photo: true,
      license: true,
      balance: true,
      chrome: true,
      bouquet: true,
      cake: true,
      donut: true
    }); 

    const data = await fetch(`https://app.squareup.com/appointments/merchant/api/reservations/${id}`, {
      credentials: "include"
    }).then(r => r.json());

    const text = String(data?.seller_note || "").split("===")[0];

    console.log(text);

    if(text.toLowerCase().includes("spanish") && settings.spanish){
      titleEl.textContent = "🇪🇸 " + titleEl.textContent
    }
    if((text.toLowerCase().includes("video")) && settings.video){
      titleEl.textContent = "🎬 " + titleEl.textContent
    }
    if((text.toLowerCase().includes("broadcast")) && settings.broadcast){
      titleEl.textContent = "🔴 " + titleEl.textContent
    }
    if(text.toLowerCase().includes("photo") && settings.photo){
      titleEl.textContent = "📸 " + titleEl.textContent
    }
    if(text.toLowerCase().includes("lnc") && !text.toLowerCase().includes("own lnc") && settings.license){
      titleEl.textContent = "✍️ " + titleEl.textContent
    }
    if(text.toLowerCase().includes("chrome runner") && settings.chrome){
      titleEl.textContent = "💿 " + titleEl.textContent
    }

    const bouquets = ["vogue", "brenda", "santa maria", "isabella", "gigi", "sicily", "valentina", "cloe", "alexandra", "gentlemen", "gentleman", "erica"]
    const found = bouquets.some(word =>
      text.toLowerCase().includes(word.toLowerCase())
    );
    if(found && !text.toLowerCase().includes("own bouquet") && !text.toLowerCase().includes("no bouquet") && settings.bouquet){
      titleEl.textContent = "💐 " + titleEl.textContent
    }

    if(text.toLowerCase().includes("cake") && !text.toLowerCase().includes("own cake") && !text.toLowerCase().includes("no cake") && settings.cake){
      titleEl.textContent = "🎂 " + titleEl.textContent
    }

    if(text.toLowerCase().includes("donut") && !text.toLowerCase().includes("no donut") && settings.donut){
      titleEl.textContent = "🍩 " + titleEl.textContent
    }

    if(settings.balance){
      const match = text.match(/Balance:\s*\$([\d,]+(?:\.\d{2})?)/);

      const amount = match ? match[1] : null;
      if(match.length > 0 && amount != 0) titleEl.textContent = "💰 " + titleEl.textContent
    }
  }

  watchCalendarEvents();

})();