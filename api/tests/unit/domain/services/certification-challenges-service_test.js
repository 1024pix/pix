const { sinon, expect, domainBuilder } = require('../../../test-helper');
const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');

describe('Unit | Service | Certification Challenge Service', function() {

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

    it('should return the certification course with the number of saved challenges', function() {
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

  describe('#groupUserKnowledgeElementsByCompetence', () => {
    const knowledgeElementOnUrl2 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
    const knowledgeElementOnUrl3 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
    const knowledgeElementOnText1 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence2' });
    const knowledgeElementsWithChallengeIds = [knowledgeElementOnUrl2, knowledgeElementOnUrl3, knowledgeElementOnText1];

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
    const knowledgeElementOnUrl2 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
    const knowledgeElementOnUrl3 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
    const knowledgeElementOnUrl4 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
    const knowledgeElementOnUrl5 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence1' });
    const knowledgeElementOnText1 = domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 'recCompetence2' });
    const knowledgeElementsWithChallengeIds = {
      recCompetence1: [knowledgeElementOnUrl5, knowledgeElementOnUrl4, knowledgeElementOnUrl3, knowledgeElementOnUrl2],
      recCompetence2: [knowledgeElementOnText1],
    };

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
});
