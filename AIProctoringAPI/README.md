# AI Proctoring API

ASP.NET Core 10 Web API for the AI Proctoring System.  
Connects to SQL Server 2022 (`LAPTOP-5UEO3BCG\SQLEXPRESS`) via stored procedures.  
JWT authentication · Role-based authorization · Swagger UI

---

## Prerequisites

| Tool | Version |
|------|---------|
| .NET SDK | 10.0.403 |
| SQL Server 2022 | LAPTOP-5UEO3BCG\SQLEXPRESS |
| sqlcmd | any |

---

## 1. Database Setup

Open **SQL Server Management Studio** or run via `sqlcmd`:

```bash
sqlcmd -S "LAPTOP-5UEO3BCG\SQLEXPRESS" -i "Database/01_CreateDatabase.sql"
sqlcmd -S "LAPTOP-5UEO3BCG\SQLEXPRESS" -d AIProctoringDB -i "Database/02_StoredProcedures.sql"
```

> If your stored procedures already exist, `CREATE OR ALTER PROCEDURE` will update them safely.  
> If you already have your own versions, **skip `02_StoredProcedures.sql`** and verify the parameter names match the services.

---

## 2. Configure the JWT Secret

The JWT secret key is stored in .NET User Secrets (never in source code).

```bash
cd AIProctoringAPI
dotnet user-secrets set "JwtSettings:SecretKey" "YourStrongSecretKeyAtLeast32Characters!"
```

A default development key was already set during project creation.  
**Replace it with your own before going to production.**

---

## 3. Connection String

The connection string is in `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=LAPTOP-5UEO3BCG\\SQLEXPRESS;Database=AIProctoringDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

For production, use environment variables instead:

```bash
$env:ConnectionStrings__DefaultConnection = "Server=...;Database=AIProctoringDB;..."
```

---

## 4. Build and Run

```bash
cd AIProctoringAPI
dotnet build
dotnet run
```

The API starts on:
- `https://localhost:7xxx` (HTTPS)
- `http://localhost:5xxx` (HTTP)

Check the console output for the exact port numbers.

---

## 5. Swagger Testing Walkthrough

Open `https://localhost:7xxx/swagger` in your browser.

### Step-by-step testing order

**1. Health check**
```
GET /api/health
```
Expect `200 OK` with `"database": "connected"`.

**2. Register a user**
```
POST /api/auth/register
{
  "username": "admin1",
  "email": "admin1@example.com",
  "password": "Admin@12345",
  "fullName": "Admin User"
}
```

**3. Log in**
```
POST /api/auth/login
{
  "username": "admin1",
  "password": "Admin@12345"
}
```
Copy the `token` from the response.

**4. Authorize Swagger**
Click the **Authorize** button (top right) → paste the token → click Authorize.

**5. Promote to admin (run this via sqlcmd once)**
```sql
UPDATE AIProctoringDB.dbo.Users SET Role = 'administrator' WHERE Username = 'admin1';
```
Then log in again to get a new token with the updated role.

**6. Create an exam**
```
POST /api/exams
{
  "title": "Python Fundamentals",
  "description": "Basic Python exam",
  "durationMinutes": 60,
  "totalMarks": 100,
  "isActive": true
}
```

**7. Add a question**
```
POST /api/questions
{
  "examId": 1,
  "questionText": "What keyword defines a function in Python?",
  "questionType": "MCQ",
  "optionA": "func",
  "optionB": "def",
  "optionC": "define",
  "optionD": "function",
  "correctAnswer": "B",
  "marks": 10
}
```

**8. Register a student and log in as student**
```
POST /api/auth/register
{ "username": "student1", "email": "student1@example.com", "password": "Student@123" }

POST /api/auth/login
{ "username": "student1", "password": "Student@123" }
```

**9. Start an exam session**
```
POST /api/sessions/start
{ "examId": 1 }
```

**10. Send a heartbeat**
```
POST /api/sessions/1/heartbeat
{}
```

**11. Record a proctoring log**
```
POST /api/proctoring/logs
{
  "sessionId": 1,
  "eventType": "tab_switch",
  "eventDetails": "Student switched browser tab"
}
```

**12. Submit the exam**
```
POST /api/sessions/1/submit
{
  "answers": { "1": "B" }
}
```

**13. View analytics (admin token required)**
```
GET /api/analytics/summary
GET /api/analytics/hourly
```

**14. Test unauthorized access**
Remove the token from Swagger Authorize, then try `GET /api/users`.  
Expect `401 Unauthorized`.

Try `PUT /api/users/student1/role` as a student.  
Expect `403 Forbidden`.

---

## 6. API Endpoints Reference

| Method | Route | Auth |
|--------|-------|------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/users | Admin |
| GET | /api/users/{username} | Admin |
| PUT | /api/users/{username}/role | Admin |
| POST | /api/exams | Admin |
| GET | /api/exams | Authenticated |
| GET | /api/exams/{id} | Authenticated |
| PUT | /api/exams/{id} | Admin |
| DELETE | /api/exams/{id} | Admin |
| POST | /api/questions | Admin |
| GET | /api/questions | Authenticated |
| GET | /api/questions/{id} | Authenticated |
| PUT | /api/questions/{id} | Admin |
| DELETE | /api/questions/{id} | Admin |
| POST | /api/sessions/start | Authenticated |
| GET | /api/sessions/{id} | Authenticated (own) |
| GET | /api/sessions/student/{studentId} | Authenticated (own) |
| GET | /api/sessions/active | Admin |
| POST | /api/sessions/{id}/heartbeat | Authenticated |
| POST | /api/sessions/{id}/submit | Authenticated |
| POST | /api/proctoring/logs | Authenticated |
| GET | /api/proctoring/sessions/{sessionId}/logs | Authenticated |
| GET | /api/proctoring/users/{userId}/logs | Authenticated (own) |
| GET | /api/proctoring/logs | Admin |
| POST | /api/proctoring/verdicts | Admin |
| GET | /api/proctoring/sessions/{sessionId}/verdicts | Authenticated |
| GET | /api/settings/{key} | Admin |
| PUT | /api/settings/{key} | Admin |
| GET | /api/settings | Admin |
| DELETE | /api/settings/{key} | Admin |
| POST | /api/identity-verification | Authenticated |
| GET | /api/identity-verification/{sessionId} | Authenticated (own) |
| POST | /api/certificates/issue | Admin |
| GET | /api/certificates/verify/{hash} | Public |
| GET | /api/certificates/student/{studentId} | Authenticated (own) |
| GET | /api/analytics/summary | Admin |
| GET | /api/analytics/hourly | Admin |
| GET | /api/health | Public |

---

## 7. Connecting Your React Frontend

In your React project, set the API base URL via environment variable:

```env
# .env (development)
REACT_APP_API_URL=https://localhost:7xxx

# .env.production
REACT_APP_API_URL=https://your-production-api.com
```

Then in your API client:
```js
const API_URL = process.env.REACT_APP_API_URL;
const response = await fetch(`${API_URL}/api/auth/login`, { ... });
```

The .NET API has CORS enabled for `http://localhost:3000` and `http://localhost:5173` by default.  
Update `AllowedCorsOrigins` in `appsettings.json` if your React dev server uses a different port.

---

## 8. Python AI/ML Integration

Your existing Python FastAPI + OpenCV/YOLO system can communicate with the .NET API:

**Option A — Python calls .NET REST endpoints directly**
```python
import httpx

# Authenticate as a trusted admin service account
resp = httpx.post("https://localhost:7xxx/api/auth/login",
                  json={"username": "ai_service", "password": "..."})
token = resp.json()["token"]

# Post a verdict after AI analysis
httpx.post("https://localhost:7xxx/api/proctoring/verdicts",
           headers={"Authorization": f"Bearer {token}"},
           json={"sessionId": 1, "verdict": "cheating_detected", "confidence": 0.95})
```

**Option B — Python writes directly to SQL Server (shared DB)**  
Both services talk to the same `AIProctoringDB`. The Python service calls stored procedures directly while .NET handles the REST API layer.

---

## 9. Security Notes

- JWT secret is stored in User Secrets (dev) or environment variables (prod). Never commit it.
- Passwords are hashed with BCrypt (work factor 12) before storage.
- Password hashes are never returned in any API response.
- Students cannot submit proctoring verdicts or assign roles to themselves.
- Server-side timestamps are used for all logs; client timestamps are ignored.
- Correct answers are hidden from student-role API responses.
