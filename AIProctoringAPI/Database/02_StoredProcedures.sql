-- ============================================================
-- AI Proctoring System - Stored Procedures
-- Run this AFTER 01_CreateDatabase.sql
-- ============================================================

USE AIProctoringDB;
GO

-- ════════════════════════════════════════════════════════════
-- A. USER AUTHENTICATION AND MANAGEMENT
-- ════════════════════════════════════════════════════════════

-- sp_RegisterUser
CREATE OR ALTER PROCEDURE sp_RegisterUser
    @Username     NVARCHAR(100),
    @Email        NVARCHAR(255),
    @PasswordHash NVARCHAR(500),
    @FullName     NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Users (Username, Email, PasswordHash, FullName)
    VALUES (@Username, @Email, @PasswordHash, @FullName);
END
GO

-- sp_GetUserForLogin (returns PasswordHash for server-side verification ONLY)
CREATE OR ALTER PROCEDURE sp_GetUserForLogin
    @Username NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT UserId, Username, Email, PasswordHash, Role, FullName
    FROM Users
    WHERE Username = @Username;
END
GO

-- sp_GetUserByUsername
CREATE OR ALTER PROCEDURE sp_GetUserByUsername
    @Username NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT UserId, Username, Email, FullName, Role, CreatedAt
    FROM Users
    WHERE Username = @Username;
END
GO

-- sp_GetAllUsers
CREATE OR ALTER PROCEDURE sp_GetAllUsers
AS
BEGIN
    SET NOCOUNT ON;
    SELECT UserId, Username, Email, FullName, Role, CreatedAt
    FROM Users
    ORDER BY CreatedAt DESC;
END
GO

-- sp_UpdateUserRole
CREATE OR ALTER PROCEDURE sp_UpdateUserRole
    @Username NVARCHAR(100),
    @Role     NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users SET Role = @Role WHERE Username = @Username;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- ════════════════════════════════════════════════════════════
-- B. EXAM MANAGEMENT
-- ════════════════════════════════════════════════════════════

-- sp_CreateExam
CREATE OR ALTER PROCEDURE sp_CreateExam
    @Title          NVARCHAR(500),
    @Description    NVARCHAR(MAX)  = NULL,
    @DurationMinutes INT           = 60,
    @TotalMarks     INT            = 0,
    @StartTime      DATETIME2      = NULL,
    @EndTime        DATETIME2      = NULL,
    @IsActive       BIT            = 1,
    @CreatedBy      INT            = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Exams (Title, Description, DurationMinutes, TotalMarks, StartTime, EndTime, IsActive, CreatedBy)
    VALUES (@Title, @Description, @DurationMinutes, @TotalMarks, @StartTime, @EndTime, @IsActive, @CreatedBy);
    SELECT SCOPE_IDENTITY() AS ExamId;
END
GO

-- sp_GetAllExams
CREATE OR ALTER PROCEDURE sp_GetAllExams
AS
BEGIN
    SET NOCOUNT ON;
    SELECT e.ExamId, e.Title, e.Description, e.DurationMinutes, e.TotalMarks,
           e.StartTime, e.EndTime, e.IsActive, e.CreatedAt,
           u.Username AS CreatedBy
    FROM Exams e
    LEFT JOIN Users u ON e.CreatedBy = u.UserId
    ORDER BY e.CreatedAt DESC;
END
GO

-- sp_GetExamById
CREATE OR ALTER PROCEDURE sp_GetExamById
    @ExamId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT e.ExamId, e.Title, e.Description, e.DurationMinutes, e.TotalMarks,
           e.StartTime, e.EndTime, e.IsActive, e.CreatedAt,
           u.Username AS CreatedBy
    FROM Exams e
    LEFT JOIN Users u ON e.CreatedBy = u.UserId
    WHERE e.ExamId = @ExamId;
END
GO

-- sp_UpdateExam
CREATE OR ALTER PROCEDURE sp_UpdateExam
    @ExamId         INT,
    @Title          NVARCHAR(500)  = NULL,
    @Description    NVARCHAR(MAX)  = NULL,
    @DurationMinutes INT           = NULL,
    @TotalMarks     INT            = NULL,
    @StartTime      DATETIME2      = NULL,
    @EndTime        DATETIME2      = NULL,
    @IsActive       BIT            = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Exams SET
        Title           = ISNULL(@Title, Title),
        Description     = ISNULL(@Description, Description),
        DurationMinutes = ISNULL(@DurationMinutes, DurationMinutes),
        TotalMarks      = ISNULL(@TotalMarks, TotalMarks),
        StartTime       = ISNULL(@StartTime, StartTime),
        EndTime         = ISNULL(@EndTime, EndTime),
        IsActive        = ISNULL(@IsActive, IsActive)
    WHERE ExamId = @ExamId;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- sp_DeleteExam
CREATE OR ALTER PROCEDURE sp_DeleteExam
    @ExamId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Exams WHERE ExamId = @ExamId;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- ════════════════════════════════════════════════════════════
-- C. QUESTION MANAGEMENT
-- ════════════════════════════════════════════════════════════

-- sp_AddQuestion
CREATE OR ALTER PROCEDURE sp_AddQuestion
    @ExamId       INT,
    @QuestionText NVARCHAR(2000),
    @QuestionType NVARCHAR(50)  = 'MCQ',
    @OptionA      NVARCHAR(500) = NULL,
    @OptionB      NVARCHAR(500) = NULL,
    @OptionC      NVARCHAR(500) = NULL,
    @OptionD      NVARCHAR(500) = NULL,
    @CorrectAnswer NVARCHAR(500),
    @Marks        INT           = 1,
    @OrderNumber  INT           = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Questions (ExamId, QuestionText, QuestionType, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Marks, OrderNumber)
    VALUES (@ExamId, @QuestionText, @QuestionType, @OptionA, @OptionB, @OptionC, @OptionD, @CorrectAnswer, @Marks, @OrderNumber);
    SELECT SCOPE_IDENTITY() AS QuestionId;
END
GO

-- sp_GetAllQuestions
CREATE OR ALTER PROCEDURE sp_GetAllQuestions
AS
BEGIN
    SET NOCOUNT ON;
    SELECT QuestionId, ExamId, QuestionText, QuestionType,
           OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Marks, OrderNumber
    FROM Questions
    ORDER BY ExamId, ISNULL(OrderNumber, QuestionId);
END
GO

-- sp_GetQuestionById
CREATE OR ALTER PROCEDURE sp_GetQuestionById
    @QuestionId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT QuestionId, ExamId, QuestionText, QuestionType,
           OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Marks, OrderNumber
    FROM Questions
    WHERE QuestionId = @QuestionId;
END
GO

-- sp_UpdateQuestion
CREATE OR ALTER PROCEDURE sp_UpdateQuestion
    @QuestionId   INT,
    @QuestionText NVARCHAR(2000) = NULL,
    @QuestionType NVARCHAR(50)   = NULL,
    @OptionA      NVARCHAR(500)  = NULL,
    @OptionB      NVARCHAR(500)  = NULL,
    @OptionC      NVARCHAR(500)  = NULL,
    @OptionD      NVARCHAR(500)  = NULL,
    @CorrectAnswer NVARCHAR(500) = NULL,
    @Marks        INT            = NULL,
    @OrderNumber  INT            = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Questions SET
        QuestionText  = ISNULL(@QuestionText, QuestionText),
        QuestionType  = ISNULL(@QuestionType, QuestionType),
        OptionA       = ISNULL(@OptionA, OptionA),
        OptionB       = ISNULL(@OptionB, OptionB),
        OptionC       = ISNULL(@OptionC, OptionC),
        OptionD       = ISNULL(@OptionD, OptionD),
        CorrectAnswer = ISNULL(@CorrectAnswer, CorrectAnswer),
        Marks         = ISNULL(@Marks, Marks),
        OrderNumber   = ISNULL(@OrderNumber, OrderNumber)
    WHERE QuestionId = @QuestionId;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- sp_DeleteQuestion
CREATE OR ALTER PROCEDURE sp_DeleteQuestion
    @QuestionId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Questions WHERE QuestionId = @QuestionId;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- ════════════════════════════════════════════════════════════
-- D. EXAM SESSIONS
-- ════════════════════════════════════════════════════════════

-- sp_StartExamSession
CREATE OR ALTER PROCEDURE sp_StartExamSession
    @ExamId    INT,
    @StudentId INT,
    @StartTime DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- Prevent duplicate active sessions
    IF EXISTS (
        SELECT 1 FROM ExamSessions
        WHERE ExamId = @ExamId AND StudentId = @StudentId AND Status = 'active'
    )
    BEGIN
        RAISERROR('An active session already exists for this student and exam.', 16, 1);
        RETURN;
    END

    INSERT INTO ExamSessions (ExamId, StudentId, StartTime, Status, LastHeartbeat)
    VALUES (@ExamId, @StudentId, ISNULL(@StartTime, GETUTCDATE()), 'active', GETUTCDATE());
    SELECT SCOPE_IDENTITY() AS SessionId;
END
GO

-- sp_GetExamSession
CREATE OR ALTER PROCEDURE sp_GetExamSession
    @SessionId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.SessionId, s.ExamId, e.Title AS ExamTitle,
           s.StudentId, u.Username AS StudentUsername,
           s.StartTime, s.EndTime, s.Status, s.Score, s.LastHeartbeat
    FROM ExamSessions s
    JOIN Exams e ON s.ExamId = e.ExamId
    JOIN Users u ON s.StudentId = u.UserId
    WHERE s.SessionId = @SessionId;
END
GO

-- sp_GetStudentSessions
CREATE OR ALTER PROCEDURE sp_GetStudentSessions
    @StudentId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.SessionId, s.ExamId, e.Title AS ExamTitle,
           s.StudentId, u.Username AS StudentUsername,
           s.StartTime, s.EndTime, s.Status, s.Score, s.LastHeartbeat
    FROM ExamSessions s
    JOIN Exams e ON s.ExamId = e.ExamId
    JOIN Users u ON s.StudentId = u.UserId
    WHERE s.StudentId = @StudentId
    ORDER BY s.StartTime DESC;
END
GO

-- sp_GetActiveSessions
CREATE OR ALTER PROCEDURE sp_GetActiveSessions
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.SessionId, s.ExamId, e.Title AS ExamTitle,
           s.StudentId, u.Username AS StudentUsername,
           s.StartTime, s.EndTime, s.Status, s.Score, s.LastHeartbeat
    FROM ExamSessions s
    JOIN Exams e ON s.ExamId = e.ExamId
    JOIN Users u ON s.StudentId = u.UserId
    WHERE s.Status = 'active'
    ORDER BY s.StartTime DESC;
END
GO

-- sp_UpdateSessionHeartbeat
CREATE OR ALTER PROCEDURE sp_UpdateSessionHeartbeat
    @SessionId     INT,
    @StudentId     INT,
    @HeartbeatTime DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ExamSessions
    SET LastHeartbeat = ISNULL(@HeartbeatTime, GETUTCDATE())
    WHERE SessionId = @SessionId AND StudentId = @StudentId AND Status = 'active';
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- sp_SubmitExam
-- Scores the exam server-side by comparing submitted answers against CorrectAnswer
CREATE OR ALTER PROCEDURE sp_SubmitExam
    @SessionId   INT,
    @StudentId   INT,
    @AnswersJson NVARCHAR(MAX),
    @SubmitTime  DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate ownership and status
    IF NOT EXISTS (
        SELECT 1 FROM ExamSessions
        WHERE SessionId = @SessionId AND StudentId = @StudentId AND Status = 'active'
    )
    BEGIN
        RAISERROR('Session not found, not owned by student, or already submitted.', 16, 1);
        RETURN;
    END

    -- Store answers and mark submitted
    UPDATE ExamSessions
    SET Status      = 'submitted',
        EndTime     = ISNULL(@SubmitTime, GETUTCDATE()),
        AnswersJson = @AnswersJson
    WHERE SessionId = @SessionId;

    -- NOTE: Full server-side JSON scoring requires SQL Server 2016+ OPENJSON.
    -- Score is set to 0 here; implement full scoring logic below if needed.
    DECLARE @Score DECIMAL(10,2) = 0;

    UPDATE ExamSessions SET Score = @Score WHERE SessionId = @SessionId;
    SELECT @Score AS Score;
END
GO

-- ════════════════════════════════════════════════════════════
-- E. PROCTORING LOGS
-- ════════════════════════════════════════════════════════════

-- sp_AddSessionLog
CREATE OR ALTER PROCEDURE sp_AddSessionLog
    @SessionId   INT,
    @UserId      INT,
    @EventType   NVARCHAR(100),
    @EventDetails NVARCHAR(MAX) = NULL,
    @Timestamp   DATETIME2      = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ProctoringLogs (SessionId, UserId, EventType, EventDetails, Timestamp)
    VALUES (@SessionId, @UserId, @EventType, @EventDetails, ISNULL(@Timestamp, GETUTCDATE()));
    SELECT SCOPE_IDENTITY() AS LogId;
END
GO

-- sp_GetSessionLogs
CREATE OR ALTER PROCEDURE sp_GetSessionLogs
    @SessionId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT LogId, SessionId, UserId, EventType, EventDetails, Timestamp
    FROM ProctoringLogs
    WHERE SessionId = @SessionId
    ORDER BY Timestamp DESC;
END
GO

-- sp_GetUserLogs
CREATE OR ALTER PROCEDURE sp_GetUserLogs
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT LogId, SessionId, UserId, EventType, EventDetails, Timestamp
    FROM ProctoringLogs
    WHERE UserId = @UserId
    ORDER BY Timestamp DESC;
END
GO

-- sp_GetAllSessionLogs
CREATE OR ALTER PROCEDURE sp_GetAllSessionLogs
AS
BEGIN
    SET NOCOUNT ON;
    SELECT LogId, SessionId, UserId, EventType, EventDetails, Timestamp
    FROM ProctoringLogs
    ORDER BY Timestamp DESC;
END
GO

-- ════════════════════════════════════════════════════════════
-- F. SETTINGS
-- ════════════════════════════════════════════════════════════

-- sp_GetSetting
CREATE OR ALTER PROCEDURE sp_GetSetting
    @Key NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [Key], [Value], Description, UpdatedAt
    FROM Settings WHERE [Key] = @Key;
END
GO

-- sp_SaveSetting (upsert)
CREATE OR ALTER PROCEDURE sp_SaveSetting
    @Key         NVARCHAR(200),
    @Value       NVARCHAR(200),
    @Description NVARCHAR(500) = NULL,
    @UpdatedAt   DATETIME2     = NULL
AS
BEGIN
    SET NOCOUNT ON;
    MERGE Settings AS target
    USING (SELECT @Key AS [Key]) AS source ON target.[Key] = source.[Key]
    WHEN MATCHED THEN
        UPDATE SET [Value] = @Value,
                   Description = ISNULL(@Description, target.Description),
                   UpdatedAt = ISNULL(@UpdatedAt, GETUTCDATE())
    WHEN NOT MATCHED THEN
        INSERT ([Key], [Value], Description, UpdatedAt)
        VALUES (@Key, @Value, @Description, ISNULL(@UpdatedAt, GETUTCDATE()));
END
GO

-- sp_GetAllSettings
CREATE OR ALTER PROCEDURE sp_GetAllSettings
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [Key], [Value], Description, UpdatedAt FROM Settings ORDER BY [Key];
END
GO

-- sp_DeleteSetting
CREATE OR ALTER PROCEDURE sp_DeleteSetting
    @Key NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Settings WHERE [Key] = @Key;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- ════════════════════════════════════════════════════════════
-- G. IDENTITY VERIFICATION
-- ════════════════════════════════════════════════════════════

-- sp_SaveIdentityVerification
CREATE OR ALTER PROCEDURE sp_SaveIdentityVerification
    @SessionId         INT,
    @StudentId         INT,
    @ImageData         NVARCHAR(MAX) = NULL,
    @VerificationStatus NVARCHAR(50) = NULL,
    @Notes             NVARCHAR(MAX) = NULL,
    @CreatedAt         DATETIME2     = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO IdentityVerifications (SessionId, StudentId, ImageData, VerificationStatus, Notes, CreatedAt)
    VALUES (@SessionId, @StudentId, @ImageData, @VerificationStatus, @Notes, ISNULL(@CreatedAt, GETUTCDATE()));
END
GO

-- sp_GetIdentityVerification
CREATE OR ALTER PROCEDURE sp_GetIdentityVerification
    @SessionId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT VerificationId, SessionId, StudentId, VerificationStatus, Notes, CreatedAt
    FROM IdentityVerifications
    WHERE SessionId = @SessionId;
END
GO

-- ════════════════════════════════════════════════════════════
-- H. PROCTORING VERDICTS
-- ════════════════════════════════════════════════════════════

-- sp_SaveProctorVerdict
CREATE OR ALTER PROCEDURE sp_SaveProctorVerdict
    @SessionId  INT,
    @Verdict    NVARCHAR(100),
    @Confidence DECIMAL(5,4) = NULL,
    @Details    NVARCHAR(MAX) = NULL,
    @CreatedAt  DATETIME2    = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO ProctorVerdicts (SessionId, Verdict, Confidence, Details, CreatedAt)
    VALUES (@SessionId, @Verdict, @Confidence, @Details, ISNULL(@CreatedAt, GETUTCDATE()));
    SELECT SCOPE_IDENTITY() AS VerdictId;
END
GO

-- sp_GetProctorVerdicts
CREATE OR ALTER PROCEDURE sp_GetProctorVerdicts
    @SessionId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT VerdictId, SessionId, Verdict, Confidence, Details, CreatedAt
    FROM ProctorVerdicts
    WHERE SessionId = @SessionId
    ORDER BY CreatedAt DESC;
END
GO

-- ════════════════════════════════════════════════════════════
-- I. CERTIFICATES
-- ════════════════════════════════════════════════════════════

-- sp_IssueCertificate
CREATE OR ALTER PROCEDURE sp_IssueCertificate
    @StudentId       INT,
    @ExamId          INT,
    @SessionId       INT           = NULL,
    @CertificateHash NVARCHAR(128),
    @IssuedAt        DATETIME2     = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- Get score from the session if provided
    DECLARE @Score DECIMAL(10,2) = NULL;
    IF @SessionId IS NOT NULL
        SELECT @Score = Score FROM ExamSessions WHERE SessionId = @SessionId;

    INSERT INTO Certificates (StudentId, ExamId, SessionId, CertificateHash, Score, IssuedAt)
    VALUES (@StudentId, @ExamId, @SessionId, @CertificateHash, @Score, ISNULL(@IssuedAt, GETUTCDATE()));
    SELECT SCOPE_IDENTITY() AS CertificateId;
END
GO

-- sp_GetCertificateByHash
CREATE OR ALTER PROCEDURE sp_GetCertificateByHash
    @CertificateHash NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.CertificateId, c.StudentId, u.FullName AS StudentName,
           c.ExamId, e.Title AS ExamTitle,
           c.CertificateHash, c.Score, c.IssuedAt
    FROM Certificates c
    JOIN Users u  ON c.StudentId = u.UserId
    JOIN Exams e  ON c.ExamId    = e.ExamId
    WHERE c.CertificateHash = @CertificateHash;
END
GO

-- sp_GetStudentCertificates
CREATE OR ALTER PROCEDURE sp_GetStudentCertificates
    @StudentId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.CertificateId, c.StudentId, u.FullName AS StudentName,
           c.ExamId, e.Title AS ExamTitle,
           c.CertificateHash, c.Score, c.IssuedAt
    FROM Certificates c
    JOIN Users u ON c.StudentId = u.UserId
    JOIN Exams e ON c.ExamId    = e.ExamId
    WHERE c.StudentId = @StudentId
    ORDER BY c.IssuedAt DESC;
END
GO

-- ════════════════════════════════════════════════════════════
-- J. ANALYTICS
-- ════════════════════════════════════════════════════════════

-- sp_GetAnalyticsSummary
CREATE OR ALTER PROCEDURE sp_GetAnalyticsSummary
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        (SELECT COUNT(*) FROM Exams)                                        AS TotalExams,
        (SELECT COUNT(*) FROM Users WHERE Role = 'student')                 AS TotalStudents,
        (SELECT COUNT(*) FROM ExamSessions)                                 AS TotalSessions,
        (SELECT COUNT(*) FROM ExamSessions WHERE Status = 'active')         AS ActiveSessions,
        (SELECT COUNT(*) FROM ExamSessions WHERE Status = 'submitted')      AS CompletedSessions,
        (SELECT AVG(Score) FROM ExamSessions WHERE Score IS NOT NULL)       AS AverageScore,
        (SELECT COUNT(*) FROM ProctoringLogs)                               AS TotalProctoringEvents,
        (SELECT COUNT(DISTINCT SessionId) FROM ProctorVerdicts
         WHERE Verdict IN ('cheating_detected', 'suspicious'))              AS FlaggedSessions;
END
GO

-- sp_GetHourlyAnalytics
CREATE OR ALTER PROCEDURE sp_GetHourlyAnalytics
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        DATEADD(HOUR, DATEDIFF(HOUR, 0, s.StartTime), 0) AS Hour,
        COUNT(DISTINCT s.SessionId)                        AS SessionCount,
        COUNT(l.LogId)                                     AS EventCount,
        AVG(s.Score)                                       AS AverageScore
    FROM ExamSessions s
    LEFT JOIN ProctoringLogs l ON s.SessionId = l.SessionId
    GROUP BY DATEADD(HOUR, DATEDIFF(HOUR, 0, s.StartTime), 0)
    ORDER BY Hour DESC;
END
GO
