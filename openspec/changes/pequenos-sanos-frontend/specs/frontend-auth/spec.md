# frontend-auth Specification

## Purpose

Authentication layer for the Pequeños Sanos frontend: login/register pages, JWT token management, Axios interceptor for Bearer injection, Zustand auth store, and route protection.

## Requirements

### Requirement: Login Page

The system SHALL display a login form accepting email and password, submit to `POST /api/v1/auth/login`, and store the returned JWT token.

#### Scenario: Successful login

- GIVEN the user is on `/login`
- WHEN they enter valid email and password and submit
- THEN the system calls `POST /api/v1/auth/login` with `{email, password}`
- AND stores the returned `{token}` in Zustand auth store and localStorage
- AND redirects to `/dashboard`

#### Scenario: Invalid credentials

- GIVEN the user is on `/login`
- WHEN they submit invalid credentials
- THEN the system displays an error message (e.g. "Email o contraseña incorrectos")
- AND the form remains editable

### Requirement: Registration Page

The system SHALL display a registration form accepting nombre, email, and password, submit to `POST /api/v1/auth/registro`, and redirect to login.

#### Scenario: Successful registration

- GIVEN the user is on `/registro`
- WHEN they enter valid name, email, and password and submit
- THEN the system calls `POST /api/v1/auth/registro` with `{nombre, email, password}`
- AND redirects to `/login` with a success message

#### Scenario: Duplicate email

- GIVEN the user is on `/registro`
- WHEN they submit an email that already exists
- THEN the system displays an error message

### Requirement: Axios JWT Interceptor

The system SHALL provide a shared Axios instance that automatically attaches `Authorization: Bearer {token}` to every outgoing request.

#### Scenario: Token attached to request

- GIVEN a user is authenticated (token exists in store)
- WHEN any API request is made via the shared Axios instance
- THEN the `Authorization: Bearer {token}` header is included

#### Scenario: No token for public endpoints

- GIVEN a user is not authenticated
- WHEN a request is made to a public endpoint (`/api/v1/auth/**`)
- THEN no Authorization header is sent

### Requirement: 401 Response Interceptor

The system SHALL intercept 401 responses and redirect the user to `/login`.

#### Scenario: 401 on authenticated request

- GIVEN a user has a stored token that has expired or is invalid
- WHEN an API request returns HTTP 401
- THEN the system clears the token from store and localStorage
- AND redirects to `/login`

### Requirement: Zustand Auth Store

The system SHALL maintain an auth store with `token`, `user`, `isAuthenticated`, `login(token)`, and `logout()` actions.

#### Scenario: Login sets authenticated state

- GIVEN the user calls `login(token)`
- THEN `isAuthenticated` becomes `true`
- AND `token` is stored in both Zustand and localStorage

#### Scenario: Logout clears state

- GIVEN the user calls `logout()`
- THEN `isAuthenticated` becomes `false`
- AND `token` is removed from Zustand and localStorage

### Requirement: ProtectedRoute Component

The system SHALL wrap authenticated routes with a component that redirects unauthenticated users to `/login`.

#### Scenario: Authenticated user accesses protected route

- GIVEN a user is authenticated
- WHEN they navigate to a protected route (e.g. `/dashboard`)
- THEN the page renders normally

#### Scenario: Unauthenticated user accesses protected route

- GIVEN no token exists in the auth store
- WHEN a user navigates to `/dashboard`
- THEN they are redirected to `/login`

## TypeScript Types

```typescript
interface LoginRequest { email: string; password: string; }
interface LoginResponse { token: string; }
interface RegisterRequest { nombre: string; email: string; password: string; }
interface RegisterResponse { id: number; nombre: string; email: string; }
```
