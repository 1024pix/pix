const { expect, sinon, domainBuilder } = require('../../../test-helper');

const { AssessmentEndedError } = require('../../../../lib/domain/errors');

const getNextChallengeForDemo = require('../../../../lib/domain/usecases/get-next-challenge-for-demo');

describe('Unit | Domain | Use Cases | get-next-challenge-for-demo', () => {

  describe('#get-next-challenge-for-demo', () => {

    let courseRepository;
    let challengeRepository;
    let answerRepository;

    let assessment;
    let course;
    let firstChallenge;
    let secondChallenge;

    beforeEach(() => {
      firstChallenge = domainBuilder.buildChallenge({ id: 'first_challenge', skills: ['@url2'] });
      secondChallenge = domainBuilder.buildChallenge({ id: 'second_challenge', skills: ['@cnil5'] });
      course = domainBuilder.buildDemo({ id: 18415, challenges: [firstChallenge.id, secondChallenge.id] });
      assessment = domainBuilder.buildAssessment({ id: 1165, courseId: course.id });

      courseRepository = { get: sinon.stub().resolves(course) };
      challengeRepository = { get: sinon.stub() };
      answerRepository = { findByAssessment: sinon.stub() };
      challengeRepository.get.withArgs('first_challenge').resolves(firstChallenge);
      challengeRepository.get.withArgs('second_challenge').resolves(secondChallenge);
    });

    it('should return the first challenge if no answer exist', async () => {
      // given
      answerRepository.findByAssessment.resolves([]);

      // when
      const result = await getNextChallengeForDemo({ courseRepository, challengeRepository, answerRepository, assessment });

      // then
      expect(result).to.equal(firstChallenge);
    });

    it('should return the second challenge if the first challenge is already answered', async () => {
      // given
      const firstAnswer = domainBuilder.buildAnswer({ challengeId: firstChallenge.id, assessmentId: assessment.id });
      answerRepository.findByAssessment.resolves([firstAnswer]);

      // when
      const result = await getNextChallengeForDemo({ courseRepository, challengeRepository, answerRepository, assessment });

      // then
      expect(result).to.equal(secondChallenge);
    });

    it('should throw a AssessmentEndedError when there are no more challenges to ask', () => {
      // given
      const firstAnswer = domainBuilder.buildAnswer({ challengeId: firstChallenge.id, assessmentId: assessment.id });
      const secondAnswer = domainBuilder.buildAnswer({ challengeId: secondChallenge.id, assessmentId: assessment.id });
      answerRepository.findByAssessment.resolves([firstAnswer, secondAnswer]);

      // when
      const promise = getNextChallengeForDemo({ courseRepository, challengeRepository, answerRepository, assessment });

      // then
      return expect(promise).to.be.rejectedWith(AssessmentEndedError);
    });
  });
});
