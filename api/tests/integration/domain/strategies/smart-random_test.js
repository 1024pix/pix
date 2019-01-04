const { expect, sinon, domainBuilder } = require('../../../test-helper');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const smartRandom = require('../../../../lib/domain/strategies/smart-random');
const _ = require('lodash');

const KNOWLEDGE_ELEMENT_STATUS = {
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated'
};

const ONE_MINUTE = 60;

function turnIntoTimedChallenge(challenge) {
  return _.assign(_.cloneDeep(challenge), { timer: ONE_MINUTE });
}

function turnIntoArchivedChallenge(challenge) {
  return _.assign(_.cloneDeep(challenge), { status: 'archived' });
}

function duplicateChallengeOfSameDifficulty(challenge) {
  const challengeId = parseInt(challenge.id[0]) + 1;
  return _.assign(_.cloneDeep(challenge), { id: 'rec' + challengeId });
}

describe('Integration | Domain | Stategies | SmartRandom', () => {
  let challenges, targetProfile, skills, knowledgeElements, answers, web1, web2, web3, web4, web5,
    web6, web7, url2, url3, url4, url5, url6, rechInfo5, rechInfo7, info2, cnil2, challengeWeb_1,
    challengeWeb_2, challengeWeb_3, challengeWeb_4, challengeWeb_5, challengeWeb_6, challengeWeb_7,
    challengeUrl_2, challengeUrl_3, challengeUrl_4, challengeUrl_5, challengeUrl_6, challengeRechInfo_5,
    challengeRechInfo_7, challengeInfo_2, challengeCnil_2;

  beforeEach(() => {
    targetProfile = null;
    skills = null;
    knowledgeElements = null;
    answers = null;

    // Acquis (skills)
    web1 = domainBuilder.buildSkill({ name: '@web1' });
    web2 = domainBuilder.buildSkill({ name: '@web2' });
    web3 = domainBuilder.buildSkill({ name: '@web3' });
    web4 = domainBuilder.buildSkill({ name: '@web4' });
    web5 = domainBuilder.buildSkill({ name: '@web5' });
    web6 = domainBuilder.buildSkill({ name: '@web6' });
    web7 = domainBuilder.buildSkill({ name: '@web7' });
    url2 = domainBuilder.buildSkill({ name: '@url2' });
    url3 = domainBuilder.buildSkill({ name: '@url3' });
    url4 = domainBuilder.buildSkill({ name: '@url4' });
    url5 = domainBuilder.buildSkill({ name: '@url5' });
    url6 = domainBuilder.buildSkill({ name: '@url6' });
    rechInfo5 = domainBuilder.buildSkill({ name: '@rechInfo5' });
    rechInfo7 = domainBuilder.buildSkill({ name: '@rechInfo7' });
    info2 = domainBuilder.buildSkill({ name: '@info2' });
    cnil2 = domainBuilder.buildSkill({ name: '@cnil2' });

    // Challenges
    challengeWeb_1 = domainBuilder.buildChallenge({ id: 'rec1', skills: [web1] });
    challengeWeb_2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [web2] });
    challengeWeb_3 = domainBuilder.buildChallenge({ id: 'rec3', skills: [web3] });
    challengeWeb_4 = domainBuilder.buildChallenge({ id: 'rec4', skills: [web4] });
    challengeWeb_5 = domainBuilder.buildChallenge({ id: 'rec5', skills: [web5] });
    challengeWeb_6 = domainBuilder.buildChallenge({ id: 'rec6', skills: [web6] });
    challengeWeb_7 = domainBuilder.buildChallenge({ id: 'rec7', skills: [web7] });
    challengeUrl_2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [url2] });
    challengeUrl_3 = domainBuilder.buildChallenge({ id: 'rec3', skills: [url3] });
    challengeUrl_4 = domainBuilder.buildChallenge({ id: 'rec4', skills: [url4] });
    challengeUrl_5 = domainBuilder.buildChallenge({ id: 'rec5', skills: [url5] });
    challengeUrl_6 = domainBuilder.buildChallenge({ id: 'rec6', skills: [url6] });
    challengeRechInfo_5 = domainBuilder.buildChallenge({ id: 'rec5', skills: [rechInfo5] });
    challengeRechInfo_7 = domainBuilder.buildChallenge({ id: 'rec5', skills: [rechInfo7] });
    challengeCnil_2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [cnil2] });
    challengeInfo_2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [info2] });
  });

  describe('#nextChallenge', function() {

    // The first question has specific rules. The most important is that it should not be a timed challenge to avoid user
    // being confused into thinking that all questions will be timed. Also, the algorithm requires to start at a default
    // expect level, that is not the minimum. When this two criterias can't be satisfied simultaneously, the untimed rule wins
    context('when it is the first question only', () => {

      it('should ideally start with an untimed, default starting level challenge', function() {
        // given
        targetProfile = new TargetProfile({ skills: [web1, url3, cnil2] });
        challenges = [challengeWeb_1, challengeWeb_3, challengeCnil_2];

        // when
        const nextChallenge = smartRandom.getNextChallenge({
          targetProfile,
          challenges,
          knowledgeElements: [],
          answers: []
        });

        // then
        expect(nextChallenge).to.be.equal(challengeCnil_2);
      });

      it('should prioritize and find an untimed challenge if the default level challenge is timed, to avoid starting with a timed one', function() {
        // given
        targetProfile = new TargetProfile({ skills: [url2, web1] });
        const challenge_defaultLevel_Timed = turnIntoTimedChallenge(challengeUrl_2);
        const challenge_notDefaultLevel_Untimed = _.assign(_.cloneDeep(challengeWeb_1));
        challenges = [challenge_defaultLevel_Timed, challenge_notDefaultLevel_Untimed];

        // when
        const nextChallenge = smartRandom.getNextChallenge({
          targetProfile,
          challenges,
          knowledgeElements: [],
          answers: []
        });

        // then
        expect(nextChallenge).to.be.equal(challenge_notDefaultLevel_Untimed);
      });

      it('should start with an untimed level 1 challenge when no default level challenge exists', function() {
        // given
        targetProfile = new TargetProfile({ skills: [web1, url3] });
        challenges = [challengeWeb_1, challengeUrl_3];

        // when
        const nextChallenge = smartRandom.getNextChallenge({
          targetProfile,
          challenges,
          knowledgeElements: [],
          answers: []
        });

        // then
        expect(nextChallenge).to.be.equal(challengeWeb_1);
      });

      it('should start with a not timed level 4 challenge when level 1, 2 and 3 dont exist', function() {
        // given
        targetProfile = new TargetProfile({ skills: [web4, url5] });
        challenges = [challengeWeb_4, challengeUrl_5];

        // when
        const nextChallenge = smartRandom.getNextChallenge({
          targetProfile,
          challenges,
          knowledgeElements: [],
          answers: []
        });

        // then
        expect(nextChallenge).to.be.equal(challengeWeb_4);
      });

      it('should start with a timed challenge anyway when no untimed challenges were found', function() {
        // given
        targetProfile = new TargetProfile({ skills: [web3] });
        const challenge_AnyLevel_Timed = turnIntoTimedChallenge(challengeWeb_3);
        challenges = [challenge_AnyLevel_Timed];

        // when
        const nextChallenge = smartRandom.getNextChallenge({
          targetProfile,
          challenges,
          knowledgeElements: [],
          answers: []
        });

        // then
        expect(nextChallenge).to.be.equal(challenge_AnyLevel_Timed);
      });

    });

    // Some challenges can be archived. Such challenges may be ruled out whn they haven't been answered yet, but at the same time
    // must be taken into account when the user has already answered them, since they give useful information to the adaptive algorithlm.
    context('when one challenge has been archived', () => {
      let challengeWeb_3_Archived, challengeWeb_4_Archived;

      beforeEach(() => {
        targetProfile = new TargetProfile({ skills: [web1, web2, web3, web4, web5] });
        challengeWeb_3_Archived = turnIntoArchivedChallenge(challengeWeb_3);
        challengeWeb_4_Archived = turnIntoArchivedChallenge(challengeWeb_4);
      });

      it('should return a challenge of level 4 if user got levels 1, 2 and the only possible level is 3 archived', function() {
        // given
        targetProfile = { skills: [web1, web2, web3, web4, web5, web6] };
        answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
        ];
        knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
        ];

        challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_3_Archived, challengeWeb_4];

        // when
        const nextChallenge = smartRandom.getNextChallenge({ targetProfile, challenges, knowledgeElements, answers });

        // then
        expect(nextChallenge).to.equal(challengeWeb_4);
      });

      it('should return a challenge of level 3 if user got levels 1, 2 and another possible level 3 is archived', function() {
        // given
        targetProfile = { skills: [web1, web2, web3, web4, web5, web6] };
        answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
        ];
        knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
        ];

        challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_3, challengeWeb_3_Archived];

        // when
        const nextChallenge = smartRandom.getNextChallenge({ targetProfile, challenges, knowledgeElements, answers });

        // then
        expect(nextChallenge).to.equal(challengeWeb_3);
      });

      it('should return a challenge of level 4 if user got levels 1, 2, 3 and 3 was archived afterwards', function() {
        // given
        targetProfile = { skills: [web1, web2, web3, web4, web5, web6] };
        answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec3', result: AnswerStatus.OK }),
        ];
        knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web3.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
        ];

        challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_3, challengeWeb_3_Archived, challengeWeb_4];

        // when
        const nextChallenge = smartRandom.getNextChallenge({ targetProfile, challenges, knowledgeElements, answers });

        // then
        expect(nextChallenge).to.equal(challengeWeb_4);
      });

      it('should return a challenge of level 3 if user got levels 1, 2, but failed 4, and 4 was archived afterwards', function() {
        // given
        targetProfile = { skills: [web1, web2, web3, web4, web5, web6] };
        answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec4', result: AnswerStatus.KO }),
        ];
        knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web5.id,
            status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED,
            source: 'direct'
          }),
        ];

        challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_3, challengeWeb_4_Archived, challengeWeb_5];

        // when
        const nextChallenge = smartRandom.getNextChallenge({ targetProfile, challenges, knowledgeElements, answers });

        // then
        expect(nextChallenge).to.equal(challengeWeb_3);
      });

    });

    // These tests verify the adaptive behavior of the algorithm : that it can increase/decrease the difficulty accordingly, can reach
    // the maximum level, can end when no challenges are available etc.
    context('when the difficulty must be adapted based on the answer to the previous question', () => {

      it('should end the test when the remaining challenges have been inferred to be too hard', function() {
        // given
        targetProfile = new TargetProfile({ skills: [url2, url3, rechInfo5, web7] });
        challenges = [challengeUrl_2, challengeUrl_3, challengeRechInfo_5, challengeWeb_7];

        answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec3', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec5', result: AnswerStatus.KO })
        ];
        knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: url2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: url3.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: rechInfo5.id,
            status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED,
            source: 'direct'
          })
        ];

        // when
        const nextChallenge = smartRandom.getNextChallenge({ targetProfile, challenges, knowledgeElements, answers });

        // then
        expect(nextChallenge).to.equal(null);

      });

      it('should consider skipping a challenge equivalent to not knowing and decrease difficulty when it happens', function() {
        // given
        targetProfile = new TargetProfile({ skills: [web1, web2, web3] });
        challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_2, challengeWeb_3];
        answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.SKIPPED })
        ];
        knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED,
            source: 'direct'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web3.id,
            status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED,
            source: 'indirect'
          }),
        ];

        // when
        const nextChallenge = smartRandom.getNextChallenge({ targetProfile, challenges, knowledgeElements, answers });

        // then
        expect(nextChallenge.hardestSkill.difficulty).to.be.equal(1);
      });

      it('should decrease the difficulty when the last given answer was not correct', function() {
        // given
        targetProfile = new TargetProfile({ skills: [web1, web2, url3, url4, rechInfo5, rechInfo7, url6] });

        challenges = [challengeWeb_1, challengeWeb_2, challengeUrl_3, challengeUrl_4, challengeUrl_6, challengeRechInfo_5, challengeRechInfo_7];

        knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: url3.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: url4.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: url6.id,
            status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED,
            source: 'direct'
          })
        ];

        answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec4', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec6', result: AnswerStatus.KO })
        ];

        // when
        const nextChallenge = smartRandom.getNextChallenge({ targetProfile, challenges, knowledgeElements, answers });

        // then
        expect(nextChallenge).to.equal(challengeRechInfo_5);
      });

      it('should ask a challenge of maximum difficulty when maximum difficulty (minus 1) was correctly answered (edge case test)', function() {
        // given
        skills = [web1, web2, web4, web6, web7];
        targetProfile = new TargetProfile({ skills });

        challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_4, challengeWeb_6, challengeWeb_7];

        answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec6', result: AnswerStatus.OK })
        ];
        knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web4.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web6.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
        ];

        // when
        const nextChallenge = smartRandom.getNextChallenge({ targetProfile, challenges, knowledgeElements, answers });

        // then
        expect(nextChallenge).to.be.deep.equal(challengeWeb_7);
      });

      it('should end the test if the only available challenges are too hard (above maximum gap allowed)', function() {
        // given
        skills = [web1, web2, web4, web6];
        targetProfile = new TargetProfile({ skills });
        challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_4, challengeWeb_6];
        answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK })
        ];
        knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
        ];

        // when
        const nextChallenge = smartRandom.getNextChallenge({ targetProfile, challenges, knowledgeElements, answers });

        // then
        expect(nextChallenge.skills[0].difficulty).not.to.be.equal(6);
      });

      it('should prioritze a challenge from an easy tube if given the possibility', function() {
        // given
        skills = [url4, url5, web3, info2];
        targetProfile = new TargetProfile({ skills });
        challenges = [challengeUrl_4, challengeUrl_5, challengeInfo_2, challengeWeb_3];
        answers = [domainBuilder.buildAnswer({ challengeId: '@recInfo2', result: AnswerStatus.OK })];
        knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: info2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          })
        ];

        // when
        const nextChallenge = smartRandom.getNextChallenge({ targetProfile, challenges, knowledgeElements, answers });

        // then
        expect(nextChallenge).to.equal(challengeWeb_3);
      });

      it('should nevertheless target a challenge from any tubes when there is no easy tube', function() {
        // given
        skills = [url4, url6, info2];
        targetProfile = new TargetProfile({ skills });
        challenges = [challengeUrl_4, challengeUrl_6, challengeInfo_2];
        answers = [domainBuilder.buildAnswer({ challengeId: '@recInfo2', result: AnswerStatus.OK })];
        knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: info2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          })
        ];

        // when
        const nextChallenge = smartRandom.getNextChallenge({ targetProfile, challenges, knowledgeElements, answers });

        // then
        expect(nextChallenge).to.equal(challengeUrl_4);
      });

    });

    // The adaptive algorithm is based on the idea that each question must provide additionnal value and must not
    // discriminate between challenges that bring the same knowledge on the user
    context('when the next question added knowledge value is taken into account', () => {

      it('should end the test if the next challenges wont provide any additionnal knowledge on the user', function() {
        // given
        skills = [web1, web2];
        targetProfile = new TargetProfile({ skills });
        challenges = [challengeWeb_1, challengeWeb_2, duplicateChallengeOfSameDifficulty(challengeWeb_2)];
        answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK })
        ];
        knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
        ];

        // when
        const nextChallenge = smartRandom.getNextChallenge({ targetProfile, challenges, knowledgeElements, answers });

        // then
        expect(nextChallenge).to.be.equal(null);
      });

      it('should select a challenge randomly among challenges of equal reward', function() {
        // given
        skills = [web1, web2, web3, url3];
        targetProfile = new TargetProfile({ skills });
        challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_3];
        answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2a', result: AnswerStatus.OK })
        ];
        knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
        ];

        sinon.stub(_, 'sample').returns(challengeWeb_3);

        // when
        const nextChallenge = smartRandom.getNextChallenge({ targetProfile, challenges, knowledgeElements, answers });

        // then
        expect(nextChallenge).to.deep.equal(challengeWeb_3);

        // This is where we assert the randomness behavior to have deterministic test
        expect(_.sample).to.have.been.called;
        _.sample.restore();
      });
    });

  });
});

