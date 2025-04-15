import { CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { domainBuilder, expect } from '../../../test-helper.js';

describe('Unit | Domain | Models | CampaignReport', function () {
  describe('getters', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        getter: 'isAssessment',
        // eslint-disable-next-line mocha/no-setup-in-describe
        isTrueForType: CampaignTypes.ASSESSMENT,
      },
      {
        getter: 'isExam',
        // eslint-disable-next-line mocha/no-setup-in-describe
        isTrueForType: CampaignTypes.EXAM,
      },
      {
        getter: 'isProfilesCollection',
        // eslint-disable-next-line mocha/no-setup-in-describe
        isTrueForType: CampaignTypes.PROFILES_COLLECTION,
      },
    ].forEach(({ getter, isTrueForType }) => {
      describe('#' + getter, function () {
        // eslint-disable-next-line mocha/no-setup-in-describe
        Object.values(CampaignTypes).forEach((campaignType) => {
          const expected = campaignType === isTrueForType;
          it(`should return ${expected} when campaign is of type ${campaignType}`, function () {
            // given
            const campaignReport = domainBuilder.buildCampaignReport({
              type: campaignType,
            });

            // when / then
            expect(campaignReport[getter]).to.equal(expected);
          });
        });
      });
    });
  });

  describe('#setCoverRate', function () {
    it('should set cover rate', function () {
      // given
      const campaignResultLevelsPerTubesAndCompetences =
        domainBuilder.prescription.campaign.buildCampaignResultLevelsPerTubesAndCompetences();
      const campaignReport = domainBuilder.buildCampaignReport();

      // when
      campaignReport.setCoverRate(campaignResultLevelsPerTubesAndCompetences);
      // then
      expect(campaignReport.tubes).to.deep.equal(campaignResultLevelsPerTubesAndCompetences.levelsPerTube);
    });
  });

  describe('#setTargetProfileInformation', function () {
    it('should define target profile informations', function () {
      const targetProfileForSpecifier = {
        name: 'target profile',
        description: 'description',
        TubesCount: 2,
        hasStage: false,
        thematicResult: 3,
      };

      const campaignReport = domainBuilder.buildCampaignReport();

      campaignReport.setTargetProfileInformation(targetProfileForSpecifier);

      expect(campaignReport.targetProfileName).to.equal(targetProfileForSpecifier.name);
      expect(campaignReport.targetProfileDescription).to.equal(targetProfileForSpecifier.description);
      expect(campaignReport.targetProfileTubesCount).to.equal(targetProfileForSpecifier.tubeCount);
      expect(campaignReport.targetProfileThematicResult).to.equal(targetProfileForSpecifier.thematicResultCount);
      expect(campaignReport.targetProfileHasStage).to.equal(targetProfileForSpecifier.hasStage);
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
