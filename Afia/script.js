const noMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

// Scroll-reveal via IntersectionObserver (never a scroll listener — avoids reflow/jank).
// Every section that should reveal already carries the "reveal" class in its markup,
// so this stays in sync automatically instead of duplicating a selector list here.
const revealTargets = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
);
revealTargets.forEach((el) => revealObserver.observe(el));

// Fluid-island menu: hamburger morph + staggered full-screen overlay.
const menuToggle = document.getElementById("menuToggle");
const menuOverlay = document.getElementById("menuOverlay");

if (menuToggle && menuOverlay) {
  const closeMenu = () => {
    menuOverlay.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    menuOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuOverlay.classList.toggle("open");
    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    menuOverlay.setAttribute("aria-hidden", String(!isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen) menuOverlay.querySelector("a")?.focus();
  });

  menuOverlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (!menuOverlay.classList.contains("open")) return;
    if (event.key === "Escape") { closeMenu(); menuToggle.focus(); return; }
    if (event.key !== "Tab") return;
    const links = Array.from(menuOverlay.querySelectorAll("a[href]"));
    if (!links.length) return;
    const first = links[0];
    const last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
}

// Gmail popover — anchored directly under the Gmail button (its wrapper is
// the positioning context), flipped to align right if it would overflow
// the viewport edge.
const mailTrigger = document.querySelector(".mail-trigger");
const gmailPopover = document.getElementById("gmailPopover");

if (mailTrigger && gmailPopover) {
  const closePopover = () => {
    gmailPopover.classList.remove("visible");
    mailTrigger.setAttribute("aria-expanded", "false");
  };

  const openPopover = () => {
    gmailPopover.classList.remove("align-right");
    gmailPopover.classList.add("visible");
    const rect = gmailPopover.getBoundingClientRect();
    if (rect.right > window.innerWidth - 20) {
      gmailPopover.classList.add("align-right");
    }
    mailTrigger.setAttribute("aria-expanded", "true");
  };

  mailTrigger.addEventListener("click", (event) => {
    event.preventDefault();
    if (gmailPopover.classList.contains("visible")) {
      closePopover();
    } else {
      openPopover();
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target === mailTrigger || mailTrigger.contains(event.target)) return;
    if (gmailPopover.contains(event.target)) return;
    closePopover();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && gmailPopover.classList.contains("visible")) {
      closePopover();
      mailTrigger.focus();
    }
  });
}


// Soft skills orbital — hover/focus previews a node, click pins it. The core
// panel swaps title, description, HUD readout and accent to the selected skill.
const softOrbit = document.querySelector('.soft-orbit');
if (softOrbit) {
  const nodes = Array.from(softOrbit.querySelectorAll('.soft-node'));
  const core = document.getElementById('softCore');
  const title = document.getElementById('softPanelTitle');
  const desc = document.getElementById('softPanelDesc');
  const directive = document.getElementById('softDirective');
  const index = document.getElementById('softIndex');
  const holoCenter = document.getElementById('softHoloCenter');
  const firstNode = nodes[0];
  let pinned = firstNode;

  const showNode = (node) => {
    nodes.forEach((n) => n.classList.toggle('is-active', n === node));
    title.textContent = node.dataset.title;
    desc.textContent = node.dataset.desc;
    directive.textContent = node.dataset.directive;
    index.textContent = node.dataset.index;
    core.style.setProperty('--panel-accent', node.style.getPropertyValue('--node-accent').trim());
    core.style.setProperty('--panel-glow', node.style.getPropertyValue('--node-glow').trim());
    const icon = node.querySelector('svg');
    if (icon && holoCenter) {
      const clone = icon.cloneNode(true);
      clone.setAttribute('width', '22');
      clone.setAttribute('height', '22');
      holoCenter.replaceChildren(clone);
    }
  };

  nodes.forEach((node) => {
    node.addEventListener('mouseenter', () => showNode(node));
    node.addEventListener('focus', () => showNode(node));
    node.addEventListener('click', () => {
      showNode(node);
      pinned = node;
    });
  });
  softOrbit.addEventListener('mouseleave', () => showNode(pinned));
  softOrbit.addEventListener('focusout', (event) => {
    if (!softOrbit.contains(event.relatedTarget)) showNode(pinned);
  });
  showNode(firstNode);
}

// Projects — 3D stacked carousel: dots, side-card clicks, drag, arrows and
// autoplay until the visitor interacts. All cards stay in the DOM; only the
// active one reveals its description, tags and case-study link.
const projStageWrap = document.querySelector('.proj-stage-wrap');
if (projStageWrap) {
  const cards = Array.from(projStageWrap.querySelectorAll('.proj-card'));
  const dots = Array.from(projStageWrap.querySelectorAll('.proj-dot'));
  const pauseBtn = projStageWrap.querySelector('.proj-pause');
  const status = document.getElementById('projStatus');
  const total = cards.length;
  let active = 0;
  let timer = null;
  let stopped = noMotion;
  let paused = noMotion;

  const render = () => {
    cards.forEach((card, i) => {
      let offset = i - active;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
      card.dataset.offset = String(offset);
      const link = card.querySelector('.proj-cta');
      if (link) link.tabIndex = offset === 0 ? 0 : -1;
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
      dot.setAttribute('aria-pressed', String(i === active));
    });
  };

  const go = (index) => {
    active = (index + total) % total;
    render();
    if (status) status.textContent = `Project ${active + 1} of ${total}`;
  };
  const clearTimer = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };
  const stopAuto = () => { stopped = true; clearTimer(); };
  const startAuto = () => {
    if (stopped || paused || timer) return;
    timer = setInterval(() => {
      const rect = projStageWrap.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) go(active + 1);
    }, 4000);
  };
  const setPaused = (value) => {
    paused = value;
    if (paused) clearTimer(); else startAuto();
    if (pauseBtn) {
      pauseBtn.textContent = paused ? 'Play' : 'Pause';
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.setAttribute('aria-label', paused ? 'Play carousel' : 'Pause carousel');
    }
  };

  dots.forEach((dot, i) => dot.addEventListener('click', () => { stopAuto(); go(i); }));
  pauseBtn?.addEventListener('click', () => setPaused(!paused));
  projStageWrap.addEventListener('click', (event) => {
    const card = event.target.closest('.proj-card');
    if (!card) return;
    const index = cards.indexOf(card);
    if (index >= 0 && index !== active) { stopAuto(); go(index); }
  });

  projStageWrap.addEventListener('pointerenter', clearTimer);
  projStageWrap.addEventListener('pointerleave', startAuto);
  projStageWrap.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    stopAuto();
    go(active + (event.key === 'ArrowRight' ? 1 : -1));
  });

  let dragStart = null;
  projStageWrap.addEventListener('pointerdown', (event) => {
    if (event.target.closest('a, .proj-dot')) return;
    dragStart = event.clientX;
  });
  projStageWrap.addEventListener('pointerup', (event) => {
    if (dragStart === null) return;
    const dx = event.clientX - dragStart;
    dragStart = null;
    if (Math.abs(dx) > 50) { stopAuto(); go(active + (dx < 0 ? 1 : -1)); }
  });
  projStageWrap.addEventListener('pointercancel', () => { dragStart = null; });
  addEventListener('pointerup', () => { dragStart = null; });

  render();
  setPaused(paused);
}

// Expertise — the ambient glow follows the hovered/focused category row.
// All rows stay expanded, matching the reference's expanded practice list.
const expertiseList = document.querySelector('.expertise-list');
if (expertiseList) {
  const rows = Array.from(expertiseList.querySelectorAll('.expertise-row'));
  const glow = expertiseList.querySelector('.expertise-glow');
  const firstRow = rows[0];
  const placeGlow = (row) => {
    glow.style.top = `${row.offsetTop + row.offsetHeight / 2}px`;
    glow.style.backgroundColor = row.dataset.tone === 'violet'
      ? 'rgba(23,107,90,.5)'
      : 'rgba(31,107,67,.5)';
  };

  rows.forEach((row) => {
    row.addEventListener('mouseenter', () => placeGlow(row));
    row.addEventListener('focusin', () => placeGlow(row));
  });
  expertiseList.addEventListener('mouseleave', () => placeGlow(firstRow));
  window.addEventListener('resize', () => placeGlow(firstRow));
  placeGlow(firstRow);
}

// Contact form — posts to the /api/contact serverless function, which
// sends the message via Resend. Requires the site to be deployed
// somewhere that serves that endpoint (e.g. Vercel) — opening this file
// directly from disk has no backend, so submissions will fail there.
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  const submitBtn = document.getElementById("cfSubmit");
  const submitLabel = document.getElementById("cfSubmitLabel");
  const status = document.getElementById("cfStatus");
  const formOpenedAt = Date.now();

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    submitBtn.disabled = true;
    submitLabel.textContent = "Sending…";
    status.textContent = "";
    status.removeAttribute("data-state");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website: contactForm.website.value, elapsed: Date.now() - formOpenedAt }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      status.textContent = "Message sent — thanks! I'll get back to you soon.";
      status.setAttribute("data-state", "ok");
      status.setAttribute("role", "status");
      contactForm.reset();
    } catch (err) {
      // A network-level failure (offline, no backend deployed, CORS, etc.)
      // throws a generic TypeError from fetch itself — show a friendly
      // message instead of surfacing that raw browser text. Errors we threw
      // ourselves above carry the server's actual reason, so keep those.
      status.textContent =
        err instanceof TypeError
          ? "Couldn't reach the server. Please try again or email me directly."
          : err.message || "Something went wrong. Please try again.";
      status.setAttribute("data-state", "error");
      // role="alert" is assertive — screen readers interrupt to announce
      // it immediately, which is what an error deserves (unlike the
      // polite "status" role used for the success message above).
      status.setAttribute("role", "alert");
    } finally {
      submitBtn.disabled = false;
      submitLabel.textContent = "Send message";
    }
  });
}

if (finePointer && !noMotion) {
  const root = document.documentElement;
  let queued = false;
  let px = 0;
  let py = 0;

  addEventListener('pointermove', (event) => {
    px = event.clientX;
    py = event.clientY;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      root.style.setProperty('--mx', `${px}px`);
      root.style.setProperty('--my', `${py}px`);
      queued = false;
    });
  }, { passive: true });

  document.querySelectorAll('.btn-primary, .island-cta').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) * 0.18;
      const dy = (event.clientY - rect.top - rect.height / 2) * 0.18;
      button.style.transform = `translate3d(${dx}px, ${dy - 2}px, 0)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });

  projStageWrap?.querySelectorAll('.proj-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (card.dataset.offset !== '0') return;
      const rect = card.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--gx', `${(nx + 0.5) * 100}%`);
      card.style.setProperty('--gy', `${(ny + 0.5) * 100}%`);
      card.style.setProperty('--rx', `${-ny * 8}deg`);
      card.style.setProperty('--ry', `${nx * 8}deg`);
    });
  });
}
