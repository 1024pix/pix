import { organizationForAdminSerializer } from '../../../src/organizational-entities/infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin.serializer.js';
import { usecases } from '../../domain/usecases/index.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';

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

const organizationAdministrationController = { updateOrganizationInformation };
export { organizationAdministrationController, updateOrganizationInformation };
