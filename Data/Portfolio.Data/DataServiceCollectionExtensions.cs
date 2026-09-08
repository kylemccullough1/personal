using Microsoft.Extensions.DependencyInjection;

namespace Portfolio.Data;

/// <summary>
/// This project's composition root. The host says AddPortfolioData() and never learns what is
/// behind it, so the first real store can be added here without Program.cs changing.
///
/// Nothing is registered yet, on purpose. The site has no database, no file store and no cache:
/// the only thing the API does today is accept a contact message, and that touches no storage.
/// This layer exists so that the first thing that does has an obvious home, and so the
/// dependency direction is already fixed before there is anything to argue about.
/// </summary>
public static class DataServiceCollectionExtensions
{
    public static IServiceCollection AddPortfolioData(this IServiceCollection services) => services;
}
