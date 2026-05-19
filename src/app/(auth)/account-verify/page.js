import { buildMetadata, breadcrumbSchema, webPageSchema } from "@/lib/seo";
import { getUser } from "@/queries/user";
import VerifyEmail from "./_component/VerifyEmail";
import Link from "next/link";

/* noIndex: verification pages should not be indexed */
export const metadata = buildMetadata({
  title: "ইমেইল ভেরিফিকেশন",
  description:
    "আপনার AMARDokan অ্যাকাউন্টের ইমেইল যাচাই করুন।",
  path: "/account-verify",
  noIndex: true,
});

export default async function VerifyPage({ searchParams }) {
  const { email } = await searchParams;
  const user = await getUser(email);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Email Verification", path: "/account-verify" },
  ];

  if (!user.status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div
            className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            aria-hidden="true"
          >
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4 bangla-text">
            ইউজার খুঁজে পাওয়া যায়নি
          </h1>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 bangla-text">
              <span className="font-semibold">ইমেইল:</span>{" "}
              {email || "প্রদান করা হয়নি"}
            </p>
            <p className="text-red-600 text-sm mt-2 bangla-text">
              এই ইমেইল ঠিকানার সাথে কোনো অ্যাকাউন্ট নেই
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h2 className="font-semibold text-blue-800 mb-2 bangla-text">
              সম্ভাব্য কারণ:
            </h2>
            <ul className="text-blue-700 text-sm space-y-1 bangla-text list-none">
              <li>• ইমেইল ঠিকানায় ভুল হয়েছে</li>
              <li>• অ্যাকাউন্টটি ডিলিট করা হয়েছে</li>
              <li>• ইমেইল ভেরিফিকেশন সম্পন্ন হয়নি</li>
              <li>• টাইপিং মিস্টেক হতে পারে</li>
            </ul>
          </div>

          <nav className="space-y-3" aria-label="Recovery options">
            <Link
              href="/registration"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition duration-200 block text-center bangla-text"
            >
              নতুন অ্যাকাউন্ট তৈরি করুন
            </Link>

            <Link
              href="/login"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition duration-200 block text-center bangla-text"
            >
              লগইন পৃষ্ঠায় ফিরে যান
            </Link>

            <Link
              href="/account-verify"
              className="w-full bg-yellow-100 border border-yellow-300 text-yellow-800 py-3 px-4 rounded-lg font-medium hover:bg-yellow-200 transition duration-200 block text-center bangla-text"
            >
              ভেরিফিকেশন পৃষ্ঠায় ফিরে যান
            </Link>
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm bangla-text">
              সমস্যা সমাধান হয়নি?{" "}
              <Link
                href="/support"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                সহায়তা কেন্দ্রে যোগাযোগ করুন
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(breadcrumbs)),
        }}
      />
      <VerifyEmail user={user} />
    </>
  );
}