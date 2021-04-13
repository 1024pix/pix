const { expect, databaseBuilder, mockLearningContent } = require('../../../test-helper');
const campaignParticipationResultRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-result-repository');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

describe('Integration | Repository | Campaign Participation Result', () => {

  describe('#getByParticipationId', () => {

    let targetProfileId;

    beforeEach(() => {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill1' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill2' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill3' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'skill4' });

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
          { id: 'skill1', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1' }, // skill previously validated in competence 1
          { id: 'skill2', status: 'actif', tubeId: 'recTube1', competenceId: 'rec1' }, // skill validated in competence 1
          { id: 'skill3', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2' }, // skill invalidated in competence 2
          { id: 'skill4', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2' }, // skill not tested
          { id: 'skill5', status: 'actif', tubeId: 'recTube2', competenceId: 'rec2' }, // skill not in target profile
        ],
      };

      mockLearningContent(learningContent);
      return databaseBuilder.commit();
    });

    it('use the most recent assessment to define if the participation is completed', async () => {
      // given
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

      // when
      const campaignAssessmentParticipationResult = await DomainTransaction.execute(async (domainTransaction) =>
        campaignParticipationResultRepository.getByParticipationId({
          campaignParticipationId,
          campaignBadges: [],
          acquiredBadgeIds: [],
          locale: 'FR',
          domainTransaction,
        }),
      );
      // then
      expect(campaignAssessmentParticipationResult).to.deep.include({
        isCompleted: true,
      });
    });

    it('compute the number of skills, the number of skill tested and the number of skill validated', async () => {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-02'),
      });

      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed', type: 'CAMPAIGN' });
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
          assessmentId,
          skillId: 'skill3',
          competenceId: 'rec2',
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

      // when
      const campaignAssessmentParticipationResult = await DomainTransaction.execute(async (domainTransaction) =>
        campaignParticipationResultRepository.getByParticipationId({
          campaignParticipationId,
          campaignBadges: [],
          acquiredBadgeIds: [],
          locale: 'FR',
          domainTransaction,
        }),
      );
      // then
      expect(campaignAssessmentParticipationResult).to.deep.include({
        id: campaignParticipationId,
        knowledgeElementsCount: 2,
        testedSkillsCount: 2,
        totalSkillsCount: 4,
        validatedSkillsCount: 1,
      });
    });

    it('computes the results for each competence assessed', async () => {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
        userId,
        campaignId,
        isShared: true,
        sharedAt: new Date('2020-01-02'),
      });

      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed', type: 'CAMPAIGN' });

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
          assessmentId,
          skillId: 'skill2',
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        },
        {
          userId,
          assessmentId,
          skillId: 'skill3',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.INVALIDATED,
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

      // when
      const campaignAssessmentParticipationResult = await DomainTransaction.execute(async (domainTransaction) =>
        campaignParticipationResultRepository.getByParticipationId({
          campaignParticipationId,
          campaignBadges: [],
          acquiredBadgeIds: [],
          locale: 'FR',
          domainTransaction,
        }),
      );

      // then
      const competenceResults = campaignAssessmentParticipationResult.competenceResults.sort((a, b) => a.id <= b.id);
      expect(competenceResults).to.deep.equal([
        {
          id: 'rec1',
          name: 'comp1Fr',
          index: '1.1',
          areaName: 'area1',
          areaColor: 'colorArea1',
          testedSkillsCount: 2,
          totalSkillsCount: 2,
          validatedSkillsCount: 2,
        },
        {
          id: 'rec2',
          name: 'comp2Fr',
          index: '2.1',
          areaName: 'area2',
          areaColor: 'colorArea2',
          testedSkillsCount: 1,
          totalSkillsCount: 2,
          validatedSkillsCount: 0,
        },
      ]);
    });

    context('when there is no snapshot because the participant did not share his results', () => {

      it('compute results by using knowledge elements', async () => {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          isShared: false,
          sharedAt: null,
        });

        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed', type: 'CAMPAIGN' });
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
            assessmentId,
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

        // when
        const campaignAssessmentParticipationResult = await DomainTransaction.execute(async (domainTransaction) =>
          campaignParticipationResultRepository.getByParticipationId({
            campaignParticipationId,
            campaignBadges: [],
            acquiredBadgeIds: [],
            locale: 'FR',
            domainTransaction,
          }),
        );

        // then
        expect(campaignAssessmentParticipationResult).to.deep.include({
          id: campaignParticipationId,
          knowledgeElementsCount: 2,
          testedSkillsCount: 2,
          totalSkillsCount: 4,
          validatedSkillsCount: 1,
        });
      });
    });

    context('when the target profile has some stages', () => {

      it('returns the stage reached', async () => {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
        const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId,
          isShared: true,
          sharedAt: new Date('2020-01-02'),
        });

        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId, state: 'completed', type: 'CAMPAIGN' });
        databaseBuilder.factory.buildStage({ id: 10, title: 'StageO', message: 'Message0', targetProfileId, threshold: 0 });
        databaseBuilder.factory.buildStage({ id: 1, title: 'Stage1', message: 'Message1', targetProfileId, threshold: 10 });
        databaseBuilder.factory.buildStage({ id: 2, title: 'Stage2', message: 'Message2', targetProfileId, threshold: 50 });
        databaseBuilder.factory.buildStage({ id: 3, title: 'Stage3', message: 'Message3', targetProfileId, threshold: 100 });

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
            assessmentId,
            skillId: 'skill2',
            competenceId: 'rec1',
            createdAt: new Date('2020-01-01'),
            status: KnowledgeElement.StatusType.VALIDATED,
          },
          {
            userId,
            assessmentId,
            skillId: 'skill3',
            competenceId: 'rec2',
            createdAt: new Date('2020-01-01'),
            status: KnowledgeElement.StatusType.INVALIDATED,
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

        // when
        const campaignAssessmentParticipationResult = await DomainTransaction.execute(async (domainTransaction) =>
          campaignParticipationResultRepository.getByParticipationId({
            campaignParticipationId,
            campaignBadges: [],
            acquiredBadgeIds: [],
            locale: 'FR',
            domainTransaction,
          }),
        );

        // then
        expect(campaignAssessmentParticipationResult.reachedStage).to.deep.include({
          id: 2,
          message: 'Message2',
          starCount: 3,
          threshold: 50,
          title: 'Stage2',
        });
        expect(campaignAssessmentParticipationResult.stageCount).to.equal(4);
      });
    });

    context('when the participation has badges', () => {

      it('computes the results for each badge', async () => {
        // given
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

        // when
        const campaignAssessmentParticipationResult = await DomainTransaction.execute(async (domainTransaction) =>
          campaignParticipationResultRepository.getByParticipationId({
            campaignParticipationId,
            campaignBadges: [badge1, badge2],
            acquiredBadgeIds: [badge1.id],
            locale: 'FR',
            domainTransaction,
          }),
        );

        // then
        const campaignParticipationBadge1 = campaignAssessmentParticipationResult.campaignParticipationBadges.find(({ id }) => id == 1);
        const campaignParticipationBadge2 = campaignAssessmentParticipationResult.campaignParticipationBadges.find(({ id }) => id == 2);
        expect(campaignParticipationBadge1).to.deep.include({
          id: 1,
          altMessage: 'Badge1 AltMessage',
          message: 'Badge1 Message',
          title: 'Badge1 Title',
          imageUrl: 'Badge1 ImgUrl',
          key: 'Badge1 Key',
          isAcquired: true,
        });
        expect(campaignParticipationBadge2).to.deep.include({
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
          // given
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

          // when
          const campaignAssessmentParticipationResult = await DomainTransaction.execute(async (domainTransaction) =>
            campaignParticipationResultRepository.getByParticipationId({
              campaignParticipationId,
              campaignBadges: [badge],
              acquiredBadgeIds: [badge.id],
              locale: 'FR',
              domainTransaction,
            }),
          );

          // then
          const partnerCompetenceResults = campaignAssessmentParticipationResult
            .campaignParticipationBadges[0]
            .partnerCompetenceResults
            .sort((a, b) => a.id <= b.id);
          expect(partnerCompetenceResults[0]).to.deep.equal({
            id: 1,
            areaColor: 'BadgeCompt1Color',
            areaName: undefined,
            index: undefined,
            name: 'BadgeCompt1',
            testedSkillsCount: 2,
            totalSkillsCount: 2,
            validatedSkillsCount: 2,
          });

          expect(partnerCompetenceResults[1]).to.deep.equal({
            id: 2,
            areaColor: 'BadgeCompt2Color',
            areaName: undefined,
            index: undefined,
            name: 'BadgeCompt2',
            testedSkillsCount: 1,
            totalSkillsCount: 2,
            validatedSkillsCount: 0,
          });
        });
      });
    });
  });
});
