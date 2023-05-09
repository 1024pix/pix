import { OrganizationInvitation } from '../../../../lib/domain/models/OrganizationInvitation.js';

const buildOrganizationInvitation = function ({
  id = 123,
  organizationId = 456,
  organizationName = 'orgaName',
  email = 'coucou@example.net',
  status = OrganizationInvitation.StatusType.PENDING,
  code = 'ABCDE12345',
  role,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
} = {}) {
  return new OrganizationInvitation({
    id,
    organizationId,
    organizationName,
    email,
    status,
    code,
    role,
    createdAt,
    updatedAt,
  });
};

export { buildOrganizationInvitation };
