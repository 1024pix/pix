import sinon from 'sinon';

import { targetProfileController } from '../../../../../src/prescription/target-profile/application/target-profile-controller.js';
import { usecases } from '../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Application | Target Profile | target-profile-controller', function () {
  describe('#findTargetProfiles', function () {
    it('should reply 200 with serialized target profiles', async function () {
      // given
      const connectedUserId = 1;
      const organizationId = 145;

      const request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { organizationId },
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

  describe('#findLearningContentsByOrganizationId', function () {
    let frameworks;
    let frameworkWithSkillsSerializer;
    let organizationId;
    let serializedFrameworks;

    beforeEach(function () {
      frameworks = Symbol('frameworks');
      organizationId = Symbol('organizationId');
      serializedFrameworks = Symbol('serializedFrameworks');

      sinon.stub(usecases, 'findLearningContentsByOrganizationId');

      frameworkWithSkillsSerializer = {
        serialize: sinon.stub(),
      };
    });

    it('should fetch and return frameworks, serialized as JSONAPI', async function () {
      // given
      const locale = 'en';
      const request = {
        params: { organizationId },
        state: { locale },
      };

      usecases.findLearningContentsByOrganizationId
        .resolves([])
        .withArgs({ organizationId, locale: 'en' })
        .resolves(frameworks);

      frameworkWithSkillsSerializer.serialize.withArgs(frameworks).returns(serializedFrameworks);
      // when

      const result = await targetProfileController.findLearningContentsByOrganizationId(request, hFake, {
        frameworkWithSkillsSerializer,
      });

      // then
      expect(result).to.equal(serializedFrameworks);
    });
  });

  describe('#getTargetProfileOverview', function () {
    it('should fetch and return a target profile, serialized as JSONAPI', async function () {
      // given
      const locale = 'en';
      const targetProfileId = 123;
      const targetProfileOverview = Symbol('targetProfileOverview');
      const serializedTargetProfileOverview = Symbol('serializedTargetProfileOverview');
      const targetProfileOverviewSerializer = {
        serialize: sinon.stub(),
      };
      sinon.stub(usecases, 'getTargetProfileOverview');

      const request = {
        params: { targetProfileId },
        state: { locale },
      };

      usecases.getTargetProfileOverview.withArgs({ targetProfileId, locale: 'en' }).resolves(targetProfileOverview);

      targetProfileOverviewSerializer.serialize
        .withArgs(targetProfileOverview)
        .returns(serializedTargetProfileOverview);

      // when
      const result = await targetProfileController.getTargetProfileOverview(request, hFake, {
        targetProfileOverviewSerializer,
      });

      // then
      expect(result).to.equal(serializedTargetProfileOverview);
    });
  });
});
