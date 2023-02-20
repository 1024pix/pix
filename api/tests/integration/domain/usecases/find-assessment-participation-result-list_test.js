import { expect, mockLearningContent, databaseBuilder } from '../../../test-helper';
import useCases from '../../../../lib/domain/usecases';

describe('Integration | UseCase | find-assessment-participation-result-list', function () {
  let organizationId;
  let campaignId;
  const page = { number: 1 };

  beforeEach(async function () {
    const skill = { id: 'recSkill', status: 'actif' };

    organizationId = databaseBuilder.factory.buildOrganization().id;
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
    databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skill.id });

    const participation1 = { participantExternalId: 'Yubaba', campaignId, status: 'SHARED' };
    const participant1 = { firstName: 'Chihiro', lastName: 'Ogino' };
    databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant1, participation1);

    const participation2 = { participantExternalId: 'Meï', campaignId, status: 'SHARED' };
    const participant2 = { firstName: 'Tonari', lastName: 'No Totoro' };
    databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant2, participation2);

    mockLearningContent({ skills: [skill], tubes: [], thematics: [], competences: [], areas: [], challenges: [] });

    await databaseBuilder.commit();
  });

  context('when there are filters', function () {
    it('returns the assessmentParticipationResultMinimal list filtered by the search', async function () {
      const { participations } = await useCases.findAssessmentParticipationResultList({
        campaignId,
        filters: { search: 'Tonari N' },
        page,
      });

      expect(participations.length).to.equal(1);
    });
  });
});
