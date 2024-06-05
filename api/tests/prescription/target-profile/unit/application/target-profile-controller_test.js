import { targetProfileController } from '../../../../../src/prescription/target-profile/application/target-profile-controller.js';
import { usecases } from '../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

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

  describe('#getFrameworksForTargetProfileSubmission', function () {
    let frameworks;
    let frameworkwithoutskillserializer;
    let requestResponseUtils;
    let serializedFrameworks;

    beforeEach(function () {
      frameworks = Symbol('frameworks');
      serializedFrameworks = Symbol('serializedFrameworks');

      sinon.stub(usecases, 'getLearningContentForTargetProfileSubmission').returns({ frameworks });
      frameworkwithoutskillserializer = {
        serialize: sinon.stub().returns(serializedFrameworks),
      };
      requestResponseUtils = { extractLocaleFromRequest: sinon.stub().returns('en') };
    });

    it('should fetch and return frameworks, serialized as JSONAPI', async function () {
      // given
      const request = {
        headers: {
          'accept-language': 'en',
        },
      };

      // when
      const result = await targetProfileController.getFrameworksForTargetProfileSubmission(request, hFake, {
        extractLocaleFromRequest: requestResponseUtils.extractLocaleFromRequest,
        frameworkwithoutskillserializer,
      });

      // then
      expect(result).to.equal(serializedFrameworks);
      expect(usecases.getLearningContentForTargetProfileSubmission).to.have.been.calledWithExactly({ locale: 'en' });
      expect(frameworkwithoutskillserializer.serialize).to.have.been.calledWithExactly(frameworks);
    });
  });
});
