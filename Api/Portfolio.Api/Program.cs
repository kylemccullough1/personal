using Portfolio.Api.Endpoints;
using Portfolio.Data;
using Portfolio.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();

// Each layer registers itself. This file names the layers and their order; it does not know
// which concrete stores or services exist behind either call.
builder.Services.AddPortfolioData();
builder.Services.AddPortfolioServices();

var app = builder.Build();

app.UseExceptionHandler();

// One group per area of the site. Adding an area means adding a file under Endpoints/ and one
// line here, so Program.cs never grows a route.
var api = app.MapGroup("/api");
api.MapSiteEndpoints();

app.Run();
