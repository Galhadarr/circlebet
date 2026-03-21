const sections = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    title: "Bets",
    content: [
      <>A bet is a question with <span className="font-medium text-text-primary">2–5 result options</span> that you and your circle pick from. Only circle members can create or see bets.</>,
      <>When you create a bet, you choose your option and the bet stays <span className="text-blue font-medium">pending</span> until at least one other person joins. Then it becomes <span className="text-green font-medium">active</span>.</>,
      <>You can add an optional banner image — same vibe as the old markets, but simpler: no fake money, just points.</>,
    ],
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Resolving & scoring",
    content: [
      "The bet creator picks the winning option when the bet ends. If the bet is time-limited, no one can join after the deadline — the creator still resolves it manually.",
      "Winners gain points (+1, or +2 if you doubled down). Losers lose the same amount. Scores are per circle and can go negative.",
      "Each circle has a scoreboard ranked by points — climb the podium!",
    ],
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: "Notifications",
    content: [
      "You get an inbox notification when a new bet is created or resolved in your circle, and when someone new joins a bet you’re already in.",
      "Open the bell in the header or use the Inbox tab on mobile.",
    ],
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Circles",
    content: [
      "Each circle is private to its members. You can belong to many circles — each has its own bets and scoreboard.",
      "Invite friends with your circle’s invite link. Have fun!",
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="space-y-8 animate-fade-in-up" style={{ "--delay": "0s" } as React.CSSProperties}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          How{" "}
          <span className="bg-gradient-to-r from-blue to-green bg-clip-text text-transparent">
            CircleBet
          </span>{" "}
          Works
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Bets, points, and bragging rights in your private circles
        </p>
      </div>

      <div className="space-y-5">
        {sections.map((section, i) => (
          <section
            key={section.title}
            className="bg-surface border border-border rounded-2xl p-6 shadow-sm animate-fade-in-up"
            style={{ "--delay": `${0.05 + i * 0.06}s` } as React.CSSProperties}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-dim flex items-center justify-center text-blue shrink-0">
                {section.icon}
              </div>
              <h2 className="text-lg font-semibold">{section.title}</h2>
            </div>
            <div className="space-y-3 pl-12">
              {section.content.map((paragraph, j) => (
                <p key={j} className="text-sm text-text-secondary leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
