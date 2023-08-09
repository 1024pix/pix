import { usecases } from '../../domain/usecases/index.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import * as organizationForAdminSerializer from '../../infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin-serializer.js';

const getOrganizationDetails = async function (request, h, dependencies = { organizationForAdminSerializer }) {
  const organizationId = request.params.id;

  const organizationDetails = await usecases.getOrganizationDetails({ organizationId });
  return dependencies.organizationForAdminSerializer.serialize(organizationDetails);
};

const updateOrganizationInformation = async function (
  request,
  h,
  dependencies = {
    organizationForAdminSerializer,
  },
) {
  const organizationDeserialized = dependencies.organizationForAdminSerializer.deserialize(request.payload);

  const organizationUpdated = await DomainTransaction.execute(function (domainTransaction) {
    return usecases.updateOrganizationInformation({
      organization: organizationDeserialized,
      domainTransaction,
    });
  });
  return h.response(dependencies.organizationForAdminSerializer.serialize(organizationUpdated));
};

const organizationAdministrationController = { getOrganizationDetails, updateOrganizationInformation };
export { organizationAdministrationController, getOrganizationDetails, updateOrganizationInformation };
