IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250812115656_InitialCreate', N'5.0.17');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [ProfileUsers] (
    [Id] nvarchar(450) NOT NULL,
    [LastName] nvarchar(100) NOT NULL,
    [FirstName] nvarchar(100) NOT NULL,
    [MiddleName] nvarchar(100) NULL,
    [Position] nvarchar(200) NULL,
    [Email] nvarchar(256) NULL,
    CONSTRAINT [PK_ProfileUsers] PRIMARY KEY ([Id])
);
GO

ALTER TABLE [UserDepartments] ADD CONSTRAINT [FK_UserDepartments_ProfileUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [ProfileUsers] ([Id]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250925111405_CreateProfileUserTable', N'5.0.17');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [SigningEmployees] (
    [Id] int NOT NULL IDENTITY,
    [LastName] nvarchar(100) NOT NULL,
    [FirstName] nvarchar(100) NOT NULL,
    [MiddleName] nvarchar(100) NULL,
    [Position] nvarchar(200) NOT NULL,
    [WarrantNumber] nvarchar(50) NULL,
    [StartDate] datetime2 NULL,
    [EndDate] datetime2 NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [CreatedBy] nvarchar(256) NULL,
    [UpdatedBy] nvarchar(256) NULL,
    CONSTRAINT [PK_SigningEmployees] PRIMARY KEY ([Id])
);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251014091211_AddSigningEmployeesTable', N'5.0.17');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Contractors] (
    [Id] uniqueidentifier NOT NULL,
    [LastName] nvarchar(100) NOT NULL,
    [FirstName] nvarchar(100) NOT NULL,
    [MiddleName] nvarchar(100) NULL,
    [DocumentType] nvarchar(50) NOT NULL,
    [DocumentSeries] nvarchar(20) NULL,
    [DocumentNumber] nvarchar(50) NOT NULL,
    [Citizenship] nvarchar(100) NULL,
    [IssueDate] datetime2 NULL,
    [IssuedBy] nvarchar(500) NULL,
    [IdentificationNumber] nvarchar(50) NULL,
    [MobilePhone] nvarchar(20) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Contractors] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Addresses] (
    [Id] uniqueidentifier NOT NULL,
    [ContractorId] uniqueidentifier NOT NULL,
    [Country] nvarchar(100) NOT NULL,
    [Region] nvarchar(100) NULL,
    [City] nvarchar(100) NULL,
    [District] nvarchar(100) NULL,
    [Settlement] nvarchar(100) NULL,
    [StreetType] nvarchar(50) NULL,
    [StreetName] nvarchar(200) NULL,
    [House] nvarchar(20) NULL,
    [Building] nvarchar(20) NULL,
    [Apartment] nvarchar(20) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Addresses] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Addresses_Contractors_ContractorId] FOREIGN KEY ([ContractorId]) REFERENCES [Contractors] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [BankDetails] (
    [Id] uniqueidentifier NOT NULL,
    [ContractorId] uniqueidentifier NOT NULL,
    [IBAN] nvarchar(34) NOT NULL,
    [BankName] nvarchar(255) NOT NULL,
    [BIC] nvarchar(20) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_BankDetails] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_BankDetails_Contractors_ContractorId] FOREIGN KEY ([ContractorId]) REFERENCES [Contractors] ([Id]) ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX [IX_Addresses_ContractorId] ON [Addresses] ([ContractorId]);
GO

CREATE UNIQUE INDEX [IX_BankDetails_ContractorId] ON [BankDetails] ([ContractorId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251015112548_AddContractorTables', N'5.0.17');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Contractors]') AND [c].[name] = N'UpdatedAt');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Contractors] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [Contractors] ADD DEFAULT (GETUTCDATE()) FOR [UpdatedAt];
GO

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Contractors]') AND [c].[name] = N'CreatedAt');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Contractors] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [Contractors] ADD DEFAULT (GETUTCDATE()) FOR [CreatedAt];
GO

DECLARE @var2 sysname;
SELECT @var2 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[BankDetails]') AND [c].[name] = N'UpdatedAt');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [BankDetails] DROP CONSTRAINT [' + @var2 + '];');
ALTER TABLE [BankDetails] ADD DEFAULT (GETUTCDATE()) FOR [UpdatedAt];
GO

DECLARE @var3 sysname;
SELECT @var3 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[BankDetails]') AND [c].[name] = N'CreatedAt');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [BankDetails] DROP CONSTRAINT [' + @var3 + '];');
ALTER TABLE [BankDetails] ADD DEFAULT (GETUTCDATE()) FOR [CreatedAt];
GO

DECLARE @var4 sysname;
SELECT @var4 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Addresses]') AND [c].[name] = N'UpdatedAt');
IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [Addresses] DROP CONSTRAINT [' + @var4 + '];');
ALTER TABLE [Addresses] ADD DEFAULT (GETUTCDATE()) FOR [UpdatedAt];
GO

DECLARE @var5 sysname;
SELECT @var5 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Addresses]') AND [c].[name] = N'CreatedAt');
IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [Addresses] DROP CONSTRAINT [' + @var5 + '];');
ALTER TABLE [Addresses] ADD DEFAULT (GETUTCDATE()) FOR [CreatedAt];
GO

CREATE TABLE [Contracts] (
    [Id] uniqueidentifier NOT NULL,
    [ContractNumber] nvarchar(50) NOT NULL,
    [ContractDate] datetime2 NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [ContractorId] uniqueidentifier NOT NULL,
    [DepartmentId] int NOT NULL,
    [SigningEmployeeId] int NULL,
    [ContractType] nvarchar(20) NOT NULL,
    [ContractTemplateName] nvarchar(200) NOT NULL,
    [ExecutorUserId] uniqueidentifier NOT NULL,
    [Processed] bit NOT NULL,
    [TransferDate] datetime2 NULL,
    [GalaxyEntryDate] datetime2 NULL,
    [OKEmployee] nvarchar(100) NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    CONSTRAINT [PK_Contracts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Contracts_Contractors_ContractorId] FOREIGN KEY ([ContractorId]) REFERENCES [Contractors] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Contracts_Departments_DepartmentId] FOREIGN KEY ([DepartmentId]) REFERENCES [Departments] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Contracts_SigningEmployees_SigningEmployeeId] FOREIGN KEY ([SigningEmployeeId]) REFERENCES [SigningEmployees] ([Id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [ContractWorkServices] (
    [Id] uniqueidentifier NOT NULL,
    [ContractId] uniqueidentifier NOT NULL,
    [WorkServiceName] nvarchar(500) NOT NULL,
    [Cost] decimal(18,2) NOT NULL,
    [OperationCount] int NULL,
    [HoursCount] decimal(10,2) NULL,
    [FixedCost] decimal(18,2) NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    CONSTRAINT [PK_ContractWorkServices] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ContractWorkServices_Contracts_ContractId] FOREIGN KEY ([ContractId]) REFERENCES [Contracts] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_Contracts_ContractDate] ON [Contracts] ([ContractDate]);
GO

CREATE UNIQUE INDEX [IX_Contracts_ContractNumber] ON [Contracts] ([ContractNumber]);
GO

CREATE INDEX [IX_Contracts_ContractorId] ON [Contracts] ([ContractorId]);
GO

CREATE INDEX [IX_Contracts_DepartmentId] ON [Contracts] ([DepartmentId]);
GO

CREATE INDEX [IX_Contracts_EndDate] ON [Contracts] ([EndDate]);
GO

CREATE INDEX [IX_Contracts_Processed] ON [Contracts] ([Processed]);
GO

CREATE INDEX [IX_Contracts_SigningEmployeeId] ON [Contracts] ([SigningEmployeeId]);
GO

CREATE INDEX [IX_Contracts_StartDate] ON [Contracts] ([StartDate]);
GO

CREATE INDEX [IX_ContractWorkServices_ContractId] ON [ContractWorkServices] ([ContractId]);
GO

CREATE INDEX [IX_ContractWorkServices_WorkServiceName] ON [ContractWorkServices] ([WorkServiceName]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251022122900_AddContractsAndWorkServices', N'5.0.17');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [ContractTemplates] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(200) NOT NULL,
    [Type] nvarchar(20) NOT NULL,
    [WorkServicesJson] nvarchar(max) NOT NULL,
    [OperationsPer8Hours] int NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    CONSTRAINT [PK_ContractTemplates] PRIMARY KEY ([Id])
);
GO

CREATE UNIQUE INDEX [IX_ContractTemplates_Name_Type] ON [ContractTemplates] ([Name], [Type]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251022133424_AddContractTemplates', N'5.0.17');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DROP INDEX [IX_ContractTemplates_Name_Type] ON [ContractTemplates];
GO

EXEC sp_rename N'[Contracts].[ContractType]', N'ContractTypeCode', N'COLUMN';
GO

DECLARE @var6 sysname;
SELECT @var6 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[SigningEmployees]') AND [c].[name] = N'CreatedAt');
IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [SigningEmployees] DROP CONSTRAINT [' + @var6 + '];');
ALTER TABLE [SigningEmployees] ADD DEFAULT (GETUTCDATE()) FOR [CreatedAt];
GO

ALTER TABLE [ContractTemplates] ADD [ContractTypeId] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [Contracts] ADD [ContractTypeId] int NOT NULL DEFAULT 0;
GO

CREATE TABLE [ContractTypes] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(50) NOT NULL,
    [Code] nvarchar(20) NOT NULL,
    [Description] nvarchar(200) NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    CONSTRAINT [PK_ContractTypes] PRIMARY KEY ([Id])
);
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'Description', N'Name', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[ContractTypes]'))
    SET IDENTITY_INSERT [ContractTypes] ON;
INSERT INTO [ContractTypes] ([Id], [Code], [CreatedAt], [Description], [Name], [UpdatedAt])
VALUES (1, N'operation', '2025-10-23T06:53:29.8763055Z', N'Оплата за каждую выполненную операцию', N'За операцию', '2025-10-23T06:53:29.8763171Z');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'Description', N'Name', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[ContractTypes]'))
    SET IDENTITY_INSERT [ContractTypes] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'Description', N'Name', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[ContractTypes]'))
    SET IDENTITY_INSERT [ContractTypes] ON;
INSERT INTO [ContractTypes] ([Id], [Code], [CreatedAt], [Description], [Name], [UpdatedAt])
VALUES (2, N'norm-hour', '2025-10-23T06:53:29.8763265Z', N'Оплата по нормо-часам работы', N'Нормо-часа', '2025-10-23T06:53:29.8763266Z');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'Description', N'Name', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[ContractTypes]'))
    SET IDENTITY_INSERT [ContractTypes] OFF;
GO

IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'Description', N'Name', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[ContractTypes]'))
    SET IDENTITY_INSERT [ContractTypes] ON;
INSERT INTO [ContractTypes] ([Id], [Code], [CreatedAt], [Description], [Name], [UpdatedAt])
VALUES (3, N'cost', '2025-10-23T06:53:29.8763269Z', N'Фиксированная стоимость работ/услуг', N'Стоимость', '2025-10-23T06:53:29.8763270Z');
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'Description', N'Name', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[ContractTypes]'))
    SET IDENTITY_INSERT [ContractTypes] OFF;
GO

CREATE INDEX [IX_ContractTemplates_ContractTypeId] ON [ContractTemplates] ([ContractTypeId]);
GO

CREATE UNIQUE INDEX [IX_ContractTemplates_Name_ContractTypeId] ON [ContractTemplates] ([Name], [ContractTypeId]);
GO

CREATE INDEX [IX_Contracts_ContractTypeId] ON [Contracts] ([ContractTypeId]);
GO

CREATE UNIQUE INDEX [IX_ContractTypes_Code] ON [ContractTypes] ([Code]);
GO

ALTER TABLE [Contracts] ADD CONSTRAINT [FK_Contracts_ContractTypes_ContractTypeId] FOREIGN KEY ([ContractTypeId]) REFERENCES [ContractTypes] ([Id]) ON DELETE NO ACTION;
GO

ALTER TABLE [ContractTemplates] ADD CONSTRAINT [FK_ContractTemplates_ContractTypes_ContractTypeId] FOREIGN KEY ([ContractTypeId]) REFERENCES [ContractTypes] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251023065330_AddContractTypes', N'5.0.17');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ContractTemplates] ADD [Cost] decimal(18,2) NOT NULL DEFAULT 0.0;
GO

ALTER TABLE [ContractTemplates] ADD [CreatedBy] nvarchar(max) NULL;
GO

ALTER TABLE [ContractTemplates] ADD [DepartmentId] int NOT NULL DEFAULT 1;
GO

ALTER TABLE [ContractTemplates] ADD [UpdatedBy] nvarchar(max) NULL;
GO

CREATE TABLE [ActTemplates] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(200) NOT NULL,
    [ContractTypeId] int NOT NULL,
    [WorkServicesJson] nvarchar(max) NOT NULL,
    [DepartmentId] int NOT NULL,
    [TotalCost] decimal(18,2) NOT NULL DEFAULT 0.0,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    CONSTRAINT [PK_ActTemplates] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ActTemplates_ContractTypes_ContractTypeId] FOREIGN KEY ([ContractTypeId]) REFERENCES [ContractTypes] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_ActTemplates_Departments_DepartmentId] FOREIGN KEY ([DepartmentId]) REFERENCES [Departments] ([Id]) ON DELETE NO ACTION
);
GO

UPDATE [ContractTypes] SET [CreatedAt] = '2025-10-23T21:13:46.6524575Z', [UpdatedAt] = '2025-10-23T21:13:46.6524690Z'
WHERE [Id] = 1;
SELECT @@ROWCOUNT;

GO

UPDATE [ContractTypes] SET [CreatedAt] = '2025-10-23T21:13:46.6524780Z', [UpdatedAt] = '2025-10-23T21:13:46.6524780Z'
WHERE [Id] = 2;
SELECT @@ROWCOUNT;

GO

UPDATE [ContractTypes] SET [CreatedAt] = '2025-10-23T21:13:46.6524783Z', [UpdatedAt] = '2025-10-23T21:13:46.6524784Z'
WHERE [Id] = 3;
SELECT @@ROWCOUNT;

GO

CREATE INDEX [IX_ContractTemplates_DepartmentId] ON [ContractTemplates] ([DepartmentId]);
GO

CREATE INDEX [IX_ContractTemplates_Name] ON [ContractTemplates] ([Name]);
GO

CREATE INDEX [IX_ActTemplates_ContractTypeId] ON [ActTemplates] ([ContractTypeId]);
GO

CREATE INDEX [IX_ActTemplates_DepartmentId] ON [ActTemplates] ([DepartmentId]);
GO

CREATE INDEX [IX_ActTemplates_Name] ON [ActTemplates] ([Name]);
GO

ALTER TABLE [ContractTemplates] ADD CONSTRAINT [FK_ContractTemplates_Departments_DepartmentId] FOREIGN KEY ([DepartmentId]) REFERENCES [Departments] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251023211346_AddActTemplatesTableFixed', N'5.0.17');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DECLARE @var7 sysname;
SELECT @var7 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ContractTemplates]') AND [c].[name] = N'OperationsPer8Hours');
IF @var7 IS NOT NULL EXEC(N'ALTER TABLE [ContractTemplates] DROP CONSTRAINT [' + @var7 + '];');
ALTER TABLE [ContractTemplates] DROP COLUMN [OperationsPer8Hours];
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251023212957_RemoveOperationsPer8HoursFromContractTemplates', N'5.0.17');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ContractTemplates] DROP CONSTRAINT [FK_ContractTemplates_Departments_DepartmentId];
GO

DROP INDEX [IX_ContractTemplates_DepartmentId] ON [ContractTemplates];
GO

DECLARE @var8 sysname;
SELECT @var8 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ContractTemplates]') AND [c].[name] = N'Cost');
IF @var8 IS NOT NULL EXEC(N'ALTER TABLE [ContractTemplates] DROP CONSTRAINT [' + @var8 + '];');
ALTER TABLE [ContractTemplates] DROP COLUMN [Cost];
GO

DECLARE @var9 sysname;
SELECT @var9 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ContractTemplates]') AND [c].[name] = N'DepartmentId');
IF @var9 IS NOT NULL EXEC(N'ALTER TABLE [ContractTemplates] DROP CONSTRAINT [' + @var9 + '];');
ALTER TABLE [ContractTemplates] DROP COLUMN [DepartmentId];
GO

ALTER TABLE [ActTemplates] ADD [ContractTemplateId] int NOT NULL DEFAULT 0;
GO

CREATE INDEX [IX_ActTemplates_ContractTemplateId] ON [ActTemplates] ([ContractTemplateId]);
GO

ALTER TABLE [ActTemplates] ADD CONSTRAINT [FK_ActTemplates_ContractTemplates_ContractTemplateId] FOREIGN KEY ([ContractTemplateId]) REFERENCES [ContractTemplates] ([Id]) ON DELETE NO ACTION;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251024065428_FixContractTemplateStructure', N'5.0.17');
GO

COMMIT;
GO

