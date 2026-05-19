import { buildMetadata, breadcrumbSchema, webPageSchema } from "@/lib/seo";
import Register from "./_component/Register";

export const metadata = buildMetadata({
  title: "রেজিস্ট্রেশন — বিনামূল্যে শুরু করুন",
  description:
    "আজই AMARDokan-এ আপনার বিনামূল্যের অ্যাকাউন্ট তৈরি করুন। ৫ মিনিটে সেটআপ করুন আপনার ই-কমার্স অটোমেশন ড্যাশবোর্ড।",
  path: "/registration",
  keywords: [
    "বিনামূল্যে রেজিস্ট্রেশন",
    "অ্যাকাউন্ট তৈরি",
    "ই-কমার্স শুরু",
  ],
  noIndex: false,
});

export default function RegistrationPage() {
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Registration", path: "/registration" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema(breadcrumbs),
            webPageSchema({
              title: "রেজিস্ট্রেশন | AMARDokan",
              description:
                "আজই বিনামূল্যে অ্যাকাউন্ট তৈরি করুন।",
              path: "/registration",
            }),
          ]),
        }}
      />
      <Register />
    </>
  );
}
