*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-base:       #0a0c0f;
  --bg-surface:    #111318;
  --bg-elevated:   #181c22;
  --border:        rgba(255,255,255,0.07);
  --border-bright: rgba(255,255,255,0.14);
  --text-primary:   #e8eaf0;
  --text-secondary: #7c8494;
  --text-muted:     #454d5c;
  --green:        #00e676;
  --green-dim:    rgba(0,230,118,0.12);
  --green-border: rgba(0,230,118,0.3);
  --red:        #ff5252;
  --red-dim:    rgba(255,82,82,0.12);
  --red-border: rgba(255,82,82,0.3);
  --amber:        #ffab40;
  --amber-dim:    rgba(255,171,64,0.12);
  --amber-border: rgba(255,171,64,0.3);
  --blue:        #448aff;
  --blue-dim:    rgba(68,138,255,0.12);
  --blue-border: rgba(68,138,255,0.3);
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

html, body, #root {
  height: 100%;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 3px; }

button { font-family: var(--font-sans); cursor: pointer; border: none; background: none; color: inherit; font-size: 13px; }

input, select {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-primary);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  outline: none;
}
input:focus, select:focus { border-color: var(--border-bright); }
select option { background: var(--bg-elevated); }

@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50%       { opacity: .4; }
}
@keyframes flash-alert {
  0%   { background: rgba(0,230,118,0.08); }
  100% { background: transparent; }
}
