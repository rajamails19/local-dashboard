# Dev Log — LocalOS Dashboard

| Command / Action | What Claude Did | Key Takeaways & Snippet |
|---|---|---|
| Fix cross-browser sync not working | Added `applyRemoteData` callback, polling every 30s, `visibilitychange` re-fetch, and `doSave` wrapper with sync status indicator (⟳ in menu bar) | `remoteSave` was silently swallowing errors. Now logs to console. Polling ensures new browser sees changes within 30s. `visibilitychange` syncs instantly when you switch tabs. |
