(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const opened = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(opened));
    });
  }

  const phone = "+7 911 561 9683";
  const phoneLinks = document.querySelectorAll("[data-phone]");
  phoneLinks.forEach(link => {
    link.href = "tel:+79115619683";
    if (link.dataset.phone === "label") link.textContent = phone;
  });

  const cars = window.ROMANAVTO_CARS || [];
  const formatPrice = value => value == null ? "Цена не указана" : new Intl.NumberFormat("ru-RU").format(value) + " ₽";

  function carArt() {
    return `<svg viewBox="0 0 420 180" role="img" aria-label="Иллюстрация автомобиля-заглушка">
      <defs><linearGradient id="carPaint" x1="0" x2="1"><stop offset="0" stop-color="#555b66"/><stop offset=".5" stop-color="#aeb3bc"/><stop offset="1" stop-color="#444954"/></linearGradient></defs>
      <ellipse cx="210" cy="145" rx="155" ry="14" fill="#000" opacity=".35"/>
      <path d="M65 119 L81 91 Q91 79 126 75 L161 44 Q174 32 203 32 L270 32 Q291 33 311 57 L338 83 Q358 88 366 104 L369 126 L54 126 Z" fill="url(#carPaint)" stroke="#d8dbe1" stroke-opacity=".5" stroke-width="2"/>
      <path d="M137 74 L169 45 Q178 39 201 39 L225 39 L225 74 Z" fill="#20252d" stroke="#858b96" stroke-width="2"/>
      <path d="M236 39 L269 39 Q286 42 301 61 L313 74 L236 74 Z" fill="#20252d" stroke="#858b96" stroke-width="2"/>
      <path d="M235 39 L235 75" stroke="#737985" stroke-width="3"/>
      <path d="M84 94 L119 88 L112 105 L72 108 Z" fill="#ff626c"/>
      <path d="M333 91 L356 101 L359 111 L337 108 Z" fill="#e3343f"/>
      <path d="M111 124 L327 124" stroke="#e5e7eb" stroke-opacity=".45" stroke-width="2"/>
      <circle cx="119" cy="126" r="27" fill="#111318" stroke="#777e89" stroke-width="5"/><circle cx="119" cy="126" r="12" fill="#737985"/><circle cx="119" cy="126" r="5" fill="#22252c"/>
      <circle cx="311" cy="126" r="27" fill="#111318" stroke="#777e89" stroke-width="5"/><circle cx="311" cy="126" r="12" fill="#737985"/><circle cx="311" cy="126" r="5" fill="#22252c"/>
      <path d="M54 126 L369 126" stroke="#d2d5dc" stroke-width="2"/>
    </svg>`;
  }

  const CREDIT_NOTE = "Можно купить в кредит без первоначального взноса";
  const formatNumber = value => {
    const numeric = Number(value);
    return value !== "" && value != null && Number.isFinite(numeric)
      ? new Intl.NumberFormat("ru-RU").format(numeric)
      : String(value ?? "");
  };
  const formatMileage = value => {
    if (value == null || value === "") return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) && String(value).trim() !== ""
      ? `${formatNumber(numeric)} км`
      : String(value);
  };
  const creditBadge = () => `<div class="credit-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>${CREDIT_NOTE}</div>`;
  const ownersLabel = n => n === 1 ? "1 собственник" : n + (n < 5 ? " собственника" : " собственников");

  function carCard(car) {
    const attrs = [car.year ? car.year + " г.в." : null, formatMileage(car.mileage), car.engine, car.transmission, car.drive].filter(Boolean);
    const photo = car.photos && car.photos[0];
    const media = photo
      ? `<picture><source srcset="${photo}-sm.webp" type="image/webp"><img src="${photo}-sm.jpg" alt="${escapeHtml(car.title)}, ${escapeHtml(String(car.year || ""))}" loading="lazy" decoding="async" width="720" height="420"></picture>`
      : carArt();
    return `<article class="car-card" data-car-title="${escapeHtml(car.title.toLowerCase())}" data-car-price="${car.price ?? ""}" data-car-year="${car.year ?? ""}">
      <a class="car-placeholder${photo ? " car-photo" : ""}" href="car.html?id=${encodeURIComponent(car.id)}" tabindex="-1" aria-hidden="true">${media}</a>
      <div class="car-card-body">
        <h3>${escapeHtml(car.title)}${car.year ? `, ${car.year}` : ""}</h3>
        <div class="car-price">${formatPrice(car.price)}</div>
        ${creditBadge()}
        ${attrs.length ? `<div class="car-meta">${attrs.map(a => `<span>${escapeHtml(String(a))}</span>`).join("")}</div>` : ""}
        <a class="btn btn-secondary btn-small" href="car.html?id=${encodeURIComponent(car.id)}">Подробнее</a>
      </div>
    </article>`;
  }

  const featured = document.querySelector("[data-car-featured]");
  if (featured) {
    featured.innerHTML = cars.map(carCard).join("");
    featured.setAttribute("tabindex", "0");
    featured.setAttribute("aria-label", "Автомобили в наличии — прокручивайте по горизонтали");
  }

  const catalog = document.querySelector("[data-car-grid]");
  if (catalog) {
    catalog.innerHTML = cars.map(carCard).join("");
    const search = document.querySelector("[data-car-search]");
    const sort = document.querySelector("[data-car-sort]");
    const empty = document.querySelector("[data-empty-state]");
    function applyFilters() {
      const term = (search?.value || "").trim().toLowerCase();
      const cards = [...catalog.querySelectorAll(".car-card")];
      cards.forEach(card => {
        card.style.display = card.dataset.carTitle.includes(term) ? "" : "none";
      });
      const order = {
        default: () => 0,
        name: (a, b) => a.dataset.carTitle.localeCompare(b.dataset.carTitle, "ru"),
        "price-asc": (a, b) => a.dataset.carPrice - b.dataset.carPrice,
        "price-desc": (a, b) => b.dataset.carPrice - a.dataset.carPrice,
        "year-desc": (a, b) => b.dataset.carYear - a.dataset.carYear
      }[sort?.value || "default"];
      if (order) [...cards].sort(order).forEach(card => catalog.appendChild(card));
      if (empty) empty.style.display = cards.some(card => card.style.display !== "none") ? "none" : "block";
    }
    search?.addEventListener("input", applyFilters);
    sort?.addEventListener("change", applyFilters);
  }

  const detail = document.querySelector("[data-car-detail]");
  if (detail) {
    const id = new URLSearchParams(location.search).get("id");
    const car = cars.find(item => item.id === id);
    if (!car) {
      detail.innerHTML = `<div class="notice"><strong>Автомобиль не найден.</strong><p>Вернитесь в каталог и выберите доступную карточку.</p><a class="btn btn-primary" href="catalog.html">Открыть каталог</a></div>`;
    } else {
      document.title = `${car.title}, ${car.year} | РоманАвто`;
      const photos = car.photos || [];
      const gallery = photos.length
        ? `<div class="gallery">
            <a class="gallery-main" href="${photos[0]}.jpg" target="_blank" rel="noopener" data-gallery-main><picture><source srcset="${photos[0]}.webp" type="image/webp" data-gallery-webp><img src="${photos[0]}.jpg" alt="${escapeHtml(car.title)} — фото 1" width="1600" height="900"></picture></a>
            <div class="gallery-thumbs">${photos.map((src, i) => `<button type="button" class="gallery-thumb${i === 0 ? " active" : ""}" data-src="${src}.jpg" data-webp="${src}.webp" aria-label="Фото ${i + 1}"><picture><source srcset="${src}-sm.webp" type="image/webp"><img src="${src}-sm.jpg" alt="" loading="lazy" decoding="async" width="720" height="420"></picture></button>`).join("")}</div>
          </div>`
        : `<div class="car-placeholder" style="border:1px solid var(--line);border-radius:16px;min-height:300px">${carArt()}</div>`;
      detail.innerHTML = `<div class="detail-layout">
        ${gallery}
        <div class="detail-panel">
          <h1 style="font-size:clamp(30px,4vw,44px);margin-top:0">${escapeHtml(car.title)}${car.year ? `, ${car.year}` : ""}</h1>
          <div class="car-price">${formatPrice(car.price)}</div>
          ${creditBadge()}
          <ul class="list-check">
            ${car.year != null ? `<li>Год выпуска: ${escapeHtml(String(car.year))}</li>` : ""}
            ${car.mileage != null ? `<li>Пробег: ${escapeHtml(formatMileage(car.mileage))}</li>` : ""}
            ${car.owners ? `<li>Владельцы: ${ownersLabel(car.owners)}</li>` : ""}
            ${car.engine ? `<li>Двигатель: ${escapeHtml(car.engine)}</li>` : ""}
            ${car.transmission ? `<li>Коробка передач: ${escapeHtml(car.transmission)}</li>` : ""}
            ${car.drive ? `<li>Привод: ${escapeHtml(car.drive)}</li>` : ""}
            ${car.fuel ? `<li>Тип топлива: ${escapeHtml(car.fuel)}</li>` : ""}
            ${car.body ? `<li>Кузов: ${escapeHtml(car.body)}</li>` : ""}
          </ul>
          <p style="margin-top:18px">${escapeHtml(car.description || "")}</p>
          <p class="small-muted" style="margin-top:18px">Оплата: наличные, перевод или кредит без первоначального взноса. Подробности уточняйте по телефону.</p>
          <a class="btn btn-primary" href="tel:+79115619683">Позвонить: +7 911 561 9683</a>
          <a class="btn btn-secondary" href="catalog.html" style="margin-top:10px">Вернуться в каталог</a>
        </div>
      </div>`;
      const main = detail.querySelector("[data-gallery-main]");
      const thumbs = [...detail.querySelectorAll(".gallery-thumb")];
      let currentPhoto = 0;
      const showPhoto = i => {
        if (!thumbs.length) return;
        currentPhoto = (i + thumbs.length) % thumbs.length;
        const thumb = thumbs[currentPhoto], img = main.querySelector("img"), source = main.querySelector("[data-gallery-webp]");
        main.href = thumb.dataset.src; img.src = thumb.dataset.src; img.alt = `${car.title} — фото ${currentPhoto + 1}`;
        if (source) source.srcset = thumb.dataset.webp;
        thumbs.forEach((t, n) => t.classList.toggle("active", n === currentPhoto));
        const count = detail.querySelector("[data-gallery-count]"); if (count) count.textContent = `${currentPhoto + 1} / ${thumbs.length}`;
      };
      thumbs.forEach((thumb, i) => thumb.addEventListener("click", () => showPhoto(i)));
      detail.querySelector("[data-gallery-prev]")?.addEventListener("click", () => showPhoto(currentPhoto - 1));
      detail.querySelector("[data-gallery-next]")?.addEventListener("click", () => showPhoto(currentPhoto + 1));
      let touchStartX = null;
      main.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].clientX; }, {passive:true});
      main.addEventListener("touchend", e => { if (touchStartX === null) return; const dx=e.changedTouches[0].clientX-touchStartX; if(Math.abs(dx)>45) showPhoto(currentPhoto+(dx<0?1:-1)); touchStartX=null; }, {passive:true});
      main.addEventListener("click", e => { e.preventDefault(); openLightbox(thumbs.map(t=>({jpg:t.dataset.src,webp:t.dataset.webp})), currentPhoto); });
      const detailPanel = detail.querySelector(".detail-panel");
      const callButton = detailPanel.querySelector('a[href^="tel:"]');
      if (callButton) {
        const actions = document.createElement("div"); actions.className = "detail-contact-actions";
        callButton.before(actions); actions.appendChild(callButton);
        const telegram = document.createElement("a");
        telegram.className = "btn btn-telegram";
        telegram.href = "https://t.me/share/url?url=" + encodeURIComponent(location.href) + "&text=" + encodeURIComponent(`Интересует автомобиль ${car.title}`);
        telegram.target = "_blank"; telegram.rel = "noopener noreferrer"; telegram.textContent = "Написать в Telegram";
        actions.appendChild(telegram);
      }
      const jsonLd = {"@context":"https://schema.org","@type":"Vehicle","name":car.title,"brand":car.title.split(" ")[0],"model":car.title.split(" ").slice(1).join(" "),"vehicleModelDate":car.year,"mileageFromOdometer":car.mileage != null ? {"@type":"QuantitativeValue","value":car.mileage,"unitCode":"KMT"}:undefined,"offers":{"@type":"Offer","price":car.price,"priceCurrency":"RUB","availability":"https://schema.org/InStock"}};
      const ld = document.createElement("script"); ld.type="application/ld+json"; ld.textContent=JSON.stringify(jsonLd); document.head.appendChild(ld);
      document.title = `${car.title}${car.year ? " " + car.year : ""} — купить с пробегом в Котласе | РоманАвто`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.content = `${car.title}${car.year ? " " + car.year + " года" : ""} с пробегом в РоманАвто, Котлас. Цена ${formatPrice(car.price)}. Характеристики, фотографии и связь с продавцом.`;

    }
  }

  let lightbox = null, lightboxPhotos = [], lightboxIndex = 0;
  function ensureLightbox() {
    if (lightbox) return lightbox;
    lightbox = document.createElement("div"); lightbox.className = "photo-lightbox"; lightbox.setAttribute("role","dialog"); lightbox.setAttribute("aria-modal","true"); lightbox.setAttribute("aria-label","Просмотр фотографий");
    lightbox.innerHTML = '<button class="lightbox-close" aria-label="Закрыть">×</button><button class="lightbox-prev" aria-label="Предыдущее фото">‹</button><picture><source type="image/webp"><img alt="Фотография автомобиля"></picture><button class="lightbox-next" aria-label="Следующее фото">›</button><span class="lightbox-count"></span>';
    document.body.appendChild(lightbox);
    const render = () => { const photo=lightboxPhotos[lightboxIndex]; lightbox.querySelector("source").srcset=photo.webp; lightbox.querySelector("img").src=photo.jpg; lightbox.querySelector(".lightbox-count").textContent=`${lightboxIndex+1} / ${lightboxPhotos.length}`; };
    lightbox.querySelector(".lightbox-close").onclick=()=>lightbox.classList.remove("open");
    lightbox.querySelector(".lightbox-prev").onclick=()=>{lightboxIndex=(lightboxIndex+lightboxPhotos.length-1)%lightboxPhotos.length;render();};
    lightbox.querySelector(".lightbox-next").onclick=()=>{lightboxIndex=(lightboxIndex+1)%lightboxPhotos.length;render();};
    lightbox.addEventListener("click",e=>{if(e.target===lightbox)lightbox.classList.remove("open");});
    document.addEventListener("keydown",e=>{if(!lightbox.classList.contains("open"))return;if(e.key==="Escape")lightbox.classList.remove("open");if(e.key==="ArrowRight")lightbox.querySelector(".lightbox-next").click();if(e.key==="ArrowLeft")lightbox.querySelector(".lightbox-prev").click();});
    return lightbox;
  }
  function openLightbox(photos, index=0) {
    if (!photos.length) return;
    const box=ensureLightbox(); lightboxPhotos=photos; lightboxIndex=index; const photo=photos[index]; box.querySelector("source").srcset=photo.webp; box.querySelector("img").src=photo.jpg; box.querySelector(".lightbox-count").textContent=`${index+1} / ${photos.length}`; box.classList.add("open");
  }

  // Фотоальбом покупателей: отображаем только реальные фотографии, без текстовых карточек.
  const reviews = window.ROMANAVTO_REVIEWS || [];
  function reviewCard(review) {
    if (!review.photo) return "";
    const alt = `Фото покупателя ${review.customer || ""}`.trim();
    const webp = review.photo.replace(/\.jpe?g$/i, ".webp");
    return `<a class="album-photo" href="${escapeHtml(review.photo)}" data-review-photo="${escapeHtml(review.photo)}" data-review-webp="${escapeHtml(webp)}" aria-label="Открыть фотографию в полном размере">
      <picture><source srcset="${escapeHtml(webp)}" type="image/webp"><img src="${escapeHtml(review.photo)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"></picture>
    </a>`;
  }
  document.querySelectorAll("[data-reviews-preview], [data-reviews-all]").forEach(container => {
    const photos = reviews.filter(review => review && review.photo);
    const isPreview = container.hasAttribute("data-reviews-preview");
    const shown = isPreview ? photos.slice(0, 3) : photos;
    if (shown.length) {
      container.innerHTML = shown.map(reviewCard).join("");
    } else {
      container.innerHTML = `<div class="review-empty">Фотографии покупателей скоро появятся.</div>`;
    }
  });

  document.addEventListener("click", event => {
    const photoLink = event.target.closest("[data-review-photo]");
    if (photoLink) { event.preventDefault(); const all=[...document.querySelectorAll("[data-review-photo]")].map(a=>({jpg:a.dataset.reviewPhoto,webp:a.dataset.reviewWebp})); openLightbox(all, all.findIndex(photo=>photo.jpg===photoLink.dataset.reviewPhoto)); }
  });

  const forms = document.querySelectorAll("[data-demo-form]");
  forms.forEach(form => form.addEventListener("submit", event => {
    event.preventDefault();
    const message = form.querySelector("[data-form-message]");
    if (message) message.textContent = "Форма пока демонстрационная и не отправляет данные. Позвоните по номеру +7 911 561 9683. Перед запуском подключите безопасный способ обработки заявок и необходимые документы по персональным данным.";
  }));

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
  }
})();
