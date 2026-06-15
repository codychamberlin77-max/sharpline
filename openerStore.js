import React, { useState, useMemo } from 'react'
import { useMonitor } from './hooks/useMonitor.js'
import { AlertCard } from './components/AlertCard.jsx'
import { SettingsPanel } from './components/SettingsPanel.jsx'
import { HistoryTable } from './components/HistoryTable.jsx'
import { OpenerStore } from './lib/openerStore.js'

const store = new OpenerStore()

const DEFAULT = {
  provider: 'therundown',
  apiKey: '',
  activeSports: ['nba', 'nfl', 'mlb', 'nhl'],
  activeSoftBooks: ['draftkings', 'fanduel', 'betmgm'],
  edgeThreshold: 2,
  vigThreshold: 30,
  scanInterval: 30,
  soundEnabled: true,
  notifEnabled: false,
}

function Dot({ on }) {
  return <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: on ? 'var(--green)' : 'var(--text-muted)', animation: on ? 'pulse-green 2s infinite' : 'none' }} />
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', flex: 1, minWidth: 90 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: color || 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  )
}

function Tab({ label, active, badge, onClick }) {
  return (
    <button onClick={onClick} style={{ fontSize: 13, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: active ? '2px solid var(--green)' : '2px solid transparent', marginBottom: -1 }}>
      {label}
      {badge > 0 && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red-border)', fontWeight: 500 }}>{badge}</span>}
    </button>
  )
}

function Empty({ children }) {
  return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: 13 }}>{children}</div>
}

export default function App() {
  const [config, setConfig] = useState(DEFAULT)
  const [tab, setTab] = useState('live')
  const update = patch => setConfig(p => ({ ...p, ...patch }))
  const monitor = useMonitor(config)

  const live = useMemo(() => monitor.liveAlerts.map(r => ({ record: r, movePct: store.movementPct(r), moveDir: store.movementDirection(r) })), [monitor.liveAlerts])
  const corr = useMemo(() => monitor.corrected.map(r => ({ record: r, movePct: 100, moveDir: 'toward' })), [monitor.corrected])

  const lastScan = monitor.stats.lastScan?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16, height: 52, flexShrink: 0 }}>
        <Dot on={monitor.running} />
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '.03em' }}>SharpLine</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>opening line alerts</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {monitor.running && monitor.countdown > 0 && !monitor.scanning && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>next scan {monitor.countdown}s</span>
          )}
          {monitor.scanning && <span style={{ fontSize: 11, color: 'var(--green)' }}>scanning…</span>}
          {lastScan && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>last scan {lastScan}</span>}
          {!monitor.running
            ? <button onClick={monitor.start} style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '6px 16px', fontWeight: 600, fontSize: 13 }}>Start monitor</button>
            : <button onClick={monitor.stop}  style={{ background: 'var(--red-dim)',   color: 'var(--red)',   border: '1px solid var(--red-border)',   borderRadius: 'var(--radius-sm)', padding: '6px 16px', fontWeight: 600, fontSize: 13 }}>Stop</button>
          }
        </div>
      </header>

      {/* Error */}
      {monitor.error && (
        <div style={{ background: 'var(--red-dim)', borderBottom: '1px solid var(--red-border)', padding: '8px 24px', fontSize: 12, color: 'var(--red)' }}>
          <strong>Error:</strong> {monitor.error}{!config.apiKey && ' — add your API key in Settings.'}
        </div>
      )}

      {/* Stats */}
      <div style={{ padding: '16px 24px 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Stat label="Live sharp alerts"  value={monitor.stats.live}      color="var(--green)" />
        <Stat label="Windows closed"     value={monitor.stats.corrected} color="var(--text-secondary)" />
        <Stat label="Lines scanned"      value={monitor.stats.scanned} />
        <Stat label="Edge threshold"     value={`${config.edgeThreshold.toFixed(1)}pt`} color="var(--amber)" />
        <Stat label="Vig threshold"      value={`${config.vigThreshold}¢`}              color="var(--blue)"  />
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 24px', borderBottom: '1px solid var(--border)', display: 'flex', marginTop: 16 }}>
        <Tab label="Live alerts" active={tab==='live'}      badge={monitor.stats.live}      onClick={() => setTab('live')} />
        <Tab label="Corrected"   active={tab==='corrected'} badge={monitor.stats.corrected} onClick={() => setTab('corrected')} />
        <Tab label="History"     active={tab==='history'}   badge={0}                       onClick={() => setTab('history')} />
        <Tab label="Settings"    active={tab==='settings'}  badge={!config.apiKey ? 1 : 0}  onClick={() => setTab('settings')} />
      </div>

      {/* Content */}
      <main style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>

        {tab === 'live' && (
          <div>
            {!monitor.running && (
              <Empty>
                ○ Monitor is paused.{' '}
                {config.apiKey
                  ? 'Hit Start to begin scanning opening lines.'
                  : <span>Go to <button onClick={() => setTab('settings')} style={{ color: 'var(--green)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Settings</button> and add your API key first.</span>
                }
              </Empty>
            )}
            {monitor.running && live.length === 0 && !monitor.scanning && (
              <Empty>No faulty openers yet. Alert fires when a soft book opener diverges from Pinnacle by {config.edgeThreshold.toFixed(1)}+ pts or {config.vigThreshold}¢+ juice.</Empty>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {live.map(({ record, movePct, moveDir }) => <AlertCard key={record.key} record={record} movePct={movePct} moveDir={moveDir} />)}
            </div>
          </div>
        )}

        {tab === 'corrected' && (
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
              These lines opened faulty but the soft book has since moved to match Pinnacle. Bet window closed — use this to track your response time.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {corr.map(({ record, movePct, moveDir }) => <AlertCard key={record.key} record={record} movePct={movePct} moveDir={moveDir} />)}
              {corr.length === 0 && <Empty>No corrected lines yet.</Empty>}
            </div>
          </div>
        )}

        {tab === 'history'  && <HistoryTable log={monitor.log} />}
        {tab === 'settings' && <SettingsPanel config={config} onChange={update} />}

      </main>
    </div>
  )
}
