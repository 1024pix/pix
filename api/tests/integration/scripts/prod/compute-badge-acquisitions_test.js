const {
  expect,
  databaseBuilder,
  sinon,
  learningContentBuilder,
  mockLearningContent,
  knex,
} = require('../../../test-helper');
const {
  normalizeRange,
  computeAllBadgeAcquisitions,
  computeBadgeAcquisition,
  getCampaignParticipationsBetweenIds,
} = require('../../../../scripts/prod/compute-badge-acquisitions');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');
const logger = require('../../../../lib/infrastructure/logger');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const Badge = require('../../../../lib/domain/models/Badge');

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
          titleFrFr: 'area1_Title',
          color: 'someColor',
          competences: [
            {
              id: 'competenceId',
              nameFrFr: 'Mener une recherche et une veille d’information',
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
      listSkill.forEach((skillId) => databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId }));
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId1, skillId: 'web1', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId1, skillId: 'web2', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId1, skillId: 'web3', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId1, skillId: 'web4', status: 'invalidated' });

      databaseBuilder.factory.buildKnowledgeElement({ userId: userId2, skillId: 'web1', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId2, skillId: 'web2', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId2, skillId: 'web3', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId: userId2, skillId: 'web4', status: 'invalidated' });

      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
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

      databaseBuilder.factory.buildBadge({
        targetProfileId,
        badgeCriteria: [],
        key: 'Badge3',
      });

      const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
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

  describe('#computeBadgeAcquisition', function () {
    let badgeRepository, campaignRepository, knowledgeElementRepository, badgeAcquisitionRepository;
    let badgeCriteriaService;
    let dependencies;
    let campaignParticipation;

    beforeEach(function () {
      campaignParticipation = {
        id: 1,
        userId: 123,
      };

      badgeRepository = {
        findByCampaignParticipationId: sinon.stub(),
      };
      campaignRepository = {
        findSkillIdsByCampaignParticipationId: sinon.stub(),
      };
      knowledgeElementRepository = {
        findUniqByUserId: sinon.stub(),
      };
      badgeAcquisitionRepository = {
        createOrUpdate: sinon.stub(),
        getAcquiredBadgeIds: sinon.stub(),
      };
      badgeCriteriaService = {
        areBadgeCriteriaFulfilled: sinon.stub(),
      };

      dependencies = {
        badgeAcquisitionRepository,
        badgeCriteriaService,
        badgeRepository,
        knowledgeElementRepository,
        campaignRepository,
      };
    });

    context('when the campaign is associated to one badge', function () {
      let badge;
      let skillIds;
      let knowledgeElements;
      let badgeId;

      beforeEach(function () {
        badgeId = Symbol('badgeId');
        skillIds = Symbol('skillIds');
        knowledgeElements = Symbol('knowledgeElements');

        badge = new Badge({
          id: badgeId,
          badgeCriteria: Symbol('badgeCriteria'),
        });
        badgeRepository.findByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation.id })
          .resolves([badge]);

        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation.id })
          .resolves(skillIds);

        knowledgeElementRepository.findUniqByUserId
          .withArgs({ userId: campaignParticipation.userId })
          .resolves(knowledgeElements);
      });

      it('should create a badge when badge requirements are fulfilled and return number of badge created', async function () {
        // given
        badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ skillIds, knowledgeElements, badge }).returns(true);
        badgeAcquisitionRepository.getAcquiredBadgeIds.resolves([]);

        // when
        const numberOfCreatedBadges = await computeBadgeAcquisition({ campaignParticipation, ...dependencies });

        // then
        expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledWithExactly({
          badgeAcquisitionsToCreate: [
            {
              badgeId,
              userId: campaignParticipation.userId,
              campaignParticipationId: campaignParticipation.id,
            },
          ],
        });
        expect(numberOfCreatedBadges).to.equal(1);
      });

      it('should not create a badge when badge requirements are not fulfilled', async function () {
        // given
        badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ skillIds, knowledgeElements, badge }).returns(false);

        // when
        const numberOfCreatedBadges = await computeBadgeAcquisition({ campaignParticipation, ...dependencies });

        // then
        expect(badgeAcquisitionRepository.createOrUpdate).to.not.have.been.called;
        expect(numberOfCreatedBadges).to.equal(0);
      });
    });

    context('when the campaign is associated to two badges', function () {
      let badge1, badge2;
      let badgeId_1, badgeId_2;
      let skillIds;
      let knowledgeElements;

      beforeEach(function () {
        badgeId_1 = Symbol('badgeId_1');
        badgeId_2 = Symbol('badgeId_2');
        skillIds = Symbol('skillIds');
        knowledgeElements = Symbol('knowledgeElements');

        badge1 = new Badge({
          id: badgeId_1,
          badgeCriteria: Symbol('badgeCriteria'),
        });
        badge2 = new Badge({
          id: badgeId_2,
          badgeCriteria: Symbol('badgeCriteria'),
        });
        badgeRepository.findByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation.id })
          .resolves([badge1, badge2]);

        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation.id })
          .resolves(skillIds);

        knowledgeElementRepository.findUniqByUserId
          .withArgs({ userId: campaignParticipation.userId })
          .resolves(knowledgeElements);
      });

      context('when only one badge requirements are fulfilled', function () {
        it('should create one badge', async function () {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ skillIds, knowledgeElements, badge: badge1 })
            .returns(true);
          badgeCriteriaService.areBadgeCriteriaFulfilled
            .withArgs({ skillIds, knowledgeElements, badge: badge2 })
            .returns(false);
          badgeAcquisitionRepository.getAcquiredBadgeIds
            .withArgs({
              badgeIds: [badge1.id],
              userId: campaignParticipation.userId,
            })
            .resolves([]);

          // when
          const numberOfCreatedBadges = await computeBadgeAcquisition({ campaignParticipation, ...dependencies });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledWithExactly({
            badgeAcquisitionsToCreate: [
              {
                badgeId: badge1.id,
                userId: campaignParticipation.userId,
                campaignParticipationId: campaignParticipation.id,
              },
            ],
          });
          expect(numberOfCreatedBadges).to.equal(1);
        });
      });

      context('when both badges requirements are fulfilled', function () {
        context('when user does not have these badges yet', function () {
          it('should create two badges', async function () {
            // given
            badgeCriteriaService.areBadgeCriteriaFulfilled
              .withArgs({ skillIds, knowledgeElements, badge: badge1 })
              .returns(true);
            badgeCriteriaService.areBadgeCriteriaFulfilled
              .withArgs({ skillIds, knowledgeElements, badge: badge2 })
              .returns(true);
            badgeAcquisitionRepository.getAcquiredBadgeIds
              .withArgs({
                badgeIds: [badge1.id, badge2.id],
                userId: campaignParticipation.userId,
              })
              .resolves([]);

            // when
            const numberOfCreatedBadges = await computeBadgeAcquisition({ campaignParticipation, ...dependencies });

            // then
            expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledWithExactly({
              badgeAcquisitionsToCreate: [
                {
                  badgeId: badge1.id,
                  userId: campaignParticipation.userId,
                  campaignParticipationId: campaignParticipation.id,
                },
                {
                  badgeId: badge2.id,
                  userId: campaignParticipation.userId,
                  campaignParticipationId: campaignParticipation.id,
                },
              ],
            });
            expect(numberOfCreatedBadges).to.equal(2);
          });
        });

        context('when user already have one badge', function () {
          it('should create the other one', async function () {
            // given
            badgeCriteriaService.areBadgeCriteriaFulfilled
              .withArgs({ skillIds, knowledgeElements, badge: badge1 })
              .returns(true);
            badgeCriteriaService.areBadgeCriteriaFulfilled
              .withArgs({ skillIds, knowledgeElements, badge: badge2 })
              .returns(true);
            badgeAcquisitionRepository.getAcquiredBadgeIds
              .withArgs({
                badgeIds: [badge1.id, badge2.id],
                userId: campaignParticipation.userId,
              })
              .resolves([badge1.id]);

            // when
            const numberOfCreatedBadges = await computeBadgeAcquisition({ campaignParticipation, ...dependencies });

            // then
            expect(badgeAcquisitionRepository.createOrUpdate).to.have.been.calledWithExactly({
              badgeAcquisitionsToCreate: [
                {
                  badgeId: badge2.id,
                  userId: campaignParticipation.userId,
                  campaignParticipationId: campaignParticipation.id,
                },
              ],
            });
            expect(numberOfCreatedBadges).to.equal(1);
          });
        });
      });
    });

    context('when the campaign is not associated to a badge', function () {
      it('should not create a badge', async function () {
        // given
        badgeRepository.findByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation.id })
          .resolves([]);

        // when
        const numberOfCreatedBadges = await computeBadgeAcquisition({ campaignParticipation, ...dependencies });

        // then
        expect(badgeAcquisitionRepository.createOrUpdate).to.not.have.been.called;
        expect(numberOfCreatedBadges).to.equal(0);
      });
    });

    context('when dry-run option is provided', function () {
      let badge;
      let skillIds;
      let knowledgeElements;
      let badgeId;

      beforeEach(function () {
        badgeId = Symbol('badgeId');
        skillIds = Symbol('skillIds');
        knowledgeElements = Symbol('knowledgeElements');

        badge = new Badge({
          id: badgeId,
          badgeCriteria: Symbol('badgeCriteria'),
        });
        badgeRepository.findByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation.id })
          .resolves([badge]);

        campaignRepository.findSkillIdsByCampaignParticipationId
          .withArgs({ campaignParticipationId: campaignParticipation.id })
          .resolves(skillIds);

        knowledgeElementRepository.findUniqByUserId
          .withArgs({ userId: campaignParticipation.userId })
          .resolves(knowledgeElements);
      });

      context('when badge requirements are fulfilled and return number of badge created', function () {
        it('should not create a badge but should return number of supposedly created badges', async function () {
          // given
          badgeCriteriaService.areBadgeCriteriaFulfilled.withArgs({ skillIds, knowledgeElements, badge }).returns(true);
          badgeAcquisitionRepository.getAcquiredBadgeIds.resolves([]);

          // when
          const numberOfSupposedlyCreatedBadges = await computeBadgeAcquisition({
            campaignParticipation,
            dryRun: true,
            ...dependencies,
          });

          // then
          expect(badgeAcquisitionRepository.createOrUpdate).to.have.not.been.called;
          expect(numberOfSupposedlyCreatedBadges).to.equal(1);
        });
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
          titleFrFr: 'area1_Title',
          color: 'someColor',
          competences: [
            {
              id: 'competenceId',
              nameFrFr: 'Mener une recherche et une veille d’information',
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
      listSkill.forEach((skillId) => databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId }));
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web1', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web2', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web3', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web4', status: 'invalidated' });

      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
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

      const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
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
        badgeCriteriaService,
        badgeAcquisitionRepository,
        badgeRepository,
        knowledgeElementRepository,
        campaignRepository,
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
