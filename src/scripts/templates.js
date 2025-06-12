import { showFormattedDate } from "./utils";

export function generateLoaderTemplate() {
  return `
    <div class="loader"></div>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
}

export function generateMainNavigationListTemplate() {
  return `
    
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="new-story-button" class="btn new-story-button" href="#/new">Buat Story <i class="fas fa-plus"></i></a></li>
    <li><a id="story-list-button" class="story-list-button" href="#/">Daftar Story</a></li>
    <li><a id="bookmark-button" class="bookmark-button" href="#/bookmark">Story Tersimpan</a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
  `;
}

export function generateStoriesListEmptyTemplate() {
  return `
    <div id="story-list-empty" class="story-list__empty">
      <h2>Tidak ada Story yang tersedia</h2>
      <p>Saat ini, tidak ada story kerusakan fasilitas umum yang dapat ditampilkan.</p>
    </div>
  `;
}

export function generateStoriesListErrorTemplate(message) {
  return `
    <div id="story-list-error" class="story-list__error">
      <h2>Terjadi kesalahan pengambilan daftar story</h2>
      <p>${message ? message : "Gunakan jaringan lain atau laporkan error ini."}</p>
    </div>
  `;
}

export function generateStoryDetailErrorTemplate(message) {
  return `
    <div id="story-detail-error" class="story-detail__error">
      <h2>Terjadi kesalahan pengambilan detail story</h2>
      <p>${message ? message : "Gunakan jaringan lain atau laporkan error ini."}</p>
    </div>
  `;
}

export function generateStoriesItemTemplate({
  id,
  title,
  description,
  evidenceImages,
  storiesName,
  createdAt,
  location,
}) {
  const latitude = location.latitude != null ? location.latitude : 0;
  const longitude = location.longitude != null ? location.longitude : 0;
  const shortDescription =
    description.length > 100
      ? description.substring(0, 97) + "..."
      : description;

  return `
    <div tabindex="0" class="story-card" data-storyid="${id}">
      <div class="story-card__image-container">
        <img class="story-card__image" src="${evidenceImages[0] || "images/placeholder-image.jpg"}" alt="${title}">
      </div>
      <div class="story-card__content">
        <h2 class="story-card__title">${title}</h2>
        <p class="story-card__description">${shortDescription}</p>
        <div class="story-card__meta">
          <span class="story-card__author">Oleh: ${storiesName}</span>
          <span class="story-card__date"><i class="fas fa-calendar-alt"></i> ${showFormattedDate(createdAt, "id-ID")}</span>
          <span class="story-card__location"><i class="fas fa-map-marker-alt"></i> ${latitude}, ${longitude}</span>
        </div>
        <a class="story-card__button btn" href="#/stories/${id}">
          Selengkapnya <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;
}

export function generateStoryDetailImageTemplate(imageUrl = null, alt = "") {
  if (!imageUrl) {
    return `
      <div class="story-detail__image-wrapper">
        <img class="story-detail__image" src="images/placeholder-image.jpg" alt="Placeholder Image" loading="lazy">
      </div>
    `;
  }

  return `
    <div class="story-detail__image-wrapper">
      <img class="story-detail__image" src="${imageUrl}" alt="${alt}" loading="lazy">
    </div>
  `;
}

export function generateStoryDetailTemplate({
  title,
  description,
  evidenceImages,
  latitudeLocation,
  longitudeLocation,
  storiesName,
  createdAt,
  location,
}) {
  const createdAtFormatted = showFormattedDate(createdAt, "id-ID");
  const imagesHtml = evidenceImages.reduce(
    (accumulator, evidenceImage) =>
      accumulator.concat(
        generateStoryDetailImageTemplate(evidenceImage, title),
      ),
    "",
  );

  return `
    <div class="container">
      <article class="story-detail__card">
        <div class="story-detail__images__container">
          <div id="images" class="story-detail__images">${imagesHtml}</div>
        </div>

        <section class="story-detail__info">
          <h2 class="story-detail__info__title">Detail Story</h2>
          <div class="story-detail__meta">
            <div class="story-detail__meta-item">
              <i class="fas fa-user"></i> <span>${storiesName}</span>
            </div>
            <div class="story-detail__meta-item">
              <i class="fas fa-calendar-alt"></i> <span>${createdAtFormatted}</span>
            </div>
            <div class="story-detail__meta-item">
              <i class="fas fa-map-marker-alt"></i> <span>${location.placeName}</span>
            </div>
            <div class="story-detail__meta-item story-detail__coordinates">
              <span>Lat: ${latitudeLocation}</span>
              <span>Lon: ${longitudeLocation}</span>
            </div>
          </div>
          <div class="story-detail__description">
            <p>${description}</p>
          </div>
        </section>

        <section class="story-detail__map">
          <h2 class="story-detail__map__title">Peta Lokasi</h2>
          <div class="story-detail__map__container">
            <div id="map" class="story-detail__map__inner"></div>
            <div id="map-loading-container"></div>
          </div>
        </section>

        <section class="story-detail__actions">
          <h2 class="story-detail__actions__title">Aksi</h2>
          <div class="story-detail__actions__buttons">
            <div id="save-actions-container"></div>
          </div>
        </section>
      </article>
    </div>
  `;
}

export function generateSaveStoryButtonTemplate() {
  return `
    <button id="story-detail-save" class="btn btn-transparent">
      Simpan Story <i class="far fa-bookmark"></i>
    </button>
  `;
}
 
export function generateRemoveStoryButtonTemplate() {
  return `
    <button id="story-detail-remove" class="btn btn-transparent">
      Buang Story <i class="fas fa-bookmark"></i>
    </button>
  `;
}

export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}