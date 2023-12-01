import { expect, domainBuilder } from '../../../../test-helper.js';
import { AnswerStatus } from '../../../../../src/school/domain/models/AnswerStatus.js';
import * as SmartRandom from '../../../../../lib/domain/services/algorithm-methods/smart-random.js';
import _ from 'lodash';

const KNOWLEDGE_ELEMENT_STATUS = {
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated',
};

const ONE_MINUTE = 60;

function turnIntoTimedChallenge(challenge) {
  return _.assign(_.cloneDeep(challenge), { timer: ONE_MINUTE });
}

function duplicateChallengeOfSameDifficulty(challenge) {
  const challengeId = parseInt(challenge.id[0]) + 1;
  return _.assign(_.cloneDeep(challenge), { id: 'rec' + challengeId });
}

describe('Integration | Domain | Algorithm-methods | SmartRandom', function () {
  let challenges,
    targetSkills,
    knowledgeElements,
    lastAnswer,
    allAnswers,
    locale,
    web1,
    web2,
    web3,
    web4,
    web5,
    web6,
    web7,
    url2,
    url3,
    url4,
    url5,
    url6,
    rechInfo5,
    rechInfo7,
    info2,
    cnil1,
    cnil2,
    challengeWeb_1,
    challengeWeb_2,
    challengeWeb_2_3,
    challengeWeb_3,
    challengeWeb_4,
    challengeWeb_5,
    challengeWeb_6,
    challengeWeb_7,
    challengeUrl_2,
    challengeUrl_3,
    challengeUrl_4,
    challengeUrl_5,
    challengeUrl_6,
    challengeRechInfo_5,
    challengeRechInfo_7,
    challengeInfo_2_frAndEn,
    challengeCnil_1,
    challengeCnil_2;

  beforeEach(function () {
    targetSkills = null;
    knowledgeElements = null;
    lastAnswer = null;
    allAnswers = [];
    locale = 'fr';

    // Acquis (skills)
    web1 = domainBuilder.buildSkill({ id: 'rec01', name: '@web1', difficulty: 1 });
    web2 = domainBuilder.buildSkill({ id: 'rec02', name: '@web2', difficulty: 2 });
    web3 = domainBuilder.buildSkill({ id: 'rec03', name: '@web3', difficulty: 3 });
    web4 = domainBuilder.buildSkill({ id: 'rec04', name: '@web4', difficulty: 4 });
    web5 = domainBuilder.buildSkill({ id: 'rec05', name: '@web5', difficulty: 5 });
    web6 = domainBuilder.buildSkill({ id: 'rec06', name: '@web6', difficulty: 6 });
    web7 = domainBuilder.buildSkill({ id: 'rec07', name: '@web7', difficulty: 7 });
    url2 = domainBuilder.buildSkill({ id: 'rec08', name: '@url2', difficulty: 2 });
    url3 = domainBuilder.buildSkill({ id: 'rec09', name: '@url3', difficulty: 3 });
    url4 = domainBuilder.buildSkill({ id: 'rec10', name: '@url4', difficulty: 4 });
    url5 = domainBuilder.buildSkill({ id: 'rec11', name: '@url5', difficulty: 5 });
    url6 = domainBuilder.buildSkill({ id: 'rec12', name: '@url6', difficulty: 6 });
    rechInfo5 = domainBuilder.buildSkill({ id: 'rec13', name: '@rechInfo5', difficulty: 5 });
    rechInfo7 = domainBuilder.buildSkill({ id: 'rec14', name: '@rechInfo7', difficulty: 7 });
    info2 = domainBuilder.buildSkill({ id: 'rec15', name: '@info2', difficulty: 2 });
    cnil1 = domainBuilder.buildSkill({ id: 'rec16', name: '@cnil1', difficulty: 1 });
    cnil2 = domainBuilder.buildSkill({ id: 'rec17', name: '@cnil2', difficulty: 2 });

    // Challenges
    challengeWeb_1 = domainBuilder.buildChallenge({ id: 'recweb1', skill: web1, locales: ['fr'] });
    challengeWeb_2 = domainBuilder.buildChallenge({ id: 'recweb2', skill: web2, locales: ['fr'] });
    challengeWeb_2_3 = domainBuilder.buildChallenge({ id: 'recweb23', skill: web3, locales: ['fr'] });
    challengeWeb_3 = domainBuilder.buildChallenge({ id: 'recweb3', skill: web3, locales: ['fr'] });
    challengeWeb_4 = domainBuilder.buildChallenge({ id: 'recweb4', skill: web4, locales: ['fr'] });
    challengeWeb_5 = domainBuilder.buildChallenge({ id: 'recweb5', skill: web5, locales: ['fr'] });
    challengeWeb_6 = domainBuilder.buildChallenge({ id: 'recweb6', skill: web6, locales: ['fr'] });
    challengeWeb_7 = domainBuilder.buildChallenge({ id: 'recweb7', skill: web7, locales: ['fr'] });
    challengeUrl_2 = domainBuilder.buildChallenge({ id: 'recurl2', skill: url2, locales: ['fr'] });
    challengeUrl_3 = domainBuilder.buildChallenge({ id: 'recurl3', skill: url3, locales: ['fr'] });
    challengeUrl_4 = domainBuilder.buildChallenge({ id: 'recurl4', skill: url4, locales: ['fr'] });
    challengeUrl_5 = domainBuilder.buildChallenge({ id: 'recurl5', skill: url5, locales: ['fr'] });
    challengeUrl_6 = domainBuilder.buildChallenge({ id: 'recurl6', skill: url6, locales: ['fr'] });
    challengeRechInfo_5 = domainBuilder.buildChallenge({ id: 'recinfo5', skill: rechInfo5, locales: ['fr'] });
    challengeRechInfo_7 = domainBuilder.buildChallenge({ id: 'recinfo7', skill: rechInfo7, locales: ['fr'] });
    challengeCnil_1 = domainBuilder.buildChallenge({ id: 'reccnil1', skill: cnil1, locales: ['fr'] });
    challengeCnil_2 = domainBuilder.buildChallenge({ id: 'reccnil2', skill: cnil2, locales: ['fr'] });
    challengeInfo_2_frAndEn = domainBuilder.buildChallenge({ id: 'recinfo2', skill: info2, locales: ['fr', 'en'] });
  });

  describe('#getPossibleSkillsForNextChallenge', function () {
    context('when it is the first question only', function () {
      it('should ideally start with an untimed, default starting level skill', function () {
        // given
        targetSkills = [web1, url3, cnil1, cnil2];
        challenges = [challengeWeb_1, challengeWeb_3, challengeCnil_1, challengeCnil_2];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements: [],
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].challenges.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].id).to.be.equal(cnil2.id);
        expect(possibleSkillsForNextChallenge[0].challenges[0].id).to.be.equal(challengeCnil_2.id);
        expect(possibleSkillsForNextChallenge[0].timed).to.be.equal(false);
      });

      it('should prioritize and find an untimed skill if the last challenge is timed, to avoid starting with a timed one', function () {
        // given
        lastAnswer = domainBuilder.buildAnswer({ timeout: 50 });
        targetSkills = [url2, web1];
        const challenge_defaultLevel_Timed = turnIntoTimedChallenge(challengeUrl_2);
        const challenge_notDefaultLevel_Untimed = _.assign(_.cloneDeep(challengeWeb_1));
        challenges = [challenge_defaultLevel_Timed, challenge_notDefaultLevel_Untimed];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements: [],
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].challenges.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].id).to.be.equal(web1.id);
        expect(possibleSkillsForNextChallenge[0].challenges[0].id).to.be.equal(challengeWeb_1.id);
        expect(possibleSkillsForNextChallenge[0].timed).to.be.equal(false);
      });

      it('should start with an untimed skill 1 challenge when no default level challenge exists', function () {
        // given
        targetSkills = [web1, url3];
        challenges = [challengeWeb_1, challengeUrl_3];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements: [],
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].challenges.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].id).to.be.equal(web1.id);
        expect(possibleSkillsForNextChallenge[0].challenges[0].id).to.be.equal(challengeWeb_1.id);
        expect(possibleSkillsForNextChallenge[0].timed).to.be.equal(false);
      });

      it('should start with a not timed level 4 challenge when level 1, 2 and 3 dont exist', function () {
        // given
        targetSkills = [web4, url5];
        challenges = [challengeWeb_4, challengeUrl_5];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements: [],
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].challenges.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].id).to.be.equal(web4.id);
        expect(possibleSkillsForNextChallenge[0].challenges[0].id).to.be.equal(challengeWeb_4.id);
        expect(possibleSkillsForNextChallenge[0].timed).to.be.equal(false);
      });

      it('should start with a timed challenge anyway when no untimed challenges were found', function () {
        // given
        targetSkills = [web3];
        const challenge_AnyLevel_Timed = turnIntoTimedChallenge(challengeWeb_3);
        challenges = [challenge_AnyLevel_Timed];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements: [],
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].challenges.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].id).to.be.equal(web3.id);
        expect(possibleSkillsForNextChallenge[0].challenges[0].id).to.be.equal(challengeWeb_3.id);
        expect(possibleSkillsForNextChallenge[0].timed).to.be.equal(true);
      });
    });

    context('when the difficulty must be adapted based on the answer to the previous question', function () {
      it('should end the test when the remaining challenges have been inferred to be too hard', function () {
        // given
        targetSkills = [url2, url3, rechInfo5, web7];
        challenges = [challengeUrl_2, challengeUrl_3, challengeRechInfo_5, challengeWeb_7];

        lastAnswer = domainBuilder.buildAnswer({ challengeId: challengeRechInfo_5.id, result: AnswerStatus.KO });
        allAnswers = [lastAnswer];
        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: url2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: url3.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: rechInfo5.id,
            status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED,
            source: 'direct',
          }),
        ];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements,
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(0);
      });

      it('should consider skipping a challenge equivalent to not knowing and decrease difficulty when it happens', function () {
        // given
        targetSkills = [web1, web2, web3];
        challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_2, challengeWeb_3];
        lastAnswer = domainBuilder.buildAnswer({ challengeId: challengeWeb_2.id, result: AnswerStatus.SKIPPED });
        allAnswers = [lastAnswer];
        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED,
            source: 'direct',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: web3.id,
            status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED,
            source: 'indirect',
          }),
        ];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements,
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge[0].difficulty).to.be.equal(1);
      });

      it('should decrease the difficulty when the last given answer was not correct', function () {
        // given
        targetSkills = [web1, web2, url3, url4, rechInfo5, rechInfo7, url6];

        challenges = [
          challengeWeb_1,
          challengeWeb_2,
          challengeUrl_3,
          challengeUrl_4,
          challengeUrl_6,
          challengeRechInfo_5,
          challengeRechInfo_7,
        ];

        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: url3.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: url4.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: url6.id,
            status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED,
            source: 'direct',
          }),
        ];

        lastAnswer = domainBuilder.buildAnswer({ challengeId: challengeUrl_6.id, result: AnswerStatus.KO });
        allAnswers = [
          lastAnswer,
          domainBuilder.buildAnswer({ challengeId: challengeWeb_2.id, result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: challengeUrl_4.id, result: AnswerStatus.OK }),
        ];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements,
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].challenges.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].id).to.be.equal(rechInfo5.id);
        expect(possibleSkillsForNextChallenge[0].challenges[0].id).to.be.equal(challengeRechInfo_5.id);
      });

      it('should ask a challenge of maximum difficulty when maximum difficulty (minus 1) was correctly answered (edge case test)', function () {
        // given
        targetSkills = [web1, web2, web4, web5, web6];

        challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_4, challengeWeb_5, challengeWeb_6];

        lastAnswer = domainBuilder.buildAnswer({ challengeId: challengeWeb_5.id, result: AnswerStatus.OK });
        allAnswers = [
          lastAnswer,
          domainBuilder.buildAnswer({ challengeId: challengeWeb_2.id, result: AnswerStatus.OK }),
        ];

        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: web4.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: web5.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
        ];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements,
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].challenges.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].id).to.be.equal(web6.id);
        expect(possibleSkillsForNextChallenge[0].challenges[0].id).to.be.equal(challengeWeb_6.id);
      });

      it('should end the test if the only available challenges are too hard (above maximum gap allowed)', function () {
        // given
        targetSkills = [web1, web2, web4, web6];
        challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_4, challengeWeb_5];
        lastAnswer = domainBuilder.buildAnswer({ challengeId: challengeWeb_2.id, result: AnswerStatus.OK });
        allAnswers = [lastAnswer];
        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
        ];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements,
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge[0].difficulty).not.to.be.deep.equal(6);
      });

      it('should prioritize a challenge from an easy tube if given the possibility', function () {
        // given
        targetSkills = [url4, url5, web3, info2];
        challenges = [challengeUrl_4, challengeUrl_5, challengeInfo_2_frAndEn, challengeWeb_3];
        lastAnswer = [domainBuilder.buildAnswer({ challengeId: challengeInfo_2_frAndEn.id, result: AnswerStatus.OK })];
        allAnswers = [lastAnswer];
        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: info2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
        ];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements,
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].challenges.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].id).to.be.equal(web3.id);
        expect(possibleSkillsForNextChallenge[0].challenges[0].id).to.be.equal(challengeWeb_3.id);
      });

      it('should nevertheless target a challenge from any tubes when there is no easy tube', function () {
        // given
        targetSkills = [url4, url6, info2];
        challenges = [challengeUrl_4, challengeUrl_6, challengeInfo_2_frAndEn];
        lastAnswer = domainBuilder.buildAnswer({ challengeId: challengeInfo_2_frAndEn.id, result: AnswerStatus.OK });
        allAnswers = [lastAnswer];
        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: info2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
        ];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements,
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].challenges.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].id).to.be.equal(url4.id);
        expect(possibleSkillsForNextChallenge[0].challenges[0].id).to.be.equal(challengeUrl_4.id);
      });
    });

    context('when the next question added knowledge value is taken into account', function () {
      it('should end the test if the next challenges wont provide any additional knowledge on the user', function () {
        // given
        targetSkills = [web1, web2];
        challenges = [challengeWeb_1, challengeWeb_2, duplicateChallengeOfSameDifficulty(challengeWeb_2)];
        lastAnswer = domainBuilder.buildAnswer({ challengeId: challengeWeb_2.id, result: AnswerStatus.OK });
        allAnswers = [lastAnswer];
        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
        ];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements,
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(0);
      });

      it('should do a deterministic selection of a challenge among challenges of equal reward', function () {
        // given
        targetSkills = [web1, web2, web3, url3];
        challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_3];
        lastAnswer = domainBuilder.buildAnswer({ challengeId: challengeWeb_2.id, result: AnswerStatus.OK });
        allAnswers = [lastAnswer];
        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
        ];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements,
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].challenges.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].id).to.be.equal(web3.id);
        expect(possibleSkillsForNextChallenge[0].challenges[0].id).to.be.equal(challengeWeb_3.id);
      });
    });

    context('when knowledge elements contains skills no present in the target profile', function () {
      it('should return correctly a next challenge', function () {
        // given
        targetSkills = [web1, web2, web3, url3];
        challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_3];
        lastAnswer = domainBuilder.buildAnswer({ challengeId: challengeWeb_2.id, result: AnswerStatus.OK });
        allAnswers = [lastAnswer];
        knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: web1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: web5.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: url2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
        ];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements,
          lastAnswer,
          allAnswers,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].challenges.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].id).to.be.equal(web3.id);
        expect(possibleSkillsForNextChallenge[0].challenges[0].id).to.be.equal(challengeWeb_3.id);

        // This is where we assert the randomness behavior to have deterministic test
      });
    });

    context('when one challenge has already been answered but its learning content has been updated', function () {
      it('should not be asked again and ask another challenge from same skill', function () {
        // given
        targetSkills = [web2];
        challenges = [challengeWeb_2_3, challengeWeb_2];
        lastAnswer = domainBuilder.buildAnswer({ challengeId: challengeWeb_2_3.id, result: AnswerStatus.KO });
        allAnswers = [lastAnswer];
        knowledgeElements = [];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements,
          allAnswers,
          lastAnswer,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].challenges.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].id).to.be.equal(web2.id);
        expect(possibleSkillsForNextChallenge[0].challenges[0].id).to.be.equal(challengeWeb_2.id);
      });

      it('should not be asked again and ask another challenge from another skill', function () {
        // given
        targetSkills = [web1, web2]; //web1, web2: une question possible mais déjà répondu => web1
        challenges = [challengeWeb_1, challengeWeb_2];
        lastAnswer = domainBuilder.buildAnswer({ challengeId: challengeWeb_2.id, result: AnswerStatus.KO });
        allAnswers = [lastAnswer];
        knowledgeElements = [];

        // when
        const { possibleSkillsForNextChallenge } = SmartRandom.getPossibleSkillsForNextChallenge({
          targetSkills,
          challenges,
          knowledgeElements,
          allAnswers,
          lastAnswer,
          locale,
        });

        // then
        expect(possibleSkillsForNextChallenge.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].challenges.length).to.be.equal(1);
        expect(possibleSkillsForNextChallenge[0].id).to.be.equal(web1.id);
        expect(possibleSkillsForNextChallenge[0].challenges[0].id).to.be.equal(challengeWeb_1.id);
      });
    });

    context('when one skill does not have challenge in the asked locale', function () {
      it('should propose only skill with asked locale', function () {
        // given
        targetSkills = [info2, cnil2];
        challenges = [challengeInfo_2_frAndEn, challengeCnil_2];
        lastAnswer = null;
        allAnswers = [];
        knowledgeElements = [];

        // when
        const { possibleSkillsForNextChallenge: possibleSkillsForNextChallengeInEnglish } =
          SmartRandom.getPossibleSkillsForNextChallenge({
            targetSkills,
            challenges,
            knowledgeElements,
            lastAnswer,
            allAnswers,
            locale: 'en',
          });
        const { possibleSkillsForNextChallenge: possibleSkillsForNextChallengeInFrench } =
          SmartRandom.getPossibleSkillsForNextChallenge({
            targetSkills,
            challenges,
            knowledgeElements,
            lastAnswer,
            allAnswers,
            locale: 'fr',
          });

        // then
        expect(possibleSkillsForNextChallengeInFrench.length).to.be.equal(2);
        expect(possibleSkillsForNextChallengeInFrench[0].name).to.be.equal('@info2');
        expect(possibleSkillsForNextChallengeInFrench[1].name).to.be.equal('@cnil2');

        expect(possibleSkillsForNextChallengeInEnglish.length).to.be.equal(1);
        expect(possibleSkillsForNextChallengeInEnglish[0].name).to.be.equal('@info2');
      });
    });
  });
});
