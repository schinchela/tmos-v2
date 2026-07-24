function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
          Toastmasters Operating System
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          TMOS frontend foundation is ready
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          React, TypeScript, Vite and Tailwind are now running inside the new
          module-by-module replacement workspace.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="font-semibold text-slate-900">Current package</p>
          <p className="mt-1 text-slate-600">
            Module 0 — Frontend Foundation
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
