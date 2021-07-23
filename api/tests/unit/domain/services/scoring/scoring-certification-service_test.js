const { expect, domainBuilder, sinon } = require('../../../../test-helper');
const certificationResultService = require('../../../../../lib/domain/services/certification-result-service');
const scoringCertificationService = require('../../../../../lib/domain/services/scoring/scoring-certification-service');

describe('Unit | Domain | services | scoring | scoring-certification-service', () => {

  describe('#calculateCertificationAssessmentScore', () => {

    it('should return an CertificationAssessmentScore', async function() {
      // given
      const certificationAssessment = domainBuilder.buildCertificationAssessment();
      const competenceWithMark_1_1 = { index: '1.1', obtainedLevel: 0, obtainedScore: 4, area_code: '1', id: 'recComp1' };
      const competenceWithMark_1_2 = { index: '1.2', obtainedLevel: 1, obtainedScore: 8, area_code: '2', id: 'recComp2' };
      const competencesWithMark = [competenceWithMark_1_1, competenceWithMark_1_2];
      sinon.stub(certificationResultService, 'getCertificationResult')
        .resolves({ competencesWithMark, percentageCorrectAnswers: 55 });
      const expectedCompetenceMark1 = domainBuilder.buildCompetenceMark({
        level: 0,
        score: 4,
        area_code: '1',
        competence_code: '1.1',
        competenceId: 'recComp1',
      });
      const expectedCompetenceMark2 = domainBuilder.buildCompetenceMark({
        level: 1,
        score: 8,
        area_code: '2',
        competence_code: '1.2',
        competenceId: 'recComp2',
      });
      const expectedAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
        percentageCorrectAnswers: 55,
        competenceMarks: [expectedCompetenceMark1, expectedCompetenceMark2],
      });

      // when
      const assessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({ certificationAssessment });

      // then
      expect(assessmentScore).to.deep.equal(expectedAssessmentScore);
    });

    it('should ceil the level and the score to a maximum threshold', async () => {
      // given
      const MAX_REACHABLE_LEVEL = 5;
      const MAX_REACHABLE_PIX = 40;
      const certificationAssessment = domainBuilder.buildCertificationAssessment();
      const competenceWithMarkAboveThreshold = {
        id: 'recComp1',
        index: '1.1',
        obtainedLevel: MAX_REACHABLE_LEVEL + 1,
        obtainedScore: MAX_REACHABLE_PIX + 10,
        area_code: '1',
      };
      const expectedCompetenceMark = domainBuilder.buildCompetenceMark({
        level: MAX_REACHABLE_LEVEL,
        score: MAX_REACHABLE_PIX,
        area_code: '1',
        competence_code: '1.1',
        competenceId: 'recComp1',
      });
      const expectedAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
        competenceMarks: [expectedCompetenceMark],
      });
      sinon.stub(certificationResultService, 'getCertificationResult').resolves({ competencesWithMark: [competenceWithMarkAboveThreshold] });

      // when
      const assessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({ certificationAssessment });

      // then
      expect(assessmentScore).to.deep.equal(expectedAssessmentScore);
    });
  });
});
