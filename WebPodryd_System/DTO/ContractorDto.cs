// WebPodryd_System/DTO/ContractorDto.cs

using System;

namespace WebPodryd_System.DTO
{
    public class ContractorDto
    {
        public Guid Id { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string DocumentType { get; set; }
        public string DocumentSeries { get; set; }
        public string DocumentNumber { get; set; }
        public string Citizenship { get; set; }
        public DateTime? IssueDate { get; set; }
        public string IssuedBy { get; set; }
        public string IdentificationNumber { get; set; }
        public string MobilePhone { get; set; }
        public BankDetailsDto BankDetails { get; set; }
        public AddressDto Address { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateContractorDto
    {
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string DocumentType { get; set; }
        public string DocumentSeries { get; set; }
        public string DocumentNumber { get; set; }
        public string Citizenship { get; set; }
        public DateTime? IssueDate { get; set; }
        public string IssuedBy { get; set; }
        public string IdentificationNumber { get; set; }
        public string MobilePhone { get; set; }
        public CreateBankDetailsDto BankDetails { get; set; }
        public CreateAddressDto Address { get; set; }
    }
}