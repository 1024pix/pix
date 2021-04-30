const { expect, databaseBuilder, mockLearningContent } = require('../../../test-helper');
const participantResultRepository = require('../../../../lib/infrastructure/repositories/participant-result-repository');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

describe('Integration | Repository | ParticipantResultRepository', () => {

  describe('#getByParticipationId', () => {

    let targetProfileId;

    beforeEach(() => {
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
          { id: 'rec1', nameFrFr: 'comp1Fr', nameEnUs: 'comp1En', index: '1.1', areaId: 'recArea1', color: 'rec1Color', skillIds: ['skill1', 'skill2'] },
          { id: 'rec2', nameFrFr: 'comp2Fr', nameEnUs: 'comp2En', index: '2.1', areaId: 'recArea2', color: 'rec2Color', skillIds: ['skill3', 'skill4', 'skill5'] },
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

    it('use the most recent assessment to define if the participation is completed', async () => {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        sharedAt: new Date('2020-01-02'),
      });

      databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'started', createdAt: new Date('2021-01-01') });
      databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed', createdAt: new Date('2021-01-02') });
      await databaseBuilder.commit();

      const participantResult = await participantResultRepository.getByParticipationId(campaignParticipationId, [], [], 'FR');

      expect(participantResult).to.deep.include({
        isCompleted: true,
      });
    });

    context('computes canRetry', async () => {
      it('returns true when all conditions are filled', async () => {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId, multipleSendings: true });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          sharedAt: new Date('2020-01-02'),
        });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByParticipationId(campaignParticipationId, [], [], 'FR');

        expect(participantResult.canRetry).to.equal(true);
      });

      it('returns false', async () => {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId, multipleSendings: false });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        await databaseBuilder.commit();

        const participantResult = await participantResultRepository.getByParticipationId(campaignParticipationId, [], [], 'FR');

        expect(participantResult.canRetry).to.equal(false);
      });
    });

    it('compute the number of skills, the number of skill tested and the number of skill validated', async () => {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
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
      databaseBuilder
        .factory
        .knowledgeElementSnapshotFactory
        .buildSnapshot({
          userId,
          snappedAt: new Date('2020-01-02'),
          knowledgeElementsAttributes,
        });
      await databaseBuilder.commit();
      const participantResult = await participantResultRepository.getByParticipationId(campaignParticipationId, [], [], 'FR');

      expect(participantResult).to.deep.include({
        id: campaignParticipationId,
        testedSkillsCount: 2,
        totalSkillsCount: 4,
        validatedSkillsCount: 1,
      });
    });

    it('compute the number of skills, the number of skill tested and the number of skill validated using operative skills', async () => {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
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
      databaseBuilder
        .factory
        .knowledgeElementSnapshotFactory
        .buildSnapshot({
          userId,
          snappedAt: new Date('2020-01-02'),
          knowledgeElementsAttributes,
        });
      await databaseBuilder.commit();
      const participantResult = await participantResultRepository.getByParticipationId(campaignParticipationId, [], [], 'FR');

      expect(participantResult).to.deep.include({
        testedSkillsCount: 1,
        totalSkillsCount: 4,
        validatedSkillsCount: 1,
      });
    });

    it('computes the results for each competence assessed', async () => {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
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

      databaseBuilder
        .factory
        .knowledgeElementSnapshotFactory
        .buildSnapshot({
          userId,
          snappedAt: new Date('2020-01-02'),
          knowledgeElementsAttributes,
        });
      await databaseBuilder.commit();
      const participantResult = await participantResultRepository.getByParticipationId(campaignParticipationId, [], [], 'FR');
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

    context('when there is no snapshot because the participant did not share his results', () => {
      it('compute results by using knowledge elements', async () => {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          isShared: false,
          sharedAt: null,
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
        const participantResult = await participantResultRepository.getByParticipationId(campaignParticipationId, [], [], 'FR');

        expect(participantResult).to.deep.include({
          id: campaignParticipationId,
          testedSkillsCount: 2,
          totalSkillsCount: 4,
          validatedSkillsCount: 1,
        });
      });
    });

    context('when the target profile has some stages', () => {
      it('returns the stage reached', async () => {
        const { id: otherTargetProfileId } = databaseBuilder.factory.buildTargetProfile();
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          isShared: true,
          sharedAt: new Date('2020-01-02'),
        });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });
        databaseBuilder.factory.buildStage({ id: 10, title: 'StageO', message: 'Message0', targetProfileId, threshold: 0 });
        databaseBuilder.factory.buildStage({ id: 1, title: 'Stage1', message: 'Message1', targetProfileId, threshold: 10 });
        databaseBuilder.factory.buildStage({ id: 2, title: 'Stage2', message: 'Message2', targetProfileId, threshold: 50 });
        databaseBuilder.factory.buildStage({ id: 3, title: 'Stage3', message: 'Message3', targetProfileId, threshold: 100 });
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

        databaseBuilder
          .factory
          .knowledgeElementSnapshotFactory
          .buildSnapshot({
            userId,
            snappedAt: new Date('2020-01-02'),
            knowledgeElementsAttributes,
          });
        await databaseBuilder.commit();
        const participantResult = await participantResultRepository.getByParticipationId(campaignParticipationId, [], [], 'FR');
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

    context('when the participation has badges', () => {
      it('computes the results for each badge', async () => {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          isShared: true,
          sharedAt: new Date('2020-01-02'),
        });

        const badge1 = databaseBuilder.factory.buildBadge({
          id: 1,
          message: 'Badge1 Message',
          altMessage: 'Badge1 AltMessage',
          title: 'Badge1 Title',
          imageUrl: 'Badge1 ImgUrl',
          key: 'Badge1 Key',
          targetProfileId,
        });

        const badge2 = databaseBuilder.factory.buildBadge({
          id: 2,
          altMessage: 'Badge2 AltMessage',
          message: 'Badge2 Message',
          title: 'Badge2 Title',
          imageUrl: 'Badge2 ImgUrl',
          key: 'Badge2 Key',
          targetProfileId,
        });

        databaseBuilder.factory.buildBadge();

        databaseBuilder.factory.buildBadgeAcquisition({ badgeId: 1, userId });

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed' });

        databaseBuilder
          .factory
          .knowledgeElementSnapshotFactory
          .buildSnapshot({
            userId,
            snappedAt: new Date('2020-01-02'),
            knowledgeElementsAttributes: [],
          });
        await databaseBuilder.commit();
        const participantResult = await participantResultRepository.getByParticipationId(campaignParticipationId, [badge1, badge2], [badge1.id], 'FR');
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
        });
        expect(badgeResult2).to.deep.include({
          id: 2,
          altMessage: 'Badge2 AltMessage',
          message: 'Badge2 Message',
          title: 'Badge2 Title',
          imageUrl: 'Badge2 ImgUrl',
          key: 'Badge2 Key',
          isAcquired: false,
        });
      });

      context('when the target profile has badge partner competences (CleaNumerique)', () => {
        it('computes the buildBadgePartnerCompetence for each competence of badge', async () => {
          const { id: userId } = databaseBuilder.factory.buildUser();
          const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
          const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId,
            isShared: true,
            sharedAt: new Date('2020-01-02'),
          });

          const badge = databaseBuilder.factory.buildBadge({ id: 1, targetProfileId });
          const badgePartnerCompetence1 = databaseBuilder.factory.buildBadgePartnerCompetence({ id: 1, badgeId: 1, name: 'BadgeCompt1', index: '1', color: 'BadgeCompt1Color', skillIds: ['skill1', 'skill2'] });
          const badgePartnerCompetence2 = databaseBuilder.factory.buildBadgePartnerCompetence({ id: 2, badgeId: 1, name: 'BadgeCompt2', index: '2', color: 'BadgeCompt2Color', skillIds: ['skill3', 'skill4'] });
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

          databaseBuilder
            .factory
            .knowledgeElementSnapshotFactory
            .buildSnapshot({
              userId,
              snappedAt: new Date('2020-01-02'),
              knowledgeElementsAttributes,
            });
          await databaseBuilder.commit();
          badge.badgePartnerCompetences = [badgePartnerCompetence1, badgePartnerCompetence2];
          const participantResult = await participantResultRepository.getByParticipationId(campaignParticipationId, [badge], [badge.id], 'FR');
          const partnerCompetenceResult1 = participantResult.badgeResults[0].partnerCompetenceResults.find(({ id }) => id === 1);
          const partnerCompetenceResult2 = participantResult.badgeResults[0].partnerCompetenceResults.find(({ id }) => id === 2);
          expect(participantResult.competenceResults).to.have.lengthOf(2);
          expect(partnerCompetenceResult1).to.deep.equal({
            id: 1,
            color: 'BadgeCompt1Color',
            name: 'BadgeCompt1',
            testedSkillsCount: 2,
            totalSkillsCount: 2,
            validatedSkillsCount: 2,
            masteryPercentage: 100,
          });

          expect(partnerCompetenceResult2).to.deep.equal({
            id: 2,
            color: 'BadgeCompt2Color',
            name: 'BadgeCompt2',
            testedSkillsCount: 2,
            totalSkillsCount: 2,
            validatedSkillsCount: 1,
            masteryPercentage: 50,
          });
        });
      });
    });
  });
});

