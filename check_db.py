import sqlite3

DB = r'c:\Users\Nikhil\Downloads\sem 7 - Copy\ai-proctor\backend\proctor.db'
conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute('PRAGMA foreign_keys')
fk = cur.fetchone()
print('FK constraints enabled:', fk[0])

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print('Tables:', tables)

cur.execute('SELECT id, title FROM exams')
exams = cur.fetchall()
print('Exams:', [(r['id'], r['title']) for r in exams])

cur.execute('SELECT exam_id, COUNT(*) as cnt FROM exam_sessions GROUP BY exam_id')
sessions = cur.fetchall()
print('Sessions by exam_id:', [(r['exam_id'], r['cnt']) for r in sessions])

cur.execute('SELECT exam_id, COUNT(*) as cnt FROM questions GROUP BY exam_id')
qs = cur.fetchall()
print('Questions by exam_id:', [(r['exam_id'], r['cnt']) for r in qs])

# Check for proctoring_logs table
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%proctoring%'")
pl = cur.fetchall()
print('Proctoring tables:', [r[0] for r in pl])

conn.close()
