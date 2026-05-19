"use client";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { registrationAction } from "@/app/actions/user";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    shopName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "পুরো নাম প্রয়োজন";
    }

    if (!formData.shopName.trim()) {
      newErrors.shopName = "দোকানের নাম প্রয়োজন";
    }

    if (!formData.email) {
      newErrors.email = "ইমেইল ঠিকানা প্রয়োজন";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "ইমেইল ঠিকানা সঠিক নয়";
    }

    if (!formData.phone) {
      newErrors.phone = "ফোন নম্বর প্রয়োজন";
    } else if (
      !/^(?:\+88|01)?\d{11}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "ফোন নম্বর সঠিক নয়";
    }

    if (!formData.password) {
      newErrors.password = "পাসওয়ার্ড প্রয়োজন";
    } else if (formData.password.length < 6) {
      newErrors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "পাসওয়ার্ড নিশ্চিত করুন";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "পাসওয়ার্ড মিলছে না";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "আপনাকে শর্তাবলী মেনে নিতে হবে";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call
    try {
      // In a real application, you would make an API call here
      const response = await registrationAction(formData);
      if (
        response.status === 200 &&
        response.data.email &&
        response.data.emailVerified === false
      ) {
        router.push(`/account-verify?email=${response.data.email}`);
      }
    } catch (error) {
      toast.error(error.message);
      setErrors({
        general: "রেজিস্ট্রেশন ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>AMARDokan - নিবন্ধন</title>
        <meta
          name="description"
          content="AMARDokan এ নতুন অ্যাকাউন্ট তৈরি করুন"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">আ</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 bangla-text">
            AMARDokan এ নিবন্ধন করুন
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 bangla-text">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 bangla-text"
            >
              লগইন করুন
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 bangla-text">
                        {errors.general}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              {/* First Row - Two inputs in one line */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 bangla-text"
                  >
                    পুরো নাম <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        errors.fullName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="আপনার পুরো নাম"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && (
                      <p className="mt-2 text-sm text-red-600 bangla-text">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="shopName"
                    className="block text-sm font-medium text-gray-700 bangla-text"
                  >
                    দোকানের নাম <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="shopName"
                      name="shopName"
                      type="text"
                      autoComplete="organization"
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        errors.shopName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="আপনার দোকানের নাম"
                      value={formData.shopName}
                      onChange={handleChange}
                    />
                    {errors.shopName && (
                      <p className="mt-2 text-sm text-red-600 bangla-text">
                        {errors.shopName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Second Row - Two inputs in one line */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 bangla-text"
                  >
                    ইমেইল ঠিকানা <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        errors.email ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="আপনার ইমেইল ঠিকানা"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 bangla-text">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 bangla-text"
                  >
                    ফোন নম্বর <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        errors.phone ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="আপনার ফোন নম্বর"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600 bangla-text">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Third Row - Two inputs in one line */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 bangla-text"
                  >
                    পাসওয়ার্ড <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        errors.password ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="পাসওয়ার্ড (ন্যূনতম ৬ অক্ষর)"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 bangla-text">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 bangla-text"
                  >
                    পাসওয়ার্ড নিশ্চিত করুন{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        errors.confirmPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="পাসওয়ার্ড আবার লিখুন"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 bangla-text">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                />
                <label
                  htmlFor="agreeToTerms"
                  className="ml-2 block text-sm text-gray-900 bangla-text"
                >
                  আমি AMARDokan এর{" "}
                  <Link
                    href="/terms"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    শর্তাবলী
                  </Link>{" "}
                  এবং{" "}
                  <Link
                    href="/privacy"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    গোপনীয়তা নীতি
                  </Link>{" "}
                  মেনে নিচ্ছি <span className="text-red-500">*</span>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600 bangla-text">
                  {errors.agreeToTerms}
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      নিবন্ধন করা হচ্ছে...
                    </>
                  ) : (
                    "নিবন্ধন করুন"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 bangla-text">
                    অথবা দিয়ে নিবন্ধন করুন
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <a
                    href="#"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Facebook দিয়ে নিবন্ধন করুন</span>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>

                <div>
                  <a
                    href="#"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Google দিয়ে নিবন্ধন করুন</span>
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          font-family: "Hind Siliguri", sans-serif;
        }
        .bangla-text {
          line-height: 1.8;
        }
      `}</style>
    </>
  );
}
