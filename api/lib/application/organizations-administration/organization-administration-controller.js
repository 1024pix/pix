const usecases = require('../../domain/usecases/index.js');
const organizationForAdminSerializer = require('../../infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin-serializer.js');

module.exports = {
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
