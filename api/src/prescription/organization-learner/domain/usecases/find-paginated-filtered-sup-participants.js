import * as injectedSupOrganizationParticipantRepository from '../../infrastructure/repositories/sup-organization-participant-repository.js';
const findPaginatedFilteredSupParticipants = function ({
  organizationId,
  filter,
  page,
  sort,
  supOrganizationParticipantRepository = injectedSupOrganizationParticipantRepository,
} = {}) {
  return supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants({
    organizationId,
    filter,
    page,
    sort,
  });
};

export { findPaginatedFilteredSupParticipants };
