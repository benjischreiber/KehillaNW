import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About KehillaNW" };

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-navy-900 mb-2">About <span className="text-gold-500">KehillaNW</span></h1>
      <div className="w-16 h-1 bg-gold-400 rounded mb-8" />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5 text-gray-700 leading-relaxed">
        <p>
          <strong className="text-navy-900">KehillaNW.org</strong> is a community website set up by members of the kehilla across
          Golders Green and Hendon who sought to share information widely and in a timely manner.
        </p>
        <p>
          This need was identified during a time of crisis when the kehilla stood together to pool their resources
          and respond as efficiently as possible to the Covid-19 pandemic. The website has since grown into a
          comprehensive community noticeboard serving the wider NW London Jewish community.
        </p>
        <p>
          We welcome notices from community members, organisations, and businesses serving the kehilla.
          If you have something to share, please get in touch.
        </p>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-xl font-bold text-navy-900 mb-3">לזכרון עולם</h2>
          <p className="text-sm">
            This website is לעילוי נשמת ר׳ שלמה צבי בן ר׳ משה מרדכי גולקר ז׳ל — Mr Hershel Golker z&apos;l
          </p>
          <p className="text-sm font-bold mt-1">ת.נ.צ.ב.ה</p>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h2 className="text-xl font-bold text-navy-900 mb-3">Get in touch</h2>
          <p className="text-sm">
            To submit a notice or for any enquiries, email:{" "}
            <a href="mailto:posts@kehillaNW.org" className="text-navy-700 font-semibold underline hover:text-gold-600">
              posts@kehillaNW.org
            </a>
          </p>
          <p className="text-sm mt-2">
            Or join our WhatsApp updates group:{" "}
            <a
              href="https://chat.whatsapp.com/D79ty6r6Lef5wGZdO30Pvj"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 font-semibold underline hover:text-green-600"
            >
              Click here to join
            </a>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/submit"
          className="inline-block bg-navy-900 text-white px-8 py-3 rounded-full font-bold hover:bg-navy-700 transition-colors"
        >
          Submit a Notice
        </Link>
      </div>
    </div>
  );
}
