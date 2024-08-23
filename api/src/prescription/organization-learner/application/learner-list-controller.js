import * as divisionSerializer from '../../campaign/infrastructure/serializers/jsonapi/division-serializer.js';
import { usecases } from '../domain/usecases/index.js';
import * as organizationParticipantsSerializer from '../infrastructure/serializers/jsonapi/organization-participants-serializer.js';
import { mapCertificabilityByLabel } from './../../shared/application/helpers.js';

const findPaginatedFilteredParticipants = async function (
  request,
  _,
  dependencies = { organizationParticipantsSerializer },
) {
  const organizationId = request.params.organizationId;
  const { page, filter: filters, sort } = request.query;
  const { extra = {}, ...commonFilters } = filters;

  if (commonFilters.certificability) {
    commonFilters.certificability = mapCertificabilityByLabel(commonFilters.certificability);
  }
  const results = await usecases.findPaginatedFilteredParticipants({
    organizationId,
    page,
    extraFilters: extra,
    filters: commonFilters,
    sort,
  });
  return dependencies.organizationParticipantsSerializer.serialize(results);
};

const getDivisions = async function (request) {
  const organizationId = request.params.id;
  const divisions = await usecases.findDivisionsByOrganization({ organizationId });
  return divisionSerializer.serialize(divisions);
};

const learnerListController = { findPaginatedFilteredParticipants, getDivisions };

export { learnerListController };
