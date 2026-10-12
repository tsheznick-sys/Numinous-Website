/* TASK 6 · the house layer: motion + the checkout wiring.
 *
 * The engine concatenates the vendored Motion bundle (reference/vendor/motion)
 * and this file into /assets/numinous-motion.js, and every document loads it —
 * the adopted home included, which is why this is a standalone script and not
 * an import inside the app bundle: the home runs the design's own script, not
 * ours, and both must move the same way. It also carries the one piece of
 * wiring that has to exist on every document for the same reason: the links.
 *
 * The rules, and they are not negotiable:
 *   · transform and opacity only — nothing here touches layout;
 *   · prefers-reduced-motion wins outright: the layer never starts;
 *   · phones get the light half (drift and reveals keep, parallax and the
 *     magnetic pull do not — no cursor, and the frames cost more);
 *   · a gate's motion is decoration on the way out, never a toll: no effect
 *     may delay a tap on a CTA that leads to Whop's checkout;
 *   · a failure here can never cost a page: boot is wrapped, the app bundle
 *     may re-boot the layer on every route change, and any element the layer
 *     hides is shown again by a watchdog if its reveal never reports.
 */

(function () {
  /* The engine concatenates Motion's bundle above this comment. That bundle is
     an IIFE that hands its functions back as __numinousMotionVendor, and this
     is deliberate: an `export { … as animate }` clause only aliases minified
     locals, so referencing `animate` directly would throw a ReferenceError and
     every reveal, counter, pull and film would silently never run. Read them
     from the vendor object, and if it is absent, the page simply stands still. */
  const VENDOR = typeof __numinousMotionVendor === "undefined" ? null : __numinousMotionVendor;
  const animate = VENDOR && VENDOR.animate;
  const inView = VENDOR && VENDOR.inView;
  const scroll = VENDOR && VENDOR.scroll;
  const stagger = VENDOR && VENDOR.stagger;

  const FINE = "(hover: hover) and (pointer: fine)";
  const NARROW = "(max-width: 760px)";
  const REDUCED = "(prefers-reduced-motion: reduce)";

  const mq = (query) => window.matchMedia(query).matches;
  const EASE = [0.22, 1, 0.36, 1];
  const STRONG = [0.16, 1, 0.3, 1];

  /* ---------- 0 · the links ----------------------------------------------
   * Every gate's checkout link carries its own return path. Whop takes the
   * redirect_url when it honours one and ignores it when it does not — either
   * way the house does not lose the thread: the gate is also stamped on the
   * way out, so the threshold after the offering still knows what was taken.
   * One map, one implementation, on every document including the home. */

  const GATE_OF_ID = {
    ch_wYXFulML0v6LIoJ: "signal",
    plan_PQnMYNixMTjRQ: "watcher",
    plan_Imfk0oedwYn7v: "watcher-annual",
    plan_Aew5DdipP3fKY: "vault",
    plan_hIKLCR4hGiv9B: "herald",
  };
  const RETURN_KEY = "numinous-gate";
  const RETURN_PAGE = "/order-complete";
  const GATE_KEYS = [...new Set(Object.values(GATE_OF_ID))];

  const checkoutId = (href) => (String(href).match(/checkout\/([A-Za-z0-9_]+)/) || [])[1] || "";
  const gateOfHref = (href) => GATE_OF_ID[checkoutId(href)] || "";

  /* The return path is absolute and https, as Whop requires. The host is read
     from the document, so the preview and the live site each wire their own. */
  function returnHref(key) {
    return window.location.origin + RETURN_PAGE + "?gate=" + encodeURIComponent(key);
  }

  function decorate(root) {
    const scope = root || document;
    scope.querySelectorAll('a[href*="whop.com/checkout/"]').forEach((a) => {
      const key = a.dataset.gate || gateOfHref(a.getAttribute("href"));
      if (!key) return;
      a.dataset.gate = key;
      if (/redirect_url=/.test(a.getAttribute("href"))) return;
      const join = a.getAttribute("href").includes("?") ? "&" : "?";
      a.setAttribute("href", a.getAttribute("href") + join + "redirect_url=" + encodeURIComponent(returnHref(key)));
    });
  }

  function wire() {
    if (wire.done) return;
    wire.done = true;
    /* Capture phase, so the stamp lands before the browser follows the link —
       and before any handler of ours could ever prevent it. */
    document.addEventListener(
      "click",
      (event) => {
        const a = event.target.closest && event.target.closest('a[href*="whop.com/checkout/"]');
        if (!a) return;
        const key = a.dataset.gate || gateOfHref(a.getAttribute("href"));
        if (!key) return;
        try {
          sessionStorage.setItem(RETURN_KEY, key);
        } catch (error) {
          /* a private window that refuses storage still has the redirect_url */
        }
      },
      true,
    );
    decorate(document);
  }

  function returnGate() {
    try {
      return sessionStorage.getItem(RETURN_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  window.__numinousLinks = { decorate: decorate, gate: returnGate, of: gateOfHref, key: RETURN_KEY };

  /* ---------- 0b · the return --------------------------------------------
   * Whop hands the buyer back — `?status=success`, `?status=failed`, or a
   * plain plan/ch id and nothing else. Wherever the hand-back lands (the
   * dashboard redirect not set, a plain product link that dropped the query),
   * the house still knows what was taken: the plan or ch id in the address,
   * the gate named in it, or the stamp this tab left on the way out. So the
   * buyer is put on their own page instead of the front door.
   *
   * An ordinary visit is never touched: a move only happens when the address
   * claims a return (a status, payment, checkout or result parameter, or a
   * plan/ch id, or a gate by name) AND the gate can be named. The decision is
   * written to window.__numinousReturnTo before the browser moves, so the
   * live site and the checks can both read what was decided. */
  const RETURN_PARAMS = /^(status|payment|checkout|result|outcome)$/i;

  function returnTarget(href, stamped) {
    let url;
    try {
      url = new URL(href, window.location.origin);
    } catch (error) {
      return "";
    }
    const path = url.pathname.replace(/index\.html$/i, "");
    /* the post-checkout page is the destination; the threshold has its own job */
    if (/^\/order-complete\/?$/i.test(path) || /^\/checkout\//i.test(path)) return "";
    const params = url.searchParams;
    const said = (value) => {
      const key = String(value || "").toLowerCase();
      return GATE_KEYS.includes(key) ? key : GATE_OF_ID[value] || "";
    };
    const named = said(params.get("gate")) || said(params.get("work"));
    const idInUrl = (url.search.match(/[?&](?:plan|session|checkout|id)=((?:plan|ch)_[A-Za-z0-9]+)/i) || [])[1] || "";
    const byId = said(idInUrl) || (/^(plan|ch)_/.test(idInUrl) ? GATE_OF_ID[idInUrl] || "" : "");
    let claims = Boolean(named) || Boolean(byId);
    for (const [name] of params) {
      if (RETURN_PARAMS.test(name)) claims = true;
    }
    const key = named || byId || (claims ? stamped || "" : "");
    if (!key) return "";
    const status = params.get("status") || "";
    const carry = status && !/^(success|complete|completed|paid|succeeded)$/i.test(status)
      ? "&status=" + encodeURIComponent(status)
      : "";
    return RETURN_PAGE + "?gate=" + encodeURIComponent(key) + carry;
  }

  function catchReturn() {
    const target = returnTarget(window.location.href, returnGate());
    if (!target) return;
    window.__numinousReturnTo = target;
    try {
      window.location.replace(target);
    } catch (error) {
      /* a document that will not move still shows the page */
    }
  }

  /* ---------- 1 · everything the layer starts, stoppable ------------------ */

  let running = [];
  const keep = (stop) => {
    if (typeof stop === "function") running.push(stop);
    else if (stop && typeof stop.stop === "function") running.push(() => stop.stop());
  };

  function stopAll() {
    for (const stop of running) {
      try {
        stop();
      } catch (error) {
        /* a stopped tween is never a problem worth surfacing */
      }
    }
    running = [];
  }

  /* ---------- 2 · the reveals, in groups --------------------------------- */

  /* Words arrive in company: a group's children come in on a stagger instead
     of one flat fade, which is what makes a page feel authored rather than
     switched on. Every hidden node is watched by the guard at the end. */
  const GROUPS =
    ".works, .steps, .films, .weeks, .stats-grid, .cards, .footer-grid, .v2-next, " +
    ".faq-home__list, .pact__terms";
  const PIECES =
    "[data-mv], .card, .step, .week, .film, .stat, .metric, .v2-threshold-card, .v2-invite, .v2-unlock, .v2-next-card, .v2-annual, .guarantee-card, " +
    ".faq-home__item, .pact__term";

  function reveals(root) {
    const hidden = new Set();
    const fold = window.innerHeight * 0.92;
    let order = 0;

    const piece = (el, delay) => {
      if (el.getBoundingClientRect().top > fold) {
        el.style.opacity = "0";
        hidden.add(el);
        keep(
          inView(
            el,
            () => {
              hidden.delete(el);
              animate(
                el,
                { opacity: [0, 1], y: [26, 0], scale: [0.985, 1] },
                { duration: 0.85, ease: STRONG, delay: delay },
              );
            },
            { amount: 0.12 },
          ),
        );
      } else {
        /* already on screen: it may settle, but it never blinks out */
        animate(el, { y: [10, 0] }, { duration: 0.6, ease: EASE, delay: delay });
      }
    };

    root.querySelectorAll(GROUPS).forEach((group) => {
      const kids = [...group.children];
      if (!kids.length) return;
      const groupDelay = Math.min(order++, 5) * 0.04;
      const list = group.matches(".steps, .weeks, .films, .works, .cards, .v2-next");
      kids.forEach((kid, index) => {
        const target = kid.matches(PIECES) ? kid : kid.querySelector(PIECES);
        if (!target) return;
        const delay = groupDelay + Math.min(index, 8) * 0.07;
        piece(target, delay);
        /* A list reads as a list when its lines come in one after another. */
        if (!list) return;
        target
          .querySelectorAll(".step, .week, .film, .card, li")
          .forEach((child, childIndex) => {
            animate(
              child,
              { opacity: [0, 1], x: [-10, 0] },
              { duration: 0.55, ease: EASE, delay: delay + 0.14 + childIndex * 0.06 },
            );
          });
      });
    });

    root.querySelectorAll(PIECES).forEach((el) => {
      if (hidden.has(el) || el.closest(GROUPS)) return;
      piece(el, Math.min(order++, 6) * 0.04);
    });

    /* The watchdog: whatever happens above, the words are never lost. */
    const guard = window.setTimeout(() => {
      hidden.forEach((el) => {
        el.style.opacity = "";
      });
      hidden.clear();
    }, 2600);
    keep(() => window.clearTimeout(guard));
  }

  /* ---------- 3 · the entrance ------------------------------------------- */

  /* The first thing a visitor sees gets its own timing: kicker, title, tag,
     copy, actions — down the page in one breath, fast enough never to feel
     like waiting. */
  function entrance(root) {
    const heads = root.querySelectorAll(
      ".hero__inner, .v2-threshold-card > div:first-child, .v2-invite-body, .v2-invite-film, .sec-head, .hero__actions",
    );
    heads.forEach((head, h) => {
      const stack = head.querySelectorAll("h1, h2, .kicker, .hero__tag, .hero__copy, .lede, .sec-sub, .sub, p, .trust, .cta-row, .hero__actions, .v2-price-line, ul");
      const kids = stack.length ? [...stack] : [head];
      animate(
        kids,
        { opacity: [0, 1], y: [22, 0] },
        { duration: 0.9, delay: h * 0.12 + stagger(0.075), ease: STRONG },
      );
    });
  }

  /* ---------- 4 · the wallpaper ------------------------------------------ */

  /* The home hero's art is a CSS pseudo-element, so its drift is the
     stylesheet's job (see subpages.css, `.mv .hero::before`). Everything else
     is a real image, and images are what this touches: each breathes on its
     own clock, and on a wide screen with a pointer it drifts against the
     page's scroll as well. Two tweens, two properties, no fighting. */
  function wallpapers(root) {
    const art = root.querySelectorAll(
      "[data-wallpaper], .hero img, .works img, .work img, .card img, .poster img, " +
        ".film img, .v2-threshold-card img, .num-art img, .sec-art img, .unlock-media img, " +
        ".pact__seal",
    );
    const wide = mq(FINE) && !mq(NARROW);
    art.forEach((img, index) => {
      try {
      const big = img.closest(".hero, .v2-threshold-card, .num-art, .unlock-media") !== null;
      img.style.willChange = "transform";
      const breath = animate(
        img,
        {
          scale: big ? [1.03, 1.13] : [1.02, 1.09],
          x: big ? [-14, 14] : [-8, 8],
          rotate: big ? [-1.4, 1.4] : [0, 0],
        },
        {
          duration: 22 + (index % 5) * 4,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        },
      );
      keep(() => {
        breath.stop();
        img.style.willChange = "";
      });
      if (!wide) return;
      const frame = img.closest("section, article, figure, .card, .work") || img;
      keep(
        scroll(animate(img, { y: [-22, 22] }, { ease: "linear" }), {
          target: frame,
          offset: ["start end", "end start"],
        }),
      );
      } catch (error) {
        /* a still image that refuses to drift is still an image */
      }
    });
  }

  /* ---------- 5 · the numbers -------------------------------------------- */

  /* The house's counts arrive rather than appear: a short climb from zero,
     pinned to the value the markup already carries — no invented numbers,
     and the true figure is restored even if the climb is interrupted. */
  function counters(root) {
    root.querySelectorAll(".metric strong, .stat b, [data-count]").forEach((el, index) => {
      const raw = el.textContent.trim();
      if (!/^\d+$/.test(raw)) return;
      const target = Number(raw);
      if (!target) return;
      const proxy = { n: 0 };
      keep(
        inView(
          el,
          () => {
            animate(proxy, { n: target }, {
              duration: 1.1,
              delay: Math.min(index, 4) * 0.08,
              ease: EASE,
              onUpdate: () => {
                el.textContent = String(Math.round(proxy.n));
              },
              onComplete: () => {
                el.textContent = raw;
              },
            });
          },
          { amount: 0.6 },
        ),
      );
    });
  }

  /* ---------- 6 · the gold ---------------------------------------------- */

  /* The sweep is the stylesheet's. The pull toward the cursor, the small lift
     and the spring on press are here. Desktop only, and never on the way to
     Whop: the pointerup tween is non-blocking, the default action untouched. */
  function buttons(root) {
    if (!mq(FINE)) return;
    root.querySelectorAll(".btn, .button, .cta-row a, button").forEach((btn) => {
      let pull = null;
      const move = (event) => {
        const box = btn.getBoundingClientRect();
        if (!box.width || !box.height) return;
        const dx = ((event.clientX - (box.left + box.width / 2)) / box.width) * 11;
        const dy = ((event.clientY - (box.top + box.height / 2)) / box.height) * 7;
        if (pull) pull.stop();
        pull = animate(btn, { x: dx, y: dy - 3, scale: 1.02 }, { duration: 0.38, ease: EASE });
      };
      const leave = () => {
        if (pull) pull.stop();
        pull = animate(btn, { x: 0, y: 0, scale: 1 }, { duration: 0.6, ease: STRONG });
      };
      const down = () => animate(btn, { scale: 0.965 }, { duration: 0.12, ease: "easeOut" });
      const up = () => animate(btn, { scale: 1.02 }, { type: "spring", stiffness: 560, damping: 22 });
      btn.addEventListener("pointerenter", move);
      btn.addEventListener("pointermove", move);
      btn.addEventListener("pointerleave", leave);
      btn.addEventListener("pointerdown", down);
      btn.addEventListener("pointerup", up);
      btn.addEventListener("pointercancel", leave);
      keep(() => {
        btn.removeEventListener("pointerenter", move);
        btn.removeEventListener("pointermove", move);
        btn.removeEventListener("pointerleave", leave);
        btn.removeEventListener("pointerdown", down);
        btn.removeEventListener("pointerup", up);
        btn.removeEventListener("pointercancel", leave);
        if (pull) pull.stop();
      });
    });
  }

  /* ---------- 7 · the films --------------------------------------------- */

  /* Muted, looped, in view — the buyer chose autoplay, so the briefing plays
     where it is, and pauses the moment it leaves. Never a sound, never a
     download the visitor did not scroll to. */
  function films(root) {
    const videos = root.querySelectorAll(".film video, .unlock-media video, .v2-invite-film video, [data-autoplay]");
    videos.forEach((video) => {
      if (!(video instanceof HTMLVideoElement)) return;
      try {
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      /* A film that cannot decode — a placeholder in a local checkout, a file
         that never landed — steps aside, and the poster art stays the page. */
      const failed = () => {
        video.style.display = "none";
        if (video.parentElement) video.parentElement.classList.add("mv-no-film");
      };
      video.addEventListener("error", failed);
      if (video.error) failed();
      keep(() => video.removeEventListener("error", failed));
      const play = () => {
        video.preload = "auto";
        try {
          const started = video.play();
          if (started && typeof started.catch === "function") started.catch(() => {});
        } catch (error) {
          /* a browser that will not play still shows the poster */
        }
      };
      const pause = () => video.pause();
      keep(inView(video, play, { amount: 0.5 }));
      keep(() => pause());
      if (mq(NARROW)) {
        /* on a phone the film waits until it is the only thing on screen */
        keep(inView(video, pause, { amount: 0.05, margin: "-40% 0px -40% 0px" }));
      }
      } catch (error) {
        /* one unwatchable film never stops the others */
      }
    });
  }

  /* ---------- 8 · the questions ------------------------------------------ */

  /* The answer is native: the browser opens the details, and the page stays
     honest for anyone without this layer. What the layer adds is the way the
     answer arrives — a short rise, opacity and transform only, never a height
     the browser has to re-measure, and never anything that could hold the
     summary's own tap. Same piece serves the home's questions and the gate
     pages' own `details` blocks. */
  function questions(root) {
    root.querySelectorAll(".faq-home__item, .faq details").forEach((box) => {
      const answer = box.querySelector(".faq-home__answer, p");
      if (!answer) return;
      const arrive = () => {
        if (!box.open) return;
        try {
          animate(answer, { opacity: [0, 1], y: [-8, 0] }, { duration: 0.46, ease: EASE });
        } catch (error) {
          /* an answer that simply appears is still an answer */
        }
      };
      box.addEventListener("toggle", arrive);
      keep(() => box.removeEventListener("toggle", arrive));
      if (box.open) arrive();
    });
  }

  /* ---------- 9 · boot --------------------------------------------------- */

  function boot(root) {
    stopAll();
    const scope = root || document.querySelector("#main") || document.body;
    /* the links are the pipeline, not the weather: they are wired whether or
       not the motion engine loaded — and so is the return */
    wire();
    try {
      catchReturn();
    } catch (error) {
      /* a return that cannot be read leaves the visitor where they landed */
    }
    if (!animate || !inView) {
      document.documentElement.classList.remove("mv");
      return;
    }
    if (mq(REDUCED)) {
      document.documentElement.classList.remove("mv");
      return;
    }
    document.documentElement.classList.add("mv");
    /* Each part stands alone: a browser whose scroll maths, observers or video
       calls do not behave loses that one piece of weather, never the rest. */
    const step = (part) => {
      try {
        part(scope);
      } catch (error) {
        /* motion is never load-bearing: the page is the site */
      }
    };
    step(decorate);
    step(entrance);
    step(reveals);
    step(wallpapers);
    step(counters);
    step(buttons);
    step(films);
    step(questions);
  }

  window.__numinousMotion = { boot: boot, stop: stopAll, returnTarget: returnTarget };

  /* The adopted home has no router of ours — it boots once, on the document.
     On the routed pages the app bundle re-boots the layer per route, which is
     why a boot always stops what came before it first. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      boot(document.body);
    });
  } else {
    boot(document.body);
  }
}());
