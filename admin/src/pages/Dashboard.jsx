import { Link } from 'react-router-dom';
import { Bars, fmt, PageHead, rs, Stat, useLoad } from '../lib.jsx';

export default function Dashboard() {
  const { data: raw } = useLoad('/admin/dashboard');
  if (!raw) return <div className="loading">Loading…</div>;

  // Defensive field mapping from backend
  const liveNow = raw.realtime?.live_rooms ?? raw.liveNow ?? 0;
  const viewersNow = raw.realtime?.online ?? raw.viewersNow ?? 0;
  const rechargePaise = (raw.today?.revenue ? Number(raw.today.revenue) * 100 : (raw.recharge24hPaise ?? 0));
  const giftCoins = raw.today?.gift_coins ?? raw.giftCoins24h ?? 0;
  const newUsers = raw.today?.new_users ?? raw.newUsers24h ?? 0;
  const totalUsers = raw.today?.dau ?? raw.users ?? 0;
  const totalHosts = raw.top_hosts?.length ?? raw.hosts ?? 0;
  const days = raw.series || raw.days || [];
  const alerts = raw.alerts || {};

  const giftRupees = (coins) => rs((Number(coins || 0) / 10) * 100);

  return (
    <>
      <PageHead title="Dashboard" sub="Real-time Platform Metrics & Growth" />
      <div className="stats">
        <Stat label="Live now" value={fmt(liveNow)} sub={`${fmt(viewersNow)} watching`} tone="pink" />
        <Stat label="Recharge (Today)" value={rs(rechargePaise)} tone="green" />
        <Stat label="Gifts sent (Today)" value={`${fmt(giftCoins)} coins`} sub={`≈ ${giftRupees(giftCoins)}`} />
        <Stat label="New users (Today)" value={fmt(newUsers)} sub={`${fmt(totalUsers)} active · ${fmt(totalHosts)} hosts`} />
      </div>
      <div className="stats">
        <Link to="/finance"><Stat label="Pending withdrawals" value={fmt(alerts.pending_settlements || raw.pendingWithdrawals || 0)} tone={alerts.pending_settlements ? 'amber' : ''} /></Link>
        <Link to="/reports"><Stat label="Open reports" value={fmt(alerts.open_reports || raw.openReports || 0)} tone={alerts.open_reports ? 'red' : ''} /></Link>
        <Link to="/agencies"><Stat label="Agency applications" value={fmt(alerts.pending_agencies || raw.pendingAgencies || 0)} tone={alerts.pending_agencies ? 'amber' : ''} /></Link>
      </div>
      <div className="grid2">
        <div className="panel"><h3>Recharge revenue, last 14 days</h3><Bars data={days} valueKey="revenue" labelKey="day" format={rs} color="#22c55e" /></div>
        <div className="panel"><h3>Coins gifted, last 14 days</h3><Bars data={days} valueKey="gift_coins" labelKey="day" color="#ff3d77" /></div>
        <div className="panel"><h3>New users, last 14 days</h3><Bars data={days} valueKey="new_users" labelKey="day" color="#7b2cff" /></div>
      </div>
    </>
  );
}
