const { expect, sinon, domainBuilder } = require('../../../test-helper');
const scoringService = require('../../../../lib/domain/services/scoring/scoring-service');
const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentScore = require('../../../../lib/domain/models/AssessmentScore');
const scoringPlacement = require('../../../../lib/domain/services/scoring/scoring-placement');
const scoringCertification = require('../../../../lib/domain/services/scoring/scoring-certification');

describe('Unit | Service | scoring-service', () => {

  describe('#calculateAssessmentScore', () => {

    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
      sandbox.stub(scoringPlacement, 'calculate').resolves();
      sandbox.stub(scoringCertification, 'calculate').resolves();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should resolve an AssessmentScore', async () => {
      // given
      const dependencies = {};
      const assessment = domainBuilder.buildAssessment({ type: Assessment.types.SMARTPLACEMENT });

      // when
      const result = await scoringService.calculateAssessmentScore(dependencies, assessment);

      // then
      expect(result).to.be.an.instanceOf(AssessmentScore);
    });

    context('when assessment can not be scored', () => {

      it('should resolve an empty (default) AssessmentScore', async () => {
        // given
        const dependencies = {};
        const assessment = domainBuilder.buildAssessment({ type: Assessment.types.DEMO });

        // when
        const result = await scoringService.calculateAssessmentScore(dependencies, assessment);

        // then
        expect(result).to.deep.equal(new AssessmentScore());
      });
    });

    context('when assessment has type "placement"', () => {

      it('should call "placement" scoring strategy', async () => {
        // given
        const dependencies = {};
        const assessment = domainBuilder.buildAssessment({ type: Assessment.types.PLACEMENT });

        // when
        await scoringService.calculateAssessmentScore(dependencies, assessment);

        // then
        expect(scoringPlacement.calculate).to.have.been.calledWith(dependencies, assessment);
      });
    });

    context('when assessment has type "certification"', () => {

      it('should call "certification" scoring strategy', async () => {
        // given
        const dependencies = {};
        const assessment = domainBuilder.buildAssessment({ type: Assessment.types.CERTIFICATION });

        // when
        await scoringService.calculateAssessmentScore(dependencies, assessment);

        // then
        expect(scoringCertification.calculate).to.have.been.calledWith(dependencies, assessment);
      });
    });
  });

});
