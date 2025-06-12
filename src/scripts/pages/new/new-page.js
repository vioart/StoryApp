import NewPresenter from "./new-presenter";
import { convertBase64ToBlob } from "../../utils";
import * as StoryAPI from "../../data/api";
import { generateLoaderAbsoluteTemplate } from "../../templates";
import Camera from "../../utils/camera";
import Map from "../../utils/map";

export default class NewPage {
  #presenter;
  #form;
  #camera;
  #isCameraOpen = false;
  #takenPhoto = null;
  #map = null;

  async render() {
    return `
      <section class="new-story__hero">
        <div class="container">
          <div class="new-story__hero-content">
            <h1 class="new-story__hero-title">Buat Cerita Baru</h1>
            <p class="new-story__hero-description">
              Abadikan momen spesial Anda dengan cerita dan foto. Isi formulir di bawah untuk berbagi pengalaman Anda!
            </p>
          </div>
        </div>
      </section>
  
      <section class="container">
        <div class="new-story__form-wrapper">
          <form id="new-form" class="new-story__form">
            <div class="new-story__form-group">
              <label for="description-input" class="new-story__form-label">Deskripsi Cerita</label>
              <textarea
                id="description-input"
                name="description"
                class="new-story__form-textarea"
                placeholder="Ceritakan kisah Anda, misalnya apa yang terjadi, di mana, kapan, atau mengapa cerita ini spesial."
                required
              ></textarea>
            </div>
            <div class="new-story__form-group">
              <label for="photo-input" class="new-story__form-label">Foto</label>
              <p class="new-story__form-hint">Sertakan satu foto (maksimal 1MB) untuk cerita Anda.</p>
              <div class="new-story__photo-controls">
                <button id="photo-input-button" class="new-story__form-button new-story__form-button--outline" type="button">
                  <i class="fas fa-upload"></i> Pilih Foto
                </button>
                <input
                  id="photo-input"
                  name="photo"
                  type="file"
                  accept="image/*"
                  hidden
                  aria-describedby="photo-more-info"
                >
                <button id="open-photo-camera-button" class="new-story__form-button new-story__form-button--outline" type="button">
                  <i class="fas fa-camera"></i> Buka Kamera
                </button>
              </div>
              <div id="camera-container" class="new-story__camera">
                <video id="camera-video" class="new-story__camera-video">
                  Video stream not available.
                </video>
                <div class="new-story__camera-controls">
                  <select id="camera-select" class="new-story__camera-select"></select>
                  <button id="camera-take-button" class="new-story__form-button" type="button">
                    <i class="fas fa-camera"></i> Ambil Foto
                  </button>
                </div>
              </div>
              <div id="photo-taken-preview" class="new-story__photo-preview"></div>
            </div>
            <div class="new-story__form-group">
              <label class="new-story__form-label">Lokasi (Opsional)</label>
              <div class="new-story__location">
                <div class="new-story__location-map">
                  <div id="map" class="new-story__map"></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="new-story__location-coordinates">
                  <input
                    type="number"
                    name="latitude"
                    class="new-story__form-input"
                    placeholder="Latitude"
                    disabled
                  >
                  <input
                    type="number"
                    name="longitude"
                    class="new-story__form-input"
                    placeholder="Longitude"
                    disabled
                  >
                </div>
              </div>
            </div>
            <div class="new-story__form-actions">
              <span id="submit-button-container">
                <button class="new-story__form-button new-story__form-button--primary" type="submit">
                  Bagikan Cerita
                </button>
              </span>
              <a class="new-story__form-button new-story__form-button--outline" href="#/">Batal</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: StoryAPI,
    });
    this.#takenPhoto = null;

    this.#presenter.showNewFormMap();
    this.#setupForm();
  }

  #setupForm() {
    this.#form = document.getElementById("new-form");
    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!this.#takenPhoto) {
        alert("Silakan pilih atau ambil satu foto untuk cerita Anda.");
        return;
      }

      const data = {
        description: this.#form.elements.namedItem("description").value,
        photo: this.#takenPhoto.blob,
        latitude: this.#form.elements.namedItem("latitude").value || null,
        longitude: this.#form.elements.namedItem("longitude").value || null,
      };
      await this.#presenter.postNewStory(data);
    });

    const photoInput = document.getElementById("photo-input");
    photoInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 1024 * 1024) {
          alert("Ukuran foto tidak boleh melebihi 1MB.");
          photoInput.value = "";
          return;
        }
        await this.#setTakenPhoto(file);
        await this.#populateTakenPhoto();
      }
    });

    document
      .getElementById("photo-input-button")
      .addEventListener("click", () => {
        photoInput.click();
      });

    const cameraContainer = document.getElementById("camera-container");
    document
      .getElementById("open-photo-camera-button")
      .addEventListener("click", async (event) => {
        cameraContainer.classList.toggle("open");
        this.#isCameraOpen = cameraContainer.classList.contains("open");

        if (this.#isCameraOpen) {
          event.currentTarget.textContent = "Tutup Kamera";
          this.#setupCamera();
          await this.#camera.launch();
        } else {
          event.currentTarget.textContent = "Buka Kamera";
          this.#camera.stop();
        }
      });
  }

  async initialMap() {
    this.#map = await Map.build("#map", {
      zoom: 15,
      locate: true,
    });

    const centerCoordinate = this.#map.getCenter();
    this.#updateLatLngInput(
      centerCoordinate.latitude,
      centerCoordinate.longitude,
    );

    const draggableMarker = this.#map.addMarker(
      [centerCoordinate.latitude, centerCoordinate.longitude],
      { draggable: "true" },
    );

    draggableMarker.addEventListener("move", (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    this.#map.addMapEventListener("click", (event) => {
      draggableMarker.setLatLng(event.latlng);
      event.sourceTarget.flyTo(event.latlng);
    });
  }

  #updateLatLngInput(latitude, longitude) {
    this.#form.elements.namedItem("latitude").value = latitude || "";
    this.#form.elements.namedItem("longitude").value = longitude || "";
  }

  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById("camera-video"),
        cameraSelect: document.getElementById("camera-select"),
      });
    }

    this.#camera.addCheeseButtonListener("#camera-take-button", async () => {
      let imageBlob = await this.#camera.takePicture();
      if (!imageBlob) {
        alert("Gagal mengambil foto dari kamera.");
        return;
      }

      // Kompresi gambar jika diperlukan
      imageBlob = await this.compressImage(imageBlob, 1024 * 1024, 800, 0.7);
      if (!imageBlob) {
        alert("Gagal mengompresi foto agar di bawah 1MB.");
        return;
      }

      await this.#setTakenPhoto(imageBlob);
      await this.#populateTakenPhoto();
      this.#camera.stop();
      document.getElementById("camera-container").classList.remove("open");
      document.getElementById("open-photo-camera-button").textContent =
        "Buka Kamera";
      this.#isCameraOpen = false;
    });
  }

  async #setTakenPhoto(image) {
    this.#takenPhoto = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: image,
    };
  }

  async #populateTakenPhoto() {
    const previewContainer = document.getElementById("photo-taken-preview");
    if (!this.#takenPhoto) {
      previewContainer.innerHTML = "";
      return;
    }

    const imageUrl = URL.createObjectURL(this.#takenPhoto.blob);
    previewContainer.innerHTML = `
      <div class="new-story__photo-preview-item">
        <img src="${imageUrl}" alt="Foto Cerita">
        <button type="button" id="remove-photo-button" class="new-story__photo-preview-remove">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    document
      .getElementById("remove-photo-button")
      .addEventListener("click", () => {
        this.#takenPhoto = null;
        document.getElementById("photo-input").value = "";
        this.#populateTakenPhoto();
      });
  }

  storeSuccessfully(message) {
    console.log(message);
    this.clearForm();
    location.hash = "/";
  }

  storeFailed(message) {
    alert(message);
  }

  clearForm() {
    this.#form.reset();
    this.#takenPhoto = null;
    this.#populateTakenPhoto();
    this.#updateLatLngInput("", "");
  }

  async compressImage(
    blob,
    maxSizeBytes = 1024 * 1024,
    maxWidth = 800,
    initialQuality = 0.7,
  ) {
    const img = new Image();
    const blobUrl = URL.createObjectURL(blob);

    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = blobUrl;
    });

    const canvas = document.createElement("canvas");
    let width = img.width;
    let height = img.height;

    // Mengatur ulang ukuran dengan mempertahankan rasio aspek
    if (width > maxWidth) {
      height = (maxWidth / width) * height;
      width = maxWidth;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    let quality = initialQuality;
    let compressedBlob;

    // Mengulang hingga ukuran di bawah maxSizeBytes
    do {
      compressedBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", quality);
      });
      quality -= 0.1; // Kurangi kualitas secara bertahap
    } while (compressedBlob.size > maxSizeBytes && quality > 0.1);

    URL.revokeObjectURL(blobUrl);
    return compressedBlob.size <= maxSizeBytes ? compressedBlob : null;
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="new-story__form-button new-story__form-button--primary" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Bagikan Cerita
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="new-story__form-button new-story__form-button--primary" type="submit">Bagikan Cerita</button>
    `;
  }
}
