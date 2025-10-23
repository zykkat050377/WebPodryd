// WebPodryd_System/Controllers/HomeController.cs
using Microsoft.AspNetCore.Mvc;

namespace WebPodryd_System.Controllers
{
    public class HomeController : Controller
    {
        [Route("")]
        public IActionResult Root() => Content("WebPodryd_System API is running");

        public IActionResult Index()
        {
            return Content("WebPodryd_System API is running");
        }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class ApiHomeController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { message = "WebPodryd_System API is running" });
        }
    }
}
