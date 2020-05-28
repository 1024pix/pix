const { expect } = require('$tests/test-helper');

const BookshelfCampaignParticipation = require('$lib/infrastructure/data/campaign-participation');
const BookshelfKnowledgeElement = require('$lib/infrastructure/data/knowledge-element');

describe('Unit | Infrastructure | Data | knowledge-element', () => {

  describe('#isCoveredByTargetProfile', () => {

    it('should return true when knowledge element covers a given target profile skill list', () => {
      // given
      const targetProfileSkillIds = ['@skill1_id', '@skill2_id', '@skill3_id'];
      const ke = new BookshelfKnowledgeElement({ skillId: '@skill2_id' });

      // when
      const actual = ke.isCoveredByTargetProfile(targetProfileSkillIds);

      // then
      expect(actual).to.equal(true);
    });

    it('should return false when knowledge element does not cover a target profile skill list', () => {
      // given
      const targetProfileSkillIds = ['@skill1_id', '@skill2_id', '@skill3_id'];
      const ke = new BookshelfKnowledgeElement({ skillId: '@skull666_id' });

      // when
      const actual = ke.isCoveredByTargetProfile(targetProfileSkillIds);

      // then
      expect(actual).to.equal(false);
    });
  });

  describe('#wasCreatedBefore', () => {

    it('should return true when KE creation date is before campaign participation share date', () => {
      // given
      const campaignParticipationShareDate = new Date('2019-05-20');
      const campaignParticipation = new BookshelfCampaignParticipation({ sharedAt: campaignParticipationShareDate });

      const keCreationDate = new Date('2019-05-19');
      const ke = new BookshelfKnowledgeElement({ createdAt: keCreationDate });

      // when
      const actual = ke.wasCreatedBefore(campaignParticipation.get('sharedAt'));

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
      const actual = ke.wasCreatedBefore(campaignParticipation.get('sharedAt'));

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
      const actual = ke.wasCreatedBefore(campaignParticipation.get('sharedAt'));

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
