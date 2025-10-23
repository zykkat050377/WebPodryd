//WebPodryd_Identity/Middleware/SessionTimeoutMiddleware.cs
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebPodryd_Identity.Middlewware
{
    public class SessionTimeoutMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly TimeSpan _sessionTimeout;

        public SessionTimeoutMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _sessionTimeout = TimeSpan.FromMinutes(
                configuration.GetValue<int>("IdentitySettings:SessionTimeoutMinutes"));
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.User.Identity.IsAuthenticated)
            {
                var lastActivity = context.Session.GetString("LastActivity");
                if (lastActivity != null &&
                    DateTime.TryParse(lastActivity, out var lastActivityTime))
                {
                    if (DateTime.UtcNow - lastActivityTime > _sessionTimeout)
                    {
                        await context.SignOutAsync();
                        context.Response.Redirect("/Identity/Account/Login?timeout=1");
                        return;
                    }
                }

                context.Session.SetString("LastActivity", DateTime.UtcNow.ToString());
            }

            await _next(context);
        }
    }
}
