# Apply Progress — PR2 Auth Flow

## Status
- Phase 2: **Complete** (9/9 tasks)
- Commit: `b0d56bd`
- Branch: `main`

## Completed Tasks

- [x] 2.1 `src/api/client.ts` — Axios instance with Bearer interceptor + 401 redirect
- [x] 2.2 `src/api/endpoints.ts` — login() and register() functions
- [x] 2.3 `src/stores/authStore.ts` — Zustand auth store with localStorage persistence
- [x] 2.4 `src/components/auth/LoginForm.tsx` — Email+password form with error handling
- [x] 2.5 `src/components/auth/RegisterForm.tsx` — Name+email+password form with validation
- [x] 2.6 `src/components/layout/ProtectedRoute.tsx` — Auth route guard
- [x] 2.7 `src/components/layout/Header.tsx` — Nav header with logout
- [x] 2.8 `src/pages/LoginPage.tsx` + `src/pages/RegisterPage.tsx` — Centered card layouts
- [x] 2.9 `src/App.tsx` — ProtectedRoute wrappers + Header + real page components

## Files Changed

| File | Action | Lines |
|------|--------|-------|
| `src/api/client.ts` | Created | 33 |
| `src/api/endpoints.ts` | Created | 16 |
| `src/stores/authStore.ts` | Created | 41 |
| `src/components/auth/LoginForm.tsx` | Created | 72 |
| `src/components/auth/RegisterForm.tsx` | Created | 78 |
| `src/components/layout/ProtectedRoute.tsx` | Created | 18 |
| `src/components/layout/Header.tsx` | Created | 33 |
| `src/pages/LoginPage.tsx` | Created | 30 |
| `src/pages/RegisterPage.tsx` | Created | 30 |
| `src/App.tsx` | Modified | 62 changed |

**Total**: 10 files, 378 insertions, 7 deletions

## Verification

- `npx tsc --noEmit` — clean (0 errors)
- `npx vite build` — success (91 modules, 286KB JS bundle)

## Remaining Phases

| Phase | PR | Tasks | Status |
|-------|----|-------|--------|
| 1: Scaffold | PR 1 | 1.1–1.5 | ✅ Done |
| 2: Auth | PR 2 | 2.1–2.9 | ✅ Done |
| 3: Dashboard | PR 3 | 3.1–3.8 | ⬜ Pending |
| 4: Game Shell | PR 4 | 4.1–4.11 | ⬜ Pending |
| 5: WebSocket | PR 5 | 5.1–5.5 | ⬜ Pending |
| 6: HUD + Audio | PR 6 | 6.1–6.6 | ⬜ Pending |
| 7: Deploy | PR 7 | 7.1–7.3 | ⬜ Pending |
