import { useState, useMemo } from "react";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const fmtShort = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
};

function Slider({ label, value, onChange, min, max, step, display }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: "1.4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9b8ab5", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "1.05rem", color: "#5c3d8f", fontWeight: 700 }}>{display(value)}</span>
      </div>
      <div style={{ position: "relative", height: "5px", background: "#e8e0f5", borderRadius: "3px" }}>
        <div style={{ position: "absolute", left: 0, height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#b8a0e8,#8ec5f5)", borderRadius: "3px" }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: "absolute", top: "-8px", left: 0, width: "100%", opacity: 0, cursor: "pointer", height: "22px" }} />
        <div style={{ position: "absolute", top: "50%", left: `${pct}%`, transform: "translate(-50%,-50%)", width: "15px", height: "15px", borderRadius: "50%", background: "#9b7ed4", border: "2px solid #fff", boxShadow: "0 1px 5px rgba(155,126,212,0.4)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  const palettes = {
    purple: { bg: "#f3eefe", border: "#c4b0e0", val: "#5c3d8f" },
    blue:   { bg: "#eaf4fd", border: "#a8d4f0", val: "#1e6fa0" },
    pink:   { bg: "#fceef6", border: "#e8b0cf", val: "#9a2566" },
    green:  { bg: "#eef8f1", border: "#a8d4b5", val: "#256e42" },
  };
  const c = palettes[accent] || palettes.purple;
  return (
    <div style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: "12px", padding: "1.1rem 1.2rem", flex: 1, minWidth: "130px" }}>
      <div style={{ fontSize: "0.61rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9b8ab5", marginBottom: "0.4rem" }}>{label}</div>
      <div style={{ fontSize: "1.4rem", fontWeight: 700, color: c.val }}>{value}</div>
      {sub && <div style={{ fontSize: "0.7rem", color: "#a898bf", marginTop: "0.2rem" }}>{sub}</div>}
    </div>
  );
}

export default function FIRECalculator() {
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(2000);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  const [annualExpenses, setAnnualExpenses] = useState(60000);
  const [targetYear, setTargetYear] = useState(20);

  const fireNumber = useMemo(() => annualExpenses / (withdrawalRate / 100), [annualExpenses, withdrawalRate]);

  const { rows, reachedFire } = useMemo(() => {
    const mR = annualReturn / 100 / 12;
    const rows = [];
    let bal = currentSavings, reachedFire = null;
    for (let y = 1; y <= 45; y++) {
      const start = bal;
      for (let m = 0; m < 12; m++) bal = bal * (1 + mR) + monthlyContribution;
      rows.push({ year: y, balance: bal, growth: bal - start - monthlyContribution * 12, contributions: monthlyContribution * 12 });
      if (!reachedFire && bal >= fireNumber) reachedFire = y;
    }
    return { rows, reachedFire };
  }, [currentSavings, monthlyContribution, annualReturn, fireNumber]);

  const targetBalance = rows[targetYear - 1]?.balance ?? 0;
  const progress = Math.min(100, (currentSavings / fireNumber) * 100);

  const requiredMonthly = useMemo(() => {
    const r = annualReturn / 100 / 12, n = targetYear * 12;
    const fvPV = currentSavings * Math.pow(1 + r, n);
    return Math.max(0, (fireNumber - fvPV) / ((Math.pow(1 + r, n) - 1) / r));
  }, [currentSavings, annualReturn, targetYear, fireNumber]);

  const onTrack = requiredMonthly <= monthlyContribution;
  const showRows = rows.slice(0, Math.max(reachedFire ?? 0, targetYear) + 3);

  const inputStyle = {
    width: "100%", background: "#fff", border: "1.5px solid #ddd6f0",
    borderRadius: "8px", padding: "0.6rem 0.8rem 0.6rem 1.8rem",
    color: "#3d3352", fontSize: "0.95rem", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#f8f3fe 0%,#edf5fc 55%,#fef3f8 100%)", color: "#3d3352", fontFamily: "system-ui, sans-serif", padding: "2rem 1rem" }}>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "inline-block", background: "rgba(155,126,212,0.12)", border: "1px solid rgba(155,126,212,0.25)", borderRadius: "999px", padding: "0.3rem 1rem", fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9b7ed4", marginBottom: "0.8rem" }}>
            ✦ Financial Independence & Early Retirement
          </div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, lineHeight: 1.1, color: "#3d2a6e", margin: 0 }}>
            FIRE <span style={{ background: "linear-gradient(135deg,#b48ce8,#7ec8f0,#f0a0cc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Calculator</span>
          </h1>
          <p style={{ color: "#b8a8d0", fontSize: "0.85rem", marginTop: "0.5rem", fontWeight: 300 }}>Retire Early · Live Intentionally · Plan with Clarity</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(260px,340px) 1fr", gap: "1.5rem", alignItems: "start" }}>

          {/* Controls panel */}
          <div style={{ background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(196,176,224,0.4)", borderRadius: "16px", padding: "1.7rem", boxShadow: "0 4px 24px rgba(155,126,212,0.09)" }}>
            <div style={{ fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#c4a0e8", marginBottom: "1.4rem", fontWeight: 600 }}>Your Numbers</div>

            {[
              { label: "Current Savings", val: currentSavings, set: setCurrentSavings },
              { label: "Monthly Contribution", val: monthlyContribution, set: setMonthlyContribution },
              { label: "Annual Retirement Expenses", val: annualExpenses, set: setAnnualExpenses },
            ].map(({ label, val, set }) => (
              <div key={label} style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.68rem", letterSpacing: "0.07em", textTransform: "uppercase", color: "#9b8ab5", display: "block", marginBottom: "0.3rem" }}>{label}</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.7rem", top: "50%", transform: "translateY(-50%)", color: "#b8a0e8", fontWeight: 700 }}>$</span>
                  <input type="number" value={val} onChange={(e) => set(Number(e.target.value))} style={inputStyle} />
                </div>
              </div>
            ))}

            <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#ddd6f0,transparent)", margin: "1.3rem 0" }} />

            <Slider label="Annual Return" value={annualReturn} onChange={setAnnualReturn} min={1} max={15} step={0.5} display={(v) => `${v}%`} />
            <Slider label="Withdrawal Rate" value={withdrawalRate} onChange={setWithdrawalRate} min={2} max={6} step={0.25} display={(v) => `${v}%`} />
            <Slider label="Target Timeline" value={targetYear} onChange={setTargetYear} min={1} max={40} step={1} display={(v) => `${v} yrs`} />
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* FIRE number hero */}
            <div style={{ background: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(196,176,224,0.4)", borderRadius: "16px", padding: "1.6rem", textAlign: "center", boxShadow: "0 4px 24px rgba(155,126,212,0.1)" }}>
              <div style={{ fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#c4a0e8", marginBottom: "0.4rem" }}>Your FIRE Number</div>
              <div style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, background: "linear-gradient(135deg,#8b5cf6,#5ba8d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {fmtShort(fireNumber)}
              </div>
              <div style={{ color: "#b8a8d0", fontSize: "0.74rem", marginTop: "0.2rem" }}>
                {fmt(annualExpenses)}/yr ÷ {withdrawalRate}% withdrawal rate
              </div>
              <div style={{ marginTop: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#b8a8d0", marginBottom: "0.35rem" }}>
                  <span>Today: {fmtShort(currentSavings)}</span>
                  <span style={{ color: "#9b7ed4", fontWeight: 600 }}>{progress.toFixed(1)}% of goal</span>
                </div>
                <div style={{ height: 8, background: "#ede8f7", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#c4a0e8,#8ec5f5,#f0a0cc)", borderRadius: 4, transition: "width 0.4s" }} />
                </div>
                <div style={{ textAlign: "right", fontSize: "0.67rem", color: "#c4b5d8", marginTop: "0.3rem" }}>Goal: {fmtShort(fireNumber)}</div>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <StatCard label="FIRE In" value={reachedFire ? `${reachedFire} yrs` : "40+ yrs"} sub={reachedFire ? `at $${monthlyContribution.toLocaleString()}/mo` : "raise contributions"} accent="purple" />
              <StatCard label={`Yr ${targetYear} Balance`} value={fmtShort(targetBalance)} sub={targetBalance >= fireNumber ? "🎯 FIRE achieved!" : `${fmtShort(fireNumber - targetBalance)} to go`} accent="blue" />
              <StatCard label="Monthly Needed" value={`$${Math.round(requiredMonthly).toLocaleString()}`} sub={`to FIRE by yr ${targetYear}`} accent={onTrack ? "green" : "pink"} />
            </div>

            {/* Status banner */}
            {!onTrack && (
              <div style={{ background: "rgba(240,160,200,0.12)", border: "1.5px solid rgba(240,160,200,0.4)", borderRadius: "10px", padding: "0.9rem 1.1rem", fontSize: "0.79rem", color: "#9a2566", display: "flex", gap: "0.6rem", alignItems: "center" }}>
                <span>💸</span>
                <span>You're <strong>${Math.round(requiredMonthly - monthlyContribution).toLocaleString()}/mo short</strong> of FIRE by year {targetYear}. Increase contributions or extend your timeline.</span>
              </div>
            )}
            {onTrack && reachedFire && reachedFire <= targetYear && (
              <div style={{ background: "rgba(100,200,150,0.1)", border: "1.5px solid rgba(100,200,150,0.35)", borderRadius: "10px", padding: "0.9rem 1.1rem", fontSize: "0.79rem", color: "#1e6a40", display: "flex", gap: "0.6rem", alignItems: "center" }}>
                <span>🌸</span>
                <span>You're on track! FIRE in <strong>year {reachedFire}</strong>{targetYear - reachedFire > 0 ? ` — ${targetYear - reachedFire} years ahead of schedule` : ""}.</span>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ marginTop: "2rem", background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(196,176,224,0.3)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(155,126,212,0.07)" }}>
          <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid rgba(196,176,224,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#c4a0e8", fontWeight: 600 }}>Year-by-Year Breakdown</div>
            <div style={{ fontSize: "0.65rem", color: "#b8a8d0" }}>🔮 FIRE reached · 🎯 Your target year</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ background: "rgba(240,235,250,0.6)" }}>
                  {["Year", "Portfolio Balance", "Annual Growth", "Contributed", "vs FIRE Number"].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1.1rem", textAlign: "right", fontSize: "0.61rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#b0a0c8", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {showRows.map(({ year, balance, growth, contributions }) => {
                  const isFire = year === reachedFire;
                  const isTarget = year === targetYear;
                  const over = balance >= fireNumber;
                  return (
                    <tr key={year} style={{ background: isFire ? "rgba(155,126,212,0.07)" : isTarget ? "rgba(100,180,230,0.07)" : "transparent" }}>
                      <td style={{ padding: "0.65rem 1.1rem", textAlign: "right", color: "#9b8ab5", fontSize: "0.79rem" }}>
                        {isFire ? "🔮 " : isTarget && !isFire ? "🎯 " : ""}Yr {year}
                      </td>
                      <td style={{ padding: "0.65rem 1.1rem", textAlign: "right", fontWeight: 700, fontSize: "0.95rem", color: "#3d2a6e" }}>{fmt(balance)}</td>
                      <td style={{ padding: "0.65rem 1.1rem", textAlign: "right", color: "#4a9a6a" }}>+{fmt(growth)}</td>
                      <td style={{ padding: "0.65rem 1.1rem", textAlign: "right", color: "#9b8ab5" }}>{fmt(contributions)}</td>
                      <td style={{ padding: "0.65rem 1.1rem", textAlign: "right" }}>
                        <span style={{ color: over ? "#256e42" : "#9a2566", fontWeight: 500 }}>
                          {over ? "+" : "–"}{fmtShort(Math.abs(balance - fireNumber))}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.66rem", color: "#c4b5d8" }}>
          Projections are hypothetical · Not financial advice · Please consult a financial advisor
        </div>
      </div>
    </div>
  );
}
