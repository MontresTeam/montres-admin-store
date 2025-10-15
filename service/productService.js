import api from "@/api/axiosIntespter";

export async function fetchProduct({
  id,
  page = 1,
  limit = 15,
  category,
  brand,
  price,
  availability,
  badges,
  gender,
  featured,
  search,
  sortBy,
} = {}) {
  try {
    let endpoint = "products";
    const params = new URLSearchParams();

    // ✅ Add query params dynamically
    if (id) params.append("id", id);
    else {
      params.append("page", page);
      params.append("limit", limit);
    }

    if (category) params.append("category", category);  
    if (brand) params.append("brand", brand);
    if (price) params.append("price", price);
    if (availability) params.append("availability", availability);
    if (badges) params.append("badges", badges);
    if (gender) params.append("gender", gender);
    if (featured !== undefined) params.append("featured", featured);
    if (search) params.append("search", search);
    if (sortBy) params.append("sortBy", sortBy);
    const response = await api.get(`${endpoint}?${params.toString()}`);
    return { data: response.data, error: null, isLoading: false };
  } catch (error) {
    console.error("❌ fetchProduct error:", error);
    return { data: null, error, isLoading: false };
  }
}

export async function updateProduct(id, updatedData) {
  try {
    const response = await api.put(`/admin/product/${id}`, updatedData);
    return { data: response.data, error: null };
  } catch (error) {
    console.error("❌ updateProduct error:", error);
    return { data: null, error };
  }
}