# SpringReactSample — Customer Management CRUD

A minimal, deploy-ready CRUD app for managing bank customers.

| Layer     | Tech                                             | Suggested host        |
| --------- | ------------------------------------------------ | --------------------- |
| Frontend  | React 18 + Vite + Tailwind CSS                   | Vercel or Netlify     |
| Backend   | Spring Boot 3.3 · Java 17 · Maven                | Render or Railway     |
| Database  | PostgreSQL                                       | Supabase or Render PG |

```
.
├── backend/                 # Spring Boot API
│   ├── src/main/java/com/example/customers/
│   │   ├── CustomersApplication.java
│   │   ├── model/Customer.java
│   │   ├── repository/CustomerRepository.java
│   │   ├── service/CustomerService.java
│   │   ├── controller/CustomerController.java
│   │   ├── config/WebConfig.java          # CORS (ALLOWED_ORIGIN)
│   │   └── exception/                     # 404 + validation JSON
│   ├── src/main/resources/application.yml # env-driven config
│   ├── src/test/…                          # unit tests (no DB needed)
│   ├── Dockerfile                          # multi-stage, eclipse-temurin
│   └── .env.example
└── frontend/                # React dashboard
    ├── src/api/customerService.js          # axios client
    ├── src/App.jsx                         # dashboard shell
    ├── src/components/                      # Table, Modal, Sidebar, …
    ├── vercel.json                         # SPA rewrites
    ├── netlify.toml + public/_redirects    # SPA fallback
    └── .env.example
```

---

## 1. Run locally

### Prerequisites

- Java 17+
- Maven 3.9+
- Node 18+
- A PostgreSQL database (local, or a free Supabase project)

### Database (quickest: Docker)

```bash
docker run --name customers-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=customers -p 5432:5432 -d postgres:16
```

### Backend

```bash
cd backend
# local fallbacks are built in, so this works out of the box with the DB above
mvn spring-boot:run
```

The API starts on <http://localhost:8080>. Hibernate creates the `customers`
table automatically (`ddl-auto: update`). Health check: `/actuator/health`.

### Frontend

```bash
cd frontend
cp .env.example .env.local     # VITE_API_BASE_URL=http://localhost:8080/api
npm install
npm run dev                    # http://localhost:5173
```

---

## 2. API reference

Base path: `/api/customers`

| Method   | Path               | Body            | Success | Notes                          |
| -------- | ------------------ | --------------- | ------- | ------------------------------ |
| `GET`    | `/api/customers`   | –               | `200`   | Optional `?search=` free text  |
| `GET`    | `/api/customers/{id}` | –            | `200`   | `404` if missing               |
| `POST`   | `/api/customers`   | Customer JSON   | `201`   | Validates required fields      |
| `PUT`    | `/api/customers/{id}` | Customer JSON | `200` | Full update                    |
| `DELETE` | `/api/customers/{id}` | –            | `204`   | `404` if missing               |

Customer JSON:

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "dateOfBirth": "1815-12-10",
  "phoneNumber": "+44 20 7946 0958",
  "email": "ada@example.com",
  "ban": "GB29NWBK60161331926819"
}
```

Errors return `{ timestamp, status, message, errors? }`.

---

## 3. Deployment checklist

### 3.1 Database — Supabase (or Render PostgreSQL)

1. Create a project and open **Project Settings → Database**.
2. Copy the **Connection string (URI)**. Convert it to JDBC form:

   ```
   postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres
   →  jdbc:postgresql://db.xxxx.supabase.co:5432/postgres?sslmode=require
   ```

   > Supabase **requires** SSL — keep `?sslmode=require`.
   > If you're on a network without IPv6, use the **connection pooler** host
   > (`aws-0-<region>.pooler.supabase.com:6543`) instead.

3. Note these values for the backend:

   | Variable                     | Value                                        |
   | ---------------------------- | -------------------------------------------- |
   | `SPRING_DATASOURCE_URL`      | `jdbc:postgresql://<host>:5432/<db>?sslmode=require` |
   | `SPRING_DATASOURCE_USERNAME` | `postgres` (or `postgres.<project-ref>` for the pooler) |
   | `SPRING_DATASOURCE_PASSWORD` | your database password                       |

   *Render PostgreSQL:* use the **External Database URL** (needs the JDBC
   `jdbc:` prefix) unless the backend runs in the same Render region, in which
   case the **Internal Database URL** is faster and free.

### 3.2 Backend — Render (or Railway)

**Render (Docker):**

1. New → **Web Service** → connect the repo → set **Root Directory** `backend`.
2. **Environment**: Docker (auto-detected from `backend/Dockerfile`).
3. **Health Check Path**: `/actuator/health`.
4. Add environment variables:

   | Key | Example |
   | --- | --- |
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://db.xxxx.supabase.co:5432/postgres?sslmode=require` |
   | `SPRING_DATASOURCE_USERNAME` | `postgres` |
   | `SPRING_DATASOURCE_PASSWORD` | `••••••••` |
   | `ALLOWED_ORIGIN` | `https://your-app.vercel.app` |
   | `JPA_DDL_AUTO` *(optional)* | `update` |
   | `JPA_SHOW_SQL` *(optional)* | `false` |

   > Do **not** set `PORT` — Render injects it and the Dockerfile respects it.

**Railway:**

1. New Project → **Deploy from GitHub repo** → it detects the `backend/Dockerfile`.
2. Add the same variables under **Variables**. Railway injects `PORT` too.

**Verify:** `curl https://<backend-host>/actuator/health` → `{"status":"UP"}`,
then `curl https://<backend-host>/api/customers` → `[]` (or your rows).

### 3.3 Frontend — Vercel (or Netlify)

Set **one** build-time variable pointing at the deployed API (include `/api`):

| Key                  | Value                                        |
| -------------------- | -------------------------------------------- |
| `VITE_API_BASE_URL`  | `https://<backend-host>/api`                 |

> Vite inlines env vars at **build time** — redeploy after changing this value.

**Vercel:** Import the repo → **Root Directory** `frontend` → framework Vite
(auto). `vercel.json` already handles SPA rewrites.

**Netlify:** New site → the repo → **Base directory** `frontend`, build
`npm run build`, publish `dist`. `netlify.toml` + `public/_redirects` handle the
SPA fallback.

### 3.4 Wire up CORS (don't skip)

After the frontend is live, set the backend's `ALLOWED_ORIGIN` to its URL and
redeploy/restart the backend:

```
ALLOWED_ORIGIN=https://your-app.vercel.app,https://your-app.netlify.app
```

For a throwaway demo you can use `ALLOWED_ORIGIN=*`, but prefer the explicit
allow-list for anything real.

---

## 4. Environment variables at a glance

**Supabase / Render PG**

```
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/<db>?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<password>
```

**Render / Railway (backend)**

```
SPRING_DATASOURCE_URL=…
SPRING_DATASOURCE_USERNAME=…
SPRING_DATASOURCE_PASSWORD=…
ALLOWED_ORIGIN=https://<frontend-host>
```

**Vercel / Netlify (frontend)**

```
VITE_API_BASE_URL=https://<backend-host>/api
```

---

## 5. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Browser console: **CORS policy** blocked | `ALLOWED_ORIGIN` must exactly match the frontend origin (scheme + host, no trailing slash). |
| Frontend says *"Cannot reach the API…"* | Wrong `VITE_API_BASE_URL`, or backend asleep (free tiers cold-start). Redeploy after changing the var. |
| Backend crashes: *SSL required* | Append `?sslmode=require` to `SPRING_DATASOURCE_URL`. |
| Backend crashes: *Connection refused / timeout* | Supabase direct host is IPv6-only on some plans — use the pooler host. |
| `404` on refresh / deep link | Ensure `vercel.json` (Vercel) or `netlify.toml` + `public/_redirects` (Netlify) are deployed. |
| Table not created | Confirm `JPA_DDL_AUTO=update` (the default) and that the DB user can create tables. |

---

## 6. Notes & next steps

- `ddl-auto: update` is great for demos; switch to **Flyway/Liquibase** migrations
  for production schema management.
- The BAN is stored as plain text and masked in the table UI. Encrypt/tokenise it
  and add auth (Spring Security + JWT) before handling real banking data.
- Tests: `cd backend && mvn test` (repository is mocked — no DB required).
