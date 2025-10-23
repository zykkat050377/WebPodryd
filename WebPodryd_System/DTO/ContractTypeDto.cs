//WebPodryd_System/DTO/ContractTypeDto.cs
using System;

namespace WebPodryd_System.DTO
{
    public class ContractTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateContractTypeDto
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
    }

    public class UpdateContractTypeDto
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
    }
}