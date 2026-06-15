import React from 'react'

function fmt(v, type) {
  if (v == null) return '—'
  if (type === 'moneyline') return (v > 0 ? '+' : '') + Math.round(v)
  return (v > 0 ? '+' : '') + parseFloat(v).toFixed(1)
}

function fmtJuice(v) {
  if (v == null) return '—'
  return (v > 0 ? '+' : '') + Math.round(v)
}

export function AlertCard({ record, movePct = 0, moveDir = 'none' }) {
  const isLive = record.status === 'live'
  const alert  = record.alert
  const trigger = alert?.trigger

  const borderColor = !isLive ? 'var(--border-bright)'
    : trigger === 'both' ? 'var(--amber)'
    : 'var(--green)'

  const triggerMap = {
    edge: { label: '2pt edge',    color: 'var(--green)', bg: 'var(--green-dim)', border: 'var(--green-border)' },
    vig:  { label: '30¢ vig',     color: 'var(--blue)',  bg: 'var(--blue-dim)',  border: 'var(--blue-border)'  },
    both: { label: 'edge + vig',  color: 'var(--amber)', bg: 'var(--amber-dim)', border: 'var(--amber-border)' },
  }
  const t = triggerMap[trigger] || triggerMap.edge

  const moveColor = moveDir === 'toward' ? 'var(--green)' : moveDir === 'away' ? 'var(--red)' : 'var(--text-muted)'
  const moveLabel = moveDir === 'toward' ? 'Moving toward fair value' : moveDir === 'away' ? 'Moving away from fair value' : 'No movement yet'

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: `0 var(--radius-lg) var(--radius-lg) 0`,
      padding: '13px 16px', opacity: isLive ? 1 : 0.72,
      animation: isLive && record.wasAlerted ? 'flash-alert .6s ease-out' : 'none',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{record.game}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {record.bookKey?.toUpperCase()} · {record.type}{record.side ? ` (${record.side})` : ''} · first seen {record.firstSeen?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {trigger && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
              {t.label}
            </span>
          )}
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
            background: isLive ? 'var(--green-dim)' : 'transparent',
            color: isLive ? 'var(--green)' : 'var(--text-secondary)',
            border: isLive ? '1px solid var(--green-border)' : '1px solid var(--border)' }}>
            {isLive ? 'live — bet window open' : 'window closed'}
          </span>
        </div>
      </div>

      {/* Three-column tracker */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 8 }}>
        {[
          { label: 'Opener (locked)',  val: fmt(record.openerNum, record.type),          juice: record.openerJuice,          color: 'var(--text-secondary)' },
          { label: 'Current',          val: fmt(record.currentNum, record.type),          juice: record.currentJuice,         color: 'var(--text-primary)'   },
          { label: 'Pinnacle (sharp)', val: fmt(record.openerPinnacleNum, record.type),   juice: record.openerPinnacleJuice,  color: 'var(--green)'          },
        ].map(col => (
          <div key={col.label}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{col.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: col.color }}>{col.val}</div>
            {col.juice != null && record.type === 'spread' && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>juice {fmtJuice(col.juice)}</div>
            )}
          </div>
        ))}
      </div>

      {/* Edge + vig */}
      {alert && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
            {alert.edgeVal.toFixed(1)}pt gap (opener vs Pinnacle)
          </span>
          {record.type === 'spread' && alert.vigVal > 0 && (
            <span style={{ fontSize: 11, color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
              {alert.vigVal}¢ juice overcharged
            </span>
          )}
        </div>
      )}

      {/* Movement bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 170 }}>{moveLabel}</span>
        <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${movePct}%`, background: moveColor, borderRadius: 2, transition: 'width .4s' }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', minWidth: 30, textAlign: 'right' }}>{movePct}%</span>
      </div>

      {record.status === 'corrected' && record.correctedAt && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
          Window closed at {record.correctedAt.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      )}
    </div>
  )
}
