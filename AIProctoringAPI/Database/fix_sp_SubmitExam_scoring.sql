USE AIProctoringDB;
GO

-- Fix sp_SubmitExam to score answers properly using OPENJSON
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

    -- Get ExamId for this session
    DECLARE @ExamId INT;
    SELECT @ExamId = ExamId FROM ExamSessions WHERE SessionId = @SessionId;

    -- Score: sum marks for each question where submitted answer matches CorrectAnswer
    DECLARE @Score DECIMAL(10,2) = 0;
    DECLARE @TotalMarks INT = 0;

    SELECT
        @Score = SUM(CASE
            WHEN UPPER(LTRIM(RTRIM(j.Value))) = UPPER(LTRIM(RTRIM(q.CorrectAnswer)))
            THEN q.Marks
            ELSE 0
        END),
        @TotalMarks = SUM(q.Marks)
    FROM Questions q
    INNER JOIN OPENJSON(@AnswersJson) j
        ON CAST(j.[Key] AS INT) = q.QuestionId
    WHERE q.ExamId = @ExamId;

    -- If no matches found (e.g. empty answers), still calculate TotalMarks
    IF @TotalMarks IS NULL OR @TotalMarks = 0
        SELECT @TotalMarks = ISNULL(SUM(Marks), 0) FROM Questions WHERE ExamId = @ExamId;

    SET @Score = ISNULL(@Score, 0);

    -- Update session
    UPDATE ExamSessions
    SET Status      = 'submitted',
        EndTime     = ISNULL(@SubmitTime, GETUTCDATE()),
        AnswersJson = @AnswersJson,
        Score       = @Score
    WHERE SessionId = @SessionId;

    -- Return result
    SELECT
        @SessionId                          AS SessionId,
        @Score                              AS Score,
        @TotalMarks                         AS TotalMarks,
        ISNULL(@SubmitTime, GETUTCDATE())   AS SubmittedAt;
END
GO
