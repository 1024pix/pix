import * as injectedScoOrganizationParticipantRepository from '../../infrastructure/repositories/sco-organization-participant-repository.js';
const findPaginatedFilteredScoParticipants = function ({
  organizationId,
  filter,
  page,
  scoOrganizationParticipantRepository = injectedScoOrganizationParticipantRepository,
  sort,
} = {}) {
  return scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants({
    organizationId,
    filter,
    page,
    sort,
  });
};

export { findPaginatedFilteredScoParticipants };
