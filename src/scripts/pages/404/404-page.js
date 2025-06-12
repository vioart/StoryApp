export default class NotFoundPage {
  async render() {
    return `
      <section class="not-found__container container">
        <div class="not-found__card">
          <h1 class="not-found__title">404 - Halaman Tidak Ditemukan</h1>
          <p class="not-found__description">
            Maaf, halaman yang Anda cari tidak ada. Silakan kembali ke <a href="#/" class="not-found__link">halaman utama</a>.
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Tidak ada logika tambahan setelah render untuk halaman 404
  }
}