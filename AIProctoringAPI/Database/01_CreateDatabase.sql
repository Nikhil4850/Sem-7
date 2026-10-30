-- ============================================================
-- AI Proctoring System - Database Setup Script
-- Run this on: LAPTOP-5UEO3BCG\SQLEXPRESS
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AIProctoringDB')
BEGIN
    CREATE DATABASE AIProctoringDB;
    PRINT 'Database AIProctoringDB created.';
END
ELSE
    PRINT 'Database AIProctoringDB already exists.';
GO

USE AIProctoringDB;
GO

-- ── Users ─────────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserId       INT IDENTITY(1,1) PRIMARY KEY,
        Username     NVARCHAR(100) NOT NULL UNIQUE,
        Email        NVARCHAR(255) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(500) NOT NULL,
        FullName     NVARCHAR(200) NULL,
        Role         NVARCHAR(50)  NOT NULL DEFAULT 'student',
        CreatedAt    DATETIME2     NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Table Users created.';
END
GO

-- ── Exams ─────────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Exams')
BEGIN
    CREATE TABLE Exams (
        ExamId          INT IDENTITY(1,1) PRIMARY KEY,
        Title           NVARCHAR(500)  NOT NULL,
        Description     NVARCHAR(MAX)  NULL,
        DurationMinutes INT            NOT NULL DEFAULT 60,
        TotalMarks      INT            NOT NULL DEFAULT 0,
        StartTime       DATETIME2      NULL,
        EndTime         DATETIME2      NULL,
        IsActive        BIT            NOT NULL DEFAULT 1,
        CreatedBy       INT            NULL REFERENCES Users(UserId),
        CreatedAt       DATETIME2      NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Table Exams created.';
END
GO

-- ── Questions ─────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Questions')
BEGIN
    CREATE TABLE Questions (
        QuestionId   INT IDENTITY(1,1) PRIMARY KEY,
        ExamId       INT            NOT NULL REFERENCES Exams(ExamId),
        QuestionText NVARCHAR(2000) NOT NULL,
        QuestionType NVARCHAR(50)   NOT NULL DEFAULT 'MCQ',
        OptionA      NVARCHAR(500)  NULL,
        OptionB      NVARCHAR(500)  NULL,
        OptionC      NVARCHAR(500)  NULL,
        OptionD      NVARCHAR(500)  NULL,
        CorrectAnswer NVARCHAR(500) NOT NULL,
        Marks        INT            NOT NULL DEFAULT 1,
        OrderNumber  INT            NULL
    );
    PRINT 'Table Questions created.';
END
GO

-- ── ExamSessions ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ExamSessions')
BEGIN
    CREATE TABLE ExamSessions (
        SessionId      INT IDENTITY(1,1) PRIMARY KEY,
        ExamId         INT            NOT NULL REFERENCES Exams(ExamId),
        StudentId      INT            NOT NULL REFERENCES Users(UserId),
        StartTime      DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
        EndTime        DATETIME2      NULL,
        Status         NVARCHAR(50)   NOT NULL DEFAULT 'active',
        Score          DECIMAL(10,2)  NULL,
        LastHeartbeat  DATETIME2      NULL,
        AnswersJson    NVARCHAR(MAX)  NULL
    );
    PRINT 'Table ExamSessions created.';
END
GO

-- ── ProctoringLogs ────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProctoringLogs')
BEGIN
    CREATE TABLE ProctoringLogs (
        LogId        INT IDENTITY(1,1) PRIMARY KEY,
        SessionId    INT            NOT NULL REFERENCES ExamSessions(SessionId),
        UserId       INT            NOT NULL REFERENCES Users(UserId),
        EventType    NVARCHAR(100)  NOT NULL,
        EventDetails NVARCHAR(MAX)  NULL,
        Timestamp    DATETIME2      NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Table ProctoringLogs created.';
END
GO

-- ── ProctorVerdicts ───────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProctorVerdicts')
BEGIN
    CREATE TABLE ProctorVerdicts (
        VerdictId  INT IDENTITY(1,1) PRIMARY KEY,
        SessionId  INT            NOT NULL REFERENCES ExamSessions(SessionId),
        Verdict    NVARCHAR(100)  NOT NULL,
        Confidence DECIMAL(5,4)   NULL,
        Details    NVARCHAR(MAX)  NULL,
        CreatedAt  DATETIME2      NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Table ProctorVerdicts created.';
END
GO

-- ── Settings ──────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Settings')
BEGIN
    CREATE TABLE Settings (
        [Key]       NVARCHAR(200) PRIMARY KEY,
        [Value]     NVARCHAR(200) NOT NULL,
        Description NVARCHAR(500) NULL,
        UpdatedAt   DATETIME2     NULL
    );
    PRINT 'Table Settings created.';
END
GO

-- ── IdentityVerifications ─────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IdentityVerifications')
BEGIN
    CREATE TABLE IdentityVerifications (
        VerificationId     INT IDENTITY(1,1) PRIMARY KEY,
        SessionId          INT            NOT NULL REFERENCES ExamSessions(SessionId),
        StudentId          INT            NOT NULL REFERENCES Users(UserId),
        ImageData          NVARCHAR(MAX)  NULL,
        VerificationStatus NVARCHAR(50)   NULL,
        Notes              NVARCHAR(MAX)  NULL,
        CreatedAt          DATETIME2      NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Table IdentityVerifications created.';
END
GO

-- ── Certificates ──────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Certificates')
BEGIN
    CREATE TABLE Certificates (
        CertificateId   INT IDENTITY(1,1) PRIMARY KEY,
        StudentId       INT            NOT NULL REFERENCES Users(UserId),
        ExamId          INT            NOT NULL REFERENCES Exams(ExamId),
        SessionId       INT            NULL REFERENCES ExamSessions(SessionId),
        CertificateHash NVARCHAR(128)  NOT NULL UNIQUE,
        Score           DECIMAL(10,2)  NULL,
        IssuedAt        DATETIME2      NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Table Certificates created.';
END
GO
