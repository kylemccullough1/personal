using Portfolio.Models.Site;
using Portfolio.Services.Site;

namespace Portfolio.Api.Endpoints;

/// <summary>Endpoints for the portfolio site itself, as opposed to any one project it shows.</summary>
public static class SiteEndpoints
{
    public static IEndpointRouteBuilder MapSiteEndpoints(this IEndpointRouteBuilder routes)
    {
        // Messages from the Contact tab. The endpoint does no validating of its own: it hands the
        // message to the service and translates the answer into HTTP.
        routes.MapPost("/contact", async (
            ContactMessage message,
            IContactService contact,
            CancellationToken cancellationToken) =>
        {
            var result = await contact.SubmitAsync(message, cancellationToken);
            return result.Accepted
                ? Results.Accepted()
                : Results.ValidationProblem(result.Errors.ToDictionary(e => e.Key, e => e.Value));
        });

        return routes;
    }
}
