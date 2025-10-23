// WebPodryd_Identity / Areas / Identity / IdentityHostingStartap.cs
using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WebPodryd_Identity.Data;

[assembly: HostingStartup(typeof(WebPodryd_Identity.Areas.Identity.IdentityHostingStartup))]
namespace WebPodryd_Identity.Areas.Identity
{
    public class IdentityHostingStartup : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            builder.ConfigureServices((context, services) => {
            });
        }
    }
}