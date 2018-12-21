const { expect, domainBuilder, sinon } = require('../../../../test-helper');
const Assessment = require('../../../../../lib/domain/models/Assessment');
const certificationService = require('../../../../../lib/domain/services/certification-service');
const competenceRepository = require('../../../../../lib/infrastructure/repositories/competence-repository');
const scoringCertification = require('../../../../../lib/domain/strategies/scoring/scoring-certification');

describe('Integration | Domain | strategies | scoring | scoring-certification', () => {

  describe('#calculate', () => {

    const COURSE_ID = 123;
    const COMPETENCE_ID_1_1 = 'competence_id_1_1';
    const COMPETENCE_ID_1_2 = 'competence_id_1_2';
    const ASSESSMENT_ID = 836;

    const skill_web1 = domainBuilder.buildSkill({ id: 'web1', name: '@web1' });
    const skill_web2 = domainBuilder.buildSkill({ id: 'web2', name: '@web2' });
    const skill_url1 = domainBuilder.buildSkill({ id: 'url1', name: '@url1' });
    const skill_url4 = domainBuilder.buildSkill({ id: 'url4', name: '@url4' });

    const competence_1_1 = domainBuilder.buildCompetence({ id: COMPETENCE_ID_1_1, index: '1.1', area: { code: 'area_1' }, skills: [skill_web1, skill_web2] });
    const competence_1_2 = domainBuilder.buildCompetence({ id: COMPETENCE_ID_1_2, index: '1.2', area: { code: 'area_1' }, skills: [skill_url1, skill_url4] });
    const competences = [competence_1_1, competence_1_2];

    const competenceWithMark_1_1 = { index: competence_1_1.index, obtainedLevel: 0, obtainedScore: 4 };
    const competenceWithMark_1_2 = { index: competence_1_2.index, obtainedLevel: 1, obtainedScore: 8 };
    const competencesWithMark = [competenceWithMark_1_1, competenceWithMark_1_2];

    const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.PLACEMENT, courseId: COURSE_ID });

    const dependencies = { competenceRepository };

    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
      sandbox.stub(competenceRepository, 'list').resolves(competences);
      sandbox.stub(certificationService, 'calculateCertificationResultByAssessmentId').resolves({ competencesWithMark });
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('when an error occurred', () => {

      it('should rejects an error when certification service failed', () => {
        // given
        certificationService.calculateCertificationResultByAssessmentId.rejects(new Error('Error from certificationService'));

        // when
        const promise = scoringCertification.calculate(dependencies, assessment);

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
          'area_code': 'area_1',
          'competence_code': '1.1',
          level: 0,
          score: 4
        }, {
          id: undefined,
          assessmentResultId: undefined,
          'area_code': 'area_1',
          'competence_code': '1.2',
          level: 1,
          score: 8
        }],
      };

      // when
      const assessmentScore = await scoringCertification.calculate(dependencies, assessment);

      // then
      expect(assessmentScore).to.deep.equal(expectedAssessmentScore);
    });
  });
});
