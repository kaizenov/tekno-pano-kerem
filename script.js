(function () {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const body = document.body;
  const header = $(".site-header");
  const nav = $("#site-nav");
  const menuToggle = $(".menu-toggle");
  const progressBar = $(".progress-bar");
  const preloader = $(".preloader");
  const preloaderStart = performance.now();

  const closeMenu = () => {
    if (!nav || !menuToggle) return;
    nav.classList.remove("is-open");
    header?.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    body.classList.remove("no-scroll");
  };

  const openMenu = () => {
    if (!nav || !menuToggle) return;
    nav.classList.add("is-open");
    header?.classList.add("menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    body.classList.add("no-scroll");
  };

  const setHeaderState = () => {
    const scrolled = window.scrollY > 24;
    header?.classList.toggle("is-scrolled", scrolled);

    if (progressBar) {
      const doc = document.documentElement;
      const max = Math.max(doc.scrollHeight - window.innerHeight, 1);
      progressBar.style.width = `${(window.scrollY / max) * 100}%`;
    }
  };

  window.addEventListener("load", () => {
    const elapsed = performance.now() - preloaderStart;
    const remaining = Math.max(1200 - elapsed, 0);
    window.setTimeout(() => {
      preloader?.classList.add("is-hidden");
    }, remaining);
  });

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  menuToggle?.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    expanded ? closeMenu() : openMenu();
  });

  $$(".nav-link, .nav-cta").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closeLightbox();
      closeModal();
    }
  });

  const currentFile = window.location.pathname.split("/").pop() || "anasayfa.html";
  $$(".nav-link").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (href.split("#")[0] === currentFile) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  const revealItems = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const counters = $$(".counter");
  const animateCounter = (counter) => {
    const target = Number(counter.dataset.target || "0");
    const duration = 1300;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(target * eased).toLocaleString("tr-TR");
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (counters.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  const testimonials = $$(".testimonial-card");
  const prevTestimonial = $("[data-slider-prev]");
  const nextTestimonial = $("[data-slider-next]");
  let testimonialIndex = 0;

  const showTestimonial = (index) => {
    if (!testimonials.length) return;
    testimonialIndex = (index + testimonials.length) % testimonials.length;
    testimonials.forEach((item, itemIndex) => {
      item.hidden = itemIndex !== testimonialIndex;
    });
  };

  prevTestimonial?.addEventListener("click", () => showTestimonial(testimonialIndex - 1));
  nextTestimonial?.addEventListener("click", () => showTestimonial(testimonialIndex + 1));
  showTestimonial(0);

  const filterButtons = $$(".filter-btn");
  const galleryItems = $$(".media-item");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";
      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      galleryItems.forEach((item) => {
        const categories = (item.dataset.category || "").split(" ");
        const visible = filter === "all" || categories.includes(filter);
        item.classList.toggle("is-hidden", !visible);
      });
    });
  });

  const lightbox = $("#lightbox");
  const lightboxMedia = $(".lightbox-media");
  const lightboxTitle = $(".lightbox-title");
  const lightboxText = $(".lightbox-text");
  const lightboxClose = $(".lightbox-close");

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    body.classList.remove("no-scroll");
    if (lightboxMedia) lightboxMedia.innerHTML = "";
  }

  const openLightbox = (trigger) => {
    if (!lightbox || !lightboxMedia) return;
    const type = trigger.dataset.type || "image";
    const title = trigger.dataset.title || "TeknoPano Galeri";
    const text = trigger.dataset.text || "";
    const image = trigger.dataset.image || trigger.querySelector("img")?.getAttribute("src");

    lightboxTitle.textContent = title;
    lightboxText.textContent = text;

    if (type === "video") {
      const video = trigger.dataset.video || "";
      const poster = trigger.querySelector("img")?.getAttribute("src") || "";
      lightboxMedia.innerHTML = video
        ? `<video controls autoplay playsinline poster="${poster}"><source src="${video}">Tarayıcınız video etiketini desteklemiyor.</video>`
        : `
          <div class="video-preview" role="img" aria-label="${title}">
            <div class="video-preview-inner">
              <span class="play-dot"><i class="fa-solid fa-play" aria-hidden="true"></i></span>
              <h3>${title}</h3>
              <p>${text || "TeknoPano proje ve ürün video alanı."}</p>
            </div>
          </div>
        `;
    } else {
      lightboxMedia.innerHTML = `<img src="${image}" alt="${title}" loading="eager">`;
    }

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("no-scroll");
    lightboxClose?.focus();
  };

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => openLightbox(item));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(item);
      }
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  const modal = $("#success-modal");
  const modalClose = $("[data-modal-close]");

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    body.classList.remove("no-scroll");
  }

  const openModal = () => {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("no-scroll");
    modalClose?.focus();
  };

  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  const form = $("#appointment-form");
  const validators = {
    name(value) {
      return value.trim().length >= 3 ? "" : "Ad soyad en az 3 karakter olmalıdır.";
    },
    phone(value) {
      const normalized = value.replace(/[\s()-]/g, "");
      return /^(05\d{9}|5\d{9}|\+905\d{9})$/.test(normalized) ? "" : "Geçerli bir telefon numarası giriniz.";
    },
    email(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Geçerli bir e-posta adresi giriniz.";
    },
    service(value) {
      return value ? "" : "Lütfen hizmet seçimi yapınız.";
    },
    date(value) {
      if (!value) return "Lütfen tarih seçiniz.";
      const selected = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today ? "" : "Geçmiş tarih seçilemez.";
    },
    message(value) {
      return value.trim().length >= 10 ? "" : "Mesajınız en az 10 karakter olmalıdır.";
    }
  };

  const setFieldError = (field, message) => {
    const error = $(`[data-error-for="${field.name}"]`, form);
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
  };

  const validateField = (field) => {
    const validator = validators[field.name];
    if (!validator) return true;
    const message = validator(field.value);
    setFieldError(field, message);
    return !message;
  };

  const formatAppointmentDate = (value) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
  };

  const buildAppointmentMessage = (formElement) => {
    const data = formElement.elements;
    const value = (fieldName) => data.namedItem(fieldName).value.trim();
    return [
      "Merhaba TeknoPano, randevu talebi oluşturmak istiyorum.",
      "",
      `Ad Soyad: ${value("name")}`,
      `Telefon: ${value("phone")}`,
      `E-posta: ${value("email")}`,
      `Hizmet Seçimi: ${value("service")}`,
      `Tarih: ${formatAppointmentDate(value("date"))}`,
      "",
      "Mesaj:",
      value("message")
    ].join("\n");
  };

  const openWhatsAppAppointment = (formElement) => {
    const phone = "905393475534";
    const message = encodeURIComponent(buildAppointmentMessage(formElement));
    const url = `https://wa.me/${phone}?text=${message}`;
    const whatsappWindow = window.open(url, "_blank");

    if (!whatsappWindow) {
      window.location.href = url;
      return false;
    }

    whatsappWindow.opener = null;
    return true;
  };

  if (form) {
    const dateField = form.elements.date;
    if (dateField) {
      const today = new Date();
      today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
      dateField.min = today.toISOString().split("T")[0];
    }

    $$("input, select, textarea", form).forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = $$("input, select, textarea", form);
      const isValid = fields.every(validateField);
      if (!isValid) {
        const firstInvalid = fields.find((field) => field.getAttribute("aria-invalid") === "true");
        firstInvalid?.focus();
        return;
      }

      const openedInNewTab = openWhatsAppAppointment(form);
      if (openedInNewTab) openModal();
      form.reset();
      fields.forEach((field) => setFieldError(field, ""));
    });
  }
})();
