export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">How CircleBet Works</h1>
        <p className="text-text-secondary text-sm mt-1">
          Everything you need to know about prediction markets on CircleBet
        </p>
      </div>

      {/* How Markets Work */}
      <section className="bg-bg-secondary border border-border rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-semibold">How Markets Work</h2>
        <p className="text-sm text-text-secondary">
          Each market is a yes/no question (e.g. &quot;Will it rain tomorrow?&quot;). You can buy{" "}
          <span className="text-green font-medium">YES</span> or{" "}
          <span className="text-red font-medium">NO</span> shares, priced between{" "}
          <span className="font-mono">$0</span> and <span className="font-mono">$1</span>.
        </p>
        <p className="text-sm text-text-secondary">
          Prices reflect the market&apos;s estimated probability. A YES price of{" "}
          <span className="font-mono">$0.70</span> means the market thinks there&apos;s a 70% chance the
          event happens.
        </p>
        <p className="text-sm text-text-secondary">
          CircleBet uses <span className="font-medium text-text-primary">LMSR (Logarithmic Market Scoring Rule)</span>{" "}
          pricing — an automated market maker that always provides liquidity. Buying shares pushes the
          price up; selling pushes it down.
        </p>
      </section>

      {/* Trading */}
      <section className="bg-bg-secondary border border-border rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-semibold">Trading</h2>
        <p className="text-sm text-text-secondary">
          When you buy shares, the cost is calculated by the LMSR formula — it depends on the current
          price and how many shares you&apos;re buying. Larger orders move the price more.
        </p>
        <p className="text-sm text-text-secondary">
          You&apos;ll see the total cost and the average price per share before confirming any trade.
          The number of shares you receive equals your cost divided by the average price.
        </p>
        <p className="text-sm text-text-secondary">
          There are no trading fees. The cost you see is the cost you pay.
        </p>
      </section>

      {/* Market Resolution */}
      <section className="bg-bg-secondary border border-border rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-semibold">Market Resolution</h2>
        <p className="text-sm text-text-secondary">
          The market creator resolves the market as{" "}
          <span className="text-green font-medium">YES</span> or{" "}
          <span className="text-red font-medium">NO</span> once the outcome is known.
        </p>
        <p className="text-sm text-text-secondary">
          Winning shares pay out <span className="font-mono font-medium text-text-primary">$1.00</span> each.
          Losing shares are worth <span className="font-mono font-medium text-text-primary">$0.00</span>.
          Your payout is automatically added to your circle balance.
        </p>
        <p className="text-sm text-text-secondary">
          If you bought YES shares at <span className="font-mono">$0.60</span> and the market resolves YES,
          you profit <span className="font-mono">$0.40</span> per share.
        </p>
      </section>

      {/* Your Portfolio */}
      <section className="bg-bg-secondary border border-border rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-semibold">Your Portfolio</h2>
        <p className="text-sm text-text-secondary">
          The Portfolio page shows all your active holdings with mark-to-market values based on
          current market prices.
        </p>
        <p className="text-sm text-text-secondary">
          Once a market resolves, your position is paid out and removed from your active holdings.
        </p>
      </section>

      {/* Circles & Balances */}
      <section className="bg-bg-secondary border border-border rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-semibold">Circles &amp; Balances</h2>
        <p className="text-sm text-text-secondary">
          Each circle is an independent economy. When you join a circle, you start with a balance
          of <span className="font-mono font-medium text-text-primary">$10,000</span>.
        </p>
        <p className="text-sm text-text-secondary">
          Your balance in one circle is completely separate from other circles — you can&apos;t
          transfer funds between them. This keeps each group&apos;s markets self-contained.
        </p>
      </section>
    </div>
  );
}
