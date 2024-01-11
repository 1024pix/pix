import { catchErr, expect, databaseBuilder, mockLearningContent, domainBuilder } from '../../../test-helper.js';
import * as participantResultRepository from '../../../../lib/infrastructure/repositories/participant-result-repository.js';
import { KnowledgeElement, CampaignParticipationStatuses, Assessment } from '../../../../lib/domain/models/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

const { STARTED } = CampaignParticipationStatuses;

describe('Integration | Repository | ParticipantResultRepository', function () {
  describe('#getByUserIdAndCampaignId', function () {
    let targetProfile;

    beforeEach(function () {
      domainBuilder.buildAssessment();
      targetProfile = domainBuilder.buildTargetProfile({ ownerOrganizationId: null });
      databaseBuilder.factory.buildTargetProfile(targetProfile);

      const learningContent = {
        areas: [
          {
            id: 'recArea1',
            name: 'area1',
            title_i18n: { fr: 'domaine1' },
            competenceIds: ['rec1'],
            color: 'colorArea1',
          },
          {
            id: 'recArea2',
            name: 'area2',
            title_i18n: { fr: 'domaine2' },
            competenceIds: ['rec2'],
            color: 'colorArea2',
          },
        ],
        competences: [
          {
            id: 'rec1',
            name_i18n: {
              fr: 'comp1Fr',
              en: 'comp1En',
            },
            index: '1.1',
            areaId: 'recArea1',
            color: 'rec1Color',
            skillIds: ['skill1', 'skill2'],
          },
          {
            id: 'rec2',
            name_i18n: {
              fr: 'comp2Fr',
              en: 'comp2En',
            },
            index: '2.1',
            areaId: 'recArea2',
            color: 'rec2Color',
            skillIds: ['skill3', 'skill4', 'skill5'],
          },
        ],
        tubes: [
          { id: 'recTube1', competenceId: 'rec1' },
          { id: 'recTube2', competenceId: 'rec2' },
        ],
        skills: [
          { id: 'skill1', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1', pixValue: 2, level: 1 },
          { id: 'skill2', status: 'archivé', tubeId: 'recTube1', competenceId: 'rec1', level: 4 },
          { id: 'skill3', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', pixValue: 20, level: 5 },
          { id: 'skill4', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', pixValue: 200, level: 3 },
          { id: 'skill5', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2', level: 6 },
          { id: 'skill6', status: 'périmé', tubeId: 'recTube2', competenceId: 'rec2', level: 7 },
        ],
        challenges: [
          { id: 'challenge1', skillId: 'skill1', status: 'validé', locales: ['FR'], alpha: 1, delta: 0 },
          { id: 'challenge2', skillId: 'skill3', status: 'validé', locales: ['FR'], alpha: 1, delta: 4 },
          { id: 'challenge3', skillId: 'skill4', status: 'validé', locales: ['FR'], alpha: 2.57, delta: 1.4 },
        ],
      };

      mockLearningContent(learningContent);
      return databaseBuilder.commit();
    });

    it('use the most recent assessment to define if the participation is completed', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      _buildCampaignSkills(campaignId);
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        sharedAt: new Date('2020-01-02'),
      });

      databaseBuilder.factory.buildAssessment({
        campaignParticipationId,
        userId,
        state: 'started',
        createdAt: new Date('2021-01-01'),
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId,
        userId,
        state: 'completed',
        createdAt: new Date('2021-01-02'),
      });
      await databaseBuilder.commit();

      const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
        userId,
        campaignId,
        targetProfile,
        badges: [],
        locale: 'FR',
      });

      expect(participantResult).to.deep.include({
        isCompleted: true,
      });
    });

    context('computes canRetry', function () {
      it('returns true when there is no organization-learner and all other conditions are filled', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          tagetProfileId: targetProfile.id,
          multipleSendings: true,
        });
        _buildCampaignSkills(campaignId);
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          sharedAt: new Date('2020-01-02'),
          masteryRate: 0.4,
        });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          targetProfile,
          badges: [],
          locale: 'FR',
        });

        expect(participantResult.canRetry).to.equal(true);
      });

      it('returns true when there is a organization-learner active and all other conditions are filled', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId: targetProfile.id,
          multipleSendings: true,
        });
        _buildCampaignSkills(campaignId);
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          masteryRate: 0.4,
          sharedAt: new Date('2020-01-02'),
        });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          targetProfile,
          badges: [],
          locale: 'FR',
        });

        expect(participantResult.canRetry).to.equal(true);
      });

      it('returns false when multipleSendings is false', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          tagetProfileId: targetProfile.id,
          multipleSendings: false,
        });
        _buildCampaignSkills(campaignId);
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
        });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          targetProfile,
          badges: [],
          locale: 'FR',
        });

        expect(participantResult.canRetry).to.equal(false);
      });

      it('returns false when organization-learner is disabled', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId: targetProfile.id,
          multipleSendings: true,
        });
        _buildCampaignSkills(campaignId);
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
        });
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId, isDisabled: true });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          targetProfile,
          badges: [],
          locale: 'FR',
        });

        expect(participantResult.canRetry).to.equal(false);
      });

      it('takes into account only organization learner for the given userId', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId: targetProfile.id,
          multipleSendings: true,
        }).id;
        _buildCampaignSkills(campaignId);
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId, isDisabled: true });
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          masteryRate: 0.1,
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });

        const otherUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildOrganizationLearner({ userId: otherUserId, organizationId, isDisabled: false });
        const otherCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          userId: otherUserId,
          campaignId,
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId: otherCampaignParticipationId, userId });
        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId: otherUserId,
          campaignId,
          targetProfile,
          badges: [],
          locale: 'FR',
        });

        expect(participantResult.canRetry).to.equal(true);
      });

      it('takes into account only organization learner for the given campaignId', async function () {
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId, isDisabled: true });
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId: targetProfile.id,
          multipleSendings: true,
        }).id;
        _buildCampaignSkills(campaignId);
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          masteryRate: 0.1,
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });

        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({
          userId,
          organizationId: otherOrganizationId,
          isDisabled: false,
        });
        const otherCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId: otherOrganizationId,
          targetProfileId: targetProfile.id,
          multipleSendings: true,
        }).id;
        const otherCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: otherCampaignId,
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId: otherCampaignParticipationId, userId });
        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          campaignId: otherCampaignId,
          targetProfile,
          badges: [],
          userId,
          locale: 'FR',
        });

        expect(participantResult.canRetry).to.equal(true);
      });
    });

    context('computes isDisabled', function () {
      it('returns true when campaign is archived', async function () {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          archivedAt: new Date(),
        });
        _buildCampaignSkills(campaignId);
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          deletedAt: null,
        });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        await databaseBuilder.commit();

        // when
        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          targetProfile,
          badges: [],
          locale: 'FR',
        });

        // then
        expect(participantResult).to.contain({ isDisabled: true });
      });

      it('returns true when participation is deleted', async function () {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ archivedAt: null });
        _buildCampaignSkills(campaignId);
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          deletedAt: new Date(),
        });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        await databaseBuilder.commit();

        // when
        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          targetProfile,
          badges: [],
          locale: 'FR',
        });

        // then
        expect(participantResult).to.contain({ isDisabled: true });
      });

      it('returns false when campaign is not archived and participation is not deleted', async function () {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ archivedAt: null });
        _buildCampaignSkills(campaignId);
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          deletedAt: null,
        });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        await databaseBuilder.commit();

        // when
        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          targetProfile,
          badges: [],
          locale: 'FR',
        });

        // then
        expect(participantResult).to.contain({ isDisabled: false });
      });
    });

    it('compute the number of skills, the number of skill tested and the number of skill validated', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      _buildCampaignSkills(campaignId);
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        sharedAt: new Date('2020-01-02'),
      });

      databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });
      const knowledgeElementsAttributes = [
        {
          userId,
          skillId: 'skill1',
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        },
        {
          userId,
          skillId: 'skill2',
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.INVALIDATED,
        },
        {
          userId,
          skillId: 'skill5',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        },
      ];
      knowledgeElementsAttributes.forEach((attributes) => databaseBuilder.factory.buildKnowledgeElement(attributes));

      await databaseBuilder.commit();
      const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
        userId,
        campaignId,
        targetProfile,
        badges: [],
        locale: 'FR',
      });

      expect(participantResult).to.deep.include({
        id: campaignParticipationId,
        testedSkillsCount: 2,
        totalSkillsCount: 4,
        validatedSkillsCount: 1,
      });
    });

    it('compute the number of skills, the number of skill tested and the number of skill validated using operative skills', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      _buildCampaignSkills(campaignId);
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        sharedAt: new Date('2020-01-02'),
      });

      databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });
      const knowledgeElementsAttributes = [
        {
          userId,
          skillId: 'skill1',
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        },
        {
          userId,
          skillId: 'skill6',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        },
      ];
      knowledgeElementsAttributes.forEach((attributes) => databaseBuilder.factory.buildKnowledgeElement(attributes));

      await databaseBuilder.commit();
      const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
        userId,
        campaignId,
        targetProfile,
        badges: [],
        locale: 'FR',
      });

      expect(participantResult).to.deep.include({
        testedSkillsCount: 1,
        totalSkillsCount: 4,
        validatedSkillsCount: 1,
      });
    });

    context('computes competences result', function () {
      let userId;
      let campaignId;

      beforeEach(async function () {
        const user = databaseBuilder.factory.buildUser();
        userId = user.id;

        const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        campaignId = campaign.id;
        _buildCampaignSkills(campaignId);

        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          sharedAt: new Date('2020-01-02'),
        });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });

        const knowledgeElementsAttributes = [
          {
            userId,
            skillId: 'skill1',
            competenceId: 'rec1',
            createdAt: new Date('2020-01-01'),
            status: KnowledgeElement.StatusType.VALIDATED,
          },
          {
            userId,
            skillId: 'skill2',
            competenceId: 'rec1',
            createdAt: new Date('2020-01-01'),
            status: KnowledgeElement.StatusType.VALIDATED,
          },
          {
            userId,
            skillId: 'skill3',
            competenceId: 'rec2',
            createdAt: new Date('2020-01-01'),
            status: KnowledgeElement.StatusType.INVALIDATED,
          },
          {
            userId,
            skillId: 'skill4',
            competenceId: 'rec2',
            createdAt: new Date('2020-01-01'),
            status: KnowledgeElement.StatusType.VALIDATED,
          },
        ];

        knowledgeElementsAttributes.forEach((attributes) => databaseBuilder.factory.buildKnowledgeElement(attributes));

        await databaseBuilder.commit();
      });

      context('target profile without any stages', function () {
        it('computes the results for each competence assessed', async function () {
          // when
          const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
            userId,
            campaignId,
            targetProfile,
            badges: [],
            locale: 'FR',
          });
          const competenceResult1 = participantResult.competenceResults.find(({ id }) => id === 'rec1');
          const competenceResult2 = participantResult.competenceResults.find(({ id }) => id === 'rec2');

          // then
          expect(competenceResult1).to.deep.equal({
            id: 'rec1',
            name: 'comp1Fr',
            index: '1.1',
            areaName: 'area1',
            areaTitle: 'domaine1',
            areaColor: 'colorArea1',
            testedSkillsCount: 2,
            totalSkillsCount: 2,
            validatedSkillsCount: 2,
            masteryPercentage: 100,
            reachedStage: undefined,
            flashPixScore: undefined,
          });
          expect(competenceResult2).to.deep.equal({
            id: 'rec2',
            name: 'comp2Fr',
            index: '2.1',
            areaName: 'area2',
            areaTitle: 'domaine2',
            areaColor: 'colorArea2',
            testedSkillsCount: 2,
            totalSkillsCount: 2,
            validatedSkillsCount: 1,
            masteryPercentage: 50,
            reachedStage: undefined,
            flashPixScore: undefined,
          });
        });
      });

      context('target profile with threshold stages', function () {
        it('computes the results for each competence assessed', async function () {
          // given
          const stage0 = databaseBuilder.factory.buildStage({
            threshold: 0,
            targetProfileId: targetProfile.id,
          });
          const stageFirstSkill = databaseBuilder.factory.buildStage.firstSkill();
          const stage2 = databaseBuilder.factory.buildStage({
            threshold: 50,
            targetProfileId: targetProfile.id,
          });
          const stage3 = databaseBuilder.factory.buildStage({
            threshold: 51,
            targetProfileId: targetProfile.id,
          });
          const stage4 = databaseBuilder.factory.buildStage({
            threshold: 76,
            targetProfileId: targetProfile.id,
          });

          await databaseBuilder.commit();

          // when
          const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
            userId,
            campaignId,
            targetProfile,
            badges: [],
            stages: [stage0, stageFirstSkill, stage2, stage3, stage4],
            locale: 'FR',
          });
          const competenceResult1 = participantResult.competenceResults.find(({ id }) => id === 'rec1');
          const competenceResult2 = participantResult.competenceResults.find(({ id }) => id === 'rec2');

          // then
          expect(competenceResult1).to.deep.equal({
            id: 'rec1',
            name: 'comp1Fr',
            index: '1.1',
            areaName: 'area1',
            areaTitle: 'domaine1',
            areaColor: 'colorArea1',
            testedSkillsCount: 2,
            totalSkillsCount: 2,
            validatedSkillsCount: 2,
            masteryPercentage: 100,
            reachedStage: 5,
            flashPixScore: undefined,
          });
          expect(competenceResult2).to.deep.equal({
            id: 'rec2',
            name: 'comp2Fr',
            index: '2.1',
            areaName: 'area2',
            areaTitle: 'domaine2',
            areaColor: 'colorArea2',
            testedSkillsCount: 2,
            totalSkillsCount: 2,
            validatedSkillsCount: 1,
            masteryPercentage: 50,
            reachedStage: 3,
            flashPixScore: undefined,
          });
        });
      });

      context('target profile with level stages', function () {
        it('computes the results for each competence assessed', async function () {
          // given
          const stage0 = databaseBuilder.factory.buildStage({
            level: 0,
            threshold: null,
            targetProfileId: targetProfile.id,
          });
          const stageFirstSkill = databaseBuilder.factory.buildStage.firstSkill();
          const stage2 = databaseBuilder.factory.buildStage({
            level: 1,
            threshold: null,
            targetProfileId: targetProfile.id,
          });
          const stage3 = databaseBuilder.factory.buildStage({
            level: 3,
            threshold: null,
            targetProfileId: targetProfile.id,
          });
          const stage4 = databaseBuilder.factory.buildStage({
            level: 7,
            threshold: null,
            targetProfileId: targetProfile.id,
          });

          await databaseBuilder.commit();

          const savedStages = [stage0, stageFirstSkill, stage2, stage3, stage4];
          const stagesFromDomain = savedStages.map(domainBuilder.buildStage);

          // when
          const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
            userId,
            campaignId,
            targetProfile,
            reachedStage: {
              id: stage3.id,
              totalStage: 4,
              reachedStageNumber: 3,
              reachedStage: stage3,
            },
            badges: [],
            stages: stagesFromDomain,
            locale: 'FR',
          });
          const competenceResult1 = participantResult.competenceResults.find(({ id }) => id === 'rec1');
          const competenceResult2 = participantResult.competenceResults.find(({ id }) => id === 'rec2');

          // then
          expect(participantResult.reachedStage.threshold).to.equal(50);
          expect(competenceResult1).to.deep.equal({
            id: 'rec1',
            name: 'comp1Fr',
            index: '1.1',
            areaName: 'area1',
            areaTitle: 'domaine1',
            areaColor: 'colorArea1',
            testedSkillsCount: 2,
            totalSkillsCount: 2,
            validatedSkillsCount: 2,
            masteryPercentage: 100,
            reachedStage: 5,
            flashPixScore: undefined,
          });
          expect(competenceResult2).to.deep.equal({
            id: 'rec2',
            name: 'comp2Fr',
            index: '2.1',
            areaName: 'area2',
            areaTitle: 'domaine2',
            areaColor: 'colorArea2',
            testedSkillsCount: 2,
            totalSkillsCount: 2,
            validatedSkillsCount: 1,
            masteryPercentage: 50,
            reachedStage: 4,
            flashPixScore: undefined,
          });
        });
      });
    });

    context('when the participation has badges', function () {
      it('computes the results for each badge', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        _buildCampaignSkills(campaignId);
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          sharedAt: new Date('2020-01-02'),
        });

        const badges = [
          domainBuilder.buildBadge({
            id: 1,
            message: 'Badge1 Message',
            altMessage: 'Badge1 AltMessage',
            title: 'Badge1 Title',
            imageUrl: 'Badge1 ImgUrl',
            key: 'Badge1 Key',
            targetProfileId: targetProfile.id,
          }),
          domainBuilder.buildBadge({
            id: 2,
            altMessage: 'Badge2 AltMessage',
            message: 'Badge2 Message',
            title: 'Badge2 Title',
            imageUrl: 'Badge2 ImgUrl',
            key: 'Badge2 Key',
            targetProfileId: targetProfile.id,
            isAlwaysVisible: true,
          }),
          domainBuilder.buildBadge({ id: 3, targetProfileId: null }),
        ];
        badges.forEach(databaseBuilder.factory.buildBadge);

        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: 1, userId, campaignParticipationId });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });

        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          targetProfile,
          badges,
          locale: 'FR',
        });
        const badgeResult1 = participantResult.badgeResults.find(({ id }) => id === 1);
        const badgeResult2 = participantResult.badgeResults.find(({ id }) => id === 2);
        expect(badgeResult1).to.deep.include({
          id: 1,
          altMessage: 'Badge1 AltMessage',
          message: 'Badge1 Message',
          title: 'Badge1 Title',
          imageUrl: 'Badge1 ImgUrl',
          key: 'Badge1 Key',
          isAcquired: true,
          isAlwaysVisible: false,
        });
        expect(badgeResult2).to.deep.include({
          id: 2,
          altMessage: 'Badge2 AltMessage',
          message: 'Badge2 Message',
          title: 'Badge2 Title',
          imageUrl: 'Badge2 ImgUrl',
          key: 'Badge2 Key',
          isAcquired: false,
          isAlwaysVisible: true,
        });
      });

      it('computes the results for each badge earned during the current campaign participation', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        _buildCampaignSkills(campaignId);
        const { id: otherCampaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          sharedAt: new Date('2020-01-02'),
        });
        const { id: otherCampaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: otherCampaignId,
          sharedAt: new Date('2020-01-02'),
        });

        const badges = [
          domainBuilder.buildBadge({
            id: 1,
            message: 'Badge1 Message',
            altMessage: 'Badge1 AltMessage',
            title: 'Badge1 Title',
            imageUrl: 'Badge1 ImgUrl',
            key: 'Badge1 Key',
            targetProfileId: targetProfile.id,
          }),
          domainBuilder.buildBadge({
            id: 2,
            altMessage: 'Badge2 AltMessage',
            message: 'Badge2 Message',
            title: 'Badge2 Title',
            imageUrl: 'Badge2 ImgUrl',
            key: 'Badge2 Key',
            targetProfileId: targetProfile.id,
          }),
          domainBuilder.buildBadge({ id: 3, targetProfileId: null }),
        ];
        badges.forEach(databaseBuilder.factory.buildBadge);

        const badgeObtainedInAnotherCampaign = databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: 1,
          userId,
          campaignParticipationId: otherCampaignParticipationId,
        });

        const badgeObtainedInThisCampaign = databaseBuilder.factory.buildBadgeAcquisition({
          badgeId: 2,
          userId,
          campaignParticipationId,
        });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });
        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          targetProfile,
          badges,
          locale: 'FR',
        });
        const badgeResult1 = participantResult.badgeResults.find(
          ({ id }) => id === badgeObtainedInAnotherCampaign.badgeId,
        );
        const badgeResult2 = participantResult.badgeResults.find(
          ({ id }) => id === badgeObtainedInThisCampaign.badgeId,
        );
        expect(badgeResult1).to.deep.include({
          id: 1,
          altMessage: 'Badge1 AltMessage',
          message: 'Badge1 Message',
          title: 'Badge1 Title',
          imageUrl: 'Badge1 ImgUrl',
          key: 'Badge1 Key',
          isAcquired: false,
        });
        expect(badgeResult2).to.deep.include({
          id: 2,
          altMessage: 'Badge2 AltMessage',
          message: 'Badge2 Message',
          title: 'Badge2 Title',
          imageUrl: 'Badge2 ImgUrl',
          key: 'Badge2 Key',
          isAcquired: true,
        });
      });
    });

    context('when no participation for given user and campaign', function () {
      it('should throw a not found error', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        _buildCampaignSkills(campaignId);
        await databaseBuilder.commit();

        const error = await catchErr(participantResultRepository.getByUserIdAndCampaignId)({
          userId,
          campaignId,
          targetProfile,
          badges: [],
          locale: 'FR',
        });

        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when the participation is shared', function () {
      it('returns the mastery rate for the participation using the mastery rate stocked', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        _buildCampaignSkills(campaignId);
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          sharedAt: new Date('2020-01-02'),
          masteryRate: 0.6,
        });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });

        await databaseBuilder.commit();
        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          targetProfile,
          badges: [],
          locale: 'FR',
        });
        expect(participantResult.masteryRate).to.equal(0.6);
      });
    });

    context('when the participation is not shared', function () {
      it('returns the mastery rate for the participation using knowledge elements', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        _buildCampaignSkills(campaignId);
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          status: STARTED,
          sharedAt: null,
        });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });

        await databaseBuilder.commit();
        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          targetProfile,
          badges: [],
          locale: 'FR',
        });
        expect(participantResult.masteryRate).to.equal(0);
      });
    });

    context('when there are several participations', function () {
      it('use the participation not improved yet', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          tagetProfileId: targetProfile.id,
          multipleSendings: true,
        });
        _buildCampaignSkills(campaignId);
        const { id: oldCampaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          status: 'SHARED',
          isImproved: true,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: oldCampaignParticipationId,
          userId,
          state: 'completed',
          isImproving: false,
        });

        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          status: 'TO_SHARE',
          isImproved: false,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId,
          userId,
          state: 'completed',
          isImproving: true,
        });

        await databaseBuilder.commit();
        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          targetProfile,
          badges: [],
          locale: 'FR',
        });
        expect(participantResult.id).to.equal(campaignParticipationId);
      });
    });

    context('when campaign is flash', function () {
      it('returns the estimated flash level and calculated pix score (total and by competence)', async function () {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          assessmentMethod: Assessment.methods.FLASH,
        });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
        });
        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
          campaignParticipationId,
          userId,
          method: Assessment.methods.FLASH,
        });
        const answers = [
          databaseBuilder.factory.buildAnswer({
            assessmentId,
            challengeId: 'challenge1',
            result: 'ok',
          }),
        ];
        const { estimatedLevel } = databaseBuilder.factory.buildFlashAssessmentResult({
          assessmentId,
          answerId: answers[0].id,
        });
        await databaseBuilder.commit();

        // when
        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          targetProfile,
          badges: [],
          locale: 'FR',
        });

        // then
        expect(participantResult).to.contain({
          estimatedFlashLevel: estimatedLevel,
          flashPixScore: 202,
        });

        expect(participantResult.competenceResults).to.deep.equal([
          {
            id: 'rec1',
            name: 'comp1Fr',
            index: '1.1',
            areaName: 'area1',
            areaTitle: 'domaine1',
            areaColor: 'colorArea1',
            testedSkillsCount: 0,
            totalSkillsCount: 2,
            validatedSkillsCount: 0,
            masteryPercentage: 0,
            reachedStage: undefined,
            flashPixScore: 2,
          },
          {
            id: 'rec2',
            name: 'comp2Fr',
            index: '2.1',
            areaName: 'area2',
            areaTitle: 'domaine2',
            areaColor: 'colorArea2',
            testedSkillsCount: 0,
            totalSkillsCount: 3,
            validatedSkillsCount: 0,
            masteryPercentage: 0,
            reachedStage: undefined,
            flashPixScore: 200,
          },
        ]);
      });
    });
  });
  describe('#getCampaignParticipationStatus', function () {
    let campaign;
    let user;
    let learner;

    beforeEach(async function () {
      campaign = databaseBuilder.factory.buildCampaign();
      user = databaseBuilder.factory.buildUser();
      learner = databaseBuilder.factory.buildOrganizationLearner({
        userId: user.id,
        organization: campaign.organizationId,
      });
      await databaseBuilder.commit();
    });

    it('should return status of an existing campaign participation', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId: learner.id,
        userId: user.id,
        status: STARTED,
      });

      await databaseBuilder.commit();

      // when
      const status = await participantResultRepository.getCampaignParticipationStatus({
        userId: user.id,
        campaignId: campaign.id,
      });

      // then
      expect(status).to.equals(STARTED);
    });
    it('should throws if there no user as no participation for a givent campaign and user', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation();
      await databaseBuilder.commit();

      // when
      const error = await catchErr(participantResultRepository.getCampaignParticipationStatus)({
        userId: user.id,
        campaignId: campaign.id,
      });

      // then
      expect(error).to.be.an.instanceof(NotFoundError);
    });
  });
});

function _buildCampaignSkills(campaignId) {
  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skill1' });
  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skill2' });
  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skill3' });
  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skill4' });
  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skill6' });
}
