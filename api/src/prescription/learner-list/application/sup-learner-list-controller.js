import { usecases } from '../domain/usescases/index.js';
import * as supOrganizationParticipantsSerializer from '../../../../lib/infrastructure/serializers/jsonapi/organization/sup-organization-participants-serializer.js';
import { mapCertificabilityByLabel } from './helpers.js';
import * as queryParamsUtils from '../../../../lib/infrastructure/utils/query-params-utils.js';

const findPaginatedFilteredSupParticipants = async function (
  request,
  _,
  dependencies = {
    queryParamsUtils,
    supOrganizationParticipantsSerializer,
  },
) {
  const organizationId = request.params.id;
  const { filter, page, sort } = dependencies.queryParamsUtils.extractParameters(request.query);
  if (filter.groups && !Array.isArray(filter.groups)) {
    filter.groups = [filter.groups];
  }

  if (filter.certificability) {
    filter.certificability = mapCertificabilityByLabel(filter.certificability);
  }

  const { data: supOrganizationParticipants, meta } = await usecases.findPaginatedFilteredSupParticipants({
    organizationId,
    filter,
    page,
    sort,
  });
  return dependencies.supOrganizationParticipantsSerializer.serialize({ supOrganizationParticipants, meta });
};

const supLearnerListController = { findPaginatedFilteredSupParticipants };
export { supLearnerListController };
