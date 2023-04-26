const usecases = require('../../domain/usecases/index.js');
const organizationForAdminSerializer = require('../../infrastructure/serializers/jsonapi/organizations-administration/organization-for-admin-serializer.js');

module.exports = {
  async updateOrganizationInformation(
    request,
    _h,
    dependencies = {
      organizationForAdminSerializer,
    }
  ) {
    const organizationDeserialized = organizationForAdminSerializer.deserialize(request.payload);

    const organizationUpdated = await usecases.updateOrganizationInformation({
      organization: organizationDeserialized,
    });
    return dependencies.organizationForAdminSerializer.serialize(organizationUpdated);
  },
};
