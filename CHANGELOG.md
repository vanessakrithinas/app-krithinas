# Changelog

## 2026-06-16
- Fix: corrected non-ASCII variable typo in `src/App.jsx` (`concAnо` → `concAno`).
- Chore: updated dev dependencies to address `npm audit` vulnerabilities (`vite` and `@vitejs/plugin-react`).
- Build: reinstalled deps and verified `npm run build` succeeds.

Notes:
- Dependency updates included a semver-major bump for `vite`; run full test suite if present.
