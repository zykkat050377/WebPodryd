// WebPodryd_System/DTO/AddressDto.cs

using System;

namespace WebPodryd_System.DTO
{
    public class AddressDto
    {
        public Guid Id { get; set; }
        public Guid ContractorId { get; set; }
        public string Country { get; set; }
        public string Region { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string Settlement { get; set; }
        public string StreetType { get; set; }
        public string StreetName { get; set; }
        public string House { get; set; }
        public string Building { get; set; }
        public string Apartment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateAddressDto
    {
        public string Country { get; set; }
        public string Region { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string Settlement { get; set; }
        public string StreetType { get; set; }
        public string StreetName { get; set; }
        public string House { get; set; }
        public string Building { get; set; }
        public string Apartment { get; set; }
    }
}
