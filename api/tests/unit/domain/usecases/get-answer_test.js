import { expect, sinon } from '../../../test-helper';
import getAnswer from '../../../../lib/domain/usecases/get-answer';
import { NotFoundError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | get-answer', function () {
  const answerId = 1;
  const userId = 'userId';
  let answerRepository;
  let assessmentRepository;

  beforeEach(function () {
    const answer = {
      id: 1,
      assessmentId: 3,
    };
    const assessment = {
      id: 3,
      userId: userId,
    };

    answerRepository = {
      get: sinon.stub(),
    };

    assessmentRepository = {
      ownedByUser: sinon.stub(),
    };

    answerRepository.get.withArgs(answerId).resolves(answer);
    assessmentRepository.ownedByUser.withArgs({ id: answer.assessmentId, userId }).resolves(assessment);
  });

  context('when user asked for answer is the user of the assessment', function () {
    it('should get the answer', function () {
      // when
      const result = getAnswer({ answerId, userId, answerRepository, assessmentRepository });

      // then
      return result.then((resultAnswer) => {
        expect(resultAnswer.id).to.equal(answerId);
      });
    });
  });

  context('when user asked for answer is not the user of the assessment', function () {
    it('should throw a Not Found error', function () {
      // when
      const result = getAnswer({ answerId, userId: userId + 1, answerRepository, assessmentRepository });

      // then
      return expect(result).to.be.rejectedWith(NotFoundError);
    });
  });

  context('when the answer id provided is not an integer', function () {
    it('should throw a Not Found error', function () {
      // when
      const result = getAnswer({ answerId: 'salut', userId: userId + 1, answerRepository, assessmentRepository });

      // then
      return expect(result).to.be.rejectedWith(NotFoundError);
    });
  });
});
