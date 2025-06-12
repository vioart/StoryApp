import RegisterPage from "../pages/auth/register/register-page";
import LoginPage from "../pages/auth/login/login-page";
import HomePage from "../pages/home/home-page";
import BookmarkPage from '../pages/bookmark/bookmark-page';
import StoryDetailPage from "../pages/story-detail/story-detail-page";
import NewPage from "../pages/new/new-page";
import NotFoundPage from "../pages/404/404-page";
import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from "../utils/auth";

export const routes = {
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/new": () => checkAuthenticatedRoute(new NewPage()),
  "/stories/:id": () => checkAuthenticatedRoute(new StoryDetailPage()),
  '/bookmark': () => checkAuthenticatedRoute(new BookmarkPage()),
  '/404': () => new NotFoundPage(),
};

export function getRoute(path) {
  // Cek apakah path persis ada di routes
  if (routes[path]) {
    return routes[path]();
  }

  // Untuk rute dinamis seperti /stories/:id
  const dynamicRoute = Object.keys(routes).find((key) => {
    if (key.includes(":id")) {
      const regex = new RegExp('^' + key.replace(/:id/, '[^/]+') + '$');
      return regex.test(path);
    }
    return false;
  });

  // Jika rute dinamis ditemukan, kembalikan instance halaman yang sesuai
  if (dynamicRoute) {
    return routes[dynamicRoute]();
  }

  // Jika tidak ada rute yang cocok, kembalikan halaman 404
  return new NotFoundPage();
}