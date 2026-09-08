using Microsoft.Extensions.DependencyInjection;
using Portfolio.Services.Site;

namespace Portfolio.Services;

/// <summary>
/// This project's composition root. One call from the host; every service registered here, so
/// adding a service is a one-line change in this file rather than a change to Program.cs.
/// </summary>
public static class ServicesServiceCollectionExtensions
{
    public static IServiceCollection AddPortfolioServices(this IServiceCollection services)
    {
        services.AddScoped<IContactService, ContactService>();
        return services;
    }
}
