USE AIProctoringDB;
GO

CREATE OR ALTER PROCEDURE sp_SubmitExam
    @SessionId   INT,
    @StudentId   INT,
    @AnswersJson NVARCHAR(MAX),  -- JSON: {"questionId": "answer", ...}
    @SubmitTime  DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate ownership and active status
    IF NOT EXISTS (
        SELECT 1 FROM ExamSessions
        WHERE SessionId = @SessionId
          AND StudentId = @StudentId
          AND Status = 'active'
    )
    BEGIN
        RAISERROR('Session not found, not owned by this student, or already submitted.', 16, 1);
        RETURN;
    END

    -- Get ExamId for this session
    DECLARE @ExamId INT;
    SELECT @ExamId = ExamId FROM ExamSessions WHERE SessionId = @SessionId;

    -- Parse submitted answers from JSON and score server-side
    -- AnswersJson format: {"6": "B", "7": "C"}  (QuestionId -> Answer)
    DECLARE @Score      DECIMAL(10,2) = 0;
    DECLARE @TotalMarks INT = 0;

    SELECT @TotalMarks = SUM(Marks) FROM Questions WHERE ExamId = @ExamId;

    -- Compare each submitted answer against CorrectAnswer
    SELECT @Score = ISNULL(SUM(
        CASE
            WHEN UPPER(LTRIM(RTRIM(a.[value]))) = UPPER(LTRIM(RTRIM(q.CorrectAnswer)))
            THEN q.Marks
            ELSE 0
        END
    ), 0)
    FROM Questions q
    JOIN OPENJSON(@AnswersJson) AS a
        ON q.QuestionId = CAST(a.[key] AS INT)
    WHERE q.ExamId = @ExamId;

    -- Mark session as submitted
    UPDATE ExamSessions
    SET Status      = 'submitted',
        EndTime     = ISNULL(@SubmitTime, GETUTCDATE()),
        AnswersJson = @AnswersJson,
        Score       = @Score
    WHERE SessionId = @SessionId;

    -- Return result
    SELECT
        @SessionId   AS SessionId,
        @Score       AS Score,
        @TotalMarks  AS TotalMarks,
        GETUTCDATE() AS SubmittedAt;
END
GO
