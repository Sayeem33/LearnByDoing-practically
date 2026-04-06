# RBAC Policy Map

This project enforces role-based access control with least-privilege defaults via `src/lib/rbac.ts`.

## Roles

- `student`
- `teacher`
- `admin`

## Route Policy

### Student Management APIs

- `GET /api/students` -> `admin`
- `POST /api/students` -> `admin`
- `GET /api/students/:id` -> `admin`
- `PUT /api/students/:id` -> `admin`
- `DELETE /api/students/:id` -> `admin`

### Experiment APIs

- `GET /api/experiments` -> `student`, `teacher`, `admin`
- `POST /api/experiments` -> `admin`
- `GET /api/experiments/:id` -> `student`, `teacher`, `admin`
- `PUT /api/experiments/:id` -> `admin`
- `DELETE /api/experiments/:id` -> `admin`

Ownership rule for experiment by-id operations:

- `student` and `teacher` can access only their own experiments.
- `admin` can access any experiment.

### Tutorial Management API

- `PUT /api/tutorials/:experimentId` -> `admin`

## Hidden Admin Login

- Admin login UI is available only at secret route:
- `/system-root-access-9x3/admin-login`
- There is no public UI link to this route.
- Admin accounts are predefined and cannot be registered through `/register`.

## Semantics

- Unauthenticated request to protected operations -> `401 Unauthorized`
- Authenticated user without required role -> `403 Forbidden`
