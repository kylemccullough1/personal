using Portfolio.Models.Site;

namespace Portfolio.Services.Site;

public interface IContactService
{
    /// <summary>Validates a contact message and, if it is acceptable, accepts it for delivery.</summary>
    Task<ContactResult> SubmitAsync(ContactMessage message, CancellationToken cancellationToken = default);
}
