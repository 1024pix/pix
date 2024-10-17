import { CampaignAssessmentParticipationResultMinimal } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignAssessmentParticipationResultMinimal.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Read-Models | CampaignResults | CampaignAssessmentParticipationResultMinimal', function () {
  describe('constructor', function () {
    it('should correctly initialize the information about campaign participation result', function () {
      const campaignAssessmentParticipationResultMinimal = new CampaignAssessmentParticipationResultMinimal({
        campaignParticipationId: 45,
        firstName: 'Lidia',
        lastName: 'Aguilar',
        masteryRate: 0.45,
        participantExternalId: 'Alba67',
        reachedStage: 2,
        totalStage: 6,
        prescriberTitle: 'titre prescripteur',
        prescriberDescription: 'description prescripteur',
        sharedResultCount: 3,
      });

      expect(campaignAssessmentParticipationResultMinimal).to.deep.equal({
        campaignParticipationId: 45,
        firstName: 'Lidia',
        lastName: 'Aguilar',
        badges: [],
        masteryRate: 0.45,
        evolution: null,
        participantExternalId: 'Alba67',
        reachedStage: 2,
        totalStage: 6,
        prescriberTitle: 'titre prescripteur',
        prescriberDescription: 'description prescripteur',
        sharedResultCount: 3,
      });
    });
  });

  describe('masteryRate', function () {
    context('when the masteryRate is null', function () {
      it('should return null for the masteryRate', function () {
        // when
        const campaignAssessmentParticipationResultMinimal = new CampaignAssessmentParticipationResultMinimal({
          masteryRate: null,
        });

        // then
        expect(campaignAssessmentParticipationResultMinimal.masteryRate).to.equal(null);
      });
    });

    context('when the masteryRate is undefined', function () {
      it('should return null for the masteryRate', function () {
        // when
        const campaignAssessmentParticipationResultMinimal = new CampaignAssessmentParticipationResultMinimal({
          masteryRate: undefined,
        });

        // then
        expect(campaignAssessmentParticipationResultMinimal.masteryRate).to.equal(null);
      });
    });

    context('when the masteryRate equals to 0', function () {
      it('should return 0 for the masteryRate', function () {
        // when
        const campaignAssessmentParticipationResultMinimal = new CampaignAssessmentParticipationResultMinimal({
          masteryRate: 0,
        });

        // then
        expect(campaignAssessmentParticipationResultMinimal.masteryRate).to.equal(0);
      });
    });

    context('when the masteryRate is a string', function () {
      it('should return the number for the masteryRate', function () {
        // when
        const campaignAssessmentParticipationResultMinimal = new CampaignAssessmentParticipationResultMinimal({
          masteryRate: '0.75',
        });

        // then
        expect(campaignAssessmentParticipationResultMinimal.masteryRate).to.equal(0.75);
      });
    });
  });

  describe('evolution', function () {
    context('when the previousMasteryRate is null', function () {
      it('should return null for the evolution', function () {
        // when
        const campaignAssessmentParticipationResultMinimal = new CampaignAssessmentParticipationResultMinimal({
          previousMasteryRate: null,
          masteryRate: 0.18,
        });

        // then
        expect(campaignAssessmentParticipationResultMinimal.evolution).to.equal(null);
      });
    });

    context('when the masteryRate is null', function () {
      it('should return null for the evolution', function () {
        // when
        const campaignAssessmentParticipationResultMinimal = new CampaignAssessmentParticipationResultMinimal({
          previousMasteryRate: 0.18,
          masteryRate: null,
        });

        // then
        expect(campaignAssessmentParticipationResultMinimal.evolution).to.equal(null);
      });
    });

    context('when the masteryRate is superior to the previousMasteryRate', function () {
      it('should return increase for the evolution', function () {
        // when
        const campaignAssessmentParticipationResultMinimal = new CampaignAssessmentParticipationResultMinimal({
          masteryRate: 0.8,
          previousMasteryRate: 0.5,
        });

        // then
        expect(campaignAssessmentParticipationResultMinimal.evolution).to.equal('increase');
      });
    });

    context('when the masteryRate is inferior to the previousMasteryRate', function () {
      it('should return decrease for the evolution', function () {
        // when
        const campaignAssessmentParticipationResultMinimal = new CampaignAssessmentParticipationResultMinimal({
          masteryRate: 0.5,
          previousMasteryRate: 0.8,
        });

        // then
        expect(campaignAssessmentParticipationResultMinimal.evolution).to.equal('decrease');
      });
    });

    context('when the masteryRate is equal to the previousMasteryRate', function () {
      it('should return stable for the evolution', function () {
        // when
        const campaignAssessmentParticipationResultMinimal = new CampaignAssessmentParticipationResultMinimal({
          masteryRate: 0.8,
          previousMasteryRate: 0.8,
        });

        // then
        expect(campaignAssessmentParticipationResultMinimal.evolution).to.equal('stable');
      });
    });
  });

  describe('badges', function () {
    it('keeps only once each badge', function () {
      // when
      const campaignAssessmentParticipationResultMinimal = new CampaignAssessmentParticipationResultMinimal({
        badges: [{ id: 1 }, { id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }, { id: 3 }, { id: 3 }],
      });

      // then
      expect(campaignAssessmentParticipationResultMinimal.badges).to.exactlyContain([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });
});
