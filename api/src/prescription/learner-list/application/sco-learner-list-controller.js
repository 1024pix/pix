import { usecases } from '../domain/usecases/index.js';
import * as scoOrganizationParticipantsSerializer from '../../../../lib/infrastructure/serializers/jsonapi/organization/sco-organization-participants-serializer.js';
import { mapCertificabilityByLabel } from './helpers.js';
import * as queryParamsUtils from '../../../../lib/infrastructure/utils/query-params-utils.js';

const findPaginatedFilteredScoParticipants = async function (
  request,
  _,
  dependencies = {
    queryParamsUtils,
    scoOrganizationParticipantsSerializer,
  },
) {
  const organizationId = request.params.id;
  const { filter, page, sort } = dependencies.queryParamsUtils.extractParameters(request.query);
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
