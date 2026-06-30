import { divisionSerializer } from '../../campaign/infrastructure/serializers/jsonapi/division-serializer.js';
import { usecases } from '../domain/usecases/index.js';
import * as adminOrganizationLearnerSerializer from '../infrastructure/serializers/jsonapi/admin-organization-learner-serializer.js';
import { organizationParticipantsSerializer } from '../infrastructure/serializers/jsonapi/organization-participants-serializer.js';
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

const findOrganizationLearnersForAdmin = async function (
  request,
  _,
  dependencies = { adminOrganizationLearnerSerializer },
) {
  const { page, filter } = request.query;
  const { learners, pagination } = await usecases.findOrganizationLearnersForAdmin({ page, filter });
  return dependencies.adminOrganizationLearnerSerializer.serialize({ learners, pagination });
};

const getDivisions = async function (request) {
  const organizationId = request.params.id;
  const divisions = await usecases.findDivisionsByOrganization({ organizationId });
  return divisionSerializer.serialize(divisions);
};

const learnerListController = { findPaginatedFilteredParticipants, findOrganizationLearnersForAdmin, getDivisions };

export { learnerListController };
