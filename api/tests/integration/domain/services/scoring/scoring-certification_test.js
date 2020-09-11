const { expect, domainBuilder, sinon } = require('../../../../test-helper');
const certificationResultService = require('../../../../../lib/domain/services/certification-result-service');
const scoringCertificationService = require('../../../../../lib/domain/services/scoring/scoring-certification-service');

describe('Integration | Domain | services | scoring | scoring-certification-service', () => {

  describe('#calculateCertificationAssessmentScore', () => {

    const courseId = 123;
    const assessmentId = 836;

    const competenceWithMark_1_1 = { index: '1.1', obtainedLevel: 0, obtainedScore: 4, area_code: '1', id: 'recComp1.1' };
    const competenceWithMark_1_2 = { index: '1.2', obtainedLevel: 1, obtainedScore: 8, area_code: '2', id: 'recComp1.2' };
    const competencesWithMark = [competenceWithMark_1_1, competenceWithMark_1_2];

    const assessment = domainBuilder.buildAssessment({ id: assessmentId, courseId });

    it('should resolve an AssessmentScore domain object', async function() {
      // given
      sinon.stub(certificationResultService, 'getCertificationResult').resolves({ competencesWithMark });
      const expectedAssessmentScore = {
        percentageCorrectAnswers: 0,
        competenceMarks: [{
          id: undefined,
          competenceId: 'recComp1.1',
          assessmentResultId: undefined,
          'area_code': '1',
          'competence_code': '1.1',
          level: 0,
          score: 4,
        }, {
          id: undefined,
          competenceId: 'recComp1.2',
          assessmentResultId: undefined,
          'area_code': '2',
          'competence_code': '1.2',
          level: 1,
          score: 8,
        }],
      };

      // when
      const assessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore(assessment);

      // then
      expect(assessmentScore).to.deep.equal(expectedAssessmentScore);
    });

    it('should ceil the level and the score to a maximum threshold', async () => {
      // given
      const MAX_REACHABLE_LEVEL = 5;
      const MAX_REACHABLE_PIX = 40;
      const nbrPix = 50;
      const competenceWithMarkAboveThreshold = { index: '1.1', obtainedLevel: 6, obtainedScore: nbrPix, area_code: '1' };
      const assessment = domainBuilder.buildAssessment({ id: assessmentId, courseId });

      sinon.stub(certificationResultService, 'getCertificationResult').resolves({ competencesWithMark: [competenceWithMarkAboveThreshold] });

      // when
      const assessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore(assessment);

      // then
      expect(assessmentScore.nbPix).to.equal(MAX_REACHABLE_PIX);
      expect(assessmentScore.competenceMarks[0].level).to.equal(MAX_REACHABLE_LEVEL);
      expect(assessmentScore.competenceMarks[0].score).to.equal(MAX_REACHABLE_PIX);
    });
  });
});
