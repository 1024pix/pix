import { usecases } from '../domain/usecases/index.js';
import * as scoOrganizationParticipantsSerializer from '../infrastructure/serializers/jsonapi/sco-organization-participants-serializer.js';
import { mapCertificabilityByLabel } from './../../shared/application/helpers.js';

const findPaginatedFilteredScoParticipants = async function (
  request,
  _,
  dependencies = { scoOrganizationParticipantsSerializer },
) {
  const organizationId = request.params.id;
  const { filter, page, sort } = request.query;
  if (filter.divisions && !Array.isArray(filter.divisions)) {
    filter.divisions = [filter.divisions];
  }
  if (filter.connectionTypes && !Array.isArray(filter.connectionTypes)) {
    filter.connectionTypes = [filter.connectionTypes];
  }
  if (filter.certificability) {
    filter.certificability = mapCertificabilityByLabel(filter.certificability);
  }
  const { data: scoOrganizationParticipants, meta } = await usecases.findPaginatedFilteredScoParticipants({
    organizationId,
    filter,
    page,
    sort,
  });
  return dependencies.scoOrganizationParticipantsSerializer.serialize({
    scoOrganizationParticipants,
    meta,
  });
};

const scoLearnerListController = { findPaginatedFilteredScoParticipants };
export { scoLearnerListController };
