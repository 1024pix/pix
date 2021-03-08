const sinon = require('sinon');
const { expect } = require('chai');
const { describe, beforeEach, afterEach, it } = require('mocha');
const { answerTheChallenge, _getReferentiel } = require('../algo');
const DataFetcher = require('../../../api/lib/domain/services/smart-random/data-fetcher');
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
    sinon.stub(KnowledgeElement, 'createKnowledgeElementsForAnswer').returns([newKe]);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return the list of answers with previous answer with the new one', () => {
    // when
    const result = answerTheChallenge({
      challenge,
      allAnswers: previousAnswers,
      allKnowledgeElements: previousKE,
      targetSkills: [],
      userId: 1,
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
      userId: 1,
    });

    // then
    expect(result.updatedKnowledgeElements).lengthOf(previousKE.length + 1);
    expect(result.updatedKnowledgeElements[0]).to.deep.equal(previousKE[0]);
    expect(result.updatedKnowledgeElements[1]).to.deep.equal(newKe);
  });

  describe('when userResult is "ok"', ()=> {
    const userResult = 'ok';

    it('should return the list of answers with the new one validated', () => {
      // when
      const result = answerTheChallenge({
        challenge,
        allAnswers: previousAnswers,
        allKnowledgeElements: previousKE,
        targetSkills: [],
        userId: 1,
        userResult,
      });

      // then
      expect(result.updatedAnswers).lengthOf(previousAnswers.length + 1);
      expect(result.updatedAnswers[0]).to.be.deep.equal(previousAnswers[0]);
      expect(result.updatedAnswers[1].challengeId).to.be.equal(challenge.id);
      expect(result.updatedAnswers[1].result).to.be.deep.equal({ status: 'ok' });
    });

  });

  describe('when userResult is "ko"', ()=> {
    const userResult = 'ko';

    it('should return the list of answers with the new one invalidated', () => {
      // when
      const result = answerTheChallenge({
        challenge,
        allAnswers: previousAnswers,
        allKnowledgeElements: previousKE,
        targetSkills: [],
        userId: 1,
        userResult,
      });

      // then
      expect(result.updatedAnswers).lengthOf(previousAnswers.length + 1);
      expect(result.updatedAnswers[0]).to.be.deep.equal(previousAnswers[0]);
      expect(result.updatedAnswers[1].challengeId).to.be.equal(challenge.id);
      expect(result.updatedAnswers[1].result).to.be.deep.equal({ status: 'ko' });
    });

  });

  describe('when userResult is "random"', ()=> {

    const userResult = 'random';

    it('should return the list of answers with some validated and some invalidated', () => {
      // when
      previousAnswers = [];
      const allResults = [];
      for (let i = 0; i < 50; i++) {
        const result = answerTheChallenge({
          challenge,
          allAnswers: previousAnswers,
          allKnowledgeElements: previousKE,
          targetSkills: [],
          userId: 1,
          userResult,
        });
        allResults.push(result.updatedAnswers[0].result.status);
      }

      // then
      expect(allResults).to.contains('ok');
      expect(allResults).to.contains('ko');
    });

  });

  describe('when userResult is first OK then all KO', () => {
    const userResult = 'firstOKthenKO';

    it('should return the list of answers with the first one validated and the rest invalidated', () => {
      // when
      const allResults = [];
      previousAnswers = [];
      for (let i = 0; i < 10; i++) {
        const result = answerTheChallenge({
          challenge,
          allAnswers: previousAnswers,
          allKnowledgeElements: previousKE,
          targetSkills: [],
          userId: 1,
          userResult,
        });
        previousAnswers = result.updatedAnswers;
        allResults.push(result.updatedAnswers[i].result.status);
      }

      // then
      expect(allResults[0]).to.equal('ok');
      expect(allResults.slice(1)).to.contains('ko');
      expect(allResults.slice(1)).to.not.contains('ok');
    });

  });

  describe('when userResult is first K0 then all OK', ()=> {
    const userResult = 'firstKOthenOK';

    it('should return the list of answers with the first one invalidated and the rest validated', () => {
      // when
      const allResults = [];
      let previousAnswers = [];
      for (let i = 0; i < 10; i++) {
        const result = answerTheChallenge({
          challenge,
          allAnswers: previousAnswers,
          allKnowledgeElements: previousKE,
          targetSkills: [],
          userId: 1,
          userResult,
        });
        previousAnswers = result.updatedAnswers;
        allResults.push(result.updatedAnswers[i].result.status);
      }

      // then
      expect(allResults[0]).to.equal('ko');
      expect(allResults.slice(1)).to.contains('ok');
      expect(allResults.slice(1)).to.not.contains('ko');
    });

  });

});

describe('#_getReferentiel', () => {
  it('should return skills and challenges from a given targetProfile', async () => {
    // given
    const targetProfileId = 1;
    const answerRepository = {};
    const assessment = {};
    const challengeRepository = {};
    const knowledgeElementRepository = {};
    const skillRepository = {};
    const improvementService = {};
    const targetProfileRepository = {
      get: () => {},
    };

    const expectedSkills = [{ id: 'recSkill1' }, { id: 'recSkill2' }, { id: 'recSkill3' }];
    const expectedChallenges = [{ id: 'recChallenge1' }, { id: 'recChallenge2' }, { id: 'recChallenge3' }];

    sinon.stub(DataFetcher, 'fetchForCampaigns').returns({ targetSkills: expectedSkills, challenges: expectedChallenges });

    // when
    const result = await _getReferentiel({
      assessment,
      targetProfileId,
      answerRepository,
      challengeRepository,
      knowledgeElementRepository,
      skillRepository,
      improvementService,
      targetProfileRepository,
    });

    // then
    expect(expectedSkills).to.be.deep.equal(result.targetSkills);
    expect(expectedChallenges).to.be.deep.equal(result.challenges);
  });

  it('should return skills and challenges from a given assessment', async () => {
    // given
    const assessment = { competenceId: 1 };
    const targetProfileId = null;
    const answerRepository = {};
    const challengeRepository = {};
    const knowledgeElementRepository = {};
    const skillRepository = {};
    const improvementService = {};
    const targetProfileRepository = {};

    const expectedSkills = [{ id: 'recSkill1' }, { id: 'recSkill2' }, { id: 'recSkill3' }];
    const expectedChallenges = [{ id: 'recChallenge1' }, { id: 'recChallenge2' }, { id: 'recChallenge3' }];

    sinon.stub(DataFetcher, 'fetchForCompetenceEvaluations').returns({ targetSkills: expectedSkills, challenges: expectedChallenges });

    // when
    const result = await _getReferentiel({
      assessment,
      targetProfileId,
      answerRepository,
      challengeRepository,
      knowledgeElementRepository,
      skillRepository,
      improvementService,
      targetProfileRepository,
    });

    // then
    expect(expectedSkills).to.be.deep.equal(result.targetSkills);
    expect(expectedChallenges).to.be.deep.equal(result.challenges);
  });
});
