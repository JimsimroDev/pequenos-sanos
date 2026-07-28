# frontend-dashboard Specification

## Purpose

Parent dashboard for managing child profiles, registering food consumption, and viewing daily reports. Standard React CRUD pages calling REST endpoints.

## Requirements

### Requirement: Dashboard Page

The system SHALL display a list of the authenticated user's child profiles with name, age, coin balance, and action buttons.

#### Scenario: Profiles loaded

- GIVEN the user is authenticated
- WHEN they navigate to `/dashboard`
- THEN the system calls `GET /api/v1/perfiles`
- AND renders a `ProfileCard` for each profile

#### Scenario: No profiles

- GIVEN the user has no child profiles
- WHEN the dashboard loads
- THEN a message prompts to create the first profile

### Requirement: New Profile Page

The system SHALL provide a form to create a child profile with fields: nombre, edadAnios (2–4), avatarCodigo, screenTimeLimit (5–60 min).

#### Scenario: Successful creation

- GIVEN the user is on `/perfil/nuevo`
- WHEN they fill all required fields and submit
- THEN the system calls `POST /api/v1/perfiles` and redirects to `/dashboard`

#### Scenario: Validation error

- GIVEN the user submits edadAnios outside 2–4 or screenTimeLimit outside 5–60
- THEN inline validation errors are shown

### Requirement: Profile Detail Page

The system SHALL display a profile's food consumption registration interface and daily report.

#### Scenario: Register food consumption

- GIVEN the user is on `/perfil/:id`
- WHEN they select a food item from the `FoodSelector` and submit
- THEN the system calls `POST /api/v1/consumos` with `{perfilId, alimentoId}`
- AND the consumption appears in `ConsumptionHistory`

#### Scenario: View daily report

- GIVEN the user is on `/perfil/:id`
- WHEN the page loads
- THEN the system calls `GET /api/v1/reportes/perfil/{id}/resumen`
- AND displays `DailyReport` with foods eaten, coins earned, total balance

### Requirement: Edit Profile Page

The system SHALL provide a form to update nombre, avatarCodigo, and screenTimeLimit.

#### Scenario: Successful update

- GIVEN the user is on `/perfil/:id/editar`
- WHEN they modify fields and submit
- THEN the system calls `PUT /api/v1/perfiles/{id}` and redirects to `/dashboard`

### Requirement: ProfileCard Component

The system SHALL render each child profile as a card showing name, age, coin balance, and edit/delete buttons.

#### Scenario: Delete profile

- GIVEN a `ProfileCard` is displayed
- WHEN the user clicks delete and confirms
- THEN the system calls `DELETE /api/v1/perfiles/{id}`
- AND the card is removed from the list

### Requirement: FoodSelector Component

The system SHALL display food items filterable by category (FRUTA, VERDURA, PROTEINA, CEREAL).

#### Scenario: Filter by category

- GIVEN food items are loaded from `GET /api/v1/alimentos`
- WHEN the user selects a category filter
- THEN only foods matching that category are displayed

### Requirement: ConsumptionHistory Component

The system SHALL display today's food registrations for a profile.

#### Scenario: History loaded

- GIVEN a profile ID is provided
- WHEN the component mounts
- THEN the system calls `GET /api/v1/consumos/perfil/{perfilId}`
- AND lists each consumption with food name, time, and points earned

## TypeScript Types

```typescript
interface DatosRespuestaPerfil {
  id: number; nombre: string; edadAnios: number;
  avatarCodigo: string; screenTimeLimit: number; monedasSaldo: number;
}
interface Alimento { id: number; nombre: string; categoria: string; descripcion: string; puntosReward: number; }
interface DatosRespuestaConsumo { id: number; nombreAlimento: string; fechaConsumo: string; puntosReward: number; procesado: boolean; }
interface ResumenDiario { perfilId: number; nombrePerfil: string; alimentosDelDia: string[]; monedasGanadasHoy: number; saldoTotal: number; }
```
