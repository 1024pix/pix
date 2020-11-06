const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | Campaign', () => {

  describe('isAssessment', () => {

    it('should return true when campaign is of type assessment', () => {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeAssessment();

      // when / then
      expect(campaign.isAssessment()).to.be.true;
    });

    it('should return false when campaign is not of type assessment', () => {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection();

      // when / then
      expect(campaign.isAssessment()).to.be.false;
    });
  });

  describe('isProfilesCollection', () => {

    it('should return true when campaign is of type profiles collection', () => {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection();

      // when / then
      expect(campaign.isProfilesCollection()).to.be.true;
    });

    it('should return false when campaign is not of type profiles collection', () => {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeAssessment();

      // when / then
      expect(campaign.isProfilesCollection()).to.be.false;
    });
  });

  describe('isArchived', () => {

    it('should return true when campaign is archived', () => {
      // given
      const campaign = domainBuilder.buildCampaign({ archivedAt: new Date('1990-01-04') });

      // when / then
      expect(campaign.isArchived()).to.be.true;
    });

    it('should return false when campaign is not of type profiles collection', () => {
      // given
      const campaign = domainBuilder.buildCampaign({ archivedAt: null });

      // when / then
      expect(campaign.isArchived()).to.be.false;
    });
  });
});
