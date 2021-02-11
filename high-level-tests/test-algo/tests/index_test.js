const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const { answerTheChallenge } = require('../algo');
const KnowledgeElement = require('../../../api/lib/domain/models/KnowledgeElement');

describe('#answerTheChallenge', () => {

  let previousAnswers;
  let previousKE;
  let newKe;
  let challenge;

  beforeEach(() => {
    previousAnswers = [ { id: 1, result: 'ko' } ];
    previousKE = [{ id: 1 }];
    challenge = { id: 'recId' };
    newKe = { id: 'KE-id' };
    sinon.stub(KnowledgeElement, "createKnowledgeElementsForAnswer").returns([newKe]);
  });

  afterEach(() => {
    sinon.restore();
  })

  it('should return the list of answers with previous answer with the new one', () => {
    // when
    const result = answerTheChallenge({
        challenge,
        allAnswers: previousAnswers,
        allKnowledgeElements: previousKE,
        targetSkills: [],
        userId: 1
      });

    // then
    expect(result.updatedAnswers).lengthOf(previousAnswers.length + 1);
    expect(result.updatedAnswers[0]).to.be.deep.equal(previousAnswers[0]);
    expect(result.updatedAnswers[1].challengeId).to.be.equal(challenge.id);
  });

  it('should return the list of previous KE with the new one', () => {

    // when
    const result = answerTheChallenge({
      challenge,
      allAnswers: previousAnswers,
      allKnowledgeElements: previousKE,
      targetSkills: [],
      userId: 1
    });

    // then
    expect(result.updatedKnowledgeElements).lengthOf(previousKE.length + 1);
    expect(result.updatedKnowledgeElements[0]).to.deep.equal(previousKE[0]);
    expect(result.updatedKnowledgeElements[1]).to.deep.equal(newKe);
  });
});
