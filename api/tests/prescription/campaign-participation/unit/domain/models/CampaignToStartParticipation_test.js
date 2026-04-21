import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | CampaignToStartParticipation', function () {
  describe('getters', function () {
    [
      {
        getter: 'isAssessment',

        isTrueForType: CampaignTypes.ASSESSMENT,
      },
      {
        getter: 'isExam',

        isTrueForType: CampaignTypes.EXAM,
      },
    ].forEach(({ getter, isTrueForType }) => {
      describe('#' + getter, function () {
        Object.values(CampaignTypes).forEach((campaignType) => {
          const expected = campaignType === isTrueForType;
          it(`should return ${expected} when campaign is of type ${campaignType}`, function () {
            // given
            const campaignToStartParticipation = domainBuilder.buildCampaignToStartParticipation({
              type: campaignType,
            });

            // when / then
            expect(campaignToStartParticipation[getter]).to.equal(expected);
          });
        });
      });
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
