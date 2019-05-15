const { sinon, expect, domainBuilder } = require('../../../test-helper');
const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');

describe('Unit | Service | Certification Challenge Service', () => {

  describe('#saveChallenges', () => {

    const challenge1 = {
      id: 'challenge1',
      competence: 'Savoir tester',
      testedSkill: '@skill1'
    };
    const challenge2 = {
      id: 'challenge2',
      competence: 'Savoir debugguer',
      testedSkill: '@skill2'
    };

    const certificationProfileWithOneCompetence = [
      {
        challenges: [challenge1, challenge2]
      }
    ];

    const certificationProfileWithTwoCompetence = [
      {
        challenges: [challenge1]
      }, {
        challenges: [challenge2]
      }
    ];

    const certificationCourse = {
      id: 'certification-course-id'
    };

    beforeEach(() => {
      sinon.stub(certificationChallengeRepository, 'save').resolves({});
    });

    context('when profile return one competence with two challenges', () => {
      it('should call certification Challenge Repository save twice', () => {
        //When
        const promise = certificationChallengesService.saveChallenges(certificationProfileWithOneCompetence, certificationCourse);

        //Then
        return promise.then(() => {
          sinon.assert.calledTwice(certificationChallengeRepository.save);
          sinon.assert.calledWith(certificationChallengeRepository.save, challenge1, certificationCourse);
          sinon.assert.calledWith(certificationChallengeRepository.save, challenge2, certificationCourse);
        });
      });
    });

    context('when profile return two competences with one challenge', () => {
      it('should call certification Challenge Repository save twice', () => {
        //When
        const promise = certificationChallengesService.saveChallenges(certificationProfileWithTwoCompetence, certificationCourse);

        //Then
        return promise.then(() => {
          sinon.assert.calledTwice(certificationChallengeRepository.save);
          sinon.assert.calledWith(certificationChallengeRepository.save, challenge1, certificationCourse);
          sinon.assert.calledWith(certificationChallengeRepository.save, challenge2, certificationCourse);
        });
      });
    });

    it('should return the certification course with the number of saved challenges', () => {
      // when
      const promise = certificationChallengesService.saveChallenges(certificationProfileWithTwoCompetence, certificationCourse);

      // then
      return promise.then((certificationCourse) => {
        expect(certificationCourse).to.deep.equal({
          id: 'certification-course-id',
          nbChallenges: 2
        });
      });
    });

  });

  context('Usecase | retrieveOrCreateCertificationCourseFromKnowledgeElements', () => {

    let knowledgeElementOnUrl2;
    let knowledgeElementOnUrl3;
    let knowledgeElementOnUrl4;
    let knowledgeElementOnUrl5;
    let knowledgeElementOnText1;

    let skillUrl5;
    let skillUrl4;
    let skillUrl3;
    let skillText1;

    let challengeUrl5;
    let challengeUrl4;
    let challengeUrl3;
    let challengeText1;

    beforeEach(() => {

      knowledgeElementOnUrl2 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
      knowledgeElementOnUrl3 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
      knowledgeElementOnUrl4 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
      knowledgeElementOnUrl5 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
      knowledgeElementOnText1 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence2' });

      knowledgeElementOnUrl2.challengeId = 'recChallengeOnUrl2';
      knowledgeElementOnUrl3.challengeId = 'recChallengeOnUrl3';
      knowledgeElementOnUrl4.challengeId = 'recChallengeOnUrl4';
      knowledgeElementOnUrl5.challengeId = 'recChallengeOnUrl5';
      knowledgeElementOnText1.challengeId = 'recChallengeOnText1';

      skillUrl5 = domainBuilder.buildSkill({ id: knowledgeElementOnUrl5.skillId, name: '@url5' });
      skillUrl4 = domainBuilder.buildSkill({ id: knowledgeElementOnUrl4.skillId, name: '@url4' });
      skillUrl3 = domainBuilder.buildSkill({ id: knowledgeElementOnUrl3.skillId, name: '@url3' });
      skillText1 = domainBuilder.buildSkill({ id: knowledgeElementOnText1.skillId, name: '@text1' });

      challengeUrl5 = domainBuilder.buildChallenge({ skills: [skillUrl5] });
      challengeUrl4 = domainBuilder.buildChallenge({ skills: [skillUrl4] });
      challengeUrl3 = domainBuilder.buildChallenge({ skills: [skillUrl3] });
      challengeText1 = domainBuilder.buildChallenge({ skills: [skillText1] });
    });

    describe('#groupUserKnowledgeElementsByCompetence', () => {
      let knowledgeElementsWithChallengeIds;

      beforeEach(() => {
        knowledgeElementsWithChallengeIds = [knowledgeElementOnUrl2, knowledgeElementOnUrl3, knowledgeElementOnText1];
      });

      it('should group knowledge elements by competences', () => {
        // when
        const result = certificationChallengesService.groupUserKnowledgeElementsByCompetence(knowledgeElementsWithChallengeIds);

        // then
        expect(result).to.deep.equal({
          recCompetence1: [knowledgeElementOnUrl2, knowledgeElementOnUrl3],
          recCompetence2: [knowledgeElementOnText1],
        });
      });
    });

    describe('#knowledgeElementsWithChallengeIdsByCompetence', () => {
      let knowledgeElementsWithChallengeIds;

      beforeEach(() => {
        knowledgeElementsWithChallengeIds = {
          recCompetence1: [knowledgeElementOnUrl5, knowledgeElementOnUrl4, knowledgeElementOnUrl3, knowledgeElementOnUrl2],
          recCompetence2: [knowledgeElementOnText1],
        };
      });

      it('should keep only 3 knowledge elements by competence', () => {
        // when
        const result = certificationChallengesService.selectThreeKnowledgeElementsHigherSkillsByCompetence(knowledgeElementsWithChallengeIds);

        // then
        expect(result).to.deep.equal({
          recCompetence1: [knowledgeElementOnUrl5, knowledgeElementOnUrl4, knowledgeElementOnUrl3],
          recCompetence2: [knowledgeElementOnText1],
        });
      });
    });

    describe('#findChallengesByCompetenceId', () => {
      it('should return a challenges list based on skills from knowlegde elements', () => {
        const selectedKnowledgeElementsWithChallengeId = {
          recCompetence1: [knowledgeElementOnUrl5, knowledgeElementOnUrl4, knowledgeElementOnUrl3],
          recCompetence2: [knowledgeElementOnText1],
        };

        const challengeNotUsed = domainBuilder.buildChallenge();

        const allChallenges = [challengeUrl5, challengeUrl4, challengeUrl3, challengeText1, challengeNotUsed];

        // when
        const userCertificationChallenges = certificationChallengesService.findChallengesByCompetenceId(allChallenges, selectedKnowledgeElementsWithChallengeId);

        // then
        expect(userCertificationChallenges).to.deep.equal(
          {
            'recCompetence1': [challengeUrl5, challengeUrl4, challengeUrl3],
            'recCompetence2': [challengeText1]
          });
      });
    });

    describe('#convertChallengesToUserCompetences', () => {
      it('should quelque chose', () => {
        // given
        const challengesByCompetenceId = {
          'recCompetence1': [challengeUrl5, challengeUrl4, challengeUrl3],
          'recCompetence2': [challengeText1]
        };

        // when
        const userCompetences = certificationChallengesService.convertChallengesToUserCompetences(challengesByCompetenceId);

        // then
        expect(userCompetences).to.deep.equal([
          { competenceId: 'recCompetence1', challenges: [challengeUrl5, challengeUrl4, challengeUrl3] },
          { competenceId: 'recCompetence2', challenges: [challengeText1] }
        ]);
      });
    });
  });
});
