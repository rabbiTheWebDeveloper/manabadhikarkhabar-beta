import { buildMetadata, breadcrumbSchema, webPageSchema } from "@/lib/seo";
import Login from "./_component/Login";

export const metadata = buildMetadata({
  title: "লগইন",
  description:
    "আপনার AMARDokan অ্যাকাউন্টে লগইন করুন এবং আপনার ই-কমার্স ব্যবসা পরিচালনা করুন।",
  path: "/login",
  noIndex: false,
});

export default function LoginPage() {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Login", path: "/login" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema(breadcrumbs),
            webPageSchema({
              title: "লগইন | AMARDokan",
              description:
                "আপনার AMARDokan অ্যাকাউন্টে লগইন করুন।",
              path: "/login",
            }),
          ]),
        }}
      />
      <Login />
    </>
  );
}
