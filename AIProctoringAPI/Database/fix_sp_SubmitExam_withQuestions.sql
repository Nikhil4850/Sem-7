USE AIProctoringDB;
GO

-- Fix sp_SubmitExam to also return questions with correct answers for result screen
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

    -- Get ExamId
    DECLARE @ExamId INT;
    SELECT @ExamId = ExamId FROM ExamSessions WHERE SessionId = @SessionId;

    -- Score: sum marks where answer matches CorrectAnswer
    DECLARE @Score      DECIMAL(10,2) = 0;
    DECLARE @TotalMarks INT           = 0;

    SELECT
        @Score = ISNULL(SUM(CASE
            WHEN UPPER(LTRIM(RTRIM(j.[Value]))) = UPPER(LTRIM(RTRIM(q.CorrectAnswer)))
            THEN q.Marks ELSE 0
        END), 0),
        @TotalMarks = ISNULL(SUM(q.Marks), 0)
    FROM Questions q
    INNER JOIN OPENJSON(@AnswersJson) j
        ON TRY_CAST(j.[Key] AS INT) = q.QuestionId
    WHERE q.ExamId = @ExamId;

    -- Fallback total marks if no answers matched
    IF @TotalMarks = 0
        SELECT @TotalMarks = ISNULL(SUM(Marks), 0) FROM Questions WHERE ExamId = @ExamId;

    -- Update session
    UPDATE ExamSessions
    SET Status      = 'submitted',
        EndTime     = ISNULL(@SubmitTime, GETUTCDATE()),
        AnswersJson = @AnswersJson,
        Score       = @Score
    WHERE SessionId = @SessionId;

    -- Result row
    SELECT
        @SessionId                        AS SessionId,
        @Score                            AS Score,
        @TotalMarks                       AS TotalMarks,
        ISNULL(@SubmitTime, GETUTCDATE()) AS SubmittedAt;

    -- Return questions WITH correct answers for the result screen
    SELECT
        QuestionId,
        ExamId,
        QuestionText,
        QuestionType,
        OptionA,
        OptionB,
        OptionC,
        OptionD,
        CorrectAnswer,   -- revealed after submission
        Marks,
        OrderNumber
    FROM Questions
    WHERE ExamId = @ExamId
    ORDER BY ISNULL(OrderNumber, QuestionId);
END
GO

PRINT 'sp_SubmitExam updated to return questions with correct answers.';
GO
