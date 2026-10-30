USE AIProctoringDB;
GO

-- sp_GetMyProfile
CREATE OR ALTER PROCEDURE sp_GetMyProfile
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT UserId, Username, Email, FullName, Role, Department, YearOfStudy, Phone,
           ProfilePhoto, CreatedAt
    FROM Users WHERE UserId = @UserId;
END
GO

-- sp_UpdateProfile
CREATE OR ALTER PROCEDURE sp_UpdateProfile
    @UserId     INT,
    @FullName   NVARCHAR(200) = NULL,
    @Email      NVARCHAR(255) = NULL,
    @Department NVARCHAR(100) = NULL,
    @YearOfStudy NVARCHAR(50) = NULL,
    @Phone      NVARCHAR(20)  = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users SET
        FullName    = ISNULL(@FullName,    FullName),
        Email       = ISNULL(@Email,       Email),
        Department  = ISNULL(@Department,  Department),
        YearOfStudy = ISNULL(@YearOfStudy, YearOfStudy),
        Phone       = ISNULL(@Phone,       Phone)
    WHERE UserId = @UserId;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- sp_UpdateProfilePhoto
CREATE OR ALTER PROCEDURE sp_UpdateProfilePhoto
    @UserId       INT,
    @ProfilePhoto NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users SET ProfilePhoto = @ProfilePhoto WHERE UserId = @UserId;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

PRINT 'Profile procedures created.';
GO
