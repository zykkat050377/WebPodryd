// WebPodryd_System/Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using System;
using WebPodryd_System.Models;

namespace WebPodryd_System.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Пользователи и департаменты
        public DbSet<ProfileUser> ProfileUsers { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<UserDepartment> UserDepartments { get; set; }
        public DbSet<SigningEmployee> SigningEmployees { get; set; }

        // Подрядчики и их данные
        public DbSet<Contractor> Contractors { get; set; }
        public DbSet<BankDetail> BankDetails { get; set; }
        public DbSet<Address> Addresses { get; set; }

        // Договоры и шаблоны
        public DbSet<Contract> Contracts { get; set; }
        public DbSet<ContractWorkService> ContractWorkServices { get; set; }
        public DbSet<ContractTemplate> ContractTemplates { get; set; }
        public DbSet<ContractType> ContractTypes { get; set; }

        // НОВЫЙ DbSet для ActTemplates
        public DbSet<ActTemplate> ActTemplates { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Конфигурация для UserDepartment
            modelBuilder.Entity<UserDepartment>()
                .HasKey(ud => new { ud.UserId, ud.DepartmentId });

            modelBuilder.Entity<UserDepartment>()
                .HasOne(ud => ud.User)
                .WithMany(u => u.UserDepartments)
                .HasForeignKey(ud => ud.UserId);

            modelBuilder.Entity<UserDepartment>()
                .HasOne(ud => ud.Department)
                .WithMany()
                .HasForeignKey(ud => ud.DepartmentId);

            // Конфигурация для Department
            modelBuilder.Entity<Department>(entity =>
            {
                entity.Property(d => d.Name).IsRequired().HasMaxLength(100);
                entity.Property(d => d.Code).HasMaxLength(50);
            });

            // Конфигурация для ProfileUser
            modelBuilder.Entity<ProfileUser>(entity =>
            {
                entity.Property(u => u.LastName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.MiddleName).HasMaxLength(100);
                entity.Property(u => u.Position).HasMaxLength(200);
                entity.Property(u => u.Email).HasMaxLength(256);
            });

            // Конфигурация для SigningEmployee
            modelBuilder.Entity<SigningEmployee>(entity =>
            {
                entity.Property(se => se.LastName).IsRequired().HasMaxLength(100);
                entity.Property(se => se.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(se => se.MiddleName).HasMaxLength(100);
                entity.Property(se => se.Position).IsRequired().HasMaxLength(200);
                entity.Property(se => se.WarrantNumber).HasMaxLength(50);
                entity.Property(se => se.CreatedBy).HasMaxLength(256);
                entity.Property(se => se.UpdatedBy).HasMaxLength(256);
            });

            // Конфигурация для Contractor
            modelBuilder.Entity<Contractor>(entity =>
            {
                entity.Property(c => c.LastName).IsRequired().HasMaxLength(100);
                entity.Property(c => c.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(c => c.MiddleName).HasMaxLength(100);
                entity.Property(c => c.DocumentType).IsRequired().HasMaxLength(50);
                entity.Property(c => c.DocumentSeries).HasMaxLength(20);
                entity.Property(c => c.DocumentNumber).IsRequired().HasMaxLength(50);
                entity.Property(c => c.Citizenship).HasMaxLength(100);
                entity.Property(c => c.IssuedBy).HasMaxLength(500);
                entity.Property(c => c.IdentificationNumber).HasMaxLength(50);
                entity.Property(c => c.MobilePhone).HasMaxLength(20);
            });

            // Конфигурация для BankDetail
            modelBuilder.Entity<BankDetail>(entity =>
            {
                entity.Property(bd => bd.IBAN).IsRequired().HasMaxLength(34);
                entity.Property(bd => bd.BankName).IsRequired().HasMaxLength(255);
                entity.Property(bd => bd.BIC).IsRequired().HasMaxLength(20);
            });

            // Конфигурация для Address
            modelBuilder.Entity<Address>(entity =>
            {
                entity.Property(a => a.Country).IsRequired().HasMaxLength(100);
                entity.Property(a => a.Region).HasMaxLength(100);
                entity.Property(a => a.City).HasMaxLength(100);
                entity.Property(a => a.District).HasMaxLength(100);
                entity.Property(a => a.Settlement).HasMaxLength(100);
                entity.Property(a => a.StreetType).HasMaxLength(50);
                entity.Property(a => a.StreetName).HasMaxLength(200);
                entity.Property(a => a.House).HasMaxLength(20);
                entity.Property(a => a.Building).HasMaxLength(20);
                entity.Property(a => a.Apartment).HasMaxLength(20);
            });

            // Конфигурация для Contract
            modelBuilder.Entity<Contract>(entity =>
            {
                entity.Property(c => c.ContractNumber).IsRequired().HasMaxLength(50);
                entity.Property(c => c.ContractTypeCode).IsRequired().HasMaxLength(20);
                entity.Property(c => c.ContractTemplateName).IsRequired().HasMaxLength(200);
                entity.Property(c => c.OKEmployee).HasMaxLength(100);

                // Связи
                entity.HasOne(c => c.Contractor)
                      .WithMany()
                      .HasForeignKey(c => c.ContractorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Department)
                      .WithMany()
                      .HasForeignKey(c => c.DepartmentId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.SigningEmployee)
                      .WithMany()
                      .HasForeignKey(c => c.SigningEmployeeId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.ContractType)
                      .WithMany(ct => ct.Contracts)
                      .HasForeignKey(c => c.ContractTypeId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Индексы
                entity.HasIndex(c => c.ContractNumber).IsUnique();
                entity.HasIndex(c => c.ContractDate);
                entity.HasIndex(c => c.StartDate);
                entity.HasIndex(c => c.EndDate);
                entity.HasIndex(c => c.Processed);
                entity.HasIndex(c => c.ContractorId);
                entity.HasIndex(c => c.DepartmentId);
                entity.HasIndex(c => c.SigningEmployeeId);
                entity.HasIndex(c => c.ContractTypeId);
            });

            // Конфигурация для ContractWorkService
            modelBuilder.Entity<ContractWorkService>(entity =>
            {
                entity.Property(ws => ws.WorkServiceName).IsRequired().HasMaxLength(500);
                entity.Property(ws => ws.Cost).HasColumnType("decimal(18,2)");
                entity.Property(ws => ws.FixedCost).HasColumnType("decimal(18,2)");
                entity.Property(ws => ws.HoursCount).HasColumnType("decimal(10,2)");

                // Связь с договором
                entity.HasOne(ws => ws.Contract)
                      .WithMany(c => c.WorkServices)
                      .HasForeignKey(ws => ws.ContractId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Индексы
                entity.HasIndex(ws => ws.ContractId);
                entity.HasIndex(ws => ws.WorkServiceName);
            });

            // В методе OnModelCreating:
            modelBuilder.Entity<ContractTemplate>(entity =>
            {
                entity.Property(t => t.Name).IsRequired().HasMaxLength(200);
                entity.Property(t => t.Type).IsRequired().HasMaxLength(20);
                entity.Property(t => t.WorkServicesJson).IsRequired();

                // Связь с ContractType
                entity.HasOne(ct => ct.ContractType)
                      .WithMany(ct => ct.ContractTemplates)
                      .HasForeignKey(ct => ct.ContractTypeId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Индексы
                entity.HasIndex(t => t.Name);
                entity.HasIndex(t => t.ContractTypeId);

                // Значения по умолчанию
                entity.Property(t => t.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(t => t.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            modelBuilder.Entity<ActTemplate>(entity =>
            {
                entity.Property(at => at.Name).IsRequired().HasMaxLength(200);
                entity.Property(at => at.WorkServicesJson).IsRequired();
                entity.Property(at => at.TotalCost).HasColumnType("decimal(18,2)").IsRequired();

                // Связи
                entity.HasOne(at => at.ContractType)
                      .WithMany()
                      .HasForeignKey(at => at.ContractTypeId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(at => at.ContractTemplate)
                      .WithMany(ct => ct.ActTemplates)
                      .HasForeignKey(at => at.ContractTemplateId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(at => at.Department)
                      .WithMany()
                      .HasForeignKey(at => at.DepartmentId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Индексы
                entity.HasIndex(at => at.ContractTypeId);
                entity.HasIndex(at => at.ContractTemplateId);
                entity.HasIndex(at => at.DepartmentId);
                entity.HasIndex(at => at.Name);

                // Значения по умолчанию
                entity.Property(at => at.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(at => at.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(at => at.TotalCost).HasDefaultValue(0);
            });

            // Конфигурация для ContractType
            modelBuilder.Entity<ContractType>(entity =>
            {
                entity.Property(ct => ct.Name).IsRequired().HasMaxLength(50);
                entity.Property(ct => ct.Code).IsRequired().HasMaxLength(20);
                entity.Property(ct => ct.Description).HasMaxLength(200);

                entity.HasIndex(ct => ct.Code).IsUnique();

                entity.Property(ct => ct.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(ct => ct.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // НОВАЯ КОНФИГУРАЦИЯ ДЛЯ ActTemplate
            modelBuilder.Entity<ActTemplate>(entity =>
            {
                entity.Property(at => at.Name).IsRequired().HasMaxLength(200);
                entity.Property(at => at.WorkServicesJson).IsRequired();
                entity.Property(at => at.TotalCost).HasColumnType("decimal(18,2)").IsRequired();

                // Связи
                entity.HasOne(at => at.ContractType)
                      .WithMany()
                      .HasForeignKey(at => at.ContractTypeId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(at => at.Department)
                      .WithMany()
                      .HasForeignKey(at => at.DepartmentId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Индексы
                entity.HasIndex(at => at.ContractTypeId);
                entity.HasIndex(at => at.DepartmentId);
                entity.HasIndex(at => at.Name);

                // Значения по умолчанию
                entity.Property(at => at.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(at => at.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(at => at.TotalCost).HasDefaultValue(0);
            });

            // Связи для BankDetail и Address
            modelBuilder.Entity<BankDetail>()
                .HasOne(bd => bd.Contractor)
                .WithOne(c => c.BankDetail)
                .HasForeignKey<BankDetail>(bd => bd.ContractorId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Address>()
                .HasOne(a => a.Contractor)
                .WithOne(c => c.Address)
                .HasForeignKey<Address>(a => a.ContractorId)
                .OnDelete(DeleteBehavior.Cascade);

            // Установка значений по умолчанию
            modelBuilder.Entity<Contract>()
                .Property(c => c.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Contract>()
                .Property(c => c.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<ContractWorkService>()
                .Property(ws => ws.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<ContractWorkService>()
                .Property(ws => ws.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Contractor>()
                .Property(c => c.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Contractor>()
                .Property(c => c.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<BankDetail>()
                .Property(bd => bd.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<BankDetail>()
                .Property(bd => bd.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Address>()
                .Property(a => a.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<Address>()
                .Property(a => a.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            modelBuilder.Entity<SigningEmployee>()
                .Property(se => se.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Данные по умолчанию для ContractTypes
            modelBuilder.Entity<ContractType>().HasData(
                new ContractType
                {
                    Id = 1,
                    Name = "За операцию",
                    Code = "operation",
                    Description = "Оплата за каждую выполненную операцию",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new ContractType
                {
                    Id = 2,
                    Name = "Нормо-часа",
                    Code = "norm-hour",
                    Description = "Оплата по нормо-часам работы",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new ContractType
                {
                    Id = 3,
                    Name = "Стоимость",
                    Code = "cost",
                    Description = "Фиксированная стоимость работ/услуг",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            );
        }
    }
}