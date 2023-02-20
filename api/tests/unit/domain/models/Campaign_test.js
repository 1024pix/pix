import { expect, domainBuilder } from '../../../test-helper';

describe('Unit | Domain | Models | Campaign', function () {
  describe('#organizationId', function () {
    it('should return id of the organization', function () {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeAssessment();

      // when
      const organizationId = campaign.organizationId;

      // then
      expect(organizationId).to.equal(campaign.organization.id);
    });

    it('should return null if campaign has no organization', function () {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection({ organization: null });

      // when
      const organizationId = campaign.organizationId;

      // then
      expect(organizationId).to.equal(null);
    });
  });

  describe('#targetProfileId', function () {
    it('should return id of the targetProfile', function () {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeAssessment();

      // when
      const targetProfileId = campaign.targetProfileId;

      // then
      expect(targetProfileId).to.equal(campaign.targetProfile.id);
    });

    it('should return null if campaign has no targetProfile', function () {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection();

      // when
      const targetProfileId = campaign.targetProfileId;

      // then
      expect(targetProfileId).to.equal(null);
    });
  });

  describe('isAssessment', function () {
    it('should return true when campaign is of type assessment', function () {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeAssessment();

      // when / then
      expect(campaign.isAssessment()).to.be.true;
    });

    it('should return false when campaign is not of type assessment', function () {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection();

      // when / then
      expect(campaign.isAssessment()).to.be.false;
    });
  });

  describe('isProfilesCollection', function () {
    it('should return true when campaign is of type profiles collection', function () {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeProfilesCollection();

      // when / then
      expect(campaign.isProfilesCollection()).to.be.true;
    });

    it('should return false when campaign is not of type profiles collection', function () {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeAssessment();

      // when / then
      expect(campaign.isProfilesCollection()).to.be.false;
    });
  });

  describe('isArchived', function () {
    it('should return true when campaign is archived', function () {
      // given
      const campaign = domainBuilder.buildCampaign({ archivedAt: new Date('1990-01-04') });

      // when / then
      expect(campaign.isArchived()).to.be.true;
    });

    it('should return false when campaign is not of type profiles collection', function () {
      // given
      const campaign = domainBuilder.buildCampaign({ archivedAt: null });

      // when / then
      expect(campaign.isArchived()).to.be.false;
    });
  });
});
