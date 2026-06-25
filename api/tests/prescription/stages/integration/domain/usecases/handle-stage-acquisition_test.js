import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { stageUsecases } from '../../../../../../src/prescription/stages/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { buildLearningContent as learningContentBuilder } from '../../../../../tooling/learning-content-builder/index.js';

describe('Evaluation | Integration | Usecase | Handle Stage Acquisition', function () {
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
    describe('For ASSESSMENT', function () {
      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser().id;
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

        const campaignDTO = databaseBuilder.factory.buildCampaign({ targetProfileId });
        const campaignId = campaignDTO.id;
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
          campaign: domainBuilder.buildCampaign(campaignDTO),
        });

        databaseBuilder.factory.learningContent.build(learningContentBuilder(learningContent));
        await databaseBuilder.commit();
      });
      context('When campaignParticipation is not available', function () {
        it('should not throw', async function () {
          // given
          assessment = new Assessment({
            userId,
            campaignParticipationId: null,
            type: Assessment.types.CAMPAIGN,
          });
          stages = [databaseBuilder.factory.buildStage({ targetProfileId, threshold: 0 })];

          // when & then
          await expect(
            stageUsecases.handleStageAcquisition({
              assessment,
            }),
          ).fulfilled;
        });
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
                databaseBuilder.factory.buildStageAcquisition({ stageId: stage.id, campaignParticipationId }),
              );

            await databaseBuilder.commit();
            const stageAcquisitionsBefore = await knex('stage-acquisitions').where({
              campaignParticipationId,
            });

            // when
            await stageUsecases.handleStageAcquisition({
              assessment,
            });

            // then
            expect(stageAcquisitionsBefore).to.have.lengthOf(3);
            const stageAcquisitionsAfter = await knex('stage-acquisitions').where({ campaignParticipationId });
            expect(stageAcquisitionsAfter).to.have.lengthOf(4);
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
              await stageUsecases.handleStageAcquisition({
                assessment,
              });

              // then
              const transactionStageAcquisitions = await domainTransaction
                .knexTransaction('stage-acquisitions')
                .select('campaignParticipationId', 'stageId')
                .where({ campaignParticipationId });

              expect(transactionStageAcquisitions).to.have.deep.members([
                {
                  campaignParticipationId,
                  stageId: stages[0].id,
                },
                {
                  campaignParticipationId,
                  stageId: stages[1].id,
                },
                {
                  campaignParticipationId,
                  stageId: stages[2].id,
                },
                {
                  campaignParticipationId,
                  stageId: stages[3].id,
                },
              ]);

              const stageAcquisitions = await knex('stage-acquisitions').where({ campaignParticipationId });
              expect(stageAcquisitions).to.have.lengthOf(0);
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
            await stageUsecases.handleStageAcquisition({
              assessment,
            });

            // then
            const stageAcquisitions = await knex('stage-acquisitions').where({ campaignParticipationId });
            expect(stageAcquisitions).to.have.lengthOf(0);
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
            await stageUsecases.handleStageAcquisition({
              assessment,
            });

            // then
            const stageAcquisitions = await knex('stage-acquisitions').where({ campaignParticipationId });
            expect(stageAcquisitions).to.have.lengthOf(4);
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
          await stageUsecases.handleStageAcquisition({
            assessment,
          });

          // then
          const stageAcquisitionsAfter = await knex('stage-acquisitions').where({ campaignParticipationId });
          expect(stageAcquisitionsAfter).to.have.lengthOf(1);
        });
      });
    });

    describe('For EXAM', function () {
      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser().id;
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

        const campaignDTO = databaseBuilder.factory.buildCampaign({ targetProfileId, type: CampaignTypes.EXAM });
        const campaignId = campaignDTO.id;
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
          campaign: domainBuilder.buildCampaign(campaignDTO),
        });

        databaseBuilder.factory.learningContent.build(learningContentBuilder(learningContent));
        await databaseBuilder.commit();
      });

      context('when some KEs are acquired', function () {
        beforeEach(async function () {
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({ userId, skillId: 'web1', status: 'validated' }),
            domainBuilder.buildKnowledgeElement({ userId, skillId: 'web2', status: 'validated' }),
            domainBuilder.buildKnowledgeElement({ userId, skillId: 'web3', status: 'validated' }),
            domainBuilder.buildKnowledgeElement({ userId, skillId: 'web4', status: 'invalidated' }),
          ];
          databaseBuilder.factory.buildKnowledgeElementSnapshot({
            snapshot: new KnowledgeElementCollection(knowledgeElements).toSnapshot(),
            campaignParticipationId,
          });

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
                databaseBuilder.factory.buildStageAcquisition({ stageId: stage.id, campaignParticipationId }),
              );

            await databaseBuilder.commit();
            const stageAcquisitionsBefore = await knex('stage-acquisitions').where({
              campaignParticipationId,
            });

            // when
            await stageUsecases.handleStageAcquisition({
              assessment,
            });

            // then
            expect(stageAcquisitionsBefore).to.have.lengthOf(3);
            const stageAcquisitionsAfter = await knex('stage-acquisitions').where({ campaignParticipationId });
            expect(stageAcquisitionsAfter).to.have.lengthOf(4);
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
              await stageUsecases.handleStageAcquisition({
                assessment,
              });

              // then
              const transactionStageAcquisitions = await domainTransaction
                .knexTransaction('stage-acquisitions')
                .select('campaignParticipationId', 'stageId')
                .where({ campaignParticipationId });

              expect(transactionStageAcquisitions).to.have.deep.members([
                {
                  campaignParticipationId,
                  stageId: stages[0].id,
                },
                {
                  campaignParticipationId,
                  stageId: stages[1].id,
                },
                {
                  campaignParticipationId,
                  stageId: stages[2].id,
                },
                {
                  campaignParticipationId,
                  stageId: stages[3].id,
                },
              ]);

              const stageAcquisitions = await knex('stage-acquisitions').where({ campaignParticipationId });
              expect(stageAcquisitions).to.have.lengthOf(0);
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
            await stageUsecases.handleStageAcquisition({
              assessment,
            });

            // then
            const stageAcquisitions = await knex('stage-acquisitions').where({ campaignParticipationId });
            expect(stageAcquisitions).to.have.lengthOf(0);
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
            await stageUsecases.handleStageAcquisition({
              assessment,
            });

            // then
            const stageAcquisitions = await knex('stage-acquisitions').where({ campaignParticipationId });
            expect(stageAcquisitions).to.have.lengthOf(4);
          });
        });
      });

      context('when no KE is acquired', function () {
        beforeEach(async function () {
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({ userId, skillId: 'web1', status: 'invalidated' }),
            domainBuilder.buildKnowledgeElement({ userId, skillId: 'web2', status: 'invalidated' }),
            domainBuilder.buildKnowledgeElement({ userId, skillId: 'web3', status: 'invalidated' }),
            domainBuilder.buildKnowledgeElement({ userId, skillId: 'web4', status: 'invalidated' }),
          ];
          databaseBuilder.factory.buildKnowledgeElementSnapshot({
            snapshot: new KnowledgeElementCollection(knowledgeElements).toSnapshot(),
            campaignParticipationId,
          });

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
          await stageUsecases.handleStageAcquisition({
            assessment,
          });

          // then
          const stageAcquisitionsAfter = await knex('stage-acquisitions').where({ campaignParticipationId });
          expect(stageAcquisitionsAfter).to.have.lengthOf(1);
        });
      });
    });
  });
});
