import { CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { domainBuilder, expect } from '../../../test-helper.js';

describe('Unit | Domain | Models | CampaignToStartParticipation', function () {
  describe('#isAssessment', function () {
    it('should return true if the campaign is of type ASSESSMENT', function () {
      // given
      const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
        type: CampaignTypes.ASSESSMENT,
      });

      // when / then
      expect(campaignToStartParticipation.isAssessment).to.be.true;
    });

    it('should return false if the campaign is not of type ASSESSMENT', function () {
      // given
      const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
        type: CampaignTypes.PROFILES_COLLECTION,
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

  describe('#computeisRestrictedAccess', function () {
    it('should return true if the organization is ManagingStudents with import feature', function () {
      // given / when
      const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
        isManagingStudents: true,
        hasLearnersImportFeature: true,
      });

      // then
      expect(campaignToStartParticipation.isRestricted).to.be.true;
    });

    it('should return true if the organization is ManagingStudents without import feature', function () {
      // given / when
      const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
        isManagingStudents: true,
        hasLearnersImportFeature: false,
      });

      // then
      expect(campaignToStartParticipation.isRestricted).to.be.true;
    });

    it('should return true if the organization is not ManagingStudents with import feature', function () {
      // given / when
      const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
        isManagingStudents: false,
        hasLearnersImportFeature: true,
      });

      // then
      expect(campaignToStartParticipation.isRestricted).to.be.true;
    });

    it('should return false if the campaign is not restricted', function () {
      // given / when
      const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
        isManagingStudents: false,
        hasLearnersImportFeature: false,
      });

      // then
      expect(campaignToStartParticipation.isRestricted).to.be.false;
    });
  });
});
