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

  function carCard(car) {
    const attrs = [car.year, car.mileage != null ? new Intl.NumberFormat("ru-RU").format(car.mileage) + " км" : null, car.transmission, car.drive].filter(Boolean);
    return `<article class="car-card" data-car-title="${escapeHtml(car.title.toLowerCase())}">
      <div class="car-placeholder">${car.demo ? '<span class="demo-tag">ДЕМО · ЗАМЕНИТЬ</span>' : ''}${carArt()}</div>
      <div class="car-card-body">
        <h3>${escapeHtml(car.title)}</h3>
        <div class="car-price">${formatPrice(car.price)}</div>
        ${attrs.length ? `<div class="car-meta">${attrs.map(a => `<span>${escapeHtml(String(a))}</span>`).join("")}</div>` : '<p class="small-muted">Характеристики будут добавлены после заполнения карточки.</p>'}
        <p>${escapeHtml(car.demo ? "Демонстрационная карточка — не является предложением о продаже автомобиля." : car.description || "")}</p>
        <a class="btn btn-secondary btn-small" href="car.html?id=${encodeURIComponent(car.id)}">Подробнее</a>
      </div>
    </article>`;
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
      if (sort?.value === "name") {
        [...cards].sort((a,b) => a.dataset.carTitle.localeCompare(b.dataset.carTitle, "ru")).forEach(card => catalog.appendChild(card));
      }
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
      detail.innerHTML = `<div class="detail-layout">
        <div class="car-placeholder" style="border:1px solid var(--line);border-radius:16px;min-height:300px">${car.demo ? '<span class="demo-tag">ДЕМО · ЗАМЕНИТЬ</span>' : ''}${carArt()}</div>
        <div class="detail-panel">
          ${car.demo ? '<div class="demo-warning">Демонстрационная карточка. Перед публикацией замените все данные и удалите пометку «ДЕМО».</div>' : ''}
          <h1 style="font-size:clamp(30px,4vw,44px);margin-top:16px">${escapeHtml(car.title)}</h1>
          <div class="car-price">${formatPrice(car.price)}</div>
          <p>${escapeHtml(car.description || "")}</p>
          <ul class="list-check">
            ${car.year != null ? `<li>Год выпуска: ${escapeHtml(String(car.year))}</li>` : ""}
            ${car.mileage != null ? `<li>Пробег: ${escapeHtml(String(car.mileage))} км</li>` : ""}
            ${car.transmission ? `<li>Коробка передач: ${escapeHtml(car.transmission)}</li>` : ""}
            ${car.drive ? `<li>Привод: ${escapeHtml(car.drive)}</li>` : ""}
            ${car.fuel ? `<li>Тип топлива: ${escapeHtml(car.fuel)}</li>` : ""}
            ${car.body ? `<li>Кузов: ${escapeHtml(car.body)}</li>` : ""}
          </ul>
          <p class="small-muted" style="margin-top:18px">Уточняйте актуальную информацию по телефону.</p>
          <a class="btn btn-primary" href="tel:+79115619683">Позвонить: +7 911 561 9683</a>
          <a class="btn btn-secondary" href="catalog.html" style="margin-top:10px">Вернуться в каталог</a>
        </div>
      </div>`;
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
