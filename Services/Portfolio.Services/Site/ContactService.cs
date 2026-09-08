using Portfolio.Models.Site;
using Microsoft.Extensions.Logging;

namespace Portfolio.Services.Site;

/// <summary>
/// The rules for a contact message. They live here rather than in the endpoint so that what
/// counts as a valid message has one answer regardless of how the message arrived.
///
/// Delivery is still a log line. Email, or a queue the desktop app drains, is the next step, and
/// when it happens it happens inside this class -- the endpoint does not change.
/// </summary>
public sealed class ContactService(ILogger<ContactService> log) : IContactService
{
    private const int MaxMessageLength = 4000;

    public Task<ContactResult> SubmitAsync(ContactMessage message, CancellationToken cancellationToken = default)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(message.Name))
            errors["name"] = ["Name is required."];

        if (string.IsNullOrWhiteSpace(message.Email) || !message.Email.Contains('@'))
            errors["email"] = ["A valid email is required."];

        // else-if, not two ifs: the original wrote both messages to the same key, so an empty
        // message silently reported the wrong reason.
        if (string.IsNullOrWhiteSpace(message.Message))
            errors["message"] = ["Message is required."];
        else if (message.Message.Length > MaxMessageLength)
            errors["message"] = [$"Message is too long ({MaxMessageLength} characters max)."];

        if (errors.Count > 0)
            return Task.FromResult(ContactResult.Invalid(errors));

        log.LogInformation(
            "Contact message from {Name} <{Email}>: {Message}",
            message.Name, message.Email, message.Message);

        return Task.FromResult(ContactResult.Success);
    }
}
