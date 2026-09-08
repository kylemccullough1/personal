namespace Portfolio.Models.Site;

/// <summary>
/// The outcome of submitting a contact message.
///
/// Deliberately not an ASP.NET result type. The service decides whether a message is acceptable;
/// the endpoint decides what that means in HTTP. Keeping those apart is what lets the same rule
/// run from somewhere that is not a web request later.
/// </summary>
public sealed record ContactResult(IReadOnlyDictionary<string, string[]> Errors)
{
    public bool Accepted => Errors.Count == 0;

    public static ContactResult Success { get; } = new(new Dictionary<string, string[]>());

    public static ContactResult Invalid(IDictionary<string, string[]> errors) =>
        new(new Dictionary<string, string[]>(errors));
}
