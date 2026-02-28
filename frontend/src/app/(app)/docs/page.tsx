const sections = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    title: "How Markets Work",
    content: [
      <>Each market is a yes/no question (e.g. &quot;Will it rain tomorrow?&quot;). You can buy <span className="text-green font-medium">YES</span> or <span className="text-red font-medium">NO</span> shares, priced between <span className="font-mono">$0</span> and <span className="font-mono">$1</span>.</>,
      <>Prices reflect the market&apos;s estimated probability. A YES price of <span className="font-mono">$0.70</span> means the market thinks there&apos;s a 70% chance the event happens.</>,
      <>CircleBet uses <span className="font-medium text-text-primary">LMSR (Logarithmic Market Scoring Rule)</span> pricing — an automated market maker that always provides liquidity. Buying shares pushes the price up; selling pushes it down.</>,
    ],
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: "Trading",
    content: [
      "When you buy shares, the cost is calculated by the LMSR formula — it depends on the current price and how many shares you're buying. Larger orders move the price more.",
      "You'll see the total cost and the average price per share before confirming any trade. The number of shares you receive equals your cost divided by the average price.",
      "There are no trading fees. The cost you see is the cost you pay.",
    ],
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Market Resolution",
    content: [
      <>The market creator resolves the market as <span className="text-green font-medium">YES</span> or <span className="text-red font-medium">NO</span> once the outcome is known.</>,
      <>Winning shares pay out <span className="font-mono font-medium text-text-primary">$1.00</span> each. Losing shares are worth <span className="font-mono font-medium text-text-primary">$0.00</span>. Your payout is automatically added to your circle balance.</>,
      <>If you bought YES shares at <span className="font-mono">$0.60</span> and the market resolves YES, you profit <span className="font-mono text-green">$0.40</span> per share.</>,
    ],
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    title: "Your Portfolio",
    content: [
      "The Portfolio page shows all your active holdings with mark-to-market values based on current market prices.",
      "Once a market resolves, your position is paid out and removed from your active holdings.",
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
    title: "Circles & Balances",
    content: [
      <>Each circle is an independent economy. When you join a circle, you start with a balance of <span className="font-mono font-medium text-text-primary">$10,000</span>.</>,
      "Your balance in one circle is completely separate from other circles — you can't transfer funds between them. This keeps each group's markets self-contained.",
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="space-y-8 animate-fade-in-up" style={{ "--delay": "0s" } as React.CSSProperties}>
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          How{" "}
          <span className="bg-gradient-to-r from-blue to-green bg-clip-text text-transparent">
            CircleBet
          </span>{" "}
          Works
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Everything you need to know about prediction markets
        </p>
      </div>

      {/* Sections */}
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
