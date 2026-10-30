USE AIProctoringDB;
GO

-- ============================================================
-- SEED DATA — AI Proctoring System
-- Passwords:
--   admin1    → Admin@123
--   teacher1  → Teacher@123
--   students  → Student@123
-- ============================================================

-- ── 1. USERS ─────────────────────────────────────────────────
MERGE Users AS target
USING (VALUES
    ('admin1',   'admin@aiproctor.edu',    '$2b$12$F.CbkuxTRn5IigfA/UoINOWWJTN3PL9xgxzKgu3rvQpfhBh2PjuHK', 'System Administrator', 'administrator'),
    ('teacher1', 'teacher@aiproctor.edu',  '$2b$12$8g29C/r/wuECL.FTbailhOt8mavkeg2hicX.6ufxqfi5dIoxUN3OC', 'Prof. Rajesh Kumar',   'teacher'),
    ('student1', 'alice@student.edu',      '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Alice Johnson',        'student'),
    ('student2', 'bob@student.edu',        '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Bob Smith',            'student'),
    ('student3', 'carol@student.edu',      '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Carol Williams',       'student'),
    ('student4', 'david@student.edu',      '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'David Brown',          'student'),
    ('student5', 'eva@student.edu',        '$2b$12$YThIDtgOg2oYRFOE2qcQQOG0lHWIly9L4DXkBgtYxdvLK1lzwt6um', 'Eva Martinez',         'student')
) AS source (Username, Email, PasswordHash, FullName, Role)
ON target.Username = source.Username
WHEN NOT MATCHED THEN
    INSERT (Username, Email, PasswordHash, FullName, Role)
    VALUES (source.Username, source.Email, source.PasswordHash, source.FullName, source.Role);
GO

-- ── 2. EXAMS ─────────────────────────────────────────────────
MERGE Exams AS target
USING (VALUES
    ('Python Fundamentals',        'Basic Python programming concepts and syntax',          60, 100, 1),
    ('Data Structures & Algorithms','Core DSA concepts: arrays, trees, graphs, sorting',   90, 150, 1),
    ('Web Development Basics',     'HTML, CSS, JavaScript fundamentals',                    45, 80,  1),
    ('Database Management',        'SQL, normalization, transactions and indexing',          60, 100, 1),
    ('Computer Networks',          'OSI model, TCP/IP, routing and switching protocols',    75, 120, 1)
) AS source (Title, Description, DurationMinutes, TotalMarks, IsActive)
ON target.Title = source.Title
WHEN NOT MATCHED THEN
    INSERT (Title, Description, DurationMinutes, TotalMarks, IsActive)
    VALUES (source.Title, source.Description, source.DurationMinutes, source.TotalMarks, source.IsActive);
GO

-- ── 3. QUESTIONS ─────────────────────────────────────────────
-- Get exam IDs
DECLARE @pyExam  INT = (SELECT TOP 1 ExamId FROM Exams WHERE Title = 'Python Fundamentals');
DECLARE @dsaExam INT = (SELECT TOP 1 ExamId FROM Exams WHERE Title = 'Data Structures & Algorithms');
DECLARE @webExam INT = (SELECT TOP 1 ExamId FROM Exams WHERE Title = 'Web Development Basics');
DECLARE @dbExam  INT = (SELECT TOP 1 ExamId FROM Exams WHERE Title = 'Database Management');
DECLARE @netExam INT = (SELECT TOP 1 ExamId FROM Exams WHERE Title = 'Computer Networks');

-- Python Fundamentals questions
IF NOT EXISTS (SELECT 1 FROM Questions WHERE ExamId = @pyExam)
BEGIN
    INSERT INTO Questions (ExamId, QuestionText, QuestionType, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Marks, OrderNumber) VALUES
    (@pyExam, 'What is the output of print(type([]))?',
        'MCQ', '<class ''list''>', '<class ''tuple''>', '<class ''array''>', '<class ''dict''>',
        'A', 10, 1),
    (@pyExam, 'Which keyword is used to define a function in Python?',
        'MCQ', 'function', 'def', 'func', 'define',
        'B', 10, 2),
    (@pyExam, 'What does the len() function return?',
        'MCQ', 'The last element', 'The sum of elements', 'The number of elements', 'The first element',
        'C', 10, 3),
    (@pyExam, 'Python is a statically typed language.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'B', 10, 4),
    (@pyExam, 'Which of the following is used for single-line comments in Python?',
        'MCQ', '//', '/* */', '#', '--',
        'C', 10, 5),
    (@pyExam, 'What is the correct way to create a dictionary in Python?',
        'MCQ', 'dict = []', 'dict = ()', 'dict = {}', 'dict = <>',
        'C', 10, 6),
    (@pyExam, 'Which method adds an element to the end of a list?',
        'MCQ', 'add()', 'insert()', 'append()', 'push()',
        'C', 10, 7),
    (@pyExam, 'What is the output of 2 ** 3 in Python?',
        'MCQ', '6', '8', '9', '5',
        'B', 10, 8),
    (@pyExam, 'Python supports multiple inheritance.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'A', 10, 9),
    (@pyExam, 'Which built-in function converts a string to an integer?',
        'MCQ', 'str()', 'float()', 'int()', 'num()',
        'C', 10, 10);
END

-- Data Structures questions
IF NOT EXISTS (SELECT 1 FROM Questions WHERE ExamId = @dsaExam)
BEGIN
    INSERT INTO Questions (ExamId, QuestionText, QuestionType, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Marks, OrderNumber) VALUES
    (@dsaExam, 'What is the time complexity of binary search?',
        'MCQ', 'O(n)', 'O(log n)', 'O(n²)', 'O(1)',
        'B', 15, 1),
    (@dsaExam, 'Which data structure uses LIFO order?',
        'MCQ', 'Queue', 'Stack', 'Array', 'Linked List',
        'B', 15, 2),
    (@dsaExam, 'A binary tree can have at most 2 children per node.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'A', 15, 3),
    (@dsaExam, 'What is the worst-case time complexity of quicksort?',
        'MCQ', 'O(n log n)', 'O(n)', 'O(n²)', 'O(log n)',
        'C', 15, 4),
    (@dsaExam, 'Which traversal visits root → left → right?',
        'MCQ', 'Inorder', 'Postorder', 'Preorder', 'Level order',
        'C', 15, 5),
    (@dsaExam, 'A hash table has O(1) average case for search.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'A', 15, 6),
    (@dsaExam, 'Which sorting algorithm is stable by default?',
        'MCQ', 'Quick Sort', 'Heap Sort', 'Merge Sort', 'Selection Sort',
        'C', 15, 7),
    (@dsaExam, 'What is a graph with no cycles called?',
        'MCQ', 'Complete graph', 'Directed graph', 'Acyclic graph', 'Weighted graph',
        'C', 15, 8),
    (@dsaExam, 'Dijkstra''s algorithm works on negative weight edges.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'B', 15, 9),
    (@dsaExam, 'What is the space complexity of merge sort?',
        'MCQ', 'O(1)', 'O(log n)', 'O(n)', 'O(n²)',
        'C', 15, 10);
END

-- Web Development questions
IF NOT EXISTS (SELECT 1 FROM Questions WHERE ExamId = @webExam)
BEGIN
    INSERT INTO Questions (ExamId, QuestionText, QuestionType, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Marks, OrderNumber) VALUES
    (@webExam, 'What does HTML stand for?',
        'MCQ', 'Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language',
        'A', 8, 1),
    (@webExam, 'Which CSS property changes text color?',
        'MCQ', 'font-color', 'text-color', 'color', 'foreground',
        'C', 8, 2),
    (@webExam, 'JavaScript is a server-side only language.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'B', 8, 3),
    (@webExam, 'Which HTML tag creates a hyperlink?',
        'MCQ', '<link>', '<a>', '<href>', '<url>',
        'B', 8, 4),
    (@webExam, 'What does CSS stand for?',
        'MCQ', 'Computer Style Sheets', 'Creative Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets',
        'C', 8, 5),
    (@webExam, 'Which JavaScript method selects an element by ID?',
        'MCQ', 'querySelector()', 'getElementById()', 'getElement()', 'selectById()',
        'B', 8, 6),
    (@webExam, 'The <div> tag is a block-level element.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'A', 8, 7),
    (@webExam, 'Which HTTP method is used to submit form data?',
        'MCQ', 'GET', 'PUT', 'POST', 'DELETE',
        'C', 8, 8),
    (@webExam, 'What is the correct HTML for an image tag?',
        'MCQ', '<image src="img.jpg">', '<img src="img.jpg">', '<img href="img.jpg">', '<picture src="img.jpg">',
        'B', 8, 9),
    (@webExam, 'CSS Flexbox is used for one-dimensional layouts.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'A', 8, 10);
END

-- Database Management questions
IF NOT EXISTS (SELECT 1 FROM Questions WHERE ExamId = @dbExam)
BEGIN
    INSERT INTO Questions (ExamId, QuestionText, QuestionType, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Marks, OrderNumber) VALUES
    (@dbExam, 'Which SQL command retrieves data from a table?',
        'MCQ', 'INSERT', 'UPDATE', 'SELECT', 'FETCH',
        'C', 10, 1),
    (@dbExam, 'What does PRIMARY KEY ensure?',
        'MCQ', 'Allows NULL values', 'Uniqueness of each row', 'Foreign key reference', 'Index creation',
        'B', 10, 2),
    (@dbExam, 'A FOREIGN KEY links two tables together.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'A', 10, 3),
    (@dbExam, 'Which normal form eliminates partial dependencies?',
        'MCQ', '1NF', '2NF', '3NF', 'BCNF',
        'B', 10, 4),
    (@dbExam, 'Which JOIN returns all rows from both tables?',
        'MCQ', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN',
        'D', 10, 5),
    (@dbExam, 'What does ACID stand for in transactions?',
        'MCQ', 'Atomicity, Consistency, Isolation, Durability', 'Access, Control, Index, Data', 'Array, Class, Interface, Data', 'None of the above',
        'A', 10, 6),
    (@dbExam, 'NULL represents an unknown or missing value in SQL.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'A', 10, 7),
    (@dbExam, 'Which aggregate function returns the total sum?',
        'MCQ', 'COUNT()', 'AVG()', 'MAX()', 'SUM()',
        'D', 10, 8),
    (@dbExam, 'A clustered index physically sorts the data.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'A', 10, 9),
    (@dbExam, 'Which command permanently saves a transaction?',
        'MCQ', 'ROLLBACK', 'SAVEPOINT', 'COMMIT', 'END',
        'C', 10, 10);
END

-- Computer Networks questions
IF NOT EXISTS (SELECT 1 FROM Questions WHERE ExamId = @netExam)
BEGIN
    INSERT INTO Questions (ExamId, QuestionText, QuestionType, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Marks, OrderNumber) VALUES
    (@netExam, 'How many layers does the OSI model have?',
        'MCQ', '4', '5', '6', '7',
        'D', 12, 1),
    (@netExam, 'Which layer of OSI handles routing?',
        'MCQ', 'Data Link', 'Network', 'Transport', 'Session',
        'B', 12, 2),
    (@netExam, 'TCP is a connection-oriented protocol.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'A', 12, 3),
    (@netExam, 'What is the default port for HTTP?',
        'MCQ', '21', '22', '80', '443',
        'C', 12, 4),
    (@netExam, 'Which protocol assigns IP addresses automatically?',
        'MCQ', 'DNS', 'FTP', 'DHCP', 'ARP',
        'C', 12, 5),
    (@netExam, 'IPv4 addresses are 128 bits long.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'B', 12, 6),
    (@netExam, 'Which device operates at the Network layer?',
        'MCQ', 'Hub', 'Switch', 'Router', 'Repeater',
        'C', 12, 7),
    (@netExam, 'What does DNS stand for?',
        'MCQ', 'Data Network System', 'Domain Name System', 'Dynamic Node Server', 'Distributed Name Service',
        'B', 12, 8),
    (@netExam, 'UDP is faster than TCP but less reliable.',
        'TrueFalse', 'True', 'False', NULL, NULL,
        'A', 12, 9),
    (@netExam, 'What is the default port for HTTPS?',
        'MCQ', '80', '8080', '443', '8443',
        'C', 12, 10);
END

-- ── 4. SETTINGS ──────────────────────────────────────────────
MERGE Settings AS target
USING (VALUES
    ('phoneConfThreshold', '0.70',  'YOLOv8 phone detection confidence threshold'),
    ('lookAwaySecs',       '2.5',   'Seconds before gaze deviation is flagged'),
    ('tabSwitchPenalty',   '25',    'Suspicion score added per tab switch'),
    ('maxSuspicionScore',  '100',   'Maximum suspicion score'),
    ('minBrightnessGuard', '30',    'Minimum brightness to run detection')
) AS source ([Key], [Value], Description)
ON target.[Key] = source.[Key]
WHEN NOT MATCHED THEN
    INSERT ([Key], [Value], Description) VALUES (source.[Key], source.[Value], source.Description)
WHEN MATCHED THEN
    UPDATE SET [Value] = source.[Value];
GO

PRINT 'Seed data inserted successfully.';
PRINT 'Login credentials:';
PRINT '  admin1    / Admin@123    (administrator)';
PRINT '  teacher1  / Teacher@123  (teacher)';
PRINT '  student1-5 / Student@123 (student)';
GO
