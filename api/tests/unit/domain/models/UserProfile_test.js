const UserProfile = require('../../../../lib/domain/models/UserProfile');

const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | UserProfile', () => {

  describe('#constructor', () => {

    it('should filter out knowledge elements data that does not intersect with target profile', () => {
      // given
      const basicTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
        answerId: 123,
        skillId: basicTargetProfile.skills[0].id,
      });
      const knowledgeElement2 = domainBuilder.buildKnowledgeElement({
        answerId: 456,
        skillId: 'someSkillIdProbablyNotInTargetProfileBecauseThisNameIsUncanny',
      });
      const answerAndChallengeIdsByAnswerId = { 123: { id: 123, challengeId: 'chal1' }, 456: { id: 456, challengeId: 'chal2' } };

      // when
      const userProfile = new UserProfile({
        userId: 'someUserId',
        profileDate: 'someProfileDate',
        targetProfileWithLearningContent: basicTargetProfile,
        knowledgeElements: [knowledgeElement1, knowledgeElement2],
        answerAndChallengeIdsByAnswerId,
      });

      // then
      const skillIds = userProfile.userSkills.map((userSkill) => userSkill.id);
      expect(skillIds).to.deep.equal([basicTargetProfile.skills[0].id]);
    });
  });

  describe('#getDirectlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId', () => {
    let targetProfileWithLearningContent;

    beforeEach(() => {
      const easySkillArea1 = domainBuilder.buildTargetedSkill({
        id: 'a1_c1_t1_s1_id',
        name: '@iziAreaOne1',
        tubeId: 'a1_c1_t1_id',
      });
      const mediumSkillArea1 = domainBuilder.buildTargetedSkill({
        id: 'a1_c1_t2_s1_id',
        name: '@mediumAreaOne2',
        tubeId: 'a1_c1_t2_id',
      });
      const hardSkillArea1 = domainBuilder.buildTargetedSkill({
        id: 'a1_c2_t1_s1_id',
        name: '@hardAreaOne4',
        tubeId: 'a1_c2_t1_id',
      });
      const tube1Area1 = domainBuilder.buildTargetedTube({
        id: 'a1_c1_t1_id',
        competenceId: 'a1_c1_id',
        skills: [easySkillArea1],
      });
      const tube2Area1 = domainBuilder.buildTargetedTube({
        id: 'a1_c1_t2_id',
        competenceId: 'a1_c1_id',
        skills: [mediumSkillArea1],
      });
      const tube3Area1 = domainBuilder.buildTargetedTube({
        id: 'a1_c2_t1_id',
        competenceId: 'a1_c2_id',
        skills: [hardSkillArea1],
      });
      const competence1Area1 = domainBuilder.buildTargetedCompetence({
        id: 'a1_c1_id',
        areaId: 'a1_id',
        tubes: [tube1Area1, tube2Area1],
        origin: 'Origin1',
      });
      const competence2Area1 = domainBuilder.buildTargetedCompetence({
        id: 'a1_c2_id',
        areaId: 'a1_id',
        tubes: [tube3Area1],
        origin: 'Origin2',
      });
      const area1 = domainBuilder.buildTargetedArea({
        id: 'a1_id',
        competences: [competence1Area1, competence2Area1],
      });
      const easySkillArea2 = domainBuilder.buildTargetedSkill({
        id: 'a2_c1_t1_s1_id',
        name: '@iziAreaTwo3',
        tubeId: 'a2_c1_t1_id',
      });
      const mediumSkillArea2 = domainBuilder.buildTargetedSkill({
        id: 'a2_c1_t1_s2_id',
        name: '@mediumAreaOne5',
        tubeId: 'a2_c1_t1_id',
      });
      const tube1Area2 = domainBuilder.buildTargetedTube({
        id: 'a2_c1_t1_id',
        competenceId: 'a2_c1_id',
        skills: [easySkillArea2, mediumSkillArea2],
      });
      const competence1Area2 = domainBuilder.buildTargetedCompetence({
        id: 'a2_c1_id',
        areaId: 'a2_id',
        tubes: [tube1Area2],
        origin: 'Origin1',
      });
      const area2 = domainBuilder.buildTargetedArea({
        id: 'a2_id',
        competences: [competence1Area2],
      });
      targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [easySkillArea1, mediumSkillArea1, hardSkillArea1, easySkillArea2, mediumSkillArea2],
        tubes: [tube1Area1, tube2Area1, tube3Area1, tube1Area2],
        competences: [competence1Area1, competence2Area1, competence1Area2],
        areas: [area1, area2],
      });
    });

    it('should return directly validated skills ordered by decreasing difficulty by area id', () => {
      // given
      const knowledgeElementEasySkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 123,
        skillId: 'a1_c1_t1_s1_id',
      });
      const knowledgeElementMediumSkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 456,
        skillId: 'a1_c1_t2_s1_id',
      });
      const knowledgeElementHardSkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 789,
        skillId: 'a1_c2_t1_s1_id',
      });
      const knowledgeElementEasySkillArea2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 159,
        skillId: 'a2_c1_t1_s1_id',
      });
      const knowledgeElementMediumSkillArea2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 753,
        skillId: 'a2_c1_t1_s2_id',
      });
      const answerAndChallengeIdsByAnswerId = {
        123: { id: 123, challengeId: 'chal1' },
        456: { id: 456, challengeId: 'chal2' },
        789: { id: 789, challengeId: 'chal3' },
        159: { id: 159, challengeId: 'chal4' },
        753: { id: 753, challengeId: 'chal5' },
      };
      const userProfile = new UserProfile({
        userId: 'someUserId',
        profileDate: 'someProfileDate',
        targetProfileWithLearningContent,
        knowledgeElements: [knowledgeElementEasySkillArea1, knowledgeElementMediumSkillArea1, knowledgeElementHardSkillArea1, knowledgeElementEasySkillArea2, knowledgeElementMediumSkillArea2],
        answerAndChallengeIdsByAnswerId,
      });

      // when
      const directlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId = userProfile.getDirectlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId();

      // then
      expect(directlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId).to.deep.equal({
        'a1_id': ['a1_c2_t1_s1_id', 'a1_c1_t2_s1_id', 'a1_c1_t1_s1_id'],
        'a2_id': ['a2_c1_t1_s2_id', 'a2_c1_t1_s1_id'],
      });
    });

    it('should ignore skills that are not directly validated', () => {
      // given
      const knowledgeElementEasySkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 123,
        skillId: 'a1_c1_t1_s1_id',
      });
      const knowledgeElementMediumSkillArea1 = domainBuilder.buildKnowledgeElement.directlyInvalidated({
        answerId: 456,
        skillId: 'a1_c1_t2_s1_id',
      });
      const knowledgeElementHardSkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 789,
        skillId: 'a1_c2_t1_s1_id',
      });
      const knowledgeElementEasySkillArea2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 159,
        skillId: 'a2_c1_t1_s1_id',
      });
      const knowledgeElementMediumSkillArea2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 753,
        skillId: 'a2_c1_t1_s2_id',
      });
      const answerAndChallengeIdsByAnswerId = {
        123: { id: 123, challengeId: 'chal1' },
        456: { id: 456, challengeId: 'chal2' },
        789: { id: 789, challengeId: 'chal3' },
        159: { id: 159, challengeId: 'chal4' },
        753: { id: 753, challengeId: 'chal5' },
      };
      const userProfile = new UserProfile({
        userId: 'someUserId',
        profileDate: 'someProfileDate',
        targetProfileWithLearningContent,
        knowledgeElements: [knowledgeElementEasySkillArea1, knowledgeElementMediumSkillArea1, knowledgeElementHardSkillArea1, knowledgeElementEasySkillArea2, knowledgeElementMediumSkillArea2],
        answerAndChallengeIdsByAnswerId,
      });

      // when
      const directlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId = userProfile.getDirectlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId();

      // then
      expect(directlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId).to.deep.equal({
        'a1_id': ['a1_c2_t1_s1_id', 'a1_c1_t1_s1_id'],
        'a2_id': ['a2_c1_t1_s2_id', 'a2_c1_t1_s1_id'],
      });
    });

    it('should only include skills within origin if one origin is provided', () => {
      // given
      const knowledgeElementEasySkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 123,
        skillId: 'a1_c1_t1_s1_id',
      });
      const knowledgeElementMediumSkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 456,
        skillId: 'a1_c1_t2_s1_id',
      });
      const knowledgeElementHardSkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 789,
        skillId: 'a1_c2_t1_s1_id',
      });
      const knowledgeElementEasySkillArea2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 159,
        skillId: 'a2_c1_t1_s1_id',
      });
      const knowledgeElementMediumSkillArea2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 753,
        skillId: 'a2_c1_t1_s2_id',
      });
      const answerAndChallengeIdsByAnswerId = {
        123: { id: 123, challengeId: 'chal1' },
        456: { id: 456, challengeId: 'chal2' },
        789: { id: 789, challengeId: 'chal3' },
        159: { id: 159, challengeId: 'chal4' },
        753: { id: 753, challengeId: 'chal5' },
      };
      const userProfile = new UserProfile({
        userId: 'someUserId',
        profileDate: 'someProfileDate',
        targetProfileWithLearningContent,
        knowledgeElements: [knowledgeElementEasySkillArea1, knowledgeElementMediumSkillArea1, knowledgeElementHardSkillArea1, knowledgeElementEasySkillArea2, knowledgeElementMediumSkillArea2],
        answerAndChallengeIdsByAnswerId,
      });

      // when
      const directlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId = userProfile.getDirectlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId({ origin: 'Origin1' });

      // then
      expect(directlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId).to.deep.equal({
        'a1_id': ['a1_c1_t2_s1_id', 'a1_c1_t1_s1_id'],
        'a2_id': ['a2_c1_t1_s2_id', 'a2_c1_t1_s1_id'],
      });
    });
  });

  describe('#getChallengeIdForSkill', () => {

    it('should return challengeId of skill if exists', () => {
      // given
      const basicTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
        answerId: 123,
        skillId: basicTargetProfile.skills[0].id,
      });
      const answerAndChallengeIdsByAnswerId = { 123: { id: 123, challengeId: 'chal1' } };
      const userProfile = new UserProfile({
        userId: 'someUserId',
        profileDate: 'someProfileDate',
        targetProfileWithLearningContent: basicTargetProfile,
        knowledgeElements: [knowledgeElement1],
        answerAndChallengeIdsByAnswerId,
      });

      // when
      const challengeId = userProfile.getChallengeIdForSkill(basicTargetProfile.skills[0].id);

      // then
      expect(challengeId).to.equal('chal1');
    });

    it('should return null if no skill was found', () => {
      // given
      const basicTargetProfile = domainBuilder.buildTargetProfileWithLearningContent.withSimpleLearningContent();
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
        answerId: 123,
        skillId: basicTargetProfile.skills[0].id,
      });
      const answerAndChallengeIdsByAnswerId = { 123: { id: 123, challengeId: 'chal1' } };
      const userProfile = new UserProfile({
        userId: 'someUserId',
        profileDate: 'someProfileDate',
        targetProfileWithLearningContent: basicTargetProfile,
        knowledgeElements: [knowledgeElement1],
        answerAndChallengeIdsByAnswerId,
      });

      // when
      const challengeId = userProfile.getChallengeIdForSkill('SomeUncannySkillId');

      // then
      expect(challengeId).to.be.null;
    });
  });
});
