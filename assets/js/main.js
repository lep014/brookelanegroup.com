/* ============================================================
   Brooke Lane Group — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Page Loader — "Brooke Lane" → "BL" → navy wipe ---------- */
  var loader = document.getElementById("loader");
  var loaderDone = false;
  var loaderDoneCallbacks = [];
  function onLoaderDone(cb) {
    if (loaderDone) cb();
    else loaderDoneCallbacks.push(cb);
  }
  function fireLoaderDone() {
    loaderDone = true;
    loaderDoneCallbacks.forEach(function (cb) { cb(); });
    loaderDoneCallbacks.length = 0;
  }

  if (loader) {
    var SESSION_KEY = "blg_loader_shown";
    var shownAlready = false;
    try { shownAlready = sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) {}
    var reducedMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (shownAlready || reducedMotion) {
      loader.parentNode.removeChild(loader);
      fireLoaderDone();
    } else {
      document.body.classList.add("is-loading");
      var chars = loader.querySelectorAll(".loader__char");
      var text = document.getElementById("loader-text");
      var bar  = document.getElementById("loader-bar");

      var INTRO_DELAY  = 150;
      var STAGGER      = 50;
      var HOLD         = 600;   // pause after full word
      var COLLAPSE_GAP = 260;   // delay between fade-out and width collapse
      var BL_HOLD      = 380;   // pause on "BL"
      var SWEEP        = 700;   // bar grows L→R
      var OPEN         = 650;   // bar expands top/bottom to fill
      var typeDone     = INTRO_DELAY + chars.length * STAGGER + 420;

      var tCollapse = typeDone + HOLD;
      var tShrink   = tCollapse + COLLAPSE_GAP;
      var tBlSettled = tShrink + 550;
      var tSweep    = tBlSettled + BL_HOLD;
      var tOpen     = tSweep + SWEEP;
      var tReveal   = tOpen + OPEN;

      chars.forEach(function (c, i) {
        setTimeout(function () { c.classList.add("is-in"); },
                   INTRO_DELAY + i * STAGGER);
      });

      setTimeout(function () {
        chars.forEach(function (c) {
          if (!c.hasAttribute("data-keep")) c.classList.add("is-out");
        });
      }, tCollapse);

      setTimeout(function () {
        chars.forEach(function (c) {
          if (!c.hasAttribute("data-keep")) c.classList.add("is-collapse");
        });
      }, tShrink);

      setTimeout(function () {
        if (text) text.classList.add("is-fading");
        if (bar)  bar.classList.add("is-sweep");
      }, tSweep);

      setTimeout(function () {
        if (bar) bar.classList.add("is-open");
      }, tOpen);

      setTimeout(function () {
        document.body.classList.remove("is-loading");
        try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
        if (loader.parentNode) loader.parentNode.removeChild(loader);
        fireLoaderDone();
      }, tReveal);
    }
  } else {
    fireLoaderDone();
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.querySelector(".nav__menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Hero typewriter ----------
     Static "We " prefix, rotating phrase, blinking caret.            */
  var typed = document.getElementById("typed");
  var caret = document.getElementById("caret");
  if (typed) {
    var phrases = [
      "keep our word",
      "listen, then solve together",
      "put customers first",
      "stand by our team",
      "bet on potential",
      "play the long game",
      "never stop learning",
      "hustle with passion"
    ];
    var TYPE_SPEED = 100;
    var DELETE_SPEED = 50;
    var HOLD = 1400;
    var index = 0;

    function setCaret(blink) {
      if (caret) caret.classList.toggle("blink", blink);
    }

    function type(text) {
      var i = 0;
      setCaret(false);
      var timer = setInterval(function () {
        i++;
        typed.textContent = text.slice(0, i);
        if (i >= text.length) {
          clearInterval(timer);
          setCaret(true);
          setTimeout(function () { erase(text); }, HOLD);
        }
      }, TYPE_SPEED);
    }

    function erase(text) {
      var i = text.length;
      setCaret(false);
      var timer = setInterval(function () {
        i--;
        typed.textContent = text.slice(0, i);
        if (i <= 0) {
          clearInterval(timer);
          index = (index + 1) % phrases.length;
          type(phrases[index]);
        }
      }, DELETE_SPEED);
    }

    onLoaderDone(function () { type(phrases[index]); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Contact form ----------
     Submits to Formspree without leaving the page and shows an
     inline message. Until a real Formspree ID is added (the action
     still contains "YOUR_FORM_ID"), it degrades gracefully and
     points visitors to the email address instead.                  */
  var form = document.querySelector(".form-card");
  var msg = document.getElementById("form-msg");
  if (form && msg) {
    function showMsg(kind, html) {
      msg.className = "form-msg form-msg--" + kind;
      msg.innerHTML = html;
      msg.hidden = false;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Not connected yet — guide the visitor to email instead.
      if (form.action.indexOf("YOUR_FORM_ID") !== -1) {
        showMsg("error",
          'Our form isn’t connected just yet. Please email us directly at ' +
          '<a href="mailto:info@brookelanegroup.com">info@brookelanegroup.com</a>.');
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : "";
      if (btn) { btn.textContent = "Sending…"; btn.disabled = true; }

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          showMsg("success",
            "Thank you for reaching out — we’ve received your message and will be in touch soon.");
        } else {
          showMsg("error",
            'Something went wrong sending your message. Please email ' +
            '<a href="mailto:info@brookelanegroup.com">info@brookelanegroup.com</a>.');
        }
      }).catch(function () {
        showMsg("error",
          'Something went wrong sending your message. Please email ' +
          '<a href="mailto:info@brookelanegroup.com">info@brookelanegroup.com</a>.');
      }).finally(function () {
        if (btn) { btn.textContent = label; btn.disabled = false; }
      });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
