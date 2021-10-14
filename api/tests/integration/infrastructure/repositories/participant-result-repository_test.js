const { catchErr, expect, databaseBuilder, mockLearningContent } = require('../../../test-helper');
const participantResultRepository = require('../../../../lib/infrastructure/repositories/participant-result-repository');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | ParticipantResultRepository', function () {
  describe('#getByUserIdAndCampaignId', function () {
    let targetProfileId;

    beforeEach(function () {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill1' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill2' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill3' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill4' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill6' });

      const learningContent = {
        areas: [
          { id: 'recArea1', name: 'area1', competenceIds: ['rec1'], color: 'colorArea1' },
          { id: 'recArea2', name: 'area2', competenceIds: ['rec2'], color: 'colorArea2' },
        ],
        competences: [
          {
            id: 'rec1',
            nameFrFr: 'comp1Fr',
            nameEnUs: 'comp1En',
            index: '1.1',
            areaId: 'recArea1',
            color: 'rec1Color',
            skillIds: ['skill1', 'skill2'],
          },
          {
            id: 'rec2',
            nameFrFr: 'comp2Fr',
            nameEnUs: 'comp2En',
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
          { id: 'skill1', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1' },
          { id: 'skill2', status: 'archivé', tubeId: 'recTube1', competenceId: 'rec1' },
          { id: 'skill3', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2' },
          { id: 'skill4', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2' },
          { id: 'skill5', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2' },
          { id: 'skill6', status: 'périmé', tubeId: 'recTube2', competenceId: 'rec2' },
        ],
      };

      mockLearningContent(learningContent);
      return databaseBuilder.commit();
    });

    it('use the most recent assessment to define if the participation is completed', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
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
        locale: 'FR',
      });

      expect(participantResult).to.deep.include({
        isCompleted: true,
      });
    });

    context('computes canRetry', function () {
      it('returns true when there is no schooling-registration and all other conditions are filled', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId, multipleSendings: true });
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
          locale: 'FR',
        });

        expect(participantResult.canRetry).to.equal(true);
      });

      it('returns true when there is a schooling-registration active and all other conditions are filled', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId });
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId,
          multipleSendings: true,
        });
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
          locale: 'FR',
        });

        expect(participantResult.canRetry).to.equal(true);
      });

      it('returns false when multipleSendings is false', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId, multipleSendings: false });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
        });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          locale: 'FR',
        });

        expect(participantResult.canRetry).to.equal(false);
      });

      it('returns false when schooling-registration is disabled', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId,
          multipleSendings: true,
        });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
        });
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId, userId, isDisabled: true });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          locale: 'FR',
        });

        expect(participantResult.canRetry).to.equal(false);
      });

      it('takes into account only schooling registration for the given userId', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId,
          multipleSendings: true,
        }).id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId, isDisabled: true });
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          masteryRate: 0.1,
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });

        const otherUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildSchoolingRegistration({ userId: otherUserId, organizationId, isDisabled: false });
        const otherCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          userId: otherUserId,
          campaignId,
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId: otherCampaignParticipationId, userId });
        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId: otherUserId,
          campaignId,
          locale: 'FR',
        });

        expect(participantResult.canRetry).to.equal(true);
      });

      it('takes into account only schooling registration for the given campaignId', async function () {
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId, isDisabled: true });
        const campaignId = databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId,
          multipleSendings: true,
        }).id;
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          masteryRate: 0.1,
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });

        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildSchoolingRegistration({
          userId,
          organizationId: otherOrganizationId,
          isDisabled: false,
        });
        const otherCampaignId = databaseBuilder.factory.buildCampaign({
          organizationId: otherOrganizationId,
          targetProfileId,
          multipleSendings: true,
        }).id;
        const otherCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: otherCampaignId,
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId: otherCampaignParticipationId, userId });
        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId: otherCampaignId,
          locale: 'FR',
        });

        expect(participantResult.canRetry).to.equal(true);
      });
    });

    it('compute the number of skills, the number of skill tested and the number of skill validated', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
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
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
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
        locale: 'FR',
      });

      expect(participantResult).to.deep.include({
        testedSkillsCount: 1,
        totalSkillsCount: 4,
        validatedSkillsCount: 1,
      });
    });

    it('computes the results for each competence assessed', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
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
      const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
        userId,
        campaignId,
        locale: 'FR',
      });
      const competenceResult1 = participantResult.competenceResults.find(({ id }) => id === 'rec1');
      const competenceResult2 = participantResult.competenceResults.find(({ id }) => id === 'rec2');
      expect(competenceResult1).to.deep.equal({
        id: 'rec1',
        name: 'comp1Fr',
        index: '1.1',
        areaName: 'area1',
        areaColor: 'colorArea1',
        testedSkillsCount: 2,
        totalSkillsCount: 2,
        validatedSkillsCount: 2,
        masteryPercentage: 100,
      });
      expect(competenceResult2).to.deep.equal({
        id: 'rec2',
        name: 'comp2Fr',
        index: '2.1',
        areaName: 'area2',
        areaColor: 'colorArea2',
        testedSkillsCount: 2,
        totalSkillsCount: 2,
        validatedSkillsCount: 1,
        masteryPercentage: 50,
      });
    });

    context('when the target profile has some stages', function () {
      it('returns the stage reached', async function () {
        const { id: otherTargetProfileId } = databaseBuilder.factory.buildTargetProfile();
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          masteryRate: 0.65,
          sharedAt: new Date('2020-01-02'),
        });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });
        databaseBuilder.factory.buildStage({
          id: 10,
          title: 'StageO',
          message: 'Message0',
          targetProfileId,
          threshold: 0,
        });
        databaseBuilder.factory.buildStage({
          id: 1,
          title: 'Stage1',
          message: 'Message1',
          targetProfileId,
          threshold: 10,
        });
        databaseBuilder.factory.buildStage({
          id: 2,
          title: 'Stage2',
          message: 'Message2',
          targetProfileId,
          threshold: 50,
        });
        databaseBuilder.factory.buildStage({
          id: 3,
          title: 'Stage3',
          message: 'Message3',
          targetProfileId,
          threshold: 100,
        });
        databaseBuilder.factory.buildStage({ targetProfileId: otherTargetProfileId });

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
        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          locale: 'FR',
        });
        expect(participantResult.reachedStage).to.deep.include({
          id: 2,
          message: 'Message2',
          starCount: 3,
          threshold: 50,
          title: 'Stage2',
        });
        expect(participantResult.stageCount).to.equal(4);
      });
    });

    context('when the participation has badges', function () {
      it('computes the results for each badge', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          sharedAt: new Date('2020-01-02'),
        });

        databaseBuilder.factory.buildBadge({
          id: 1,
          message: 'Badge1 Message',
          altMessage: 'Badge1 AltMessage',
          title: 'Badge1 Title',
          imageUrl: 'Badge1 ImgUrl',
          key: 'Badge1 Key',
          targetProfileId,
        });

        databaseBuilder.factory.buildBadge({
          id: 2,
          altMessage: 'Badge2 AltMessage',
          message: 'Badge2 Message',
          title: 'Badge2 Title',
          imageUrl: 'Badge2 ImgUrl',
          key: 'Badge2 Key',
          targetProfileId,
          isAlwaysVisible: true,
        });

        databaseBuilder.factory.buildBadge();

        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: 1, userId, campaignParticipationId });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });

        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
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
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
        const { id: otherCampaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
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

        databaseBuilder.factory.buildBadge({
          id: 1,
          message: 'Badge1 Message',
          altMessage: 'Badge1 AltMessage',
          title: 'Badge1 Title',
          imageUrl: 'Badge1 ImgUrl',
          key: 'Badge1 Key',
          targetProfileId,
        });

        databaseBuilder.factory.buildBadge({
          id: 2,
          altMessage: 'Badge2 AltMessage',
          message: 'Badge2 Message',
          title: 'Badge2 Title',
          imageUrl: 'Badge2 ImgUrl',
          key: 'Badge2 Key',
          targetProfileId,
        });

        databaseBuilder.factory.buildBadge();

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
          locale: 'FR',
        });
        const badgeResult1 = participantResult.badgeResults.find(
          ({ id }) => id === badgeObtainedInAnotherCampaign.badgeId
        );
        const badgeResult2 = participantResult.badgeResults.find(
          ({ id }) => id === badgeObtainedInThisCampaign.badgeId
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

      context('when the target profile has badge partner competences (CleaNumerique)', function () {
        it('computes the buildBadgePartnerCompetence for each competence of badge', async function () {
          const { id: userId } = databaseBuilder.factory.buildUser();
          const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
          const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId,
            sharedAt: new Date('2020-01-02'),
          });

          const badge = databaseBuilder.factory.buildBadge({ id: 1, targetProfileId });
          const badgePartnerCompetence1 = databaseBuilder.factory.buildBadgePartnerCompetence({
            id: 1,
            badgeId: 1,
            name: 'BadgeCompt1',
            index: '1',
            color: 'BadgeCompt1Color',
            skillIds: ['skill1', 'skill2'],
          });
          const badgePartnerCompetence2 = databaseBuilder.factory.buildBadgePartnerCompetence({
            id: 2,
            badgeId: 1,
            name: 'BadgeCompt2',
            index: '2',
            color: 'BadgeCompt2Color',
            skillIds: ['skill3', 'skill4'],
          });
          databaseBuilder.factory.buildBadgePartnerCompetence();

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

          knowledgeElementsAttributes.forEach((attributes) =>
            databaseBuilder.factory.buildKnowledgeElement(attributes)
          );

          await databaseBuilder.commit();
          badge.badgePartnerCompetences = [badgePartnerCompetence1, badgePartnerCompetence2];
          const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
            userId,
            campaignId,
            locale: 'FR',
          });
          const partnerCompetenceResult1 = participantResult.badgeResults[0].partnerCompetenceResults.find(
            ({ id }) => id === 1
          );
          const partnerCompetenceResult2 = participantResult.badgeResults[0].partnerCompetenceResults.find(
            ({ id }) => id === 2
          );
          expect(participantResult.competenceResults).to.have.lengthOf(2);
          expect(partnerCompetenceResult1).to.deep.equal({
            id: 1,
            name: 'BadgeCompt1',
            testedSkillsCount: 2,
            totalSkillsCount: 2,
            validatedSkillsCount: 2,
            masteryPercentage: 100,
          });

          expect(partnerCompetenceResult2).to.deep.equal({
            id: 2,
            name: 'BadgeCompt2',
            testedSkillsCount: 2,
            totalSkillsCount: 2,
            validatedSkillsCount: 1,
            masteryPercentage: 50,
          });
        });
      });
    });

    context('when no participation for given user and campaign', function () {
      it('should throw a not found error', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
        await databaseBuilder.commit();

        const error = await catchErr(participantResultRepository.getByUserIdAndCampaignId)({
          userId,
          campaignId,
          locale: 'FR',
        });

        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when the participation is shared', function () {
      it('returns the mastery rate for the participation using the mastery rate stocked', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
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
          locale: 'FR',
        });
        expect(participantResult.masteryRate).to.equal(0.6);
      });
    });

    context('when the participation is not shared', function () {
      it('returns the mastery rate for the participation using knowledge elements', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          status: 'STARTED',
          sharedAt: null,
        });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });

        await databaseBuilder.commit();
        const participantResult = await participantResultRepository.getByUserIdAndCampaignId({
          userId,
          campaignId,
          locale: 'FR',
        });
        expect(participantResult.masteryRate).to.equal(0);
      });
    });
  });
});
