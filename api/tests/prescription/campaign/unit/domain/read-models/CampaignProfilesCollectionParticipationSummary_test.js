import { CampaignProfilesCollectionParticipationSummary } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignProfilesCollectionParticipationSummary.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Read-Models | CampaignResults | CampaignProfilesCollectionParticipationSummary', function () {
  describe('constructor', function () {
    it('should correctly initialize the information about campaign participation result', function () {
      // given
      const inputData = {
        firstName: 'Sarah',
        lastName: 'Croche',
        participantExternalId: 'Sarah2024',
        sharedAt: '2024-10-28',
        pixScore: 20,
        sharedProfileCount: 2,
        certifiable: true,
        certifiableCompetencesCount: 9,
      };

      // when
      const campaignProfilesCollectionParticipationSummary = new CampaignProfilesCollectionParticipationSummary({
        ...inputData,
        previousPixScore: null,
        campaignParticipationId: 45,
      });

      // then
      expect(campaignProfilesCollectionParticipationSummary).to.deep.equal({
        id: 45,
        ...inputData,
        evolution: null,
      });
    });

    context('evolution', function () {
      // given
      const inputCommonData = {
        campaignParticipationId: 45,
        firstName: 'Sarah',
        lastName: 'Croche',
        participantExternalId: 'Sarah2024',
        certifiable: true,
        certifiableCompetencesCount: 9,
        sharedProfileCount: 2,
        sharedAt: '2024-10-28',
      };

      describe('when previous participation pixScore is undefined', function () {
        it('should return null for evolution', function () {
          // when
          const campaignProfilesCollectionParticipationSummary = new CampaignProfilesCollectionParticipationSummary({
            ...inputCommonData,
            pixScore: 20,
            previousPixScore: undefined,
          });

          // then
          expect(campaignProfilesCollectionParticipationSummary).to.include({
            evolution: null,
          });
        });
      });

      describe('when previous participation is 0', function () {
        it('should not return null for evolution', function () {
          const campaignProfilesCollectionParticipationSummary = new CampaignProfilesCollectionParticipationSummary({
            ...inputCommonData,

            pixScore: 0,
            previousPixScore: 0,
          });

          expect(campaignProfilesCollectionParticipationSummary.evolution).to.not.be.null;
        });
      });

      context('evolution compute', function () {
        describe('when pixScore is superior to previous pixScore', function () {
          it('should return "increase" for evolution', function () {
            const campaignProfilesCollectionParticipationSummary = new CampaignProfilesCollectionParticipationSummary({
              ...inputCommonData,
              sharedAt: '2024-10-28',
              pixScore: 20,
              previousPixScore: 10,
            });

            expect(campaignProfilesCollectionParticipationSummary).to.include({
              evolution: 'increase',
            });
          });
        });

        describe('when pixScore is inferior to previous pixScore', function () {
          it('should return decrease for evolution', function () {
            const campaignProfilesCollectionParticipationSummary = new CampaignProfilesCollectionParticipationSummary({
              ...inputCommonData,
              sharedAt: '2024-10-28',
              pixScore: 30,
              previousPixScore: 50,
            });

            expect(campaignProfilesCollectionParticipationSummary).to.include({
              evolution: 'decrease',
            });
          });
        });

        describe('when pixScore is equal to previous pixScore', function () {
          it('should return stable for evolution', function () {
            const campaignProfilesCollectionParticipationSummary = new CampaignProfilesCollectionParticipationSummary({
              ...inputCommonData,
              sharedAt: '2024-10-28',
              pixScore: 30,
              previousPixScore: 30,
            });

            expect(campaignProfilesCollectionParticipationSummary).to.include({
              evolution: 'stable',
            });
          });
        });
      });
    });
  });
});
