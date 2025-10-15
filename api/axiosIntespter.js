import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASEURL,
  withCredentials: true, // allows sending refreshToken cookie automatically
});

// 🟢 Request Interceptor — Add Access Token
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🟠 Response Interceptor — Handle Expired Access Token (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // check if access token expired and request hasn't been retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // call refresh endpoint to get new access token
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BASEURL}/Auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;

        if (newAccessToken) {
          // store new token and retry original request
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;

          return api(originalRequest); // retry with new token
        }
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);

        // if refresh fails, clear accessToken and redirect to login
        localStorage.removeItem("accessToken");
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;