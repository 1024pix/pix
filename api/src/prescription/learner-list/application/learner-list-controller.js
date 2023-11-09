import { usecases } from '../domain/usecases/index.js';
import * as organizationParticipantsSerializer from '../../../../lib/infrastructure/serializers/jsonapi/organization/organization-participants-serializer.js';
import { mapCertificabilityByLabel } from './helpers.js';
import * as queryParamsUtils from '../../../../lib/infrastructure/utils/query-params-utils.js';

const getPaginatedParticipantsForAnOrganization = async function (
  request,
  _,
  dependencies = {
    queryParamsUtils,
    organizationParticipantsSerializer,
  },
) {
  const organizationId = request.params.id;
  const { page, filter: filters, sort } = dependencies.queryParamsUtils.extractParameters(request.query);

  if (filters.certificability) {
    filters.certificability = mapCertificabilityByLabel(filters.certificability);
  }
  const results = await usecases.getPaginatedParticipantsForAnOrganization({
    organizationId,
    page,
    filters,
    sort,
  });
  return dependencies.organizationParticipantsSerializer.serialize(results);
};

const learnerListController = { getPaginatedParticipantsForAnOrganization };
export { learnerListController };
