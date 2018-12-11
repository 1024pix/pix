// new SmartRandom\(([\[\]a-z0-9]+), ([a-z0-9]+)
const { expect, domainBuilder } = require('../../../test-helper');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Tube = require('../../../../lib/domain/models/Tube');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const SmartRandom = require('../../../../lib/domain/strategies/SmartRandom');

const KNOWLEDGE_ELEMENT_STATUS = {
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated'
};

describe('Unit | Domain | Models | SmartRandom', () => {

  describe('#constructor', () => {
    it('should create a course with tubes', () => {
      // given
      const web1 = domainBuilder.buildSkill({ name: 'web1' });
      const web2 = domainBuilder.buildSkill({ name: 'web2' });
      const web3 = domainBuilder.buildSkill({ name: 'web3' });
      const challenge1 = domainBuilder.buildChallenge({ id: 'recWeb1', skills: [web1] });
      const challenge2 = domainBuilder.buildChallenge({ id: 'recWeb2', skills: [web2] });
      const challenge3 = domainBuilder.buildChallenge({ id: 'recWeb3', skills: [web3] });

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
      const web1 = domainBuilder.buildSkill({ name: 'web1' });
      const web2 = domainBuilder.buildSkill({ name: 'web2' });
      const web3 = domainBuilder.buildSkill({ name: 'web3' });
      const challenge1 = domainBuilder.buildChallenge({ id: 'recWeb1', skills: [web1] });
      const challenge2 = domainBuilder.buildChallenge({ id: 'recWeb2', skills: [web2] });

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

    it('should return a challenge that requires web2 if web1-2-3 is the tube and no answer has been given so far', function() {
      // given
      const web1 = domainBuilder.buildSkill({ name: 'web1' });
      const web2 = domainBuilder.buildSkill({ name: 'web2' });
      const web3 = domainBuilder.buildSkill({ name: 'web3' });
      const challenge1 = domainBuilder.buildChallenge({ id: 'recWeb1', skills: [web1] });
      const challenge2 = domainBuilder.buildChallenge({ id: 'recWeb2', skills: [web2] });
      const challenge3 = domainBuilder.buildChallenge({ id: 'recWeb3', skills: [web3] });

      const challenges = [challenge1, challenge2, challenge3];
      const skills = [web1, web2, web3];
      const targetProfile = new TargetProfile({ skills });
      const answers = [];
      const knowledgeElements = [];

      // when
      const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.equal(challenge2);
    });

    context('when the first question is correctly answered', () => {

      it('should select in priority a challenge in the unexplored tubes with level below level 3', function() {
        // given
        const url4 = domainBuilder.buildSkill({ name: 'url4' });
        const url5 = domainBuilder.buildSkill({ name: 'url5' });
        const web3 = domainBuilder.buildSkill({ name: 'web3' });
        const info2 = domainBuilder.buildSkill({ name: 'info2' });
        const skills = [url4, url5, web3, info2];
        const targetProfile = new TargetProfile({ skills });

        const challengeUrl4 = domainBuilder.buildChallenge({ id: 'recUrl4', skills: [url4] });
        const challengeUrl5 = domainBuilder.buildChallenge({ id: 'recUrl5', skills: [url5] });
        const challengeWeb3 = domainBuilder.buildChallenge({ id: 'recWeb3', skills: [web3] });
        const challengeInfo2 = domainBuilder.buildChallenge({ id: 'recInfo2', skills: [info2] });

        const challenges = [challengeUrl4, challengeUrl5, challengeInfo2, challengeWeb3];
        const answers = [domainBuilder.buildAnswer({ challengeId: 'recInfo2', result: AnswerStatus.OK })];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: info2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED })
        ];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(challengeWeb3);
      });

      it('should nevertheless target any tubes when there is no easy tube', function() {
        // given
        const url4 = domainBuilder.buildSkill({ name: 'url4' });
        const url6 = domainBuilder.buildSkill({ name: 'url6' });
        const info2 = domainBuilder.buildSkill({ name: 'info2' });
        const skills = [url4, url6, info2];
        const targetProfile = new TargetProfile({ skills });

        const challengeUrl4 = domainBuilder.buildChallenge({ id: 'recUrl4', skills: [url4] });
        const challengeUrl6 = domainBuilder.buildChallenge({ id: 'recUrl6', skills: [url6] });
        const challengeInfo2 = domainBuilder.buildChallenge({ id: 'recInfo2', skills: [info2] });

        const challenges = [challengeUrl4, challengeUrl6, challengeInfo2];

        const answers = [domainBuilder.buildAnswer({ challengeId: 'recInfo2', result: AnswerStatus.OK })];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: info2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED })
        ];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(challengeUrl4);
      });

    });

    it('should return a challenge of level 5 if user got levels 2-4 ok but level 6 ko', function() {
      // given
      const web1 = domainBuilder.buildSkill({ name: 'web1' });
      const web2 = domainBuilder.buildSkill({ name: 'web2' });
      const url3 = domainBuilder.buildSkill({ name: 'url3' });
      const url4 = domainBuilder.buildSkill({ name: 'url4' });
      const rechInfo5 = domainBuilder.buildSkill({ name: 'rechInfo5' });
      const url6 = domainBuilder.buildSkill({ name: 'url6' });
      const rechInfo7 = domainBuilder.buildSkill({ name: 'rechInfo7' });
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
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: url3.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: url4.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: url6.id, result: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED })
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

    it('should not return a challenge of level 7 if user got levels 2-3 ok but level 5 ko', function() {
      // given
      const url2 = domainBuilder.buildSkill({ name: 'url2' });
      const url3 = domainBuilder.buildSkill({ name: 'url3' });
      const rechInfo5 = domainBuilder.buildSkill({ name: 'rechInfo5' });
      const web7 = domainBuilder.buildSkill({ name: 'web7' });
      const skills = [url2, url3, rechInfo5, web7];
      const targetProfile = new TargetProfile({ skills });

      const ch2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [web2] });
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
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: url2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: url3.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: rechInfo5.id, status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED })
      ];

      // when
      const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.equal(null);

    });

    context('when one challenge (level3) has been archived', () => {
      const web1 = domainBuilder.buildSkill({ name: '@web1' });
      const web2 = domainBuilder.buildSkill({ name: '@web2' });
      const web3 = domainBuilder.buildSkill({ name: '@web3' });
      const web4 = domainBuilder.buildSkill({ name: '@web4' });
      const web5 = domainBuilder.buildSkill({ name: '@web5' });
      const skills = [web1, web2, web3, web4, web5];
      const targetProfile = new TargetProfile({ skills });

      const ch1 = domainBuilder.buildChallenge({ id: 'rec1', skills: [web1] });
      const ch2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [web2] });
      const ch3 = domainBuilder.buildChallenge({ id: 'rec3', skills: [web3] });
      const ch3Bis = domainBuilder.buildChallenge({ id: 'rec3bis', skills: [web3] });
      const ch4 = domainBuilder.buildChallenge({ id: 'rec4', skills: [web4] });
      const ch5 = domainBuilder.buildChallenge({ id: 'rec5', skills: [web5] });
      let challenges = [ch1, ch2, ch3, ch3Bis, ch4, ch5];

      it('should return a challenge of level 3 if user got levels 1, 2 ,3 and 4 at KO', function() {
        // given
        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: undefined, result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec4', result: AnswerStatus.KO }),
        ];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web4.id, status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web5.id, status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED })
        ];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge.skills[0].name).to.equal('@web3');
      });

      it('should return a challenge of level 5 if user got levels 1, 2, 3, 4 with OK', function() {
        // given
        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: undefined, result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec4', result: AnswerStatus.OK }),
        ];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web3.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web4.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED })
        ];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(ch5);
      });

      it('should return a challenge of level 4 if user got levels 1, 2 and 3 archived', function() {
        // given
        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: undefined, result: AnswerStatus.OK }),
        ];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        ];

        challenges = [ch1, ch2, ch3, ch3Bis, ch4];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.equal(ch4);
      });

      it('should return a challenge of level 3 if user got levels 1, 2 and 3 archived', function() {
        // given
        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'rec1', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: undefined, result: AnswerStatus.OK }),
        ];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        ];

        ch3.status = 'archived';
        challenges = [ch1, ch2, ch3, ch3Bis];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const nextChallenge = smartRandom.getNextChallenge();

        // ass
        expect(nextChallenge).to.equal(ch3Bis);
      });
    });

    it('should return null if remaining challenges do not provide extra validated or failed skills', function() {
      // given
      const web1 = domainBuilder.buildSkill({ name: 'web1' });
      const web2 = domainBuilder.buildSkill({ name: 'web2' });
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
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
      ];

      // when
      const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.be.equal(null);
    });

    context('when assessment has no answer', function() {

      it('should start with a not timed challenge', function() {
        // given
        const web1 = domainBuilder.buildSkill({ name: '@web1' });
        const url2 = domainBuilder.buildSkill({ name: '@url2' });
        const targetProfile = new TargetProfile({ skills: [url2, web1] });

        const notTimedChallenge = domainBuilder.buildChallenge({ id: 'rec', skills: [web1] });
        const timedChallenge = domainBuilder.buildChallenge({ id: 'rec', skills: [url2], timer: 30 });
        const challenges = [timedChallenge, notTimedChallenge];
        const answers = [];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.be.equal(notTimedChallenge);
      });

      it('should start with a not timed level 2 challenge', function() {
        // given
        const web1 = domainBuilder.buildSkill({ name: '@web1' });
        const cnil2 = domainBuilder.buildSkill({ name: '@cnil2' });
        const url3 = domainBuilder.buildSkill({ name: '@url3' });
        const targetProfile = new TargetProfile({ skills: [web1, url3, cnil2] });

        const level2Challenge = domainBuilder.buildChallenge({ id: 'rec1', skills: [cnil2] });
        const level1Challenge = domainBuilder.buildChallenge({ id: 'rec2', skills: [web1] });
        const level3Challenge = domainBuilder.buildChallenge({ id: 'rec3', skills: [url3] });
        const challenges = [level3Challenge, level1Challenge, level2Challenge];
        const answers = [];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.be.equal(level2Challenge);
      });

      it('should start with a not timed level 1 challenge when no level 2 exists', function() {
        // given
        const web1 = domainBuilder.buildSkill({ name: '@web1' });
        const url3 = domainBuilder.buildSkill({ name: '@url3' });
        const targetProfile = new TargetProfile({ skills: [web1, url3] });

        const level1Challenge = domainBuilder.buildChallenge({ id: 'rec1', skills: [web1] });
        const level3Challenge = domainBuilder.buildChallenge({ id: 'rec2', skills: [url3] });
        const challenges = [level3Challenge, level1Challenge];
        const answers = [];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.be.equal(level1Challenge);
      });

      it('should start with a not timed level 4 challenge when no level 2, 1 and 3 exists', function() {
        // given
        const web4 = domainBuilder.buildSkill({ name: '@web4' });
        const url5 = domainBuilder.buildSkill({ name: '@url5' });
        const targetProfile = new TargetProfile({ skills: [web4, url5] });

        const level4Challenge = domainBuilder.buildChallenge({ id: 'rec1', skills: [web4] });
        const level5Challenge = domainBuilder.buildChallenge({ id: 'rec2', skills: [url5] });
        const challenges = [level4Challenge, level5Challenge];
        const answers = [];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.be.equal(level4Challenge);
      });

      it('should start with a timed level 3 challenge when no not timed challenge exists', function() {
        // given
        const web3 = domainBuilder.buildSkill({ name: '@web3' });
        const targetProfile = new TargetProfile({ skills: [web3] });

        const timedChallenge = domainBuilder.buildChallenge({ id: 'rec1', skills: [web3], timer:10 });
        const firstChallenge = domainBuilder.buildChallenge({ id: 'rec', skills: [url2] });
        const challenges = [firstChallenge];
        const answers = [];
        const knowledgeElements = [];

      // when
      const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
      const nextChallenge = smartRandom.getNextChallenge();
        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile });
        const nextChallenge = smartRandom.getNextChallenge();

        // then
        expect(nextChallenge).to.be.equal(timedChallenge);
      });
    });

    it('should return an easier challenge if user skipped previous challenge', function() {
      // given
      const web1 = domainBuilder.buildSkill({ name: 'web1' });
      const web2 = domainBuilder.buildSkill({ name: 'web2' });
      const web3 = domainBuilder.buildSkill({ name: 'web3' });
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
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web3.id, status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web2.id, status: KNOWLEDGE_ELEMENT_STATUS.INVALIDATED }),
      ];

      // when
      const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge.hardestSkill.difficulty).to.be.equal(1);
    });

    it('should return any challenge at random if several challenges have equal reward at the middle of the test', function() {
      // given
      const web1 = domainBuilder.buildSkill({ name: 'web1' });
      const web2 = domainBuilder.buildSkill({ name: 'web2' });
      const web3 = domainBuilder.buildSkill({ name: 'web3' });
      const url3 = domainBuilder.buildSkill({ name: 'url3' });
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
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
      ];

      // when
      const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge.hardestSkill.difficulty).to.be.equal(3);
    });

    it('should not return a question of level 6 after first answer is correct', function() {
      // given
      const web1 = domainBuilder.buildSkill({ name: 'web1' });
      const web2 = domainBuilder.buildSkill({ name: 'web2' });
      const web4 = domainBuilder.buildSkill({ name: 'web4' });
      const web6 = domainBuilder.buildSkill({ name: 'web6' });
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
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
      ];

      // when
      const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge.skills[0].difficulty).not.to.be.equal(6);
    });

    it('should return a challenge of difficulty 7 if challenge of difficulty 6 is correctly answered', function() {
      // given
      const web1 = domainBuilder.buildSkill({ name: 'web1' });
      const web2 = domainBuilder.buildSkill({ name: 'web2' });
      const web4 = domainBuilder.buildSkill({ name: 'web4' });
      const web6 = domainBuilder.buildSkill({ name: 'web6' });
      const web7 = domainBuilder.buildSkill({ name: 'web7' });
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
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web4.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web6.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
      ];

      // when
      const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge.skills).to.be.deep.equal([web7]);
    });

    it('should not select a challenge that is more than 2 levels above the predicted level', function() {
      // given
      const web2 = domainBuilder.buildSkill({ name: 'web2' });
      const url7 = domainBuilder.buildSkill({ name: 'url7' });
      const skills = [web2, url7];
      const targetProfile = new TargetProfile({ skills });

      const challengeWeb2 = domainBuilder.buildChallenge({ id: 'rec2', skills: [web2] });
      const challengeUrl7 = domainBuilder.buildChallenge({ id: 'rec7', skills: [url7] });
      const challenges = [challengeWeb2, challengeUrl7];
      const answers = [
        domainBuilder.buildAnswer({ challengeId: 'rec2', result: AnswerStatus.OK })
      ];
      const knowledgeElements = [
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: web2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
      ];

      // when
      const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
      const nextChallenge = smartRandom.getNextChallenge();

      // then
      expect(nextChallenge).to.equal(null);
    });
  });

  describe('SmartRandom._filteredChallenges()', function() {
    it('should not ask a question that targets a skill already assessed', function() {
      // given
      const [skill1, skill2, skill3] = domainBuilder.buildSkillCollection();

      const targetProfile = new TargetProfile({ skills: [skill1, skill2, skill3] });

      const challengeAssessingSkill1 = domainBuilder.buildChallenge({ skills: [skill1] });
      const challengeAssessingSkill2 = domainBuilder.buildChallenge({ skills: [skill2] });
      const anotherChallengeAssessingSkill2 = domainBuilder.buildChallenge({ skills: [skill2] });
      const challengeAssessingSkill3 = domainBuilder.buildChallenge({ skills: [skill3] });

      const answerCh1 = domainBuilder.buildAnswer({ challengeId: challengeAssessingSkill1.id, result: AnswerStatus.OK });
      const answerCh2 = domainBuilder.buildAnswer({ challengeId: challengeAssessingSkill2.id, result: AnswerStatus.OK });
      const answers = [answerCh1, answerCh2];
      const knowledgeElements = [
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skill2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
      ];

      const challenges = [
        challengeAssessingSkill1,
        challengeAssessingSkill2,
        anotherChallengeAssessingSkill2,
        challengeAssessingSkill3,
      ];

      // when
      const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
      const result = SmartRandom._filteredChallenges({
        challenges: smartRandom.challenges,
        answers :smartRandom.answers,
        knowledgeElements,
        predictedLevel:smartRandom.getPredictedLevel()
      });

      // then
      expect(result).to.deep.equal([challengeAssessingSkill3]);
    });

    context('when the selected challenges cover more skills than the defined target profile', () => {
      it('should ignore the already answered challenges, even if they have non evaluated skills', function() {
        // given
        const [skill1, skill2] = domainBuilder.buildSkillCollection();

        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1] });

        const challengeAssessingSkill1 = domainBuilder.buildChallenge({ skills: [skill1, skill2] });

        const answerCh1 = domainBuilder.buildAnswer({ challengeId: challengeAssessingSkill1.id, result: AnswerStatus.OK });
        const answers = [answerCh1];
        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED }),
        ];
        const challenges = [
          challengeAssessingSkill1,
        ];

        // when
        const smartRandom = new SmartRandom({ answers, challenges, targetProfile, knowledgeElements });
        const result = SmartRandom._filteredChallenges({
          challenges: smartRandom.challenges,
          answers :smartRandom.answers,
          knowledgeElements,
          predictedLevel:smartRandom.getPredictedLevel()
         });

        // then
        expect(result).to.deep.equal([]);
      });
    });

  });
});
