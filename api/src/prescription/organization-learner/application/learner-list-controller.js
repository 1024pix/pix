import * as queryParamsUtils from '../../../shared/infrastructure/utils/query-params-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as organizationParticipantsSerializer from '../infrastructure/serializers/jsonapi/organization-participants-serializer.js';
import { mapCertificabilityByLabel } from './../../shared/application/helpers.js';

const findPaginatedFilteredParticipants = async function (
  request,
  _,
  dependencies = {
    queryParamsUtils,
    organizationParticipantsSerializer,
  },
) {
  const organizationId = request.params.organizationId;
  const { page, filter: filters, sort } = dependencies.queryParamsUtils.extractParameters(request.query);

  if (filters.certificability) {
    filters.certificability = mapCertificabilityByLabel(filters.certificability);
  }
  const results = await usecases.findPaginatedFilteredParticipants({
    organizationId,
    page,
    filters,
    sort,
  });
  return dependencies.organizationParticipantsSerializer.serialize(results);
};

const learnerListController = { findPaginatedFilteredParticipants };
export { learnerListController };
