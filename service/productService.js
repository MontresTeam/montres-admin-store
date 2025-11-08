import api from "@/api/axiosIntespter";

// ✅ Fetch Products
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

// ✅ Add Product

export async function addProduct(formData) {
  try {
    // formData should be a FormData object (because of image upload)
    const response = await api.post("/admin/product/add", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { data: response.data, error: null };
  } catch (error) {
    console.error("❌ addProduct error:", error);
    return { data: null, error };
  }
}

// ✅ Update Product
export async function updateProduct(id, updatedData) {
  try {
    const response = await api.put(`/admin/product/${id}`, updatedData);
    return { data: response.data, error: null };
  } catch (error) {
    console.error("❌ updateProduct error:", error);
    return { data: null, error };
  }
}
// Home Product Grid - Example Usage
export async function getHomeProductGrid() {
  try {
    let endpoint = `home`;
    // ✅ Add search if provided
    const response = await api.get(endpoint);

    return { data: response.data, error: null, isLoading: false };
  } catch (error) {
    return { data: null, error, isLoading: false };
  }
}

export const updateHomeProductGrid = async (categoryId, { title, products }) => {
  try {
    const res = await api.put(`/home/updatehomeproduct/${categoryId}`, {
      title,
      products,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating home product grid:", error);
    throw error;
  }
};

export async function fetchProductAll({ search = "" } = {}) {
  try {
    let endpoint = `productAll`;

    // ✅ Add search if provided
    if (search) {
      endpoint += `?search=${encodeURIComponent(search)}`;
    }

    const response = await api.get(endpoint);

    return { data: response.data, error: null, isLoading: false };
  } catch (error) {
    return { data: null, error, isLoading: false };
  }
}

// Brand New Section - Example Usage

//update this function in brandNew.jsx to use the API
export const updateBrandNew = async ({ products }) => {
  try {
    const res = await api.put('/home/brandnew', { products });
    return res.data;
  } catch (error) {
    console.error("Error updating BrandNew products:", error);
    throw error;
  }
};

// get brand new products
export const getBrandNew = async () => {
  try {
    const res = await api.get('/home/brandnew');
    return res.data;
  } catch (error) {
    console.error("Error fetching BrandNew products:", error);
    throw error;
  }
};
// ✅ Delete Product
export async function deleteProduct(id) {
  try {
    const response = await api.delete(`/admin/product/${id}`);
    return { data: response.data, error: null };
  } catch (error) {
    console.error("❌ deleteProduct error:", error);
    return { data: null, error };
  }
}




// ✅ Get all customer orders
export async function getOrders() {
  try {
    const response = await api.get(`/admin/order/`);
    return { data: response.data, error: null };
  } catch (error) {
    console.error("❌ getOrders error:", error);
    return { data: null, error };
  }
}

// ✅ Get a single order by ID
export async function getOrderById(orderId) {
  try {
    const response = await api.get(`/admin/order/${orderId}`);
    return { data: response.data, error: null };
  } catch (error) {
    console.error("❌ getOrderById error:", error);
    return { data: null, error };
  }
}

// trusted section -

export const getTrustedProducts = async () => {
  try {
    const res = await api.get('/home/trusted');
    return res.data;
  } catch (error) {
    console.error("Error fetching Trusted products:", error);
    throw error;
  }
};

export const updateTrustedProducts = async ({ newArrivals, montresTrusted, replace = false }) => {
  try {
    const res = await api.put('/home/updatetrusted', { newArrivals, montresTrusted, replace });
    return res.data;
  } catch (error) {
    console.error("Error updating Trusted products:", error);
    throw error;
  }
};

