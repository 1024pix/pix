import * as campaignApi from '../../../../../../src/prescription/campaign/application/api/campaigns-api.js';
import { CampaignParticipation } from '../../../../../../src/prescription/campaign/application/api/models/CampaignParticipation.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Application | campaign-api', function () {
  describe('#findAllForOrganization', function () {
    it('should not fail without page args', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaign();

      await databaseBuilder.commit();

      const result = await campaignApi.findAllForOrganization({ organizationId });

      expect(result.models.length).to.be.equal(2);
    });

    it('should take pagination in consideration', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildCampaign({ organizationId });
      const campaignId2 = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      databaseBuilder.factory.buildCampaign();

      await databaseBuilder.commit();

      const result = await campaignApi.findAllForOrganization({ organizationId, page: { size: 1, number: 2 } });

      expect(result.models.length).to.be.equal(1);
      expect(result.models[0].id).to.deep.equal(campaignId2);
      expect(result.meta.pageCount).to.equal(2);
    });
  });

  describe('#getCampaignParticipations', function () {
    it('should return an array of campaign participations', async function () {
      // given
      const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
      const areaId = databaseBuilder.factory.learningContent.buildArea({ frameworkId }).id;
      const competenceId = databaseBuilder.factory.learningContent.buildCompetence({ areaId }).id;
      const tube = databaseBuilder.factory.learningContent.buildTube({ competenceId });
      const skillId = databaseBuilder.factory.learningContent.buildSkill({ tubeId: tube.id, status: 'actif' }).id;

      const { id: userId } = databaseBuilder.factory.buildUser({
        firstName: 'user firstname 1',
        lastName: 'user lastname 1',
      });
      const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
        userId,
        firstName: 'firstname 1',
        lastName: 'lastname 1',
      });
      const campaign = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId });
      const participation1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.SHARED,
        organizationLearnerId: organizationLearner1.id,
        masteryRate: 0.1,
        pixScore: 42,
        validatedSkillsCount: 10,
        userId,
        participantExternalId: 'external id 1',
        createdAt: new Date('2025-01-02'),
        sharedAt: new Date('2025-01-03'),
      });
      const ke = databaseBuilder.factory.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId,
        userId: participation1.userId,
      });

      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId: participation1.id,
        snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
      });

      const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organizationLearner1.organizationId,
      });
      const participation2 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.STARTED,
        organizationLearnerId: organizationLearner2.id,
        userId: organizationLearner2.userId,
      });

      await databaseBuilder.commit();

      // when
      const result = await campaignApi.getCampaignParticipations({
        campaignId: campaign.id,
        locale: 'fr',
        page: { size: 2, number: 1 },
      });

      // then
      expect(result.models[0]).instanceOf(CampaignParticipation);
      expect(result.models[1]).instanceOf(CampaignParticipation);
      expect(result.models).to.deep.equal([
        {
          campaignParticipationId: participation2.id,
          participantFirstName: organizationLearner2.firstName,
          participantLastName: organizationLearner2.lastName,
          participantExternalId: participation2.participantExternalId,
          userId: organizationLearner2.userId,
          createdAt: participation2.createdAt,
          sharedAt: null,
          masteryRate: null,
          status: CampaignParticipationStatuses.STARTED,
          tubes: undefined,
        },
        {
          campaignParticipationId: participation1.id,
          participantFirstName: 'firstname 1',
          participantLastName: 'lastname 1',
          participantExternalId: 'external id 1',
          userId,
          createdAt: new Date('2025-01-02'),
          sharedAt: new Date('2025-01-03'),
          masteryRate: 0.1,
          status: CampaignParticipationStatuses.SHARED,
          tubes: [
            {
              competenceId: 'competenceIdA',
              id: 'tubeIdA',
              maxLevel: 2,
              reachedLevel: 2,
              practicalDescription: 'practicalDescription FR Tube A',
              practicalTitle: 'practicalTitle FR Tube A',
            },
          ],
        },
      ]);
      expect(result.meta).to.deep.equal({
        page: 1,
        pageCount: 1,
        pageSize: 2,
        rowCount: 2,
      });
    });
  });
});
