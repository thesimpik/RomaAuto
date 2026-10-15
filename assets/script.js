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
  const formatNumber = value => new Intl.NumberFormat("ru-RU").format(value);
  const creditBadge = () => `<div class="credit-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>${CREDIT_NOTE}</div>`;
  const ownersLabel = n => n === 1 ? "1 собственник" : n + (n < 5 ? " собственника" : " собственников");

  function carCard(car) {
    const attrs = [car.year ? car.year + " г.в." : null, car.mileage != null ? formatNumber(car.mileage) + " км" : null, car.engine, car.transmission, car.drive].filter(Boolean);
    const photo = car.photos && car.photos[0];
    const media = photo
      ? `<img src="${photo}-sm.jpg" alt="${escapeHtml(car.title)}, ${escapeHtml(String(car.year || ""))}" loading="lazy" width="720" height="420">`
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
  if (featured) featured.innerHTML = cars.map(carCard).join("");

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
            <a class="gallery-main" href="${photos[0]}.jpg" target="_blank" rel="noopener" data-gallery-main><img src="${photos[0]}.jpg" alt="${escapeHtml(car.title)} — фото 1" width="1600" height="900"></a>
            <div class="gallery-thumbs">${photos.map((src, i) => `<button type="button" class="gallery-thumb${i === 0 ? " active" : ""}" data-src="${src}.jpg" aria-label="Фото ${i + 1}"><img src="${src}-sm.jpg" alt="" loading="lazy" width="720" height="420"></button>`).join("")}</div>
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
            ${car.mileage != null ? `<li>Пробег: ${formatNumber(car.mileage)} км</li>` : ""}
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
      detail.querySelectorAll(".gallery-thumb").forEach((thumb, i) => thumb.addEventListener("click", () => {
        main.href = thumb.dataset.src;
        main.querySelector("img").src = thumb.dataset.src;
        main.querySelector("img").alt = `${car.title} — фото ${i + 1}`;
        detail.querySelectorAll(".gallery-thumb").forEach(t => t.classList.toggle("active", t === thumb));
      }));
    }
  }

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
