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
    menuOverlay.setAttribute("aria-hidden", "true");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuOverlay.classList.toggle("open");
    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuOverlay.setAttribute("aria-hidden", String(!isOpen));
  });

  menuOverlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
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
        body: JSON.stringify({ name, email, message }),
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
