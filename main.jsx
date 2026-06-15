import { useState, useEffect, useRef, useCallback } from 'react'
import { RundownClient, OddsApiClient, evaluateLine, SPORTS } from '../lib/api.js'
import { OpenerStore } from '../lib/openerStore.js'
import { playSharpAlert, playCorrectSound, sendNotification } from '../lib/notifications.js'

const openerStore = new OpenerStore()

export function useMonitor(config) {
  const { provider, apiKey, activeSports, activeSoftBooks, edgeThreshold, vigThreshold, soundEnabled, notifEnabled, scanInterval } = config

  const [running, setRunning]       = useState(false)
  const [scanning, setScanning]     = useState(false)
  const [liveAlerts, setLiveAlerts] = useState([])
  const [corrected, setCorrected]   = useState([])
  const [log, setLog]               = useState([])
  const [stats, setStats]           = useState({ scanned: 0, live: 0, corrected: 0, lastScan: null })
  const [error, setError]           = useState(null)
  const [countdown, setCountdown]   = useState(0)

  const clientRef  = useRef(null)
  const timerRef   = useRef(null)
  const cdRef      = useRef(null)

  const refresh = useCallback(() => {
    setLiveAlerts([...openerStore.getLiveAlerts()])
    setCorrected([...openerStore.getCorrectedAlerts()])
    setLog([...openerStore.getLog()])
  }, [])

  const runScan = useCallback(async () => {
    if (!clientRef.current || !apiKey) return
    setScanning(true)
    setError(null)
    try {
      const thresholds = { edgeThreshold, vigThreshold }
      let totalLines = 0

      const sportKeys = Object.entries(SPORTS[provider] || {})
        .filter(([k]) => activeSports.includes(k))
        .map(([, v]) => v)

      for (const sportKey of sportKeys) {
        let lines = []
        try {
          lines = provider === 'therundown'
            ? await clientRef.current.fetchEvents(sportKey, activeSoftBooks)
            : await clientRef.current.fetchOdds(sportKey, activeSoftBooks)
        } catch (e) { console.warn('[SharpLine]', e.message); continue }

        totalLines += lines.length
        lines.forEach(line => {
          const alert = evaluateLine(line, thresholds)
          const { record, isNew, justCorrected } = openerStore.process(line, alert)
          if (isNew && alert) {
            if (soundEnabled) playSharpAlert()
            if (notifEnabled) sendNotification(`Sharp alert: ${record.game}`, `${record.bookKey.toUpperCase()} ${record.type} — opener ${record.openerNum} vs Pinnacle ${record.openerPinnacleNum} (${alert.edgeVal.toFixed(1)}pt gap)`, record.key)
          }
          if (justCorrected && soundEnabled) playCorrectSound()
        })
      }

      setStats(prev => ({ scanned: prev.scanned + totalLines, live: openerStore.getLiveAlerts().length, corrected: openerStore.getCorrectedAlerts().length, lastScan: new Date() }))
      refresh()
    } catch (err) {
      setError(err.message || 'Scan failed')
    } finally {
      setScanning(false)
    }
  }, [provider, apiKey, activeSports, activeSoftBooks, edgeThreshold, vigThreshold, soundEnabled, notifEnabled, refresh])

  const startCountdown = useCallback(() => {
    clearInterval(cdRef.current)
    setCountdown(scanInterval)
    cdRef.current = setInterval(() => setCountdown(p => { if (p <= 1) { clearInterval(cdRef.current); return 0 } return p - 1 }), 1000)
  }, [scanInterval])

  const start = useCallback(() => {
    if (!apiKey) { setError('Add your API key in Settings first'); return }
    clientRef.current = provider === 'therundown' ? new RundownClient(apiKey) : new OddsApiClient(apiKey)
    openerStore.clear()
    setStats({ scanned: 0, live: 0, corrected: 0, lastScan: null })
    setLiveAlerts([]); setCorrected([]); setLog([])
    setRunning(true)
  }, [apiKey, provider])

  const stop = useCallback(() => {
    clearInterval(timerRef.current); clearInterval(cdRef.current)
    clientRef.current?.disconnectWebSocket?.()
    setRunning(false); setCountdown(0)
  }, [])

  useEffect(() => {
    if (!running) return
    runScan()
    timerRef.current = setInterval(() => { runScan(); startCountdown() }, scanInterval * 1000)
    startCountdown()
    return () => { clearInterval(timerRef.current); clearInterval(cdRef.current) }
  }, [running, runScan, scanInterval, startCountdown])

  return { running, scanning, liveAlerts, corrected, log, stats, error, countdown, start, stop }
}
