import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | CampaignToJoin', function () {
  describe('#isAssessment', function () {
    it('should return true if the campaign is of type ASSESSMENT', function () {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ type: CampaignTypes.ASSESSMENT });

      // when / then
      expect(campaignToJoin.isAssessment).to.be.true;
    });

    it('should return false if the campaign is not of type ASSESSMENT', function () {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ type: CampaignTypes.PROFILES_COLLECTION });

      // when / then
      expect(campaignToJoin.isAssessment).to.be.false;
    });
  });

  describe('#isProfilesCollection', function () {
    it('should return true if the campaign is of type PROFILES_COLLECTION', function () {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ type: CampaignTypes.PROFILES_COLLECTION });

      // when / then
      expect(campaignToJoin.isProfilesCollection).to.be.true;
    });

    it('should return false if the campaign is not of type PROFILES_COLLECTION', function () {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ type: CampaignTypes.ASSESSMENT });

      // when / then
      expect(campaignToJoin.isProfilesCollection).to.be.false;
    });
  });

  describe('#isAccessible', function () {
    it('should return false if the campaign is archived', function () {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ archivedAt: new Date('2020-02-02') });

      // when / then
      expect(campaignToJoin.isAccessible).to.be.false;
    });

    it('should return false if the campaign is deleted', function () {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ deletedAt: new Date('2020-02-02') });

      // when / then
      expect(campaignToJoin.isAccessible).to.be.false;
    });

    it('should return true if the campaign is not archived and not deleted', function () {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ archivedAt: null, deletedAt: null });

      // when / then
      expect(campaignToJoin.isAccessible).to.be.true;
    });
  });

  describe('#isRestricted', function () {
    it('should return true if the organization is ManagingStudents with import feature', function () {
      // given / when
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        organizationIsManagingStudents: true,
        hasLearnersImportFeature: true,
      });

      // then
      expect(campaignToJoin.isRestricted).to.be.true;
    });

    it('should return true if the organization is ManagingStudents without import feature', function () {
      // given / when
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        organizationIsManagingStudents: true,
        hasLearnersImportFeature: false,
      });

      // then
      expect(campaignToJoin.isRestricted).to.be.true;
    });

    it('should return true if the organization is not ManagingStudents with import feature', function () {
      // given / when
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        organizationIsManagingStudents: false,
        hasLearnersImportFeature: true,
      });

      // then
      expect(campaignToJoin.isRestricted).to.be.true;
    });

    it('should return false if the campaign is not restricted', function () {
      // given / when
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        organizationIsManagingStudents: false,
        hasLearnersImportFeature: false,
      });

      // then
      expect(campaignToJoin.isRestricted).to.be.false;
    });
  });
});
