import React from 'react'

function fmt(v, type) {
  if (v == null) return '—'
  if (type === 'moneyline') return (v > 0 ? '+' : '') + Math.round(v)
  return (v > 0 ? '+' : '') + parseFloat(v).toFixed(1)
}

export function HistoryTable({ log }) {
  if (!log.length) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: 13 }}>
        No history yet. Corrected lines appear here when the market catches up to Pinnacle.
      </div>
    )
  }

  const eventColor = { new: 'var(--green)', corrected: 'var(--text-secondary)' }
  const trigColor  = { edge: 'var(--green)', vig: 'var(--blue)', both: 'var(--amber)' }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Time','Event','Game','Book','Type','Trigger','Opener','Pinnacle','Edge'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {log.map((e, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                {e.loggedAt?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: eventColor[e.event] || 'var(--text-secondary)' }}>
                  {e.event === 'new' ? 'ALERT' : 'CORRECTED'}
                </span>
              </td>
              <td style={{ padding: '8px 12px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.game}</td>
              <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{e.bookKey}</td>
              <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{e.type}</td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: trigColor[e.alert?.trigger] || 'var(--text-secondary)' }}>
                  {e.alert?.trigger || '—'}
                </span>
              </td>
              <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{fmt(e.openerNum, e.type)}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{fmt(e.openerPinnacleNum, e.type)}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 500 }}>
                {e.alert?.edgeVal != null ? `${e.alert.edgeVal.toFixed(1)}pt` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
