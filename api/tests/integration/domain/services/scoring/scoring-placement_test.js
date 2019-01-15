const { expect, domainBuilder, sinon } = require('../../../../test-helper');
const AnswerStatus = require('../../../../../lib/domain/models/AnswerStatus');
const Assessment = require('../../../../../lib/domain/models/Assessment');
const AssessmentScore = require('../../../../../lib/domain/models/AssessmentScore');

const courseRepository = require('../../../../../lib/infrastructure/repositories/course-repository');
const answerRepository = require('../../../../../lib/infrastructure/repositories/answer-repository');
const challengeRepository = require('../../../../../lib/infrastructure/repositories/challenge-repository');
const skillRepository = require('../../../../../lib/infrastructure/repositories/skill-repository');
const competenceRepository = require('../../../../../lib/infrastructure/repositories/competence-repository');

const scoringPlacement = require('../../../../../lib/domain/services/scoring/scoring-placement');

describe('Integration | Domain | services | scoring | scoring-placement', () => {

  describe('#calculate', () => {

    const COURSE_ID = 123;
    const COMPETENCE_ID = 'competence_id';
    const ASSESSMENT_ID = 836;

    const skill_web1 = domainBuilder.buildSkill({ id: 'web1', name: '@web1' });
    const skill_web2 = domainBuilder.buildSkill({ id: 'web2', name: '@web2' });

    const challenge_web1 = domainBuilder.buildChallenge({ id: 'challenge_web_1', skills: [skill_web1] });
    const challenge_web2 = domainBuilder.buildChallenge({ id: 'challenge_web_2', skills: [skill_web2] });

    const answer_web1_ok = domainBuilder.buildAnswer({ result: AnswerStatus.OK, assessmentId: ASSESSMENT_ID, challengeId: challenge_web1.id, });
    const answer_web2_ko = domainBuilder.buildAnswer({ result: AnswerStatus.KO, assessmentId: ASSESSMENT_ID, challengeId: challenge_web2.id, });

    const challenges = [challenge_web1, challenge_web2];
    const competence = domainBuilder.buildCompetence({ id: COMPETENCE_ID, index: '1.1', area: { code: 'area_1' }, skills: [skill_web1, skill_web2] });
    const course = domainBuilder.buildCourse({ id: COURSE_ID, competences: [COMPETENCE_ID] });
    const assessment = domainBuilder.buildAssessment({ id: ASSESSMENT_ID, type: Assessment.types.PLACEMENT, courseId: COURSE_ID });

    const dependencies = { answerRepository, challengeRepository, competenceRepository, courseRepository, skillRepository };

    beforeEach(() => {
      sinon.stub(competenceRepository, 'get').resolves(competence);
      sinon.stub(courseRepository, 'get').resolves(course);
      sinon.stub(skillRepository, 'findByCompetenceId').resolves([skill_web1, skill_web2]);
      sinon.stub(challengeRepository, 'findByCompetenceId').resolves(challenges);
      sinon.stub(answerRepository, 'findByAssessment').resolves([answer_web1_ok, answer_web2_ko]);
    });

    context('when an error occurred', () => {

      it('should rejects an error when course repository failed', () => {
        // given
        courseRepository.get.rejects(new Error('Error from courseRepository'));

        // when
        const promise = scoringPlacement.calculate(dependencies, assessment);

        // then
        return expect(promise).to.have.been.rejectedWith(Error, 'Error from courseRepository');
      });
    });

    it('should resolve an AssessmentScore domain object', async function() {
      // given
      const expectedAssessmentScore = {
        level: 0,
        nbPix: 4,
        validatedSkills: [skill_web1],
        failedSkills: [skill_web2],
        competenceMarks: [{
          id: undefined,
          assessmentResultId: undefined,
          'area_code': 'area_1',
          'competence_code': '1.1',
          level: 0,
          score: 4
        }],
      };

      // when
      const assessmentScore = await scoringPlacement.calculate(dependencies, assessment);

      // then
      expect(assessmentScore).to.be.an.instanceOf(AssessmentScore);
      expect(assessmentScore).to.deep.equal(expectedAssessmentScore);
    });
  });
});
