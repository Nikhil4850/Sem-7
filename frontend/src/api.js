// Central API configuration
export const BASE_URL = 'http://localhost:5052';
export const WS_URL   = 'ws://localhost:8000';

// Auth
export const API = {
  // Auth
  register:    `${BASE_URL}/api/auth/register`,
  login:       `${BASE_URL}/api/auth/login`,
  me:          `${BASE_URL}/me`,

  // Users
  users:                     `${BASE_URL}/api/users`,
  userRole: (username) => `${BASE_URL}/api/users/${username}/role`,

  // Exams
  exams:       `${BASE_URL}/api/exams`,
  exam:    (id) => `${BASE_URL}/api/exams/${id}`,

  // Questions
  questions:          `${BASE_URL}/api/questions`,
  question:       (id) => `${BASE_URL}/api/questions/${id}`,

  // Sessions
  sessionStart:              `${BASE_URL}/api/sessions/start`,
  sessionHeartbeat: (id) => `${BASE_URL}/api/sessions/${id}/heartbeat`,
  sessionSubmit:    (id) => `${BASE_URL}/api/sessions/${id}/submit`,
  sessions:                  `${BASE_URL}/api/sessions`,

  // Proctoring
  proctoringLogs:     `${BASE_URL}/api/proctoring/logs`,
  proctoringVerdicts: `${BASE_URL}/api/proctoring/verdicts`,

  // Analytics & system
  analyticsSummary: `${BASE_URL}/api/analytics/summary`,
  systemHealth:     `${BASE_URL}/api/system/health`,

  // Settings
  settings:            `${BASE_URL}/api/settings`,
  setting: (key) => `${BASE_URL}/api/settings/${key}`,

  // Identity & certificates
  identityVerification: `${BASE_URL}/api/identity-verification`,
  issueCertificate:     `${BASE_URL}/api/certificates/issue`,

  // Exports
  exportLogs:     `${BASE_URL}/logs/export/csv`,
  exportResults:  `${BASE_URL}/exam/results/export/csv`,
  exportSessions: `${BASE_URL}/api/sessions/results/export/csv`,

  // WebSocket proctoring
  wsProctor: (token) => `${WS_URL}/ws/proctor?token=${token || ''}`,
};

// Helper: auth header
export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// Helper: JSON POST/PUT/DELETE
export async function apiRequest(url, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (res.status === 401 && typeof window.__appLogout === 'function') {
    window.__appLogout();
  }
  return res;
}
