import { expect, domainBuilder } from '../../../test-helper';
import CampaignTypes from '../../../../lib/domain/models/CampaignTypes';

describe('Unit | Domain | Models | CampaignReport', function () {
  it('should define target profile informations', function () {
    const targetProfileForSpecifier = {
      name: 'target profile',
      description: 'description',
      TubesCount: 2,
      hasStage: false,
      thematicResult: 3,
    };

    const campaignReport = domainBuilder.buildCampaignReport({ targetProfileForSpecifier });

    expect(campaignReport.targetProfileName).to.equal(targetProfileForSpecifier.name);
    expect(campaignReport.targetProfileDescription).to.equal(targetProfileForSpecifier.description);
    expect(campaignReport.targetProfileTubesCount).to.equal(targetProfileForSpecifier.tubeCount);
    expect(campaignReport.targetProfileThematicResult).to.equal(targetProfileForSpecifier.thematicResultCount);
    expect(campaignReport.targetProfileHasStage).to.equal(targetProfileForSpecifier.hasStage);
  });

  describe('#isAssessment', function () {
    it('should return true if the campaign is of type ASSESSMENT', function () {
      // given
      const campaignReport = domainBuilder.buildCampaignReport({ type: CampaignTypes.ASSESSMENT });

      // when / then
      expect(campaignReport.isAssessment).to.be.true;
    });

    it('should return false if the campaign is not of type ASSESSMENT', function () {
      // given
      const campaignReport = domainBuilder.buildCampaignReport({ type: CampaignTypes.PROFILES_COLLECTION });

      // when / then
      expect(campaignReport.isAssessment).to.be.false;
    });
  });

  describe('#isProfilesCollection', function () {
    it('should return true if the campaign is of type PROFILES_COLLECTION', function () {
      // given
      const campaignReport = domainBuilder.buildCampaignReport({ type: CampaignTypes.PROFILES_COLLECTION });

      // when / then
      expect(campaignReport.isProfilesCollection).to.be.true;
    });

    it('should return false if the campaign is not of type PROFILES_COLLECTION', function () {
      // given
      const campaignReport = domainBuilder.buildCampaignReport({ type: CampaignTypes.ASSESSMENT });

      // when / then
      expect(campaignReport.isProfilesCollection).to.be.false;
    });
  });

  describe('#isArchived', function () {
    it('should return true if the campaign is archived', function () {
      // given
      const campaignReport = domainBuilder.buildCampaignReport({ archivedAt: new Date('2020-02-02') });

      // when / then
      expect(campaignReport.isArchived).to.be.true;
    });

    it('should return false if the campaign is not archived', function () {
      // given
      const campaignReport = domainBuilder.buildCampaignReport({ archivedAt: null });

      // when / then
      expect(campaignReport.isArchived).to.be.false;
    });
  });

  describe('#computeAverageResult', function () {
    it('should return null if there is no masteryRates', function () {
      const campaignReport = domainBuilder.buildCampaignReport();

      campaignReport.computeAverageResult([]);

      expect(campaignReport.averageResult).to.equal(null);
    });

    it('should return a not rounded result if there is masteryRates', function () {
      const campaignReport = domainBuilder.buildCampaignReport();

      campaignReport.computeAverageResult([0.13, 0.52]);

      expect(campaignReport.averageResult).to.equal(0.325);
    });
  });
});
