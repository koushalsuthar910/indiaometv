export default function Login() {
  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <div className="card p-6 space-y-4">
        <h1 className="text-2xl font-extrabold">Log in</h1>
        <p className="text-slate-400 text-sm">
          IndiaomeTV works without an account. Anonymous sessions are created automatically when you start a chat.
          Account sign-in will be available in a future release.
        </p>
        <input disabled placeholder="Email (coming soon)" className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 opacity-60" />
        <input disabled placeholder="Password (coming soon)" type="password" className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 opacity-60" />
        <button disabled className="btn-primary w-full opacity-50">Sign in</button>
      </div>
    </div>
  );
}
