const UserProfile = require('../../../../lib/domain/models/UserProfile');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

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
});
