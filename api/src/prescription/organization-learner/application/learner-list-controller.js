import { usecases } from '../domain/usecases/index.js';
import * as organizationParticipantsSerializer from '../infrastructure/serializers/jsonapi/organization-participants-serializer.js';
import { mapCertificabilityByLabel } from './helpers.js';
import * as queryParamsUtils from '../../../../lib/infrastructure/utils/query-params-utils.js';

const findPaginatedFilteredParticipants = async function (
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
