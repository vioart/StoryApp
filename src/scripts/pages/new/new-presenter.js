export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showNewFormMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewStory({ description, photo, latitude, longitude }) {
    this.#view.showSubmitLoadingButton();
    try {
      const data = {
        description,
        photo,
        lat: latitude ? parseFloat(latitude) : null,
        lon: longitude ? parseFloat(longitude) : null,
      };
      const response = await this.#model.storeNewStory(data);

      if (!response.ok) {
        console.error("postNewStory: response:", response);
        this.#view.storeFailed(response.message || "Gagal membagikan cerita");
        return;
      }

      this.#view.storeSuccessfully(response.message);
    } catch (error) {
      console.error("postNewStory: error:", error);
      this.#view.storeFailed(error.message || "Terjadi kesalahan jaringan");
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
