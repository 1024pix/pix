const { expect, sinon, domainBuilder } = require('../../../test-helper');

const getAnswerWithRecentKnowledgeElements = require('../../../../lib/domain/usecases/get-answer-with-recent-knowledge-elements');

describe('Unit | Domain | Use Cases | get-answer-with-recent-knowledge-elements', () => {

  describe('#getAnswerWithRecentKnowledgeElements', () => {

    let answerRepository;
    let assessmentRepository;
    let smartPlacementKnowledgeElementRepository;
    const answerId = 1;
    let answer, knowledgeElements1, knowledgeElements2;

    beforeEach(() => {
      answerRepository = { get: sinon.stub().resolves() };
      assessmentRepository = { get: sinon.stub().resolves() };
      smartPlacementKnowledgeElementRepository = { findFirstSavedKnowledgeElementsByUserId: sinon.stub().resolves() };
    });

    context('when answer do not have knowledge elements', () => {
      beforeEach(() => {
        answer = domainBuilder.buildAnswer({ id: answerId, knowledgeElements: [] });
        answerRepository.get.resolves(answer);
      });

      it('should not try to call assessmentRepository.get', () => {
        // when
        const promise = getAnswerWithRecentKnowledgeElements({ answerId, answerRepository, assessmentRepository, smartPlacementKnowledgeElementRepository });

        // then
        return promise.then(() => {
          expect(assessmentRepository.get).to.not.have.been.called;
        });
      });

      it('should return the answers with no knowledge elements', () => {
        // when
        const promise = getAnswerWithRecentKnowledgeElements({ answerId, answerRepository, assessmentRepository, smartPlacementKnowledgeElementRepository });

        // then
        return promise.then((answerReturned) => {
          expect(answerReturned).to.deep.equal(answer);
        });
      });
    });

    context('when answer have knowledge elements', () => {
      beforeEach(() => {
        knowledgeElements1 = domainBuilder.buildSmartPlacementKnowledgeElement({ id:1, skillId: 1, status: 'validated' });
        knowledgeElements2 = domainBuilder.buildSmartPlacementKnowledgeElement({ id:2, skillId: 2, status: 'validated' });
        answer = domainBuilder.buildAnswer({ id: answerId, knowledgeElements: [knowledgeElements1, knowledgeElements2] });
        answerRepository.get.resolves(answer);
      });

      context('when assessment of answer is not a smart placement', () => {
        beforeEach(() => {
          assessmentRepository.get.resolves(domainBuilder.buildAssessment({ type: 'PLACEMENT' }));
        });

        it('should not try to call smartPlacementKnowledgeElementRepository.findFirstSavedKnowledgeElementsByUserId', () => {

          // when
          const promise = getAnswerWithRecentKnowledgeElements({ answerId, answerRepository, assessmentRepository, smartPlacementKnowledgeElementRepository });

          // then
          return promise.then(() => {
            expect(assessmentRepository.get).to.have.been.called;
            expect(smartPlacementKnowledgeElementRepository.findFirstSavedKnowledgeElementsByUserId).to.not.have.been.called;
          });
        });

        it('should return the answers with his knowledge elements', () => {

          // when
          const promise = getAnswerWithRecentKnowledgeElements({ answerId, answerRepository, assessmentRepository, smartPlacementKnowledgeElementRepository });

          // then
          return promise.then((answerReturned) => {
            expect(answerReturned).to.deep.equal(answer);
          });
        });
      });

      context('when assessment of answer is a smart placement', () => {
        beforeEach(() => {
          assessmentRepository.get.resolves(domainBuilder.buildAssessment({ type: 'SMART_PLACEMENT' }));
          smartPlacementKnowledgeElementRepository.findFirstSavedKnowledgeElementsByUserId.resolves([knowledgeElements1]);
        });

        it('should return the answer with only his recent knowledge elements', () => {
          // given

          // when
          const promise = getAnswerWithRecentKnowledgeElements({ answerId, answerRepository, assessmentRepository, smartPlacementKnowledgeElementRepository });

          // then
          return promise.then((answerReturned) => {
            expect(answerReturned.id).to.equal(answer.id);
            expect(answerReturned.knowledgeElements).to.deep.equal([knowledgeElements1]);
          });
        });
      });
    });
  });

});
