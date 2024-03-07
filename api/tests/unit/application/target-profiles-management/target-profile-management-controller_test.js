import { targetProfilesManagementController } from '../../../../lib/application/target-profiles-management/target-profile-management-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Controller | Target Profiles Management | target-profile-management-controller', function () {
  describe('#detachOrganizations', function () {
    it('should call the detachOrganizationsFromTargetProfile use-case', async function () {
      // given
      const connectedUserId = 1;
      const payload = { data: { 'organization-ids': [1, 2, 3] } };
      const request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: 1 },
        payload,
        i18n: {
          __: sinon.stub(),
        },
      };

      const expectedResult = Symbol('result');
      const organizationIds = Symbol('organizationIds');
      const detachedOrganizationIds = Symbol('detachedOrganizationIds');
      const targetProfileRepository = Symbol('target profile repository');

      sinon.stub(usecases, 'detachOrganizationsFromTargetProfile');
      usecases.detachOrganizationsFromTargetProfile
        .withArgs({ targetProfileId: 1, organizationIds, targetProfileRepository })
        .resolves(detachedOrganizationIds);

      const targetProfileDetachOrganizationsSerializer = { serialize: sinon.stub() };
      targetProfileDetachOrganizationsSerializer.serialize
        .withArgs({ targetProfileId: 1, detachedOrganizationIds })
        .returns(expectedResult);

      const deserializer = { deserialize: sinon.stub() };
      deserializer.deserialize.withArgs(payload).returns({ organizationIds: organizationIds });

      const dependencies = { targetProfileRepository, deserializer, targetProfileDetachOrganizationsSerializer };

      // when
      const response = await targetProfilesManagementController.detachOrganizations(request, hFake, dependencies);

      // then
      expect(response.source).to.equal(expectedResult);
      expect(response.statusCode).to.equal(200);
    });
  });
});
