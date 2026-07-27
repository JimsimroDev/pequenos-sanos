---
name: product
inclusion: always
---

# Product — Pequeños Sanos

## Vision

Transform mealtime into a positive, motivating experience through gamification.
Healthy food consumption in real life translates into progress and rewards inside
a regulated multiplayer virtual world (MMO), while a strict parental screen-time
control prevents digital addiction in early childhood.

## Target Users

| User | Age | Role |
|------|-----|------|
| Padre / Tutor | Adult | Creates account, registers food intake, configures daily screen-time limit, views reports |
| Niño | 2–4 years | Plays with their avatar in the virtual world within the time allowed by the parent |

## Core Problem

Children aged 2–4 frequently reject new foods (food neophobia) and resist
balanced diets. Simultaneously, unregulated screen time at this age poses an
early addiction risk. Pequeños Sanos resolves both problems together.

## Business Objectives

| ID | Objective |
|----|-----------|
| OBJ-1 | Incentivize healthy food intake through gamification mechanics |
| OBJ-2 | Give parents an intuitive panel to register, validate and track nutritional progress |
| OBJ-3 | Prevent digital addiction by limiting daily play time with automatic disconnection |
| OBJ-4 | Guarantee transactional integrity when awarding rewards — zero duplicate credits |
| OBJ-5 | Maintain a fluid 30 FPS multiplayer experience within the permitted time window |

## Key Features (MVP)

| ID | Feature | Priority |
|----|---------|----------|
| CS-1 | Parental validation of healthy food consumption | High |
| CS-2 | Transactional rewards engine (coins/accessories) for completed nutritional goals | High |
| CS-3 | Daily screen-time limit configuration (`screen_time_limit`) per child profile | High |
| CS-4 | Server-side session timer with automatic Force Logout at limit | High |
| CS-5 | Real-time avatar synchronization on a virtual map via WebSockets | Medium |
| CS-6 | Parental control panel: profiles, food catalogue, usage reports | Medium |

## MVP Deliverables

1. **Módulo Parental y Nutricional** — user accounts, child profiles, food catalogue, screen-time config.
2. **Motor Transaccional de Recompensas** — ACID reward adjudication, duplicate prevention.
3. **Motor MMO y Control de Tiempo Real** — WebSocket server at 30 FPS, in-memory timer, Force Logout.

## Out of Scope (MVP)

- Virtual store to redeem coins for cosmetic items.
- Push notifications to mobile devices.
- Integration with external health or nutrition systems.
- Content management panel for the food catalogue.
- Offline mode for the game client.
