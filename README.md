# pi-codex-primary

Pi extension for multiple ChatGPT Codex OAuth subscriptions with one routing policy: use the first healthy account, fall back in order, and return to the first account after its reported quota reset.

Derived from [`pi-codex-multi`](https://github.com/thelastbodhisattva/pi-codex-multi).

## Install

```bash
pi install git:github.com/kszenes/pi-codex-primary
```

Do not install `pi-codex-multi` or `pi-multi-pass` at the same time because they register the same commands and provider aliases.

The extension stores configuration and cooldown state under `~/.pi/agent/`; OAuth credentials remain in Pi's standard auth store and are not part of this repository.

## Commands

```text
/subs add       Add an extra Codex OAuth account
/subs login     Log in to an added account
/subs switch    Switch manually
/subs status    Show login status
/subs limits    Show five-hour and seven-day usage
/pool           Manage account pools
```

## Configuration

Global configuration: `~/.pi/agent/codex-primary.json`

```json
{
  "subscriptions": [
    { "provider": "openai-codex", "index": 2, "label": "Fallback" }
  ],
  "accountLabels": {
    "openai-codex": "Primary",
    "openai-codex-2": "Fallback"
  },
  "pools": [
    {
      "name": "Codex",
      "baseProvider": "openai-codex",
      "members": ["openai-codex", "openai-codex-2"],
      "enabled": true,
      "strategy": "priority"
    }
  ],
  "chains": [],
  "presets": [],
  "maxRetries": 3
}
```

Pool order is priority order. When Codex reports a quota error, the extension queries `/wham/usage`, stores the limiting window's absolute `reset_at`, and uses the next account. On the first user prompt at or after that reset, it switches back to the first account. If no reset is available, it retries after five minutes.

The footer shows compact per-window usage and reset countdowns, for example `Fallback | 5h: 19% (~2h17m) | 7d: 87% (~6d23h)`. Percentages use green above 50%, orange from 21-50%, and red at 20% or below.

## License

MIT. See [LICENSE](LICENSE).
