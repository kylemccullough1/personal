namespace Portfolio.Models.Site;

/// <summary>What a visitor typed into the Contact tab. Every field is nullable because this is
/// the unvalidated shape as it arrives off the wire; validation is the service's job.</summary>
public sealed record ContactMessage(string? Name, string? Email, string? Message);
