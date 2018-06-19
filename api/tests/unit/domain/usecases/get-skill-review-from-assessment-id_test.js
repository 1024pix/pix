const { expect, sinon } = require('../../../test-helper');

const useCase = require('../../../../lib/domain/usecases/');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');

const Answer = require('../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Assessment = require('../../../../lib/domain/models/Assessment');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Course = require('../../../../lib/domain/models/Course');
const Skill= require('../../../../lib/domain/models/Skill');
const SkillReview = require('../../../../lib/domain/models/SkillReview');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | get-skill-review-from-assessment-id', () => {

  describe('#getSkillReviewFromAssessementId', () => {

    const challengeAnswered = new Challenge({
      id: 'recChallengeAnswered',
      instruction: 'instruction',
      proposals: 'proposal',
      type: 'QCM',
    });
    const challengeNotAnswered = new Challenge({
      id: 'recChallengeNotAnswered',
      instruction: 'instruction',
      proposals: 'proposal',
      type: 'QCM',
    });
    const challenges = [challengeAnswered, challengeNotAnswered];

    const course = new Course({
      id: 'recCourse',
      name: 'Some Course',
      type: '',
      challenges,
    });

    const assessment = new Assessment({
      id: 'recAssessment',
      courseId: course.id,
      state: Assessment.states.COMPLETED,
      type: Assessment.types.SMARTPLACEMENT,
    });

    const answer = new Answer({
      challengeId: challengeAnswered.id,
      result: AnswerStatus.OK,
    });
    const answers = [answer];

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(assessmentRepository, 'get');
      sandbox.stub(challengeRepository, 'findBySkills').resolves(challenges);
      sandbox.stub(answerRepository, 'findByAssessment').resolves(answers);
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('when assessment if found', () => {

      beforeEach(() => assessmentRepository.get.resolves(assessment));

      it('should use repositories to retrieve relevant informations', () => {
        // given
        const expectedSkillReviewSkills = [
          new Skill({ name: '@accesDonnées2' }),
          new Skill({ name: '@accesDonnées1' }),
          new Skill({ name: '@collecteDonnées2' }),
          new Skill({ name: '@collecteDonnées1' }),
          new Skill({ name: '@infosPerso4' }),
          new Skill({ name: '@infosPerso3' }),
          new Skill({ name: '@infosPerso2' }),
          new Skill({ name: '@infosPerso1' }),
          new Skill({ name: '@tracesLocales3' }),
          new Skill({ name: '@tracesLocales2' }),
          new Skill({ name: '@tracesLocales1' }),
          new Skill({ name: '@tracesPratiques6' }),
          new Skill({ name: '@tracesPratiques5' }),
          new Skill({ name: '@tracesPratiques4' }),
          new Skill({ name: '@tracesPratiques3' }),
          new Skill({ name: '@tracesPratiques2' }),
          new Skill({ name: '@tracesPratiques1' }),
          new Skill({ name: '@archive4' }),
          new Skill({ name: '@archive3' }),
          new Skill({ name: '@archive2' }),
          new Skill({ name: '@archive1' }),
          new Skill({ name: '@fichier1' }),
          new Skill({ name: '@propFichier3' }),
          new Skill({ name: '@propFichier2' }),
          new Skill({ name: '@propFichier1' }),
          new Skill({ name: '@sauvegarde6' }),
          new Skill({ name: '@sauvegarde5' }),
          new Skill({ name: '@sauvegarde4' }),
          new Skill({ name: '@sauvegarde3' }),
          new Skill({ name: '@sauvegarde2' }),
          new Skill({ name: '@sauvegarde1' }),
          new Skill({ name: '@unite2' }),
          new Skill({ name: '@unite1' }),
        ];

        // when
        const promise = useCase.getSkillReviewFromAssessmentId({
          assessmentId: assessment.id,
          assessmentRepository,
          challengeRepository,
          answerRepository
        });

        // then
        return promise.then(() => {
          expect(assessmentRepository.get).to.have.been.calledWith(assessment.id);
          expect(challengeRepository.findBySkills).to.have.been.calledWith(expectedSkillReviewSkills);
        });
      });

      it('should return a skill review associated to the assessment', () => {
        // when
        const promise = useCase.getSkillReviewFromAssessmentId({
          assessmentId: assessment.id,
          assessmentRepository,
          challengeRepository,
          answerRepository
        });

        // then
        return promise.then((skillReview) => {
          expect(skillReview).to.be.an.instanceOf(SkillReview);
          expect(skillReview.assessment).to.equal(assessment);
          expect(skillReview.assessment.answers).to.equal(answers);
          expect(skillReview.assessment.answers[0].challenge).to.equal(challengeAnswered);
        });
      });
    });

    context('when assessment does not exist', () => {

      beforeEach(() => assessmentRepository.get.resolves());

      it('should throw a Not Found error', () => {
        // when
        const promise = useCase.getSkillReviewFromAssessmentId({
          assessmentId: 'NonExistentId',
          assessmentRepository,
          challengeRepository,
          answerRepository
        });

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });
  });
});
