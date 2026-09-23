export default function Privacy() {
  return (
    <article className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="text-3xl font-extrabold">Privacy Policy</h1>
      <p className="text-slate-400 text-sm mt-2">Last updated: 2026</p>
      <div className="space-y-4 mt-6 text-slate-300">
        <section>
          <h2 className="text-xl font-bold mb-2">Camera & microphone</h2>
          <p>We ask your browser for camera and microphone access. Video and audio are transmitted directly to your chat partner over WebRTC. IndiaomeTV does not record or store your media.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2">Session information</h2>
          <p>We generate a temporary anonymous session ID stored in your browser's localStorage. Optional display name and country you provide are shared with your chat partner.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2">Text messages</h2>
          <p>Text messages are relayed in real time to your chat partner. Messages are not stored on our servers.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2">Reports & blocks</h2>
          <p>When you file a report we store the reason, an anonymous reporter/reported ID, and a timestamp so moderators can review it.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2">Cookies & local storage</h2>
          <p>We use localStorage for your session ID, and no third-party tracking cookies are set by default.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-2">Data deletion</h2>
          <p>Clearing your browser's localStorage removes your session ID. Reports and bans are retained for moderation.</p>
        </section>
      </div>
    </article>
  );
}
