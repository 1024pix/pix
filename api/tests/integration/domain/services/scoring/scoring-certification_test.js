const { expect, domainBuilder, sinon } = require('../../../../test-helper');
const Assessment = require('../../../../../lib/domain/models/Assessment');
const certificationService = require('../../../../../lib/domain/services/certification-service');
const scoringCertification = require('../../../../../lib/domain/services/scoring/scoring-certification');

describe('Integration | Domain | services | scoring | scoring-certification', () => {

  describe('#calculate', () => {

    const courseId = 123;
    const assessmentId = 836;

    const competenceWithMark_1_1 = { index: '1.1', obtainedLevel: 0, obtainedScore: 4, area_code: '1', };
    const competenceWithMark_1_2 = { index: '1.2', obtainedLevel: 1, obtainedScore: 8, area_code: '2', };
    const competencesWithMark = [competenceWithMark_1_1, competenceWithMark_1_2];

    const assessment = domainBuilder.buildAssessment({ id: assessmentId, type: Assessment.types.PLACEMENT, courseId });

    beforeEach(() => {
      sinon.stub(certificationService, 'calculateCertificationResultByAssessmentId').resolves({ competencesWithMark });
    });

    context('when an error occurred', () => {

      it('should rejects an error when certification service failed', () => {
        // given
        certificationService.calculateCertificationResultByAssessmentId.rejects(new Error('Error from certificationService'));

        // when
        const promise = scoringCertification.calculate(assessment);

        // then
        return expect(promise).to.have.been.rejectedWith(Error, 'Error from certificationService');
      });
    });

    it('should resolve an AssessmentScore domain object', async function() {
      // given
      const expectedAssessmentScore = {
        level: null,
        nbPix: 12,
        validatedSkills: [],
        failedSkills: [],
        competenceMarks: [{
          id: undefined,
          assessmentResultId: undefined,
          'area_code': '1',
          'competence_code': '1.1',
          level: 0,
          score: 4
        }, {
          id: undefined,
          assessmentResultId: undefined,
          'area_code': '2',
          'competence_code': '1.2',
          level: 1,
          score: 8
        }],
      };

      // when
      const assessmentScore = await scoringCertification.calculate(assessment);

      // then
      expect(assessmentScore).to.deep.equal(expectedAssessmentScore);
    });
  });
});
