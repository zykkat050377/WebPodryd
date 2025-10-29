// WebPodryd_System/Startup.cs
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using WebPodryd_System.Data;
using WebPodryd_System.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;

namespace WebPodryd_System
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    Configuration.GetConnectionString("SystemDbConnection")));

            // Добавляем аутентификацию JWT
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = Configuration["JwtSettings:Issuer"],
                        ValidAudience = Configuration["JwtSettings:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(Configuration["JwtSettings:Secret"]))
                    };
                });

            // Добавляем авторизацию
            services.AddAuthorization();

            // Регистрируем HttpClient для IdentityServiceClient
            services.AddHttpClient<IIdentityServiceClient, IdentityServiceClient>(client =>
            {
                client.BaseAddress = new Uri(Configuration["IdentityService:Url"]);
                client.DefaultRequestHeaders.Add("Accept", "application/json");
            });

            // Регистрируем другие сервисы
            services.AddScoped<DepartmentAssignmentService>();
            services.AddHostedService<UserSyncService>();

            services.AddControllers();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", builder =>
                {
                    builder.WithOrigins("http://localhost:5174", "https://localhost:5174")
                           .AllowAnyHeader()
                           .AllowAnyMethod()
                           .AllowCredentials();
                });
            });

            // Добавляем логирование
            services.AddLogging();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler(errorApp =>
                {
                    errorApp.Run(async context =>
                    {
                        context.Response.StatusCode = 500;
                        context.Response.ContentType = "text/plain";
                        var error = context.Features.Get<IExceptionHandlerFeature>();
                        if (error != null)
                        {
                            await context.Response.WriteAsync($"Error: {error.Error.Message}");
                        }
                    });
                });
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseRouting();

            // ВАЖНО: CORS должен быть до Authentication и Authorization
            app.UseCors("AllowFrontend");

            // Добавляем middleware аутентификации и авторизации
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }

}