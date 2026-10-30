USE AIProctoringDB;
GO

-- sp_GetAllSessions (admin/teacher view — all sessions with student info)
CREATE OR ALTER PROCEDURE sp_GetAllSessions
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        s.SessionId, s.ExamId, e.Title AS ExamTitle,
        s.StudentId, u.Username AS StudentUsername, u.FullName AS StudentName,
        u.Email AS StudentEmail,
        s.StartTime, s.EndTime, s.Status, s.Score, s.LastHeartbeat,
        (SELECT COUNT(*) FROM ProctoringLogs pl WHERE pl.SessionId = s.SessionId) AS ViolationCount
    FROM ExamSessions s
    JOIN Exams e  ON s.ExamId    = e.ExamId
    JOIN Users u  ON s.StudentId = u.UserId
    ORDER BY s.StartTime DESC;
END
GO

-- sp_GetStudentFullProfile (admin/teacher can view any student's full data)
CREATE OR ALTER PROCEDURE sp_GetStudentFullProfile
    @StudentId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Student basic info
    SELECT UserId, Username, Email, FullName, Role, Department, YearOfStudy, Phone, ProfilePhoto, CreatedAt
    FROM Users WHERE UserId = @StudentId;

    -- All exam sessions with results
    SELECT s.SessionId, s.ExamId, e.Title AS ExamTitle,
           s.StartTime, s.EndTime, s.Status, s.Score, e.TotalMarks
    FROM ExamSessions s
    JOIN Exams e ON s.ExamId = e.ExamId
    WHERE s.StudentId = @StudentId
    ORDER BY s.StartTime DESC;

    -- Violation summary
    SELECT pl.EventType, COUNT(*) AS Count
    FROM ProctoringLogs pl
    JOIN ExamSessions s ON pl.SessionId = s.SessionId
    WHERE s.StudentId = @StudentId
    GROUP BY pl.EventType
    ORDER BY Count DESC;
END
GO

-- sp_GetAllSessionsWithViolations (for live monitor)
CREATE OR ALTER PROCEDURE sp_GetAllSessionsWithViolations
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        s.SessionId, s.ExamId, e.Title AS ExamTitle,
        s.StudentId, u.Username AS StudentUsername, u.FullName AS StudentName,
        s.StartTime, s.EndTime, s.Status,
        s.Score, e.TotalMarks,
        s.LastHeartbeat,
        (SELECT COUNT(*) FROM ProctoringLogs pl WHERE pl.SessionId = s.SessionId) AS ViolationCount,
        (SELECT TOP 1 Verdict FROM ProctorVerdicts pv WHERE pv.SessionId = s.SessionId ORDER BY CreatedAt DESC) AS Verdict
    FROM ExamSessions s
    JOIN Exams e ON s.ExamId    = e.ExamId
    JOIN Users u ON s.StudentId = u.UserId
    ORDER BY s.StartTime DESC;
END
GO

PRINT 'Admin view procedures created.';
GO
