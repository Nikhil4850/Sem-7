USE AIProctoringDB;
GO

-- Fix sp_StartExamSession to resume existing active sessions instead of throwing an error
CREATE OR ALTER PROCEDURE sp_StartExamSession
    @ExamId    INT,
    @StudentId INT,
    @StartTime DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- If an active session already exists, return it (resume)
    DECLARE @ExistingId INT;
    SELECT @ExistingId = SessionId
    FROM ExamSessions
    WHERE ExamId = @ExamId AND StudentId = @StudentId AND Status = 'active';

    IF @ExistingId IS NOT NULL
    BEGIN
        SELECT @ExistingId AS SessionId;
        RETURN;
    END

    -- Also resume a submitted session for retakes — mark old one completed first
    UPDATE ExamSessions
    SET Status = 'completed'
    WHERE ExamId = @ExamId AND StudentId = @StudentId AND Status = 'submitted';

    -- Create new session
    INSERT INTO ExamSessions (ExamId, StudentId, StartTime, Status, LastHeartbeat)
    VALUES (@ExamId, @StudentId, ISNULL(@StartTime, GETUTCDATE()), 'active', GETUTCDATE());

    SELECT SCOPE_IDENTITY() AS SessionId;
END
GO
