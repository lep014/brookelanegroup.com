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
    var SESSION_KEY = "blg_loader_shown_v2";
    var forceLoader = /[?&]loader=force\b/.test(window.location.search);
    var shownAlready = false;
    try { shownAlready = sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) {}
    var reducedMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!forceLoader && (shownAlready || reducedMotion)) {
      loader.parentNode.removeChild(loader);
      document.body.classList.remove("is-loading");
      fireLoaderDone();
    } else {
      var topChars = loader.querySelectorAll(".loader__half--top .loader__char");
      var botChars = loader.querySelectorAll(".loader__half--bot .loader__char");
      var bar  = document.getElementById("loader-bar");

      var nonKeep = [];
      topChars.forEach(function (c, i) {
        if (!c.hasAttribute("data-keep")) nonKeep.push(i);
      });

      var HOLD          = 1100;  // static "Brooke Lane" on screen
      var STAGGER       = 120;   // gap between consecutive letter drops
      var COLLAPSE_GAP  = 360;   // delay between a letter dropping and its width collapsing
      var COLLAPSE_DUR  = 620;
      var BL_HOLD       = 520;
      var SWEEP         = 750;
      var OPEN          = 800;

      function startSequence() {
        loader.classList.add("is-ready");

        var tOut       = HOLD;
        var tReveal    = tOut
                       + (nonKeep.length - 1) * STAGGER
                       + COLLAPSE_GAP + COLLAPSE_DUR
                       + BL_HOLD + SWEEP + OPEN;
        var tSweep     = tReveal - OPEN - SWEEP;
        var tOpen      = tReveal - OPEN;

        nonKeep.forEach(function (charIdx, seq) {
          var dropAt     = tOut + seq * STAGGER;
          var collapseAt = dropAt + COLLAPSE_GAP;
          setTimeout(function () {
            if (topChars[charIdx]) topChars[charIdx].classList.add("is-out");
            if (botChars[charIdx]) botChars[charIdx].classList.add("is-out");
          }, dropAt);
          setTimeout(function () {
            if (topChars[charIdx]) topChars[charIdx].classList.add("is-collapse");
            if (botChars[charIdx]) botChars[charIdx].classList.add("is-collapse");
          }, collapseAt);
        });

        setTimeout(function () {
          if (bar) bar.classList.add("is-sweep");
        }, tSweep);

        setTimeout(function () {
          loader.classList.add("is-opening");
        }, tOpen);

        setTimeout(function () {
          document.body.classList.remove("is-loading");
          try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
          if (loader.parentNode) loader.parentNode.removeChild(loader);
          fireLoaderDone();
        }, tReveal);
      }

      // Wait for Mulish 800 to actually be ready so the wordmark doesn't
      // render in a fallback font and "zoom" when the real font swaps in.
      // 1s ceiling so a slow font fetch never blocks the page.
      var started = false;
      function go() { if (!started) { started = true; startSequence(); } }
      if (document.fonts && document.fonts.load) {
        document.fonts.load("800 1em Mulish").then(go, go);
      }
      setTimeout(go, 1000);
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
