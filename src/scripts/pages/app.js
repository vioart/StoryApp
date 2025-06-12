import { getActiveRoute } from "../routes/url-parser";
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateUnsubscribeButtonTemplate,
} from "../templates";
import { isServiceWorkerAvailable, setupSkipToContent, transitionHelper } from "../utils";
import { getAccessToken, getLogout } from "../utils/auth";
// import { routes } from "../routes/routes";
import { getRoute } from "../routes/routes"
import { isCurrentPushSubscriptionAvailable, subscribe, unsubscribe } from '../utils/notification-helper';

export default class App {
  #content;
  #drawerButton;
  #drawerNavigation;
  #skipLinkButton;

  constructor({ content, drawerNavigation, drawerButton, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    const path = window.location.pathname;
    if (path !== '/') {
      const cleanPath = path.replace(/^\/+/, '');
      console.log(`Redirecting from ${path} to #/${cleanPath}`);
      location.hash = `/${cleanPath}`;
      history.replaceState(null, null, '/');
    } else if (!location.hash) {
      console.log("No hash found, redirecting to #/");
      location.hash = "/";
    }

    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#drawerNavigation.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      const isTargetInsideDrawer = this.#drawerNavigation.contains(
        event.target,
      );
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#drawerNavigation.classList.remove("open");
      }

      this.#drawerNavigation.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#drawerNavigation.classList.remove("open");
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain =
      this.#drawerNavigation.children.namedItem("navlist-main");
    const navList = this.#drawerNavigation.children.namedItem("navlist");

    // User not log in
    if (!isLogin) {
      navListMain.innerHTML = "";
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (confirm("Apakah Anda yakin ingin keluar?")) {
        getLogout();

        // Redirect
        location.hash = "/login";
      }
    });
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    if (!pushNotificationTools) return;
    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    
    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document.getElementById('unsubscribe-button').addEventListener('click', () => {
        unsubscribe().finally(() => {
          this.#setupPushNotification();
        });
      });
      
      return;
    }
 
    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
    document.getElementById('subscribe-button').addEventListener('click', () => {
      subscribe().finally(() => {
        this.#setupPushNotification();
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    // const route = routes[url] || routes['/'];
    // const page = route ? route() : new HomePage();

    const page = getRoute(url);

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        page.afterRender();
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: "instant" });
      this.#setupNavigationList();

      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
    });
  }
}
