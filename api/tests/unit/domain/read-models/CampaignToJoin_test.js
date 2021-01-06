const { expect, domainBuilder } = require('../../../test-helper');
const { types } = require('../../../../lib/domain/read-models/CampaignToJoin');

describe('Unit | Domain | Models | CampaignToJoin', () => {

  describe('#isAssessment', () => {
    it('should return true if the campaign is of type ASSESSMENT', () => {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ type: types.ASSESSMENT });

      // when / then
      expect(campaignToJoin.isAssessment).to.be.true;
    });

    it('should return false if the campaign is not of type ASSESSMENT', () => {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ type: types.PROFILES_COLLECTION });

      // when / then
      expect(campaignToJoin.isAssessment).to.be.false;
    });
  });

  describe('#isProfilesCollection', () => {
    it('should return true if the campaign is of type PROFILES_COLLECTION', () => {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ type: types.PROFILES_COLLECTION });

      // when / then
      expect(campaignToJoin.isProfilesCollection).to.be.true;
    });

    it('should return false if the campaign is not of type PROFILES_COLLECTION', () => {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ type: types.ASSESSMENT });

      // when / then
      expect(campaignToJoin.isProfilesCollection).to.be.false;
    });
  });

  describe('#isArchived', () => {
    it('should return true if the campaign is archived', () => {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ archivedAt: new Date('2020-02-02') });

      // when / then
      expect(campaignToJoin.isArchived).to.be.true;
    });

    it('should return false if the campaign is not archived', () => {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ archivedAt: null });

      // when / then
      expect(campaignToJoin.isArchived).to.be.false;
    });
  });
});
