const usecases = require('../../domain/usecases/index.js');
const organizationForAdminSerializer = require('../../infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin-serializer.js');

module.exports = {
  async getOrganizationDetails(request, h, dependencies = { organizationForAdminSerializer }) {
    const organizationId = request.params.id;

    const organizationDetails = await usecases.getOrganizationDetails({ organizationId });
    return dependencies.organizationForAdminSerializer.serialize(organizationDetails);
  },

  async updateOrganizationInformation(
    request,
    h,
    dependencies = {
      organizationForAdminSerializer,
    }
  ) {
    const organizationDeserialized = dependencies.organizationForAdminSerializer.deserialize(request.payload);

    const organizationUpdated = await usecases.updateOrganizationInformation({
      organization: organizationDeserialized,
    });
    return h.response(dependencies.organizationForAdminSerializer.serialize(organizationUpdated));
  },
};
