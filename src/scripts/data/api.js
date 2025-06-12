import { getAccessToken } from "../utils/auth";
import { BASE_URL } from "../config";

const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  MY_USER_INFO: `${BASE_URL}/users/me`,

  // Stories
  STORY_LIST: `${BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
  STORE_NEW_STORY: `${BASE_URL}/stories`,

  // Action
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getMyUserInfo() {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.MY_USER_INFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getAllStories() {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.STORY_LIST, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    message: json.message || "Failed to fetch stories",
    data: json.listStory || [],
  };
}

export async function getStoryById(id) {
  const accessToken = getAccessToken();
  const url = ENDPOINTS.STORY_DETAIL(id);

  try {
    const fetchResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const contentType = fetchResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await fetchResponse.text();
      console.error(`Non-JSON response received: ${text.substring(0, 100)}...`);
      return {
        ok: false,
        error: true,
        message: "Invalid response format from server",
        data: {},
      };
    }

    const json = await fetchResponse.json();

    return {
      ...json,
      ok: fetchResponse.ok,
      message: json.message || "Failed to fetch story",
      data: json.story || {},
    };
  } catch (error) {
    console.error(`Error fetching story: ${error.message}`);
    return {
      ok: false,
      error: true,
      message: error.message || "Network error occurred",
      data: {},
    };
  }
}

export async function storeNewStory({ description, photo, lat, lon }) {
  const accessToken = getAccessToken();

  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  if (lat !== null) formData.append("lat", lat);
  if (lon !== null) formData.append("lon", lon);

  try {
    const fetchResponse = await fetch(ENDPOINTS.STORE_NEW_STORY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const contentType = fetchResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await fetchResponse.text();
      console.error(`Non-JSON response received: ${text.substring(0, 100)}...`);
      return {
        ok: false,
        error: true,
        message: "Invalid response format from server",
      };
    }

    const json = await fetchResponse.json();

    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    console.error(`Error posting story: ${error.message}`);
    return {
      ok: false,
      error: true,
      message: error.message || "Network error occurred",
    };
  }
}

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });
 
  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();
 
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
 
export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({ endpoint });
 
  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();
 
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
