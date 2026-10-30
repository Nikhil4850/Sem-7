USE AIProctoringDB;
GO

-- ============================================================
-- INDIAN STUDENT SEED DATA
-- All passwords: Student@123
-- ============================================================

-- ── 1. INDIAN STUDENTS (20 students) ─────────────────────────
MERGE Users AS target
USING (VALUES
    ('aarav.sharma',    'aarav.sharma@git.edu.in',    '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Aarav Sharma',      'student'),
    ('priya.patel',     'priya.patel@git.edu.in',     '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Priya Patel',       'student'),
    ('rohit.verma',     'rohit.verma@git.edu.in',     '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Rohit Verma',       'student'),
    ('ananya.singh',    'ananya.singh@git.edu.in',    '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Ananya Singh',      'student'),
    ('kiran.kumar',     'kiran.kumar@git.edu.in',     '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Kiran Kumar',       'student'),
    ('neha.gupta',      'neha.gupta@git.edu.in',      '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Neha Gupta',        'student'),
    ('arjun.mehta',     'arjun.mehta@git.edu.in',     '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Arjun Mehta',       'student'),
    ('pooja.iyer',      'pooja.iyer@git.edu.in',      '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Pooja Iyer',        'student'),
    ('vikram.reddy',    'vikram.reddy@git.edu.in',    '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Vikram Reddy',      'student'),
    ('divya.nair',      'divya.nair@git.edu.in',      '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Divya Nair',        'student'),
    ('rahul.joshi',     'rahul.joshi@git.edu.in',     '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Rahul Joshi',       'student'),
    ('sneha.desai',     'sneha.desai@git.edu.in',     '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Sneha Desai',       'student'),
    ('amit.malhotra',   'amit.malhotra@git.edu.in',   '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Amit Malhotra',     'student'),
    ('kavya.krishnan',  'kavya.krishnan@git.edu.in',  '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Kavya Krishnan',    'student'),
    ('saurabh.pandey',  'saurabh.pandey@git.edu.in',  '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Saurabh Pandey',    'student'),
    ('riya.agarwal',    'riya.agarwal@git.edu.in',    '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Riya Agarwal',      'student'),
    ('nikhil.bhatia',   'nikhil.bhatia@git.edu.in',   '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Nikhil Bhatia',     'student'),
    ('tanvi.saxena',    'tanvi.saxena@git.edu.in',    '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Tanvi Saxena',      'student'),
    ('harsh.tiwari',    'harsh.tiwari@git.edu.in',    '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Harsh Tiwari',      'student'),
    ('ishika.mishra',   'ishika.mishra@git.edu.in',   '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Ishika Mishra',     'student')
) AS source (Username, Email, PasswordHash, FullName, Role)
ON target.Username = source.Username
WHEN NOT MATCHED THEN
    INSERT (Username, Email, PasswordHash, FullName, Role)
    VALUES (source.Username, source.Email, source.PasswordHash, source.FullName, source.Role);
GO

PRINT '20 Indian students inserted.';
GO

-- ── 2. EXAM SESSIONS (submitted results) ─────────────────────
DECLARE @pyExam  INT = (SELECT TOP 1 ExamId FROM Exams WHERE Title = 'Python Fundamentals');
DECLARE @dsaExam INT = (SELECT TOP 1 ExamId FROM Exams WHERE Title = 'Data Structures & Algorithms');
DECLARE @webExam INT = (SELECT TOP 1 ExamId FROM Exams WHERE Title = 'Web Development Basics');
DECLARE @dbExam  INT = (SELECT TOP 1 ExamId FROM Exams WHERE Title = 'Database Management');
DECLARE @netExam INT = (SELECT TOP 1 ExamId FROM Exams WHERE Title = 'Computer Networks');

-- Insert submitted sessions for Indian students
INSERT INTO ExamSessions (ExamId, StudentId, StartTime, EndTime, Status, Score, LastHeartbeat)
SELECT
    e.ExamId,
    u.UserId,
    DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 30, GETUTCDATE()),
    DATEADD(MINUTE, e.DurationMinutes - (ABS(CHECKSUM(NEWID())) % 10), DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 30, GETUTCDATE())),
    'submitted',
    -- Random score between 40% and 100% of total marks
    CAST(e.TotalMarks * (0.4 + (ABS(CHECKSUM(NEWID())) % 61) / 100.0) AS DECIMAL(10,2)),
    GETUTCDATE()
FROM Users u
CROSS JOIN Exams e
WHERE u.Username IN (
    'aarav.sharma','priya.patel','rohit.verma','ananya.singh','kiran.kumar',
    'neha.gupta','arjun.mehta','pooja.iyer','vikram.reddy','divya.nair',
    'rahul.joshi','sneha.desai','amit.malhotra','kavya.krishnan','saurabh.pandey',
    'riya.agarwal','nikhil.bhatia','tanvi.saxena','harsh.tiwari','ishika.mishra'
)
AND NOT EXISTS (
    SELECT 1 FROM ExamSessions es
    WHERE es.StudentId = u.UserId AND es.ExamId = e.ExamId
);
GO

PRINT 'Exam sessions inserted.';
GO

-- ── 3. PROCTORING LOGS (violations) ──────────────────────────
-- Add realistic violation logs for the sessions
INSERT INTO ProctoringLogs (SessionId, UserId, EventType, EventDetails, Timestamp)
SELECT
    es.SessionId,
    es.StudentId,
    v.EventType,
    v.EventDetails,
    DATEADD(MINUTE, ABS(CHECKSUM(NEWID())) % es2.DurMin, es.StartTime)
FROM ExamSessions es
JOIN Users u ON es.StudentId = u.UserId
JOIN Exams ex ON es.ExamId = ex.ExamId
CROSS APPLY (SELECT ex.DurationMinutes AS DurMin) es2
CROSS APPLY (
    VALUES
        ('phone_detected',  'Smartphone detected with confidence 0.87 by YOLOv8'),
        ('looking_away',    'Gaze deviation detected — student looked away for 3.2 seconds'),
        ('tab_switch',      'Browser tab switch detected — focus lost'),
        ('multiple_faces',  'Multiple faces detected in camera frame'),
        ('no_face',         'No face detected — student may have left seat')
) v(EventType, EventDetails)
WHERE u.Username IN (
    'aarav.sharma','priya.patel','rohit.verma','ananya.singh','kiran.kumar',
    'neha.gupta','arjun.mehta','pooja.iyer','vikram.reddy','divya.nair',
    'rahul.joshi','sneha.desai','amit.malhotra','kavya.krishnan','saurabh.pandey',
    'riya.agarwal','nikhil.bhatia','tanvi.saxena','harsh.tiwari','ishika.mishra'
)
AND es.Status = 'submitted'
-- Only insert ~60% of combinations to simulate realistic partial violations
AND ABS(CHECKSUM(NEWID())) % 10 < 6;
GO

PRINT 'Proctoring violation logs inserted.';
GO

-- ── 4. PROCTOR VERDICTS ───────────────────────────────────────
INSERT INTO ProctorVerdicts (SessionId, Verdict, Confidence, Details, CreatedAt)
SELECT
    es.SessionId,
    CASE
        WHEN (SELECT COUNT(*) FROM ProctoringLogs pl WHERE pl.SessionId = es.SessionId) >= 4 THEN 'suspicious'
        WHEN (SELECT COUNT(*) FROM ProctoringLogs pl WHERE pl.SessionId = es.SessionId AND pl.EventType = 'phone_detected') > 0 THEN 'cheating_detected'
        ELSE 'clean'
    END,
    CASE
        WHEN (SELECT COUNT(*) FROM ProctoringLogs pl WHERE pl.SessionId = es.SessionId) >= 4 THEN 0.85
        WHEN (SELECT COUNT(*) FROM ProctoringLogs pl WHERE pl.SessionId = es.SessionId AND pl.EventType = 'phone_detected') > 0 THEN 0.92
        ELSE 0.97
    END,
    'AI Proctor automated verdict based on YOLOv8 + gaze tracking analysis.',
    DATEADD(MINUTE, 2, es.EndTime)
FROM ExamSessions es
JOIN Users u ON es.StudentId = u.UserId
WHERE u.Username IN (
    'aarav.sharma','priya.patel','rohit.verma','ananya.singh','kiran.kumar',
    'neha.gupta','arjun.mehta','pooja.iyer','vikram.reddy','divya.nair',
    'rahul.joshi','sneha.desai','amit.malhotra','kavya.krishnan','saurabh.pandey',
    'riya.agarwal','nikhil.bhatia','tanvi.saxena','harsh.tiwari','ishika.mishra'
)
AND es.Status = 'submitted'
AND NOT EXISTS (SELECT 1 FROM ProctorVerdicts pv WHERE pv.SessionId = es.SessionId);
GO

PRINT 'Proctor verdicts inserted.';
GO

-- ── 5. SUMMARY ────────────────────────────────────────────────
SELECT 'Users'          AS [Table], COUNT(*) AS [Rows] FROM Users
UNION ALL
SELECT 'Exams',          COUNT(*) FROM Exams
UNION ALL
SELECT 'Questions',      COUNT(*) FROM Questions
UNION ALL
SELECT 'ExamSessions',   COUNT(*) FROM ExamSessions
UNION ALL
SELECT 'ProctoringLogs', COUNT(*) FROM ProctoringLogs
UNION ALL
SELECT 'ProctorVerdicts',COUNT(*) FROM ProctorVerdicts
UNION ALL
SELECT 'Settings',       COUNT(*) FROM Settings;
GO
