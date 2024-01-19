import { expect, domainBuilder, sinon } from '../../../test-helper.js';
import { CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { config } from '../../../../lib/config.js';

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

  describe('#isArchived', function () {
    it('should return true if the campaign is archived', function () {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ archivedAt: new Date('2020-02-02') });

      // when / then
      expect(campaignToJoin.isArchived).to.be.true;
    });

    it('should return false if the campaign is not archived', function () {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ archivedAt: null });

      // when / then
      expect(campaignToJoin.isArchived).to.be.false;
    });
  });

  describe('#organizationName', function () {
    it('should return organization name', function () {
      // given
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ organizationName: 'My organization' });

      // when / then
      expect(campaignToJoin.organizationName).to.equal('My organization');
    });

    it('should return Pix as organization name if the organization is the autonomous course organization', function () {
      // given
      sinon.stub(config.autonomousCourse, 'autonomousCoursesOrganizationId').value(777);
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        organizationName: 'Not displayed organization name',
        organizationId: 777,
      });

      // when / then
      expect(campaignToJoin.organizationName).to.equal('Pix');
    });
  });
});
