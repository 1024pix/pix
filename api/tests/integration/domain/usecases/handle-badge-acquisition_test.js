import { expect, databaseBuilder, knex, mockLearningContent, learningContentBuilder } from '../../../test-helper';
import useCases from '../../../../lib/domain/usecases';
import Assessment from '../../../../lib/domain/models/Assessment';
import DomainTransaction from '../../../../lib/infrastructure/DomainTransaction';

describe('Integration | Usecase | Handle Badge Acquisition', function () {
  let userId, assessment, badgeCompleted;

  describe('#handleBadgeAcquisition', function () {
    beforeEach(async function () {
      const listSkill = ['web1', 'web2', 'web3', 'web4'];

      const learningContent = [
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
                        },
                        {
                          id: listSkill[1],
                          nom: '@web2',
                          status: 'actif',
                          challenges: [],
                        },
                        {
                          id: listSkill[2],
                          nom: 'web3',
                          status: 'actif',
                          challenges: [],
                        },
                        {
                          id: listSkill[3],
                          nom: 'web4',
                          status: 'actif',
                          challenges: [],
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

      userId = databaseBuilder.factory.buildUser().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web1', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web2', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web3', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web4', status: 'invalidated' });

      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      listSkill.forEach((skillId) => databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId }));
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId }).id;

      badgeCompleted = databaseBuilder.factory.buildBadge({
        targetProfileId,
        key: 'Badge1',
      });
      databaseBuilder.factory.buildBadgeCriterion({
        scope: 'CampaignParticipation',
        badgeId: badgeCompleted.id,
        threshold: 40,
      });

      const badgeNotCompletedId = databaseBuilder.factory.buildBadge({
        targetProfileId,
        key: 'Badge2',
      }).id;
      databaseBuilder.factory.buildBadgeCriterion({
        scope: 'CampaignParticipation',
        badgeId: badgeNotCompletedId,
        threshold: 90,
      });

      assessment = new Assessment({
        userId,
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
      });

      const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
      mockLearningContent(learningContentObjects);

      return databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('badge-acquisitions').delete();
    });

    context('when domain transaction is not committed yet', function () {
      it('should not affect the database', async function () {
        await DomainTransaction.execute(async (domainTransaction) => {
          // when
          await useCases.handleBadgeAcquisition({
            assessment,
            domainTransaction,
          });

          // then
          const transactionBadgeAcquisitions = await domainTransaction
            .knexTransaction('badge-acquisitions')
            .select('userId', 'badgeId')
            .where({ userId });
          expect(transactionBadgeAcquisitions).to.deep.equal([{ userId, badgeId: badgeCompleted.id }]);

          const realBadgeAcquisitions = await knex('badge-acquisitions').where({ userId });
          expect(realBadgeAcquisitions.length).to.equal(0);
        });
      });
    });
  });
});
