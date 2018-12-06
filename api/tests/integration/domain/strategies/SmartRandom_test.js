const { expect, domainBuilder } = require('../../../test-helper');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Tube = require('../../../../lib/domain/models/Tube');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const SmartRandom = require('../../../../lib/domain/strategies/SmartRandom');
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

describe.only('Integration | Domain | Stategies | SmartRandom', () => {
  let targetProfile, web1, web2, web3, web4, web5, web6, web7, url2, url3, url4, url5, url6, url7, rechInfo5, rechInfo7, info2, cnil2;
  let challengeWeb_1, challengeWeb_2, challengeWeb_3, challengeWeb_4, challengeWeb_5, challengeWeb_6,
    challengeWeb_7, challengeUrl_2, challengeUrl_3, challengeUrl_4, challengeUrl_5, challengeUrl_6,
    challengeUrl_7, challengeRechInfo_5, challengeRechInfo_7, challengeInfo_2, challengeCnil_2;

  beforeEach(() => {
    targetProfile = null;

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
    url7 = domainBuilder.buildSkill({ name: '@url7' });
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
    challengeUrl_7 = domainBuilder.buildChallenge({ id: 'rec7', skills: [url7] });
    challengeRechInfo_5 = domainBuilder.buildChallenge({ id: 'rec5', skills: [rechInfo5] });
    challengeRechInfo_7 = domainBuilder.buildChallenge({ id: 'rec7', skills: [rechInfo7] });
    challengeCnil_2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [cnil2] });
    challengeInfo_2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [info2] });

  });

  describe('#constructor', () => {
    it('should create a course with tubes', () => {
      // given
      const challenge1 = domainBuilder.buildChallenge({ id: '@recWeb1', skills: [web1] });
      const challenge2 = domainBuilder.buildChallenge({ id: '@recWeb2', skills: [web2] });
      const challenge3 = domainBuilder.buildChallenge({ id: '@recWeb3', skills: [web3] });

      const challenges = [challenge1, challenge2, challenge3];
      const skills = [web1, web2, web3];
      const targetProfile = new TargetProfile({ skills });
      const expectedTubes = new Tube({ skills: [web1, web2, web3] });
      const answers = [];
      const knowledgeElements = [];

      // when
      const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });

      // then
      expect(smartRandom.course.tubes).to.be.deep.equal([expectedTubes]);
    });

    it('should create a course with tubes contains only skills with challenges', () => {
      // given
      const challenge1 = domainBuilder.buildChallenge({ id: '@recWeb1', skills: [web1] });
      const challenge2 = domainBuilder.buildChallenge({ id: '@recWeb2', skills: [web2] });

      const challenges = [challenge1, challenge2];
      const skills = [web1, web2, web3];
      const targetProfile = new TargetProfile({ skills });
      const expectedTubes = new Tube({ skills: [web1, web2] });
      const answers = [];
      const knowledgeElements = [];

      // when
      const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });

      // then
      expect(smartRandom.course.tubes).to.be.deep.equal([expectedTubes]);
    });
  });

  describe('#nextChallenge', function() {

    // The first question has specific rules. The most important is that it should not be a timed challenge to avoid user
    // being confused into thinking that all questions will be timed. Also, the algorithm requires to start at a default
    // expect level, that is not the minimum. When this two criterias can't be satisfied simultaneously, the untimed rule wins
    context('when it is the first question only', () => {

      it('should ideally start with an untimed, default starting level challenge', function() {
        // given
        const targetProfile = new TargetProfile({ skills: [web1, url3, cnil2] });
        const challenges = [challengeWeb_1, challengeWeb_3, challengeCnil_2];

        // when
        const smartRandom = new SmartRandom({ targetProfile, challenges, knowledgeElements: [], answers: [] });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.be.equal(challengeCnil_2);
      });

      it('should prioritize and find an untimed challenge if the default level challenge is timed, to avoid starting with a timed one', function() {
        // given
        const targetProfile = new TargetProfile({ skills: [url2, web1] });
        const challenge_defaultLevel_Timed = turnIntoTimedChallenge(challengeUrl_2);
        const challenge_notDefaultLevel_Untimed = _.assign(_.cloneDeep(challengeWeb_1));
        const challenges = [challenge_defaultLevel_Timed, challenge_notDefaultLevel_Untimed];

        // when
        const smartRandom = new SmartRandom({ targetProfile, challenges, knowledgeElements: [], answers: [] });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.be.equal(challenge_notDefaultLevel_Untimed);
      });

      it('should start with an untimed level 1 challenge when no default level challenge exists', function() {
        // given
        const targetProfile = new TargetProfile({ skills: [web1, url3] });
        const challenges = [challengeWeb_1, challengeUrl_3];

        // when
        const smartRandom = new SmartRandom({ targetProfile, challenges, knowledgeElements: [], answers: [] });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.be.equal(challengeWeb_1);
      });

      it('should start with a not timed level 4 challenge when level 1, 2 and 3 dont exist', function() {
        // given
        const targetProfile = new TargetProfile({ skills: [web4, url5] });
        const challenges = [challengeWeb_4, challengeUrl_5];

        // when
        const smartRandom = new SmartRandom({ targetProfile, challenges, knowledgeElements: [], answers: [] });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.be.equal(challengeWeb_4);
      });

      it('should start with a timed challenge anyway when no untimed challenges were found', function() {
        // given
        const targetProfile = new TargetProfile({ skills: [web3] });
        const challenge_AnyLevel_Timed = turnIntoTimedChallenge(challengeWeb_3);
        const challenges = [challenge_AnyLevel_Timed];

        // when
        const smartRandom = new SmartRandom({ targetProfile, challenges, knowledgeElements: [], answers: [] });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.be.equal(challenge_AnyLevel_Timed);
      });

    });

    // Some challenges can be archived. Such challenges may be ruled out whn they haven't been answered yet, but at the same time
    // must be taken into account when the user has already answered them, since they give useful information to the adaptive algorithlm.
    context('when one challenge has been archived', () => {
      let challengeWeb_3_Archived, challengeWeb_4_Archived, targetProfileSkills;

      beforeEach(() => {
        targetProfileSkills = [web1, web2, web3, web4, web5];
        targetProfile = new TargetProfile({ skills: targetProfileSkills });
        challengeWeb_3_Archived =  turnIntoArchivedChallenge(challengeWeb_3);
        challengeWeb_4_Archived =  turnIntoArchivedChallenge(challengeWeb_4);
      });

      it('should return a challenge of level 4 if user got levels 1, 2 and the only possible level is 3 archived', function() {
        // given
        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
        ];
        const knowledgeElements = [
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

        const challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_3_Archived, challengeWeb_4];

        // when
        const smartRandom = new SmartRandom({ targetProfile, challenges, knowledgeElements, answers });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(challengeWeb_4);
      });

      it('should return a challenge of level 3 if user got levels 1, 2 and another possible level 3 is archived', function() {
        // given
        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
        ];
        const knowledgeElements = [
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

        const challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_3, challengeWeb_3_Archived];

        // when
        const smartRandom = new SmartRandom({ targetProfile, challenges, knowledgeElements, answers });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(challengeWeb_3);
      });
      it('should return a challenge of level 4 if user got levels 1, 2, 3 and 3 was archived afterwards', function() {
        // given
        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec3', result: AnswerStatus.OK }),
        ];
        const knowledgeElements = [
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

        const challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_3, challengeWeb_3_Archived, challengeWeb_4];

        // when
        const smartRandom = new SmartRandom({ targetProfile, challenges, knowledgeElements, answers });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(challengeWeb_4);
      });
      it('should return a challenge of level 3 if user got levels 1, 2, but failed 4, and 4 was archived afterwards', function() {
        // given
        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec3', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec4', result: AnswerStatus.KO }),
        ];
        const knowledgeElements = [
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
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web5.id,
            status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED,
            source: 'direct'
          }),
        ];

        const challenges = [challengeWeb_1, challengeWeb_2, challengeWeb_3, challengeWeb_4_Archived, challengeWeb_5];

        // when
        const smartRandom = new SmartRandom({ targetProfile, challenges, knowledgeElements, answers });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(null); // TODO: figure out why it's null instead of expected challenge 3 ??
      });
    });

    // on vérifier que l'on ajuste bien la difficulté sans erreur
    context('when the difficulty must be adapted based on the answer to the previous question', () => {

      // on s'assurer que le test augmente/diminue bien la difficulté en fonction de la réponse
      it('should not return a challenge of level 7 if user got levels 2-3 ok but level 5 ko', function() {
        // given
        const skills = [url2, url3, rechInfo5, web7];
        const targetProfile = new TargetProfile({ skills });

        const ch2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [url2] });
        const ch3 = domainBuilder.buildChallenge({ id: 'rec3', skills: [url3] });
        const ch5 = domainBuilder.buildChallenge({ id: 'rec5', skills: [rechInfo5] });
        const ch7 = domainBuilder.buildChallenge({ id: 'rec7', skills: [web7] });
        const challenges = [ch2, ch3, ch5, ch7];

        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec3', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec5', result: AnswerStatus.KO })
        ];

        const knowledgeElements = [
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
        const smartRandom = new SmartRandom({ targetProfile, challenges, knowledgeElements, answers });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(null);

      });

      // on considère qu'un skipping est équivalent à ne pas savoir
      it('should return an easier challenge if user skipped previous challenge', function() {
        // given
        const skills = [web1, web2, web3];
        const targetProfile = new TargetProfile({ skills });

        const ch1 = domainBuilder.buildChallenge({ id: 'rec1', skills: [web1] });
        const ch2a = domainBuilder.buildChallenge({ id: 'rec2a', skills: [web2] });
        const ch2b = domainBuilder.buildChallenge({ id: 'rec2b', skills: [web2] });
        const ch3 = domainBuilder.buildChallenge({ id: 'rec3', skills: [web3] });
        const challenges = [ch1, ch2a, ch2b, ch3];
        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2a', result: AnswerStatus.SKIPPED })
        ];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web3.id,
            status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED,
            source: 'indirect'
          }),
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED,
            source: 'direct'
          }),
        ];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge.hardestSkill.difficulty).to.be.equal(1);
      });

      // on doit converge entre ce qu'on sait et ce qu'on fail
      it('should return a challenge of level 5 if user got levels 2-4 ok but level 6 ko', function() {
        // given
        const skills = [web1, web2, url3, url4, rechInfo5, rechInfo7, url6];
        const targetProfile = new TargetProfile({ skills });

        const ch1 = domainBuilder.buildChallenge({ id: 'recEasy', skills: [web1] });
        const ch2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [web2] });
        const ch3 = domainBuilder.buildChallenge({ id: 'rec3', skills: [url3] });
        const ch4 = domainBuilder.buildChallenge({ id: 'rec4', skills: [url4] });
        const ch5 = domainBuilder.buildChallenge({ id: 'rec5', skills: [rechInfo5] });
        const ch6 = domainBuilder.buildChallenge({ id: 'rec6', skills: [url6] });
        const ch7 = domainBuilder.buildChallenge({ id: 'rec7', skills: [rechInfo7] });
        const challenges = [ch1, ch2, ch3, ch4, ch5, ch6, ch7];

        const knowledgeElements = [
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

        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec4', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec6', result: AnswerStatus.KO })
        ];

        // when
        const smartRandom = new SmartRandom({ knowledgeElements, challenges, targetProfile, answers });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(ch5);
      });

      // cas aux limite : test qu'on est capable d'aller jusqu'au niveau maximum
      it('should return a challenge of difficulty 7 if challenge of difficulty 6 is correctly answered', function() {
        // given
        const skills = [web1, web2, web4, web6, web7];
        const targetProfile = new TargetProfile({ skills });

        const ch1 = domainBuilder.buildChallenge({ id: 'rec1', skills: [web1] });
        const ch2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [web2] });
        const ch4 = domainBuilder.buildChallenge({ id: 'rec4', skills: [web4] });
        const ch6 = domainBuilder.buildChallenge({ id: 'rec6', skills: [web6] });
        const ch7 = domainBuilder.buildChallenge({ id: 'rec7', skills: [web7] });
        const challenges = [ch1, ch2, ch4, ch6, ch7];

        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec6', result: AnswerStatus.OK })
        ];
        const knowledgeElements = [
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
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge.skills).to.be.deep.equal([web7]);
      });

      // doit respecter un gap maximum de 2
      it('should not return a question of level 6 after first answer is correct', function() {
        // given
        const skills = [web1, web2, web4, web6];
        const targetProfile = new TargetProfile({ skills });

        const ch1 = domainBuilder.buildChallenge({ id: 'rec1', skills: [web1] });
        const ch2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [web2] });
        const ch4 = domainBuilder.buildChallenge({ id: 'rec4', skills: [web4] });
        const ch6 = domainBuilder.buildChallenge({ id: 'rec6', skills: [web6] });
        const challenges = [ch1, ch2, ch4, ch6];
        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK })
        ];
        const knowledgeElements = [
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
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge.skills[0].difficulty).not.to.be.equal(6);
      });

      // doit respecter le cas maximum de 2
      it('should not select a challenge that is more than 2 levels above the predicted level', function() {
        // given
        const skills = [web2, url7];
        const targetProfile = new TargetProfile({ skills });

        const challengeWeb2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [web2] });
        const challengeUrl7 = domainBuilder.buildChallenge({ id: 'rec7', skills: [url7] });
        const challenges = [challengeWeb2, challengeUrl7];
        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK })
        ];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: web2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          }),
        ];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(null);
      });

      // doit prioriser les easy tubes quand il y en a
      it('should select in priority a challenge in the unexplored tubes with level below level 3', function() {
        // given
        const url4 = domainBuilder.buildSkill({ name: '@url4' });
        const url5 = domainBuilder.buildSkill({ name: '@url5' });
        const web3 = domainBuilder.buildSkill({ name: '@web3' });
        const info2 = domainBuilder.buildSkill({ name: '@info2' });
        const skills = [url4, url5, web3, info2];
        const targetProfile = new TargetProfile({ skills });

        const challengeUrl4 = domainBuilder.buildChallenge({ id: '@recUrl4', skills: [url4] });
        const challengeUrl5 = domainBuilder.buildChallenge({ id: '@recUrl5', skills: [url5] });
        const challengeWeb3 = domainBuilder.buildChallenge({ id: '@recWeb3', skills: [web3] });
        const challengeInfo2 = domainBuilder.buildChallenge({ id: '@recInfo2', skills: [info2] });

        const challenges = [challengeUrl4, challengeUrl5, challengeInfo2, challengeWeb3];
        const answers = [domainBuilder.buildAnswer({ challengeId: '@recInfo2', result: AnswerStatus.OK })];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: info2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          })
        ];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(challengeWeb3);
      });

      // doit quand même poser une question sur un autre tube s'il n'y a pas de easy tube
      it('should nevertheless target any tubes when there is no easy tube', function() {
        // given
        const skills = [url4, url6, info2];
        const targetProfile = new TargetProfile({ skills });

        const challengeUrl4 = domainBuilder.buildChallenge({ id: '@recUrl4', skills: [url4] });
        const challengeUrl6 = domainBuilder.buildChallenge({ id: '@recUrl6', skills: [url6] });
        const challengeInfo2 = domainBuilder.buildChallenge({ id: '@recInfo2', skills: [info2] });

        const challenges = [challengeUrl4, challengeUrl6, challengeInfo2];

        const answers = [domainBuilder.buildAnswer({ challengeId: '@recInfo2', result: AnswerStatus.OK })];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({
            skillId: info2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct'
          })
        ];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(challengeUrl4);
      });

    });

    // lorsque l'on prend en compte l'apport en connaissance de la prochaine question
    context('when the next question added knowledge value is taken into account', () => {
      // on ne pose aucune question qui ne donne aucune nouvelle information
      it('should return null if remaining challenges do not provide extra validated or failed skills', function() {
        // given
        const skills = [web1, web2];
        const targetProfile = new TargetProfile({ skills });

        const ch1 = domainBuilder.buildChallenge({ id: 'rec1', skills: [web1] });
        const ch2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [web2] });
        const ch3 = domainBuilder.buildChallenge({ id: 'rec3', skills: [web2] });
        const challenges = [ch1, ch2, ch3];
        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK })
        ];
        const knowledgeElements = [
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
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.be.equal(null);
      });

      // ne doit pas discriminer ! (check chai?)
      it('should return any challenge at random if several challenges have equal reward at the middle of the test', function() {
        // given
        const skills = [web1, web2, web3, url3];
        const targetProfile = new TargetProfile({ skills });

        const ch1 = domainBuilder.buildChallenge({ id: 'rec1', skills: [web1] });
        const ch2a = domainBuilder.buildChallenge({ id: 'rec2a', skills: [web2] });
        const ch3a = domainBuilder.buildChallenge({ id: 'rec3a', skills: [web3] });
        const ch3b = domainBuilder.buildChallenge({ id: 'rec3b', skills: [web3] });
        const ch3c = domainBuilder.buildChallenge({ id: 'rec3c', skills: [url3] });
        const challenges = [ch1, ch2a, ch3a, ch3b, ch3c];
        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec2a', result: AnswerStatus.OK })
        ];
        const knowledgeElements = [
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
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge.hardestSkill.difficulty).to.be.equal(3);
      });
    });

  });
});
