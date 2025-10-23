// WebPodryd_System/DTO/BankDetailsDto.cs

using System;

namespace WebPodryd_System.DTO
{
    public class BankDetailsDto
    {
        public Guid Id { get; set; }
        public Guid ContractorId { get; set; }
        public string IBAN { get; set; }
        public string BankName { get; set; }
        public string BIC { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateBankDetailsDto
    {
        public string IBAN { get; set; }
        public string BankName { get; set; }
        public string BIC { get; set; }
    }
}