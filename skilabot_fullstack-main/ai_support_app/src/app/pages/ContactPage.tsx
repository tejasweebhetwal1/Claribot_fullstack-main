export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 shadow-lg shadow-slate-200/50">
        <div className="space-y-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
            Contact support
          </p>
          <h1 className="text-4xl font-black text-slate-950">Need help with ClariBot?</h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600">
            Reach out to our team for assistance, questions, or partnership inquiries.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Email</h2>
            <p className="mt-3 text-slate-600">support@claribot.com</p>
          </div>

          <div className="rounded-3xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Business hours</h2>
            <p className="mt-3 text-slate-600">Monday–Friday, 9am–5pm</p>
          </div>
        </div>
      </div>
    </main>
  );
}
