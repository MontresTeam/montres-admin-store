"use client";
import React, { useState, useRef } from "react";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setProfileImage(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // If profile image is uploaded, you would typically upload it to a server here
    if (profileImage) {
      // Simulate image upload
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      const user = await authenticateUser(formData);
      if (user) {
        redirectToDashboard(user.role);
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const authenticateUser = async (credentials) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const validUsers = {
          ceo_admin: {
            password: "ceo123",
            role: "ceo",
            name: "CEO Administrator",
          },
          sales_agent: {
            password: "sales123",
            role: "sales",
            name: "Sales Agent",
          },
          dev_admin: {
            password: "dev123",
            role: "developer",
            name: "Developer",
          },
        };

        const user = validUsers[credentials.username];
        if (user && user.password === credentials.password) {
          resolve(user);
        } else {
          resolve(null);
        }
      }, 1500);
    });
  };

  const redirectToDashboard = (role) => {
    alert(
      `Login successful! Welcome to ${
        role.charAt(0).toUpperCase() + role.slice(1)
      } Dashboard${profileImage ? " with profile image uploaded" : ""}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Banner Image */}
          <div className="hidden lg:flex relative bg-gradient-to-br from-blue-600/20 to-purple-600/20">
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
              }}
            >
              <div className="relative z-20 p-12 h-full flex flex-col justify-between text-white">
                <div>
                  <h1 className="text-4xl font-bold mb-4">Admin Portal</h1>
                  <p className="text-xl text-blue-100 font-light">
                    Secure Access to Your Management Dashboard
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2">New Feature!</h3>
                    <p className="text-sm text-blue-100">
                      Now you can upload your profile picture directly from the login page for faster onboarding.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-blue-200 text-sm">
                    Trusted by 10,000+ enterprises worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Admin Portal</h1>
                <p className="text-sm text-blue-100">
                  Secure Access Dashboard
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-white p-6 lg:p-12">
            <div className="max-w-md mx-auto">
              {/* Header */}
              <div className="text-center mb-6 lg:mb-8">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg relative">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full rounded-2xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <svg
                      className="w-8 h-8 lg:w-10 lg:h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  )}
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Welcome Back
                </h1>
                <p className="text-gray-600 mt-1 lg:mt-2 text-sm lg:text-base">
                  Sign in to your admin account
                </p>
              </div>

              {/* Image Upload Option */}
              <div className="mb-6 lg:mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Picture (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-upload"
                      />
                      <label
                        htmlFor="profile-upload"
                        className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {profileImage
                              ? `Uploaded: ${profileImage.name.substring(0, 20)}...`
                              : "Click to upload profile image"}
                          </span>
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Supports: JPG, PNG, GIF, WebP (Max 5MB)
                    </p>
                  </div>
                  {imagePreview && (
                    <div className="sm:w-20 w-full">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
                {/* Username Field */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 lg:py-4 text-sm lg:text-base border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your username"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 lg:py-4 text-sm lg:text-base border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 lg:py-4 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Sign in to Dashboard</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              </form>

              {/* Demo Credentials for Mobile */}
              <div className="mt-6 lg:hidden bg-blue-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Demo Credentials:
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">CEO:</span>
                    <code className="bg-white px-2 py-1 rounded">ceo_admin / ceo123</code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Sales:</span>
                    <code className="bg-white px-2 py-1 rounded">sales_agent / sales123</code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Dev:</span>
                    <code className="bg-white px-2 py-1 rounded">dev_admin / dev123</code>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 lg:mt-8 text-center">
                <p className="text-xs text-gray-500">
                  © 2025 Admin Panel. Secure enterprise access system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;