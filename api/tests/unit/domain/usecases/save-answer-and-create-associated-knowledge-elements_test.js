const { expect, sinon, factory } = require('../../../test-helper');

const useCase = require('../../../../lib/domain/usecases');

const { NotFoundError, ChallengeAlreadyAnsweredError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | save-answer-and-create-associated-knowledge-elements', () => {

  const answerRepository = {
    findByChallengeAndAssessment: () => undefined,
  };
  const smartPlacementAssessmentRepository = { get: () => undefined };
  const smartPlacementKnowledgeElementRepository = { get: () => undefined };
  const solutionService = { get: () => undefined };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(answerRepository, 'findByChallengeAndAssessment').resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#saveAnswerAndCreateAssociatedKnowledgeElements', () => {

    context('when an answer for that challenge and that assessment already exists', () => {

      it('should fail', () => {
        // when
        const promise = useCase.saveAnswerAndCreateAssociatedKnowledgeElements({});

        // then
        return expect(promise).to.be.rejectedWith(ChallengeAlreadyAnsweredError);
      });
    });
  });
});
