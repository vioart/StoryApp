import LoginPresenter from "./login-presenter";
import * as CityCareAPI from "../../../data/api";
import * as AuthModel from "../../../utils/auth";

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="login-container">
        <article class="login-form-container">
          <h1 class="login__title">Masuk ke Akun Anda</h1>
          <form id="login-form" class="login-form">
            <div class="form-control">
              <label for="email-input">Email</label>
              <div class="login-form__title-container">
                <input id="email-input" type="email" name="email" placeholder="Masukkan email Anda" required>
              </div>
            </div>
            <div class="form-control">
              <label for="password-input">Kata Sandi</label>
              <div class="login-form__title-container">
                <input id="password-input" type="password" name="password" placeholder="Masukkan kata sandi Anda" required>
              </div>
            </div>
            <div class="form-buttons">
              <div id="submit-button-container">
                <button class="btn" type="submit">Masuk</button>
              </div>
              <p class="login-form__do-not-have-account">Belum punya akun? <a href="#/register">Daftar sekarang</a></p>
            </div>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: CityCareAPI,
      authModel: AuthModel,
    });

    this.#setupForm();
  }

  #setupForm() {
    const form = document.getElementById("login-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      this.showSubmitLoadingButton();

      const data = {
        email: document.getElementById("email-input").value,
        password: document.getElementById("password-input").value,
      };

      try {
        await this.#presenter.getLogin(data);
      } catch (error) {
        this.hideSubmitLoadingButton();
      }
    });
  }

  loginSuccessfully(message) {
    console.log(message);
    location.hash = "/";
  }

  loginFailed(message) {
    this.hideSubmitLoadingButton();
    alert(message);
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Memproses...
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit">Masuk</button>
    `;
  }
}
