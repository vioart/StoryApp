import {
  generateLoaderAbsoluteTemplate,
  generateStoryDetailErrorTemplate,
  generateStoryDetailTemplate,
  generateSaveStoryButtonTemplate,
  generateRemoveStoryButtonTemplate,
} from "../../templates";
import StoryDetailPresenter from "./story-detail-presenter";
import { parseActivePathname } from "../../routes/url-parser";
import Map from "../../utils/map";
import * as StoryAPI from "../../data/api";
import Database from "../../data/database";

export default class StoryDetailPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="story-detail__container">
          <div id="story-detail" class="story-detail"></div>
          <div id="story-detail-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new StoryDetailPresenter(parseActivePathname().id, {
      view: this,
      apiModel: StoryAPI,
      dbModel: Database,
    });

    this.#presenter.showStoryDetail();
  }

  async populateStoryDetailAndInitialMap(message, story) {
    // Pastikan story dan location tersedia
    if (
      !story ||
      !story.location ||
      story.location.latitude == null ||
      story.location.longitude == null
    ) {
      document.getElementById("story-detail").innerHTML =
        generateStoryDetailErrorTemplate(
          "Data lokasi tidak valid atau tidak tersedia."
        );
      return;
    }

    document.getElementById("story-detail").innerHTML =
      generateStoryDetailTemplate({
        title: story.title,
        description: story.description,
        evidenceImages: story.evidenceImages,
        latitudeLocation: story.location.latitude,
        longitudeLocation: story.location.longitude,
        storiesName: story.storiesName,
        createdAt: story.createdAt,
        location: story.location,
      });

    // Map
    await this.#presenter.showStoryDetailMap();
    if (this.#map) {
      const storyCoordinate = [
        story.location.latitude,
        story.location.longitude,
      ];
      const markerOptions = { alt: story.title };
      const popupOptions = { content: story.title };
      try {
        this.#map.changeCamera(storyCoordinate, 15);
        this.#map.addMarker(storyCoordinate, markerOptions, popupOptions);
      } catch (error) {
        console.error("Error rendering map:", error);
        document.getElementById("map").innerHTML =
          "<p>Gagal memuat peta: Koordinat tidak valid.</p>";
      }
    }

    // Actions buttons
    this.#presenter.showSaveButton();
  }

  populateStoryDetailError(message) {
    document.getElementById("story-detail").innerHTML =
      generateStoryDetailErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build("#map", {
      zoom: 15,
    });
  }

  renderSaveButton() {
    document.getElementById("save-actions-container").innerHTML =
      generateSaveStoryButtonTemplate();

    document
      .getElementById("story-detail-save")
      .addEventListener("click", async () => {
        await this.#presenter.saveStory();
        await this.#presenter.showSaveButton();
      });
  }

  saveToBookmarkSuccessfully(message) {
    console.log(message);
  }
  saveToBookmarkFailed(message) {
    alert(message);
  }

  renderRemoveButton() {
    document.getElementById("save-actions-container").innerHTML =
      generateRemoveStoryButtonTemplate();

    document
      .getElementById("story-detail-remove")
      .addEventListener("click", async () => {
        await this.#presenter.removeReport();
        await this.#presenter.showSaveButton();
      });
  }

  removeFromBookmarkSuccessfully(message) {
    console.log(message);
  }
  
  removeFromBookmarkFailed(message) {
    alert(message);
  }

  showStoryDetailLoading() {
    document.getElementById("story-detail-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideStoryDetailLoading() {
    document.getElementById("story-detail-loading-container").innerHTML = "";
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }
}
