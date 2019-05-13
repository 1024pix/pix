const { expect } = require('../../../test-helper');

const BookshelfCampaignParticipation = require('../../../../lib/infrastructure/data/campaign-participation');
const BookshelfKnowledgeElement = require('../../../../lib/infrastructure/data/knowledge-element');

describe('Unit | Infrastructure | Data | knowledge-element', () => {

  describe('#isConcernedByTargetProfile', () => {

    it('should return true when knowledge element covers a given target profile skill list', () => {
      // given
      const targetProfileSkillIds = ['@skill1_id', '@skill2_id', '@skill3_id'];
      const ke = new BookshelfKnowledgeElement({ skillId: '@skill2_id' });

      // when
      const actual = ke.isConcernedByTargetProfile(targetProfileSkillIds);

      // then
      expect(actual).to.equal(true);
    });

    it('should return false when knowledge element does not concern a target profile skill list', () => {
      // given
      const targetProfileSkillIds = ['@skill1_id', '@skill2_id', '@skill3_id'];
      const ke = new BookshelfKnowledgeElement({ skillId: '@skull666_id' });

      // when
      const actual = ke.isConcernedByTargetProfile(targetProfileSkillIds);

      // then
      expect(actual).to.equal(false);
    });
  });

  describe('#wasCreatedBeforeParticipationSharingDate', () => {

    it('should return true when KE creation date is before campaign participation share date', () => {
      // given
      const campaignParticipationShareDate = new Date('2019-05-20');
      const campaignParticipation = new BookshelfCampaignParticipation({ sharedAt: campaignParticipationShareDate });

      const keCreationDate = new Date('2019-05-19');
      const ke = new BookshelfKnowledgeElement({ createdAt: keCreationDate });

      // when
      const actual = ke.wasCreatedBeforeParticipationSharingDate(campaignParticipation);

      // then
      expect(actual).to.equal(true);
    });

    it('should return false when KE creation date is equal to campaign participation share date', () => {
      // given
      const campaignParticipationShareDate = new Date('2019-05-20');
      const campaignParticipation = new BookshelfCampaignParticipation({ sharedAt: campaignParticipationShareDate });

      const keCreationDate = new Date('2019-05-20');
      const ke = new BookshelfKnowledgeElement({ createdAt: keCreationDate });

      // when
      const actual = ke.wasCreatedBeforeParticipationSharingDate(campaignParticipation);

      // then
      expect(actual).to.equal(false);
    });

    it('should return false when KE creation date is after campaign participation share date', () => {
      // given
      const campaignParticipationShareDate = new Date('2019-05-20');
      const campaignParticipation = new BookshelfCampaignParticipation({ sharedAt: campaignParticipationShareDate });

      const keCreationDate = new Date('2019-05-21');
      const ke = new BookshelfKnowledgeElement({ createdAt: keCreationDate });

      // when
      const actual = ke.wasCreatedBeforeParticipationSharingDate(campaignParticipation);

      // then
      expect(actual).to.equal(false);
    });
  });

  describe('#isTheLastOneForGivenSkill', () => {

    it('should return true when other KEs cover a different skill', () => {
      // given
      const createdAt = new Date();

      const ke = new BookshelfKnowledgeElement({ skillId: '@skill_id', createdAt });

      const participantsKEs = [
        ke,
        new BookshelfKnowledgeElement({ skillId: '@skall_id', createdAt }),
        new BookshelfKnowledgeElement({ skillId: '@skell_id', createdAt }),
        new BookshelfKnowledgeElement({ skillId: '@skull_id', createdAt }),
      ];

      // when
      const actual = ke.isTheLastOneForGivenSkill(participantsKEs);

      // then
      expect(actual).to.equal(true);
    });

    it('should return true when KE creation date is after all other KEs covering the same skill', () => {
      // given
      const skillId = '@skill_id';

      const ke = new BookshelfKnowledgeElement({ skillId, createdAt: new Date('2019-05-20') });

      const participantsKEs = [
        ke,
        new BookshelfKnowledgeElement({ skillId, createdAt: new Date('2015-01-01') }),
        new BookshelfKnowledgeElement({ skillId, createdAt: new Date('2016-01-02') }),
        new BookshelfKnowledgeElement({ skillId, createdAt: new Date('2017-01-03') }),
      ];

      // when
      const actual = ke.isTheLastOneForGivenSkill(participantsKEs);

      // then
      expect(actual).to.equal(true);
    });

    it('should return false when KE creation date is not the last one of KEs covering the same skill', () => {
      // given
      const skillId = '@skill_id';

      const ke = new BookshelfKnowledgeElement({ skillId, createdAt: new Date('2014-05-20') });

      const participantsKEs = [
        ke,
        new BookshelfKnowledgeElement({ skillId, createdAt: new Date('2015-01-01') }),
        new BookshelfKnowledgeElement({ skillId, createdAt: new Date('2016-01-02') }),
        new BookshelfKnowledgeElement({ skillId, createdAt: new Date('2017-01-03') }),
      ];

      // when
      const actual = ke.isTheLastOneForGivenSkill(participantsKEs);

      // then
      expect(actual).to.equal(false);
    });

  });

  describe('#isValidated', () => {

    it('should return true when knowledge element has status "validated"', () => {
      // given
      const ke = new BookshelfKnowledgeElement({ status: 'validated' });

      // when
      const actual = ke.isValidated();

      // then
      expect(actual).to.equal(true);
    });

    it('should return false when knowledge element does not have status "validated"', () => {
      // given
      const ke = new BookshelfKnowledgeElement({ status: 'invalidated' });

      // when
      const actual = ke.isValidated();

      // then
      expect(actual).to.equal(false);
    });
  });

});
