import sinon from 'sinon';

import { campaignController } from '../../../../../src/prescription/campaign/application/campaign-controller.js';
import { usecases } from '../../../../../src/prescription/campaign/domain/usecases/index.js';
import { FRENCH_SPOKEN } from '../../../../../src/shared/domain/services/locale-service.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Application | Controller | Campaign', function () {
  describe('#getPresentationSteps', function () {
    it('should return expected results', async function () {
      // given
      const userId = Symbol('userId');
      const campaignCode = Symbol('campaign code');
      const locale = FRENCH_SPOKEN;

      sinon.stub(usecases, 'getPresentationSteps');

      const dependencies = {
        presentationStepsSerializerStub: {
          serialize: sinon.stub(),
        },
      };

      const presentationSteps = Symbol('presentation steps');
      const expectedResults = Symbol('results');

      usecases.getPresentationSteps.withArgs({ userId, campaignCode, locale }).resolves(presentationSteps);
      dependencies.presentationStepsSerializerStub.serialize.withArgs(presentationSteps).returns(expectedResults);

      const request = {
        auth: { credentials: { userId } },
        params: { campaignCode },
        state: { locale },
      };

      // when
      const response = await campaignController.getPresentationSteps(request, hFake, {
        presentationStepsSerializer: dependencies.presentationStepsSerializerStub,
      });

      // then
      expect(response).to.equal(expectedResults);
    });
  });

  describe('#getLevelPerTubesAndCompetences', function () {
    const campaignId = 1;
    const locale = FRENCH_SPOKEN;
    let campaignResultLevelsPerTubesAndCompetencesSerializerStub;

    beforeEach(function () {
      sinon.stub(usecases, 'getResultLevelsPerTubesAndCompetences');
      campaignResultLevelsPerTubesAndCompetencesSerializerStub = {
        serialize: sinon.stub(),
      };
    });

    it('should return expected results', async function () {
      // given
      const resultLevels = Symbol('resultLevels');
      const expectedResults = Symbol('results');
      usecases.getResultLevelsPerTubesAndCompetences.withArgs({ campaignId, locale }).resolves(resultLevels);
      campaignResultLevelsPerTubesAndCompetencesSerializerStub.serialize
        .withArgs(resultLevels)
        .returns(expectedResults);

      const request = {
        params: { campaignId },
        state: { locale },
      };

      // when
      const response = await campaignController.getLevelPerTubesAndCompetences(request, hFake, {
        campaignResultLevelsPerTubesAndCompetencesSerializer: campaignResultLevelsPerTubesAndCompetencesSerializerStub,
      });

      // then
      expect(response).to.equal(expectedResults);
    });
  });
});
