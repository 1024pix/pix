import { expect, hFake, sinon } from '../../../../test-helper.js';

import { targetProfileController } from '../../../../../src/prescription/target-profile/application/target-profile-controller.js';
import { usecases } from '../../../../../src/prescription/target-profile/domain/usecases/index.js';

describe('Unit | Application | Target Profile | target-profile-controller', function () {
  describe('#findTargetProfiles', function () {
    it('should reply 200 with serialized target profiles', async function () {
      // given
      const connectedUserId = 1;
      const organizationId = 145;

      const request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId },
      };

      const foundTargetProfiles = Symbol('TargetProfile');

      sinon.stub(usecases, 'getAvailableTargetProfilesForOrganization');
      const targetProfileForSpecifierSerializerStub = {
        serialize: sinon.stub(),
      };
      const dependencies = {
        targetProfileForSpecifierSerializer: targetProfileForSpecifierSerializerStub,
      };

      usecases.getAvailableTargetProfilesForOrganization.withArgs({ organizationId }).resolves(foundTargetProfiles);
      targetProfileForSpecifierSerializerStub.serialize.withArgs(foundTargetProfiles).returns({});

      // when
      const response = await targetProfileController.findTargetProfiles(request, hFake, dependencies);

      // then
      expect(response).to.deep.equal({});
    });
  });
});
