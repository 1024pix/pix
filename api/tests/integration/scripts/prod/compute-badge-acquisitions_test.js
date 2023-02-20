import {
  expect,
  databaseBuilder,
  sinon,
  learningContentBuilder,
  mockLearningContent,
  knex,
} from '../../../test-helper';

import {
  normalizeRange,
  computeAllBadgeAcquisitions,
  computeBadgeAcquisition,
  getCampaignParticipationsBetweenIds,
} from '../../../../scripts/prod/compute-badge-acquisitions';

import CampaignParticipation from '../../../../lib/domain/models/CampaignParticipation';
import logger from '../../../../lib/infrastructure/logger';
import badgeAcquisitionRepository from '../../../../lib/infrastructure/repositories/badge-acquisition-repository';
import badgeForCalculationRepository from '../../../../lib/infrastructure/repositories/badge-for-calculation-repository';
import knowledgeElementRepository from '../../../../lib/infrastructure/repositories/knowledge-element-repository';

describe('Script | Prod | Compute Badge Acquisitions', function () {
  describe('#validateRange', function () {
    it('should truncate idMax when is superior to MAX_RANGE_SIZE', function () {
      // given
      sinon.stub(logger, 'info').returns();
      const range = {
        idMin: 0,
        idMax: 1_000_000,
      };

      // when
      const normalizedRange = normalizeRange(range);

      // then
      expect(normalizedRange).to.deep.equal({ idMin: 0, idMax: 100_000 });
    });

    it('should not truncate range when it is below MAX_RANGE_SIZE', function () {
      // given
      const range = {
        idMin: 0,
        idMax: 9000,
      };

      // when
      const normalizedRange = normalizeRange(range);

      // then
      expect(normalizedRange).to.deep.equal(range);
    });
  });

  describe('#getCampaignParticipationsBetweenIds', function () {
    it('should return campaign participation between idMin and idMax', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation();
      const id2 = databaseBuilder.factory.buildCampaignParticipation().id;
      const id3 = databaseBuilder.factory.buildCampaignParticipation().id;
      const id4 = databaseBuilder.factory.buildCampaignParticipation().id;
      await databaseBuilder.commit();

      // when
      const campaignParticipations = await getCampaignParticipationsBetweenIds({ idMin: id2, idMax: id4 });

      // then
      expect(campaignParticipations.length).to.equal(3);
      expect(campaignParticipations.map(({ id }) => id)).to.deep.equal([id2, id3, id4]);
      expect(campaignParticipations[0]).to.be.instanceOf(CampaignParticipation);
    });
  });

  describe('Integration | #computeAllBadgeAcquisitions', function () {
    let userId1, userId2;
    let badgeCompleted;
    let campaignParticipation1, campaignParticipation2;

    beforeEach(async function () {
      const listSkill = ['web1', 'web2', 'web3', 'web4'];

      const learningContent = [
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
      ];

      userId1 = databaseBuilder.factory.buildUser().id;
      userId2 = databaseBuilder.factory.buildUser().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId1, skillId: 'web1', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId1, skillId: 'web2', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId1, skillId: 'web3', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId1, skillId: 'web4', status: 'invalidated' });

      databaseBuilder.factory.buildKnowledgeElement({ userId: userId2, skillId: 'web1', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId2, skillId: 'web2', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId2, skillId: 'web3', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId2, skillId: 'web4', status: 'invalidated' });

      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      listSkill.forEach((skillId) => databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId }));
      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId: userId1 });
      campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId: userId2 });

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

      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);

      return databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('badge-acquisitions').delete();
    });

    it('should compute badge acquisition for all campaign participations', async function () {
      // when
      const numberOfCreatedBadges = await computeAllBadgeAcquisitions({
        idMin: campaignParticipation1.id,
        idMax: campaignParticipation2.id,
      });

      // then
      const badgeAcquisitions = await knex('badge-acquisitions');
      expect(badgeAcquisitions.length).to.equal(2);
      expect(numberOfCreatedBadges).to.equal(2);
    });

    context('when dry run option is provided', function () {
      it('should not create badge', async function () {
        // given
        const dryRun = true;

        // when
        const numberOfSupposedlyCreatedBadges = await computeAllBadgeAcquisitions({
          idMin: campaignParticipation1.id,
          idMax: campaignParticipation2.id,
          dryRun,
        });

        // then
        const badgeAcquisitions = await knex('badge-acquisitions');
        expect(badgeAcquisitions.length).to.equal(0);
        expect(numberOfSupposedlyCreatedBadges).to.equal(2);
      });
    });
  });

  describe('Integration | #computeBadgeAcquisition', function () {
    let userId;
    let badgeCompleted;
    let badgeCompletedAndAcquired;
    let campaignParticipation;

    beforeEach(async function () {
      const listSkill = ['web1', 'web2', 'web3', 'web4'];

      const learningContent = [
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
      ];

      userId = databaseBuilder.factory.buildUser().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web1', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web2', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web3', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web4', status: 'invalidated' });

      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      listSkill.forEach((skillId) => databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId }));
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId, userId });

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

      badgeCompletedAndAcquired = databaseBuilder.factory.buildBadge({
        targetProfileId,
        key: 'Badge3',
      });
      databaseBuilder.factory.buildBadgeCriterion({
        scope: 'CampaignParticipation',
        badgeId: badgeCompletedAndAcquired.id,
        threshold: 40,
      });
      databaseBuilder.factory.buildBadgeAcquisition({
        badgeId: badgeCompletedAndAcquired.id,
        userId,
      });

      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);

      return databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('badge-acquisitions').delete();
    });

    it('should save only the validated badges not yet acquired', async function () {
      // when
      const numberOfCreatedBadges = await computeBadgeAcquisition({
        campaignParticipation,
        badgeAcquisitionRepository,
        badgeForCalculationRepository,
        knowledgeElementRepository,
      });

      // then
      const badgeAcquisitions = await knex('badge-acquisitions').where({ userId: userId, badgeId: badgeCompleted.id });
      expect(badgeAcquisitions.length).to.equal(1);
      expect(badgeAcquisitions[0].userId).to.equal(userId);
      expect(badgeAcquisitions[0].badgeId).to.equal(badgeCompleted.id);
      expect(numberOfCreatedBadges).to.equal(1);
    });
  });
});
