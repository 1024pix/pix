import {
  AssessmentCampaignParticipation,
  ProfilesCollectionCampaignParticipation,
} from '../../../../../../src/prescription/campaign/domain/read-models/CampaignParticipation.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { FRENCH_SPOKEN } from '../../../../../../src/shared/domain/services/locale-service.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

const {
  buildStage,
  buildBadge,
  buildCampaign,
  learningContent,
  buildCampaignSkill,
  buildTargetProfile,
  buildBadgeCriterion,
  buildBadgeAcquisition,
  buildKnowledgeElement,
  buildStageAcquisition,
  buildOrganizationLearner,
  buildCampaignParticipation,
  buildKnowledgeElementSnapshot,
} = databaseBuilder.factory;

describe('Integration | UseCase | get-campaign-participations', function () {
  context('when campaign type is assessment', function () {
    it('should return all participations for given campaign', async function () {
      // given
      const frameworkId = learningContent.buildFramework().id;
      const areaId = learningContent.buildArea({ frameworkId }).id;
      const competence = learningContent.buildCompetence({ areaId });
      const tube = learningContent.buildTube({ competenceId: competence.id });
      const skillId = learningContent.buildSkill({
        id: 'recSkillId1',
        tubeId: tube.id,
        status: 'actif',
        level: 1,
        competenceId: competence.id,
      }).id;
      const skillId2 = learningContent.buildSkill({
        id: 'recSkillId2',
        tubeId: tube.id,
        status: 'actif',
        level: 2,
        competenceId: competence.id,
      }).id;
      const organizationLearner1 = buildOrganizationLearner({ lastName: 'Albert' });

      const targetProfile = buildTargetProfile();

      // Build stages
      const stage0 = buildStage({ targetProfileId: targetProfile.id, threshold: 0 });
      const stage1 = buildStage({ targetProfileId: targetProfile.id, threshold: 20 });
      const stage2 = buildStage({ targetProfileId: targetProfile.id, threshold: 21 });
      buildStage({ targetProfileId: targetProfile.id, threshold: 22 });

      const badge1 = buildBadge({ targetProfileId: targetProfile.id, key: 'BADGE1' });
      const badge2 = buildBadge({ targetProfileId: targetProfile.id, key: 'BADGE2' });

      buildBadgeCriterion({
        badgeId: badge1.id,
        threshold: 50,
        cappedTubes: JSON.stringify([{ tubeId: tube.id, level: 1 }]),
      });
      buildBadgeCriterion({
        badgeId: badge2.id,
        threshold: 100,
        cappedTubes: JSON.stringify([{ tubeId: tube.id, level: 2 }]),
      });

      const campaign = buildCampaign({ type: CampaignTypes.ASSESSMENT, targetProfileId: targetProfile.id });

      buildCampaignSkill({ campaignId: campaign.id, skillId });
      buildCampaignSkill({ campaignId: campaign.id, skillId: skillId2 });

      const participation1 = buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.SHARED,
        organizationLearnerId: organizationLearner1.id,
        masteryRate: 0.1,
        pixScore: 42,
        validatedSkillsCount: 10,
        createdAt: new Date('2020-01-03'),
        sharedAt: new Date('2020-01-03'),
      });
      buildStageAcquisition({ campaignParticipationId: participation1.id, stageId: stage0.id });
      buildStageAcquisition({ campaignParticipationId: participation1.id, stageId: stage1.id });
      buildStageAcquisition({ campaignParticipationId: participation1.id, stageId: stage2.id });

      buildBadgeAcquisition({ campaignParticipationId: participation1.id, badgeId: badge1.id });

      const ke = buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId,
        userId: participation1.userId,
      });
      const ke2 = buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
        skillId: skillId2,
        userId: participation1.userId,
      });

      buildKnowledgeElementSnapshot({
        campaignParticipationId: participation1.id,
        snapshot: new KnowledgeElementCollection([ke, ke2]).toSnapshot(),
      });

      const organizationLearner2 = buildOrganizationLearner({
        lastName: 'Michele',
        organizationId: organizationLearner1.organizationId,
      });
      buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.STARTED,
        organizationLearnerId: organizationLearner2.id,
        masteryRate: null,
        pixScore: null,
        validatedSkillsCount: null,
        createdAt: new Date('2020-01-03'),
      });

      buildCampaignParticipation({
        status: CampaignParticipationStatuses.STARTED,
        masteryRate: 0.5,
        createdAt: new Date('2020-01-04'),
      });

      buildCampaignParticipation({
        status: CampaignParticipationStatuses.STARTED,
        masteryRate: 0.5,
        createdAt: new Date('2020-01-01'),
      });

      await databaseBuilder.commit();

      const page = {
        size: 1,
        number: 1,
      };
      const since = new Date('2020-01-02').getTime();
      // when
      const { models, meta } = await usecases.getCampaignParticipations({
        campaignId: campaign.id,
        locale: FRENCH_SPOKEN,
        page,
        since,
      });

      // then
      expect(models).to.have.lengthOf(1);
      expect(models[0]).to.deep.equal(
        new AssessmentCampaignParticipation({
          campaignParticipationId: participation1.id,
          userId: participation1.userId,
          participantExternalId: participation1.participantExternalId,
          status: participation1.status,
          masteryRate: participation1.masteryRate,
          createdAt: participation1.createdAt,
          sharedAt: participation1.sharedAt,
          participantFirstName: organizationLearner1.firstName,
          participantLastName: organizationLearner1.lastName,
          tubes: [
            {
              id: tube.id,
              competenceId: competence.id,
              competenceName: competence.name_i18n[FRENCH_SPOKEN],
              maxLevel: 2,
              reachedLevel: 1,
              description: tube.practicalDescription_i18n[FRENCH_SPOKEN],
              title: tube.practicalTitle_i18n[FRENCH_SPOKEN],
            },
          ],
          stages: {
            reachedStage: 2,
            numberOfStages: 3,
          },
          badges: [
            {
              id: badge1.id,
              key: badge1.key,
              title: badge1.title,
              imageUrl: badge1.imageUrl,
              altMessage: badge1.altMessage,
              isAcquired: true,
              acquisitionPercentage: 100,
            },
            {
              id: badge2.id,
              key: badge2.key,
              title: badge2.title,
              imageUrl: badge2.imageUrl,
              altMessage: badge2.altMessage,
              isAcquired: false,
              acquisitionPercentage: 50,
            },
          ],
        }),
      );
      expect(meta).to.deep.equal({
        page: 1,
        pageCount: 2,
        pageSize: 1,
        rowCount: 2,
      });
    });
  });

  context('when campaign type is profile collection', function () {
    it('should return all participations for given campaign', async function () {
      // given
      const campaign = buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });
      const organizationLearner1 = buildOrganizationLearner();
      const participation1 = buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.SHARED,
        organizationLearnerId: organizationLearner1.id,
        masteryRate: 0.1,
        pixScore: 42,
        validatedSkillsCount: 10,
      });
      const organizationLearner2 = buildOrganizationLearner({
        organizationId: organizationLearner1.organizationId,
      });
      const participation2 = buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.STARTED,
        organizationLearnerId: organizationLearner2.id,
        masteryRate: 0.3,
        pixScore: 21,
        validatedSkillsCount: 10,
      });
      buildCampaignParticipation({
        status: CampaignParticipationStatuses.STARTED,
        masteryRate: 0.5,
      });

      await databaseBuilder.commit();

      // when
      const { models, meta } = await usecases.getCampaignParticipations({
        campaignId: campaign.id,
        locale: FRENCH_SPOKEN,
      });

      //then
      expect(models).to.have.lengthOf(2);
      expect(models[0]).instanceOf(ProfilesCollectionCampaignParticipation);
      expect(models[1]).instanceOf(ProfilesCollectionCampaignParticipation);
      expect(models).to.deep.members([
        {
          campaignParticipationId: participation1.id,
          userId: participation1.userId,
          participantExternalId: participation1.participantExternalId,
          status: participation1.status,
          createdAt: participation1.createdAt,
          sharedAt: participation1.sharedAt,
          pixScore: participation1.pixScore,
          participantFirstName: organizationLearner1.firstName,
          participantLastName: organizationLearner1.lastName,
        },
        {
          campaignParticipationId: participation2.id,
          userId: participation2.userId,
          participantExternalId: participation2.participantExternalId,
          status: participation2.status,
          createdAt: participation2.createdAt,
          sharedAt: participation2.sharedAt,
          pixScore: participation2.pixScore,
          participantFirstName: organizationLearner2.firstName,
          participantLastName: organizationLearner2.lastName,
        },
      ]);
      expect(meta).to.deep.equal({
        page: 1,
        pageCount: 1,
        pageSize: 10,
        rowCount: 2,
      });
    });
  });
});
