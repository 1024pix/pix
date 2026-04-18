import { getNextChallengeForDemo } from '../../../../../src/evaluation/domain/usecases/get-next-challenge-for-demo.js';
import { AssessmentEndedError } from '../../../../../src/shared/domain/errors.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Evaluation | Unit | Domain | Use Cases | get-next-challenge-for-demo', function () {
  describe('#get-next-challenge-for-demo', function () {
    let courseRepository;
    let challengeToPlayRepository;
    let answerRepository;

    let assessment;
    let course;
    let firstChallenge;
    let secondChallenge;

    beforeEach(function () {
      firstChallenge = domainBuilder.evaluation.buildChallengeToPlay({ id: 'first_challenge' });
      secondChallenge = domainBuilder.evaluation.buildChallengeToPlay({ id: 'second_challenge' });
      course = domainBuilder.buildCourse({ id: 18415, challenges: [firstChallenge.id, secondChallenge.id] });
      assessment = domainBuilder.buildAssessment({ id: 1165, courseId: course.id });

      courseRepository = { get: sinon.stub().resolves(course) };
      challengeToPlayRepository = { get: sinon.stub() };
      answerRepository = { findByAssessment: sinon.stub() };
      challengeToPlayRepository.get.withArgs('first_challenge').resolves(firstChallenge);
      challengeToPlayRepository.get.withArgs('second_challenge').resolves(secondChallenge);
    });

    it('should return the first challenge if no answer exist', async function () {
      // given
      answerRepository.findByAssessment.resolves([]);

      // when
      const result = await getNextChallengeForDemo({
        courseRepository,
        challengeToPlayRepository,
        answerRepository,
        assessment,
      });

      // then
      expect(result).to.equal(firstChallenge);
    });

    it('should return the second challenge if the first challenge is already answered', async function () {
      // given
      const firstAnswer = domainBuilder.buildAnswer({ challengeId: firstChallenge.id, assessmentId: assessment.id });
      answerRepository.findByAssessment.resolves([firstAnswer]);

      // when
      const result = await getNextChallengeForDemo({
        courseRepository,
        challengeToPlayRepository,
        answerRepository,
        assessment,
      });

      // then
      expect(result).to.equal(secondChallenge);
    });

    it('should throw a AssessmentEndedError when there are no more challenges to ask', function () {
      // given
      const firstAnswer = domainBuilder.buildAnswer({ challengeId: firstChallenge.id, assessmentId: assessment.id });
      const secondAnswer = domainBuilder.buildAnswer({ challengeId: secondChallenge.id, assessmentId: assessment.id });
      answerRepository.findByAssessment.resolves([firstAnswer, secondAnswer]);

      // when
      const promise = getNextChallengeForDemo({
        courseRepository,
        challengeToPlayRepository,
        answerRepository,
        assessment,
      });

      // then
      return expect(promise).to.be.rejectedWith(AssessmentEndedError);
    });
  });
});
