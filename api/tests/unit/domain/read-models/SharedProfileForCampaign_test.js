import { expect, domainBuilder } from '../../../test-helper';
import SharedProfileForCampaign from '../../../../lib/domain/read-models/SharedProfileForCampaign';
import Scorecard from '../../../../lib/domain/models/Scorecard';

describe('Unit | Domain | Models | SharedProfileForCampaign', function () {
  describe('#scorecards', function () {
    context('when participant has knowledge elements', function () {
      it('return scorecards', function () {
        const userId = 1;
        const competence = { id: 1, name: 'Useful competence', areaId: 'area' };
        const area = { id: 'area' };
        const knowledgeElements = [domainBuilder.buildKnowledgeElement({ competenceId: competence.id })];
        const expectedScorecard = Scorecard.buildFrom({ userId, competence, knowledgeElements });

        const sharedProfileForCampaign = new SharedProfileForCampaign({
          userId,
          campaignParticipation: {
            sharedAt: new Date('2020-01-01'),
          },
          competences: [competence],
          allAreas: [area],
          knowledgeElementsGroupedByCompetenceId: {
            [competence.id]: knowledgeElements,
          },
        });

        expect(sharedProfileForCampaign.scorecards[0]).to.deep.include({
          id: expectedScorecard.id,
          name: expectedScorecard.name,
        });
      });
    });

    context('when participant does not have knowledge elements', function () {
      it('return empty array', function () {
        const userId = 1;
        const competence = { id: 1, name: 'Useful competence' };

        const sharedProfileForCampaign = new SharedProfileForCampaign({
          userId,
          campaignParticipation: {
            sharedAt: new Date('2020-01-01'),
          },
          competencesWithArea: [competence],
        });

        expect(sharedProfileForCampaign.scorecards).to.deep.equal([]);
      });
    });
  });

  describe('#canRetry', function () {
    context('when participant is disabled', function () {
      it('cannot retry', function () {
        const sharedProfileForCampaign = new SharedProfileForCampaign({
          campaignParticipation: {
            sharedAt: new Date('2020-01-01'),
          },
          campaignAllowsRetry: true,
          isOrganizationLearnerActive: false,
        });

        expect(sharedProfileForCampaign.canRetry).to.equal(false);
      });
    });

    context('when the campaign does not allow retry', function () {
      it('return false', function () {
        const sharedProfileForCampaign = new SharedProfileForCampaign({
          campaignParticipation: {
            sharedAt: new Date('2020-01-01'),
          },
          campaignAllowsRetry: false,
          isOrganizationLearnerActive: true,
        });

        expect(sharedProfileForCampaign.canRetry).to.equal(false);
      });

      it('returns false if campaign participation is deleted', function () {
        const sharedProfileForCampaign = new SharedProfileForCampaign({
          campaignParticipation: {
            sharedAt: new Date('2020-01-01'),
            deletedAt: new Date('2020-01-01'),
          },
          campaignAllowsRetry: true,
          isOrganizationLearnerActive: true,
        });

        expect(sharedProfileForCampaign.canRetry).to.equal(false);
      });
    });

    context('when participant is  active', function () {
      context('when participation is not shared', function () {
        it('return false', function () {
          const sharedProfileForCampaign = new SharedProfileForCampaign({
            campaignParticipation: {
              sharedAt: null,
            },
            campaignAllowsRetry: true,
            isOrganizationLearnerActive: true,
          });

          expect(sharedProfileForCampaign.canRetry).to.equal(false);
        });
      });

      context('when the profile has been shared', function () {
        it('return true', function () {
          const sharedProfileForCampaign = new SharedProfileForCampaign({
            campaignParticipation: {
              sharedAt: new Date('2020-01-01'),
            },
            campaignAllowsRetry: true,
            isOrganizationLearnerActive: true,
          });

          expect(sharedProfileForCampaign.canRetry).to.equal(true);
        });
      });
    });
  });
});
