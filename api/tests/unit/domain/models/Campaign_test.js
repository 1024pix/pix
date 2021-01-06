const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | Campaign', () => {

  describe('#organizationId', () => {
    it('should return id of the organization', () => {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeAssessment();

      // when
      const organizationId = campaign.organizationId;

      // then
      expect(organizationId).to.equal(campaign.organization.id);
    });

    it('should return null if campaign has no organization', () => {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection({ organization: null });

      // when
      const organizationId = campaign.organizationId;

      // then
      expect(organizationId).to.equal(null);
    });
  });

  describe('#targetProfileId', () => {
    it('should return id of the targetProfile', () => {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeAssessment();

      // when
      const targetProfileId = campaign.targetProfileId;

      // then
      expect(targetProfileId).to.equal(campaign.targetProfile.id);
    });

    it('should return null if campaign has no targetProfile', () => {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection();

      // when
      const targetProfileId = campaign.targetProfileId;

      // then
      expect(targetProfileId).to.equal(null);
    });
  });

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
