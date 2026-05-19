"use client";
import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  resendVerificationEmailAction,
  verifyEmailAction,
} from "@/app/actions/user";
import { toast } from "react-toastify";
import { Router } from "next/router";
import { useRouter } from "next/navigation";

export default function VerifyEmail({ user }) {
  const [code, setCode] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1); // Only allow one character
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus to next input
    if (value !== "" && index < 3) {
      inputRefs[index + 1].current.focus();
    }

    // Clear errors when user types
    if (errors.code) {
      setErrors({});
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (pastedData.length === 4 && /^\d+$/.test(pastedData)) {
      const newCode = pastedData.split("");
      setCode(newCode);
      inputRefs[3].current.focus();
    }
  };

  // Validate code
  const validateCode = () => {
    if (code.some((digit) => digit === "")) {
      setErrors({ code: "সমস্ত ৪টি অঙ্ক পূরণ করুন" });
      return false;
    }

    setErrors({});

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCode()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      const response = await verifyEmailAction(user.email, code.join(""));
  

      if (response.success) {
        toast.success("ইমেইল ভেরিফিকেশন সফল!");
        router.push("/login");
      }

      // Redirect to dashboard or login
    } catch (error) {
      toast.error(
        error.message || "ভেরিফিকেশন ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।"
      );
      setErrors({
        general: "ভেরিফিকেশন ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    try {
      setCanResend(false);
      await resendVerificationEmailAction(user.email);

      setCountdown(60);
      toast.success("নতুন ভেরিফিকেশন কোড আপনার ইমেইলে পাঠানো হয়েছে।");
    } catch (error) {
      console.error("Resend error:", error);
      toast.error(
        error.message || "কোড পুনরায় পাঠানো যায়নি। দয়া করে আবার চেষ্টা করুন।"
      );
      setCanResend(true);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    inputRefs[0].current.focus();
  }, []);

  return (
    <>
      <Head>
        <title>AMARDokan - ইমেইল ভেরিফিকেশন</title>
        <meta name="description" content="AMARDokan ইমেইল ভেরিফিকেশন" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 bangla-text">
            ইমেইল ভেরিফিকেশন
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 bangla-text">
            আমরা আপনার ইমেইলে একটি ৪-অঙ্কের ভেরিফিকেশন কোড পাঠিয়েছি
          </p>
          <p className="mt-1 text-center text-sm text-gray-600 bangla-text">
            ইমেইল: <span className="font-medium">{user?.email}</span>
          </p>
          <p className="mt-1 text-center text-sm text-gray-600 bangla-text">
            যদি আপনি ইমেইল না পান, তাহলে স্প্যাম ফোল্ডার চেক করুন অথবা{" "}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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

              <div>
                <label
                  htmlFor="verification-code"
                  className="block text-sm font-medium text-gray-700 bangla-text"
                >
                  ৪-অঙ্কের ভেরিফিকেশন কোড
                </label>
                <div className="mt-2">
                  <div className="flex justify-center space-x-4">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={inputRefs[index]}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="1"
                        className={`w-16 h-16 text-3xl text-center border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.code ? "border-red-300" : "border-gray-300"
                        }`}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                      />
                    ))}
                  </div>
                  {errors.code && (
                    <p className="mt-2 text-sm text-red-600 text-center bangla-text">
                      {errors.code}
                    </p>
                  )}
                </div>
              </div>

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
                      যাচাই করা হচ্ছে...
                    </>
                  ) : (
                    "ইমেইল যাচাই করুন"
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 bangla-text">
                  কোড পাননি?{" "}
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="font-medium text-indigo-600 hover:text-indigo-500 bangla-text"
                    >
                      আবার কোড পাঠান
                    </button>
                  ) : (
                    <span className="text-gray-500 bangla-text">
                      {countdown} সেকেন্ড পরে আবার চেষ্টা করুন
                    </span>
                  )}
                </p>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 bangla-text">
                    অথবা
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 bangla-text">
                  সমস্যা হচ্ছে?{" "}
                  <Link
                    href="/"
                    className="font-medium text-indigo-600 hover:text-indigo-500 bangla-text"
                  >
                    সহায়তা কেন্দ্রে যোগাযোগ করুন
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 bangla-text">
            ইমেইল ঠিকানা পরিবর্তন করতে চান?{" "}
            <Link
              href="/registration"
              className="font-medium text-indigo-600 hover:text-indigo-500 bangla-text"
            >
              নিবন্ধন পৃষ্ঠায় ফিরে যান
            </Link>
          </p>
        </div>
      </div>

      <style jsx global>{`
        body {
          font-family: "Hind Siliguri", sans-serif;
        }
        .bangla-text {
          line-height: 1.8;
        }
        input[type="text"] {
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
