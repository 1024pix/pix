const { expect, sinon } = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const Course = require('../../../../lib/domain/models/Course');
const Challenge = require('../../../../lib/domain/models/Challenge');

const { AssessmentEndedError } = require('../../../../lib/domain/errors');

const getNextChallengeForDemo = require('../../../../lib/domain/usecases/get-next-challenge-for-demo');

describe('Unit | Domain | Use Cases | get-next-challenge-for-demo', () => {

  describe('#get-next-challenge-for-demo', () => {

    let courseRepository;
    let challengeRepository;

    let courseId;
    let assessment;
    let course;

    beforeEach(() => {
      courseId = 18415;
      course = new Course({ id: courseId, challenges: ['first_challenge', 'second_challenge'] });
      assessment = new Assessment({ id: 1165, courseId });

      courseRepository = { get: sinon.stub().resolves(course) };
      challengeRepository = { get: sinon.stub().resolves() };
    });

    it('should return the first challenge if no currentChallengeId is given', () => {
      // given
      const expectedChallenge = new Challenge({ skills: ['@url2'] });
      challengeRepository.get.withArgs('first_challenge').resolves(expectedChallenge);
      challengeRepository.get.withArgs('second_challenge').resolves(new Challenge({ skills: ['@cnil5'] }));

      // when
      const promise = getNextChallengeForDemo({ courseRepository, challengeRepository, assessment, challengeId: null });

      // then
      return promise.then((result) => {
        expect(result).to.equal(expectedChallenge);
      });
    });

    it('should return the second challenge if the challenge id given is first_challenge', () => {
      // given
      const expectedChallenge = new Challenge({ skills: ['@cnil5'] });
      challengeRepository.get.withArgs('first_challenge').resolves(new Challenge({ skills: ['@url2'] }));
      challengeRepository.get.withArgs('second_challenge').resolves(expectedChallenge);

      // when
      const promise = getNextChallengeForDemo({ courseRepository, challengeRepository, assessment, challengeId: 'first_challenge' });

      // then
      return promise.then((result) => {
        expect(result).to.equal(expectedChallenge);
      });
    });

    it('should throw a AssessmentEndedError when there are no more challenges to ask', () => {
      // when
      const promise = getNextChallengeForDemo({ courseRepository, challengeRepository, assessment, challengeId: 'second_challenge' });

      // then
      return expect(promise).to.be.rejectedWith(AssessmentEndedError);
    });
  });
});
