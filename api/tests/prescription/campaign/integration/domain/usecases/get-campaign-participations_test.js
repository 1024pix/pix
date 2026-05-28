import { AssessmentCampaignParticipation } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignParticipation.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { FRENCH_SPOKEN } from '../../../../../../src/shared/domain/services/locale-service.js';
import { expect } from '../../../../../test-helper.js';
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
      const organizationLearner1 = buildOrganizationLearner({ lastName: 'Michel' });

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
        lastName: 'Albert',
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
        size: 2,
        number: 1,
      };
      const since = new Date('2020-01-02').getTime();

      const sort = [{ value: 'createdAt', type: 'asc' }];
      // when
      const { models, meta } = await usecases.getCampaignParticipations({
        campaignId: campaign.id,
        locale: FRENCH_SPOKEN,
        page,
        since,
        sort,
      });

      // then
      expect(models).to.have.lengthOf(2);
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
        pageCount: 1,
        pageSize: 2,
        rowCount: 2,
      });
    });
  });

  context('when campaign type is profile collection', function () {
    it('should return all participations with tubes computed from knowledge element snapshots', async function () {
      // given
      const frameworkId = learningContent.buildFramework().id;
      const areaId = learningContent.buildArea({ frameworkId }).id;
      const competence = learningContent.buildCompetence({ areaId });
      const tube = learningContent.buildTube({ competenceId: competence.id });
      const skill = learningContent.buildSkill({
        tubeId: tube.id,
        status: 'actif',
        level: 1,
        competenceId: competence.id,
      });

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

      const firstParticipationKe = buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skill.id,
        userId: participation1.userId,
      });
      buildKnowledgeElementSnapshot({
        campaignParticipationId: participation1.id,
        snapshot: new KnowledgeElementCollection([firstParticipationKe]).toSnapshot(),
      });

      const organizationLearner2 = buildOrganizationLearner({
        organizationId: organizationLearner1.organizationId,
      });
      const participation2 = buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.SHARED,
        organizationLearnerId: organizationLearner2.id,
        masteryRate: 0.3,
        pixScore: 21,
        validatedSkillsCount: 10,
      });

      const secondParticipationKe = buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
        skillId: skill.id,
        userId: participation2.userId,
      });
      buildKnowledgeElementSnapshot({
        campaignParticipationId: participation2.id,
        snapshot: new KnowledgeElementCollection([secondParticipationKe]).toSnapshot(),
      });

      const organizationLearner3 = buildOrganizationLearner({
        organizationId: organizationLearner1.organizationId,
      });
      const participation3 = buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.STARTED,
        organizationLearnerId: organizationLearner3.id,
        pixScore: null,
        validatedSkillsCount: null,
      });

      await databaseBuilder.commit();

      // when
      const { models, meta } = await usecases.getCampaignParticipations({
        campaignId: campaign.id,
        locale: FRENCH_SPOKEN,
      });

      //then
      expect(models).to.have.lengthOf(3);
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
          tubes: [
            {
              id: tube.id,
              competenceId: competence.id,
              competenceName: competence.name_i18n[FRENCH_SPOKEN],
              title: tube.practicalTitle_i18n[FRENCH_SPOKEN],
              description: tube.practicalDescription_i18n[FRENCH_SPOKEN],
              maxLevel: 1,
              reachedLevel: 1,
            },
          ],
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
          tubes: [
            {
              id: tube.id,
              competenceId: competence.id,
              competenceName: competence.name_i18n[FRENCH_SPOKEN],
              title: tube.practicalTitle_i18n[FRENCH_SPOKEN],
              description: tube.practicalDescription_i18n[FRENCH_SPOKEN],
              maxLevel: 1,
              reachedLevel: 0,
            },
          ],
        },
        {
          campaignParticipationId: participation3.id,
          userId: participation3.userId,
          participantExternalId: participation3.participantExternalId,
          status: participation3.status,
          createdAt: participation3.createdAt,
          sharedAt: participation3.sharedAt,
          pixScore: participation3.pixScore,
          participantFirstName: organizationLearner3.firstName,
          participantLastName: organizationLearner3.lastName,
          tubes: [],
        },
      ]);
      expect(meta).to.deep.equal({
        page: 1,
        pageCount: 1,
        pageSize: 10,
        rowCount: 3,
      });
    });

    it('should not include tubes from other participations', async function () {
      // given
      const frameworkId = learningContent.buildFramework({ id: 'recFrameworkIso' }).id;
      const areaId = learningContent.buildArea({ id: 'recAreaIso', frameworkId }).id;
      const competence1 = learningContent.buildCompetence({ id: 'recCompetenceIso1', areaId });
      const tube1 = learningContent.buildTube({ id: 'recTubeIso1', competenceId: competence1.id });
      const skill1 = learningContent.buildSkill({
        id: 'recSkillIso1',
        tubeId: tube1.id,
        status: 'actif',
        level: 1,
        competenceId: competence1.id,
      });

      const competence2 = learningContent.buildCompetence({ id: 'recCompetenceIso2', areaId });
      const tube2 = learningContent.buildTube({ id: 'recTubeIso2', competenceId: competence2.id });
      const skill2 = learningContent.buildSkill({
        id: 'recSkillIso2',
        tubeId: tube2.id,
        status: 'actif',
        level: 2,
        competenceId: competence2.id,
      });

      const campaign = buildCampaign({ type: CampaignTypes.PROFILES_COLLECTION });

      const organizationLearner1 = buildOrganizationLearner();
      const participation1 = buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.SHARED,
        organizationLearnerId: organizationLearner1.id,
      });
      buildKnowledgeElementSnapshot({
        campaignParticipationId: participation1.id,
        snapshot: new KnowledgeElementCollection([
          buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            skillId: skill1.id,
            userId: participation1.userId,
          }),
        ]).toSnapshot(),
      });

      const organizationLearner2 = buildOrganizationLearner({ organizationId: organizationLearner1.organizationId });
      const participation2 = buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.SHARED,
        organizationLearnerId: organizationLearner2.id,
      });
      buildKnowledgeElementSnapshot({
        campaignParticipationId: participation2.id,
        snapshot: new KnowledgeElementCollection([
          buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
            skillId: skill2.id,
            userId: participation2.userId,
          }),
        ]).toSnapshot(),
      });

      await databaseBuilder.commit();

      // when
      const { models } = await usecases.getCampaignParticipations({
        campaignId: campaign.id,
        locale: FRENCH_SPOKEN,
      });

      // then
      const result1 = models.find((m) => m.campaignParticipationId === participation1.id);
      const result2 = models.find((m) => m.campaignParticipationId === participation2.id);

      expect(result1.tubes.map((t) => t.id)).to.deep.equal([tube1.id]);
      expect(result2.tubes.map((t) => t.id)).to.deep.equal([tube2.id]);
    });
  });
});
