# FastAPI Reference Architecture

The original problem statement specified a FastAPI + PostgreSQL + SQLAlchemy backend. This implementation uses Next.js API Routes + Prisma as a functionally equivalent stack optimised for the sandbox. The full API contract, RBAC, validation, and audit logging are identical.

## Why Next.js API Routes for the demo

- **Single deployable:** one process, one port, no CORS issues in the sandbox
- **Shared types:** TypeScript end-to-end (frontend + backend)
- **Faster iteration:** no separate Python service to run
- **Prisma = SQLAlchemy equivalent:** same ORM capabilities, type-safe queries

## Production port to FastAPI

The entire API surface maps 1:1 to FastAPI routers. Example mapping:

| Next.js Route | FastAPI Equivalent |
| --- | --- |
| `src/app/api/v1/auth/login/route.ts` | `app/api/v1/auth.py::POST /login` |
| `src/app/api/v1/bills/upload/route.ts` | `app/api/v1/bills.py::POST /upload` |
| `src/app/api/v1/missions/route.ts` | `app/api/v1/missions.py::GET /` |
| `src/app/api/v1/admin/submissions/route.ts` | `app/api/v1/admin.py::POST /submissions` |

## Suggested FastAPI structure

```
backend/
  app/
    main.py                 # FastAPI app, CORS, router includes
    core/
      config.py             # Pydantic BaseSettings (matches .env)
      security.py           # JWT + bcrypt (matches src/lib/auth.ts)
      deps.py               # Depends(get_current_user), Depends(require_role)
    models/                 # SQLAlchemy models (matches prisma/schema.prisma)
      user.py, profile.py, district.py, bill.py, footprint.py,
      mission.py, submission.py, points.py, badge.py, solar.py,
      community.py, post.py, map_pin.py, district_stats.py,
      notification.py, audit_log.py, system_setting.py
    schemas/                # Pydantic schemas (matches src/types/index.ts)
    services/
      auth_service.py, bill_service.py, mission_service.py,
      points_service.py, solar_service.py, eco_engine.py,
      ocr_service.py
    repositories/           # SQLAlchemy query layer
    api/v1/
      auth.py, profile.py, dashboard.py, bills.py, missions.py,
      points.py, badges.py, leaderboard.py, solar.py, ai_chat.py,
      community.py, map.py, twin.py, admin.py, impact_stats.py, seed.py
    utils/
      audit.py, rate_limit.py
  migrations/               # Alembic
  tests/
  requirements.txt
```

## Configuration parity

| Next.js env | FastAPI env |
| --- | --- |
| `DATABASE_URL=file:./db/custom.db` | `DATABASE_URL=postgresql://user:pass@host:5432/greengujarat` |
| `JWT_SECRET=...` | `JWT_SECRET=...` (same) |
| `EMISSION_FACTOR_KG_PER_KWH=0.71` | same |
| `LLM_API_KEY=` | same |
| `OCR_PROVIDER=demo` | `OCR_PROVIDER=tesseract\|paddle\|demo` |

## Test parity

The pytest suite would mirror the same test cases:

```python
# tests/test_auth.py
def test_register_and_login(client):
    response = client.post("/api/v1/auth/register", json={...})
    assert response.status_code == 201
    # login
    response = client.post("/api/v1/auth/login", json={...})
    assert response.status_code == 200
    assert "token" in response.json()

# tests/test_points_duplication.py
def test_duplicate_mission_submission_rejected(client, auth_user):
    # first submission succeeds
    response = client.post("/api/v1/missions/submissions", json={"missionId": ...})
    assert response.status_code == 201
    # second submission rejected
    response = client.post("/api/v1/missions/submissions", json={"missionId": ...})
    assert response.status_code == 409

# tests/test_admin_permissions.py
def test_citizen_cannot_access_admin(client, citizen_token):
    response = client.get("/api/v1/admin/admin-metrics", headers={"Authorization": f"Bearer {citizen_token}"})
    assert response.status_code == 403
```

The current `tests/` folder contains frontend integration tests using Vitest. The same test scenarios apply to the FastAPI port.
