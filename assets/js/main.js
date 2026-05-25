/* ============================================================
   Brooke Lane Group — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Page Loader — short brand flash ---------- */
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
    var SESSION_KEY = "blg_loader_shown_v3";
    var forceLoader = /[?&]loader=force\b/.test(window.location.search);
    var shownAlready = false;
    try { shownAlready = sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) {}
    var reducedMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!forceLoader && (shownAlready || reducedMotion)) {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
      document.body.classList.remove("is-loading");
      fireLoaderDone();
    } else {
      var HOLD = 600;   // monogram visible
      var LIFT = 600;   // panel slide-up duration
      var img  = loader.querySelector(".loader__mark");

      function start() {
        loader.classList.add("is-show");
        setTimeout(function () {
          loader.classList.add("is-lift");
        }, HOLD);
        setTimeout(function () {
          document.body.classList.remove("is-loading");
          try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
          if (loader.parentNode) loader.parentNode.removeChild(loader);
          fireLoaderDone();
        }, HOLD + LIFT);
      }

      if (img && !img.complete) {
        img.addEventListener("load",  start, { once: true });
        img.addEventListener("error", start, { once: true });
        setTimeout(start, 400);
      } else {
        start();
      }
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

  /* ---------- Contact unmasking ----------
     Email + phone are stored in data attributes only, never as
     plain text or hrefs in the served HTML. Spam scrapers that
     don't execute JS (which is most of them) come away empty.
     Real users get fully functional mailto: / tel: links and
     visible addresses / numbers wired up here on page load.       */
  document.querySelectorAll("[data-em]").forEach(function (el) {
    var parts = el.getAttribute("data-em").split("|");
    if (parts.length !== 2) return;
    var addr = parts[0] + "@" + parts[1];
    el.setAttribute("href", "mailto:" + addr);
    if (el.hasAttribute("data-em-show")) el.textContent = addr;
  });
  document.querySelectorAll("[data-tel]").forEach(function (el) {
    // Value is stored reversed so the raw HTML never contains the
    // actual phone digits in order — defeats regex phone scrapers.
    var num = el.getAttribute("data-tel").split("").reverse().join("");
    el.setAttribute("href", "tel:+" + num);
    if (el.hasAttribute("data-tel-show")) {
      var local = num.replace(/^1/, "");
      el.textContent = local.slice(0, 3) + " " + local.slice(3, 6) + " " + local.slice(6);
    }
  });

  /* ---------- Contact form ----------
     Submits to Formspree without leaving the page and shows an
     inline message. Until a real Formspree ID is added (the action
     still contains "YOUR_FORM_ID"), it degrades gracefully and
     points visitors to the email address instead.                  */
  var form = document.querySelector(".contact__form, .form-card");
  var msg = document.getElementById("form-msg");

  // Conditionally show the SMS consent block only after the visitor
  // types a phone number — it's only relevant if they're opting in.
  var phoneInput = form && form.querySelector('input[name="phone"]');
  var smsWrap = document.getElementById("sms-consent-wrap");
  if (phoneInput && smsWrap) {
    var toggleSms = function () {
      var has = phoneInput.value.trim().length > 0;
      smsWrap.hidden = !has;
    };
    phoneInput.addEventListener("input", toggleSms);
    toggleSms();
  }
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
