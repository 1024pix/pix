const { expect, domainBuilder } = require('../../../test-helper');
const { types } = require('../../../../lib/domain/models/Campaign');

describe('Unit | Domain | Models | CampaignToStartParticipation', function () {
  describe('#isAssessment', function () {
    it('should return true if the campaign is of type ASSESSMENT', function () {
      // given
      const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({ type: types.ASSESSMENT });

      // when / then
      expect(campaignToStartParticipation.isAssessment).to.be.true;
    });

    it('should return false if the campaign is not of type ASSESSMENT', function () {
      // given
      const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
        type: types.PROFILES_COLLECTION,
      });

      // when / then
      expect(campaignToStartParticipation.isAssessment).to.be.false;
    });
  });

  describe('#isArchived', function () {
    it('should return true if the campaign is archived', function () {
      // given
      const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
        archivedAt: new Date('2020-02-02'),
      });

      // when / then
      expect(campaignToStartParticipation.isArchived).to.be.true;
    });

    it('should return false if the campaign is not archived', function () {
      // given
      const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({ archivedAt: null });

      // when / then
      expect(campaignToStartParticipation.isArchived).to.be.false;
    });
  });
});
