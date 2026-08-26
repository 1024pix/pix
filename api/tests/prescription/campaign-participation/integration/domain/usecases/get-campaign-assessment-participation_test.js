import { CampaignAssessmentParticipation } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignAssessmentParticipation.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | get-campaign-assessment-participation', function () {
  let campaignId, targetProfileId, organizationId, organizationLearner;

  let skillId, skillId2, skillId3;

  beforeEach(async function () {
    skillId = 'recArea1_Competence1_Tube1_Skill1';
    skillId2 = 'skillId2';
    skillId3 = 'skillId3';
    const learningContent = {
      areas: [{ id: 'recArea1', competenceIds: ['recArea1_Competence1'] }],
      competences: [
        {
          id: 'recArea1_Competence1',
          areaId: 'recArea1',
          skillIds: [skillId],
          origin: 'Pix',
        },
      ],
      thematics: [],
      tubes: [
        {
          id: 'recArea1_Competence1_Tube1',
          competenceId: 'recArea1_Competence1',
        },
      ],
      skills: [
        {
          id: skillId,
          name: '@recArea1_Competence1_Tube1_Skill1',
          level: 1,
          status: 'actif',
          tubeId: 'recArea1_Competence1_Tube1',
          competenceId: 'recArea1_Competence1',
        },
        {
          id: skillId2,
          name: '@skillId2',
          level: 2,
          status: 'actif',
          tubeId: 'recArea1_Competence1_Tube1',
          competenceId: 'recArea1_Competence1',
        },
        {
          id: skillId3,
          name: '@skillId3',
          level: 3,
          status: 'actif',
          tubeId: 'recArea1_Competence1_Tube1',
          competenceId: 'recArea1_Competence1',
        },
      ],
      challenges: [
        {
          id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
          skillId: skillId,
          competenceId: 'recArea1_Competence1',
          status: 'validé',
          locales: ['fr-fr'],
        },
      ],
    };

    databaseBuilder.factory.learningContent.build(learningContent);

    organizationId = databaseBuilder.factory.buildOrganization().id;
    organizationLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
      organizationId,
    });
    targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

    campaignId = databaseBuilder.factory.buildCampaign({
      type: CampaignTypes.ASSESSMENT,
      targetProfileId,
      organizationId,
    }).id;

    databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId });
    databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skillId2 });
    databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skillId3 });

    await databaseBuilder.commit();
  });

  context('badges', function () {
    let badgeId;

    beforeEach(async function () {
      // given
      badgeId = databaseBuilder.factory.buildBadge({ key: 'badge1', targetProfileId }).id;

      await databaseBuilder.commit();
    });

    it('should not set badges when participation is not shared', async function () {
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId: organizationLearner.userId,
        status: CampaignParticipationStatuses.STARTED,
        organizationLearnerId: organizationLearner.id,
        masteryRate: 0,
        validatedSkillsCount: 0,
      }).id;

      databaseBuilder.factory.buildAssessment({
        campaignParticipationId,
        userId: organizationLearner.userId,
        type: Assessment.types.CAMPAIGN,
        state: Assessment.states.STARTED,
      });

      await databaseBuilder.commit();

      // when
      const result = await usecases.getCampaignAssessmentParticipation({
        campaignId,
        campaignParticipationId,
      });

      // then
      expect(result.badges).lengthOf(0);
    });

    it('should set badges when participation obtained some', async function () {
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId: organizationLearner.userId,
        status: CampaignParticipationStatuses.SHARED,
        sharedAt: new Date(),
        organizationLearnerId: organizationLearner.id,
        masteryRate: 0,
        validatedSkillsCount: 0,
      }).id;
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId,
        userId: organizationLearner.userId,
        type: Assessment.types.CAMPAIGN,
        state: Assessment.states.COMPLETED,
      });

      databaseBuilder.factory.buildBadgeAcquisition({
        userId: organizationLearner.userId,
        badgeId,
        campaignParticipationId,
        createdAt: new Date('2020-01-01'),
      });

      await databaseBuilder.commit();

      // when
      const result = await usecases.getCampaignAssessmentParticipation({
        campaignId,
        campaignParticipationId,
      });

      // then
      expect(result.badges).to.lengthOf(1);
    });
  });

  context('stages', function () {
    it('should set stages when participation', async function () {
      // given
      const reachedStageId = databaseBuilder.factory.buildStage({
        targetProfileId,
        level: 1,
        prescriberTitle: 'palier 0',
        prescriberDescription: 'message 0',
        threshold: null,
      }).id;
      databaseBuilder.factory.buildStage({
        targetProfileId,
        isFirstSkill: true,
        level: null,
        prescriberTitle: 'premier acquis',
        prescriberDescription: 'premier acquis',
        threshold: null,
      });

      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId: organizationLearner.userId,
        status: CampaignParticipationStatuses.SHARED,
        sharedAt: new Date(),
        organizationLearnerId: organizationLearner.id,
        masteryRate: 0,
        validatedSkillsCount: 0,
      }).id;

      databaseBuilder.factory.buildAssessment({
        campaignParticipationId,
        userId: organizationLearner.userId,
        type: Assessment.types.CAMPAIGN,
        state: Assessment.states.COMPLETED,
      });

      databaseBuilder.factory.buildStageAcquisition({ stageId: reachedStageId, campaignParticipationId });

      await databaseBuilder.commit();

      // when
      const result = await usecases.getCampaignAssessmentParticipation({
        campaignId,
        campaignParticipationId,
      });

      // then
      expect(result.totalStage).to.be.equal(2);
      expect(result.reachedStage).to.be.equal(1);
      expect(result.prescriberTitle).to.be.equal('palier 0');
      expect(result.prescriberDescription).to.be.equal('message 0');
    });

    it('should not set stages when target profile does not have stages', async function () {
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId: organizationLearner.userId,
        status: CampaignParticipationStatuses.SHARED,
        sharedAt: new Date(),
        organizationLearnerId: organizationLearner.id,
        masteryRate: 0,
        validatedSkillsCount: 0,
      }).id;

      databaseBuilder.factory.buildAssessment({
        campaignParticipationId,
        userId: organizationLearner.userId,
        type: Assessment.types.CAMPAIGN,
        state: Assessment.states.STARTED,
      });

      await databaseBuilder.commit();

      // when
      const result = await usecases.getCampaignAssessmentParticipation({
        campaignId,
        campaignParticipationId,
      });

      // then
      expect(result.totalStage).to.be.null;
      expect(result.reachedStage).to.be.null;
      expect(result.prescriberTitle).to.be.null;
      expect(result.prescriberDescription).to.be.null;
    });
  });

  context('progression', function () {
    describe('When Campaign is Assessment', function () {
      it('should get the campaignAssessmentParticipation', async function () {
        // when
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId: organizationLearner.userId,
          status: CampaignParticipationStatuses.STARTED,
          organizationLearnerId: organizationLearner.id,
          masteryRate: 0,
          validatedSkillsCount: 0,
        }).id;

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId,
          userId: organizationLearner.userId,
          type: Assessment.types.CAMPAIGN,
          state: Assessment.states.STARTED,
        });

        await databaseBuilder.commit();

        const result = await usecases.getCampaignAssessmentParticipation({
          campaignId,
          campaignParticipationId,
        });

        // then
        expect(result).to.instanceOf(CampaignAssessmentParticipation);
      });

      describe('when campaign participation is shared', function () {
        it('should return 100% progression', async function () {
          // given
          const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId: organizationLearner.userId,
            status: CampaignParticipationStatuses.SHARED,
            organizationLearnerId: organizationLearner.id,
          });

          databaseBuilder.factory.buildAssessment({
            campaignParticipationId,
            userId: organizationLearner.userId,
            type: Assessment.types.CAMPAIGN,
            state: Assessment.states.STARTED,
          });

          await databaseBuilder.commit();

          // when
          const result = await usecases.getCampaignAssessmentParticipation({
            campaignId,
            campaignParticipationId,
          });

          // then
          expect(result.progression).to.equal(1);
        });
      });

      describe('When campaign participation is started', function () {
        it('should return 100% progression for a started campaign participation with 3 ke answered out of 3', async function () {
          // given
          const createdAt = new Date('2024-01-01');
          const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId: organizationLearner.userId,
            status: CampaignParticipationStatuses.STARTED,
            organizationLearnerId: organizationLearner.id,
            createdAt,
          });

          databaseBuilder.factory.buildAssessment({
            campaignParticipationId,
            userId: organizationLearner.userId,
            type: Assessment.types.CAMPAIGN,
            state: Assessment.states.STARTED,
            createdAt,
          });

          // Le premier acquis est réussi, les deux suivants ratés : le plancher
          // est à 1, le plafond à 2, et les trois acquis sont donc évalués.
          databaseBuilder.factory.buildKnowledgeState({
            userId: organizationLearner.userId,
            tubeId: 'recArea1_Competence1_Tube1',
            floor: 1,
            ceiling: 2,
            directLevels: [1, 2],
            updatedAt: new Date('2024-01-02'),
          });

          await databaseBuilder.commit();

          // when
          const result = await usecases.getCampaignAssessmentParticipation({
            campaignId,
            campaignParticipationId,
          });

          // then
          expect(result.progression).to.equal(1);
        });

        it('should return 33% progression for a started campaign participation with 1 ke answered out of 3', async function () {
          // given
          const createdAt = new Date('2024-01-01');
          const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId: organizationLearner.userId,
            status: CampaignParticipationStatuses.STARTED,
            organizationLearnerId: organizationLearner.id,
            createdAt,
          });

          databaseBuilder.factory.buildAssessment({
            campaignParticipationId,
            userId: organizationLearner.userId,
            type: Assessment.types.CAMPAIGN,
            state: Assessment.states.STARTED,
            createdAt,
          });

          // Un seul acquis évalué sur les trois : le plus haut est raté, le
          // plafond est donc à 3. Un plafond plus bas invaliderait aussi les
          // acquis au-dessus — rater un niveau vaut échec des suivants.
          databaseBuilder.factory.buildKnowledgeState({
            userId: organizationLearner.userId,
            tubeId: 'recArea1_Competence1_Tube1',
            ceiling: 3,
            directLevels: [3],
            updatedAt: new Date('2024-01-02'),
          });

          await databaseBuilder.commit();

          // when
          const result = await usecases.getCampaignAssessmentParticipation({
            campaignId,
            campaignParticipationId,
          });

          // then
          expect(result.progression).to.equal(1 / 3);
        });
      });
    });

    describe('When Campaign is EXAM', function () {
      beforeEach(async function () {
        campaignId = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.EXAM,
          targetProfileId,
          organizationId,
        }).id;

        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skillId2 });
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skillId3 });

        await databaseBuilder.commit();
      });

      it('should get the campaignAssessmentParticipation', async function () {
        // when
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId: organizationLearner.userId,
          status: CampaignParticipationStatuses.STARTED,
          organizationLearnerId: organizationLearner.id,
          masteryRate: 0,
          validatedSkillsCount: 0,
        }).id;

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId,
          userId: organizationLearner.userId,
          type: Assessment.types.CAMPAIGN,
          state: Assessment.states.STARTED,
        });

        await databaseBuilder.commit();

        const result = await usecases.getCampaignAssessmentParticipation({
          campaignId,
          campaignParticipationId,
        });

        // then
        expect(result).to.instanceOf(CampaignAssessmentParticipation);
      });

      describe('when campaign participation is shared', function () {
        it('should return 100% progression', async function () {
          // given
          const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId: organizationLearner.userId,
            status: CampaignParticipationStatuses.SHARED,
            organizationLearnerId: organizationLearner.id,
          });

          databaseBuilder.factory.buildAssessment({
            campaignParticipationId,
            userId: organizationLearner.userId,
            type: Assessment.types.CAMPAIGN,
            state: Assessment.states.STARTED,
          });

          await databaseBuilder.commit();

          // when
          const result = await usecases.getCampaignAssessmentParticipation({
            campaignId,
            campaignParticipationId,
          });

          // then
          expect(result.progression).to.equal(1);
        });
      });

      describe('When campaign participation is started', function () {
        it('should return 0 progression for a started campaign participation with no current answer', async function () {
          // given
          const createdAt = new Date('2024-01-01');
          const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId: organizationLearner.userId,
            status: CampaignParticipationStatuses.STARTED,
            organizationLearnerId: organizationLearner.id,
            createdAt,
          });

          databaseBuilder.factory.buildAssessment({
            campaignParticipationId,
            userId: organizationLearner.userId,
            type: Assessment.types.CAMPAIGN,
            state: Assessment.states.STARTED,
            createdAt,
          });

          // Seul le premier acquis est réussi : le plancher est à 1.
          databaseBuilder.factory.buildKnowledgeState({
            userId: organizationLearner.userId,
            tubeId: 'recArea1_Competence1_Tube1',
            floor: 1,
            directLevels: [1],
            updatedAt: new Date('2023-01-01'),
          });

          await databaseBuilder.commit();

          // when
          const result = await usecases.getCampaignAssessmentParticipation({
            campaignId,
            campaignParticipationId,
          });

          // then
          expect(result.progression).to.equal(0);
        });

        it('should return full progression when the failed level settles the whole tube on snapshot', async function () {
          // given
          const createdAt = new Date('2024-01-01');
          const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId: organizationLearner.userId,
            status: CampaignParticipationStatuses.STARTED,
            organizationLearnerId: organizationLearner.id,
            createdAt,
          });

          databaseBuilder.factory.buildAssessment({
            campaignParticipationId,
            userId: organizationLearner.userId,
            type: Assessment.types.CAMPAIGN,
            state: Assessment.states.STARTED,
            createdAt,
          });

          const ke = databaseBuilder.factory.buildKnowledgeElement({
            skillId,
            userId: organizationLearner.userId,
            status: 'invalidated',
            createdAt: new Date('2024-01-01'),
          });

          databaseBuilder.factory.buildKnowledgeElementSnapshot({
            campaignParticipationId,
            snapshot: JSON.stringify([ke]),
          });

          await databaseBuilder.commit();

          // when
          const result = await usecases.getCampaignAssessmentParticipation({
            campaignId,
            campaignParticipationId,
          });

          // then — rater le niveau 1 invalide les niveaux 2 et 3 du tube :
          // les trois acquis sont évalués, la progression est complète.
          expect(result.progression).to.equal(1);
        });
      });
    });
  });
});
