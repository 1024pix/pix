import { expect, databaseBuilder, knex, mockLearningContent, learningContentBuilder } from '../../../test-helper.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { STAGE_ACQUISITIONS_TABLE_NAME } from '../../../../db/migrations/20230721114848_create-stage_acquisitions-table.js';

describe('Integration | Usecase | Handle Stage Acquisition', function () {
  let userId, assessment, stages, campaignParticipationId, targetProfileId, listSkill, learningContent;

  before(async function () {
    listSkill = ['web1', 'web2', 'web3', 'web4'];

    learningContent = [
      {
        id: 'recFrameworkId',
        name: 'monFramework',
        areas: [
          {
            id: 'recArea1',
            title_i18n: {
              fr: 'area1_Title',
            },
            color: 'someColor',
            competences: [
              {
                id: 'competenceId',
                name_i18n: {
                  fr: 'Mener une recherche et une veille d’information',
                },
                index: '1.1',
                tubes: [
                  {
                    id: 'recTube0_0',
                    skills: [
                      {
                        id: listSkill[0],
                        nom: '@web1',
                        status: 'actif',
                        challenges: [],
                        level: 1,
                      },
                      {
                        id: listSkill[1],
                        nom: '@web2',
                        status: 'actif',
                        challenges: [],
                        level: 1,
                      },
                      {
                        id: listSkill[2],
                        nom: 'web3',
                        status: 'actif',
                        challenges: [],
                        level: 2,
                      },
                      {
                        id: listSkill[3],
                        nom: 'web4',
                        status: 'actif',
                        challenges: [],
                        level: 3,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
  });

  describe('#handleStageAcquisition', function () {
    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      listSkill.forEach((skillId) => databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId }));
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
        validatedSkillsCount: null,
      }).id;

      assessment = new Assessment({
        userId,
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
      });

      mockLearningContent(learningContentBuilder(learningContent));
    });

    context('when some KEs are acquired', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web1', status: 'validated' });
        databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web2', status: 'validated' });
        databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web3', status: 'validated' });
        databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web4', status: 'invalidated' });

        return databaseBuilder.commit();
      });

      context('when stage acquisitions are already present', function () {
        it('should not try to insert already existing stages', async function () {
          // given
          stages = [
            databaseBuilder.factory.buildStage({ targetProfileId, threshold: 0 }),
            databaseBuilder.factory.buildStage.firstSkill({ targetProfileId }),
            databaseBuilder.factory.buildStage({ targetProfileId, threshold: 20 }),
            databaseBuilder.factory.buildStage({ targetProfileId, threshold: 40 }),
            databaseBuilder.factory.buildStage({ targetProfileId, threshold: 100 }),
          ];
          stages
            .slice(0, 3)
            .map(async (stage) =>
              databaseBuilder.factory.buildStageAcquisition({ stageId: stage.id, userId, campaignParticipationId }),
            );

          await databaseBuilder.commit();
          const stageAcquisitionsBefore = await knex(STAGE_ACQUISITIONS_TABLE_NAME).where({ userId });

          // when
          await usecases.handleStageAcquisition({
            assessment,
          });

          // then
          expect(stageAcquisitionsBefore.length).to.equal(3);
          const stageAcquisitionsAfter = await knex(STAGE_ACQUISITIONS_TABLE_NAME).where({ userId });
          expect(stageAcquisitionsAfter.length).to.equal(4);
        });
      });

      context('when domain transaction is not committed yet', function () {
        it('should not affect the database', async function () {
          await DomainTransaction.execute(async (domainTransaction) => {
            // given
            stages = [
              databaseBuilder.factory.buildStage({ targetProfileId, threshold: 0 }),
              databaseBuilder.factory.buildStage.firstSkill({ targetProfileId }),
              databaseBuilder.factory.buildStage({ targetProfileId, threshold: 20 }),
              databaseBuilder.factory.buildStage({ targetProfileId, threshold: 40 }),
              databaseBuilder.factory.buildStage({ targetProfileId, threshold: 100 }),
            ];
            await databaseBuilder.commit();

            // when
            await usecases.handleStageAcquisition({
              assessment,
              domainTransaction,
            });

            // then
            const transactionStageAcquisitions = await domainTransaction
              .knexTransaction(STAGE_ACQUISITIONS_TABLE_NAME)
              .select('userId', 'stageId')
              .where({ userId });

            expect(transactionStageAcquisitions).to.have.deep.members([
              {
                userId,
                stageId: stages[0].id,
              },
              {
                userId,
                stageId: stages[1].id,
              },
              {
                userId,
                stageId: stages[2].id,
              },
              {
                userId,
                stageId: stages[3].id,
              },
            ]);

            const stageAcquisitions = await knex(STAGE_ACQUISITIONS_TABLE_NAME).where({ userId });
            expect(stageAcquisitions.length).to.equal(0);
          });
        });
      });

      context('when assessment is not for a campaign', function () {
        it('should not insert stages in database', async function () {
          // given
          assessment = new Assessment({
            userId,
            campaignParticipationId,
            type: Assessment.types.COMPETENCE_EVALUATION,
          });
          stages = [databaseBuilder.factory.buildStage({ targetProfileId, threshold: 0 })];

          // when
          await usecases.handleStageAcquisition({
            assessment,
          });

          // then
          const stageAcquisitions = await knex(STAGE_ACQUISITIONS_TABLE_NAME).where({ userId });
          expect(stageAcquisitions.length).to.equal(0);
        });
      });

      context('when target profile have level stages', function () {
        it('should insert stages acquisitions after conversion', async function () {
          // given
          stages = [
            databaseBuilder.factory.buildStage({ targetProfileId, level: 0, threshold: null }),
            databaseBuilder.factory.buildStage.firstSkill({ targetProfileId }),
            databaseBuilder.factory.buildStage({ targetProfileId, level: 1, threshold: null }),
            databaseBuilder.factory.buildStage({ targetProfileId, level: 2, threshold: null }),
            databaseBuilder.factory.buildStage({ targetProfileId, level: 3, threshold: null }),
          ];

          await databaseBuilder.commit();

          // when
          await usecases.handleStageAcquisition({
            assessment,
          });

          // then
          const stageAcquisitions = await knex(STAGE_ACQUISITIONS_TABLE_NAME).where({ userId });
          expect(stageAcquisitions.length).to.equal(4);
        });
      });
    });

    context('when no KE is acquired', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web1', status: 'invalidated' });
        databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web2', status: 'invalidated' });
        databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web3', status: 'invalidated' });
        databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web4', status: 'invalidated' });

        return databaseBuilder.commit();
      });

      it('should not insert first-skill', async function () {
        // given
        stages = [
          databaseBuilder.factory.buildStage({ targetProfileId, threshold: 0 }),
          databaseBuilder.factory.buildStage.firstSkill({ targetProfileId }),
        ];

        await databaseBuilder.commit();

        // when
        await usecases.handleStageAcquisition({
          assessment,
        });

        // then
        const stageAcquisitionsAfter = await knex(STAGE_ACQUISITIONS_TABLE_NAME).where({ userId });
        expect(stageAcquisitionsAfter.length).to.equal(1);
      });
    });
  });
});
