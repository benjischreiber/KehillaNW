import type { Metadata } from "next";

export const metadata: Metadata = { title: "Submit a Notice" };

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-navy-900 mb-2">Submit a <span className="text-gold-500">Notice</span></h1>
      <div className="w-16 h-1 bg-gold-400 rounded mb-8" />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <p className="text-gray-600 mb-6 leading-relaxed">
          To submit a notice or event for publication on KehillaNW.org, please email us with the details below.
          We aim to publish notices within 24 hours.
        </p>

        <div className="bg-navy-50 rounded-xl p-5 mb-6">
          <h2 className="font-bold text-navy-900 mb-2">What to include:</h2>
          <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
            <li>Title / headline of the notice</li>
            <li>A short description (1–2 sentences)</li>
            <li>Full details or a flyer image</li>
            <li>Category (e.g. Entertainment, Support, Shopping)</li>
            <li>Date / end date if it&apos;s a time-limited notice</li>
            <li>Any relevant links</li>
          </ul>
        </div>

        <a
          href="mailto:posts@kehillaNW.org?subject=Notice submission"
          className="block w-full bg-navy-900 text-white text-center font-bold py-4 rounded-xl hover:bg-navy-700 transition-colors"
        >
          Email posts@kehillaNW.org
        </a>

        <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500 text-center">
          Or join our{" "}
          <a
            href="https://chat.whatsapp.com/D79ty6r6Lef5wGZdO30Pvj"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 font-semibold hover:underline"
          >
            WhatsApp group
          </a>{" "}
          for updates and to submit notices informally.
        </div>
      </div>
    </div>
  );
}
