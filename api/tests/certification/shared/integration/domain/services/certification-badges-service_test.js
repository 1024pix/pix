import * as certificationBadgesService from '../../../../../../src/certification/shared/domain/services/certification-badges-service.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import {
  databaseBuilder,
  domainBuilder,
  expect,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../../test-helper.js';

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

const _buildKnowledgeElements = ({ skillIds = [], userId, status, createdAt = new Date() }) => {
  skillIds.forEach((skillId) => {
    databaseBuilder.factory.buildKnowledgeElement({ userId, skillId, status, createdAt });
  });
};

describe('Integration | Service | Certification-Badges Service', function () {
  describe('#findStillValidBadgeAcquisitions', function () {
    it('should return one badgeAcquisition', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();

      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

      const badge = databaseBuilder.factory.buildBadge.certifiable({ targetProfileId });

      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      listSkill.forEach((skillId) => databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId }));
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;

      databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId: badge.id, campaignParticipationId });
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      const complementaryCertificationBadge = databaseBuilder.factory.buildComplementaryCertificationBadge({
        userId,
        badgeId: badge.id,
        complementaryCertificationId: complementaryCertification.id,
        level: 2,
      });

      _buildKnowledgeElements({ skillIds: ['web1', 'web2', 'web3'], userId, status: 'validated' });
      _buildKnowledgeElements({ skillIds: ['web4'], userId, status: 'invalidated' });

      databaseBuilder.factory.buildBadgeCriterion({
        scope: 'CampaignParticipation',
        badgeId: badge.id,
        threshold: 40,
      });
      await databaseBuilder.commit();
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);

      // when
      const badgeAcquisitions = await DomainTransaction.execute(async (domainTransaction) => {
        return certificationBadgesService.findStillValidBadgeAcquisitions({ userId, domainTransaction });
      });

      // then
      const expectedCertifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
        badgeId: badge.id,
        badgeKey: badge.key,
        campaignId,
        complementaryCertificationId: complementaryCertification.id,
        complementaryCertificationKey: complementaryCertification.key,
        complementaryCertificationBadgeId: complementaryCertificationBadge.id,
        complementaryCertificationBadgeLabel: complementaryCertificationBadge.label,
        complementaryCertificationBadgeImageUrl: complementaryCertificationBadge.imageUrl,
      });
      expect(badgeAcquisitions).to.deepEqualArray([expectedCertifiableBadgeAcquisition]);
    });

    context('when a reset cancelled the current badge acquisition', function () {
      context('when a limit date is after the reset (now by default)', function () {
        it('should return no badge acquisition', async function () {
          // given
          const { id: userId } = databaseBuilder.factory.buildUser();

          const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

          const badge = databaseBuilder.factory.buildBadge.certifiable({ targetProfileId: targetProfileId });

          const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
          listSkill.forEach((skillId) => databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId }));
          const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;

          databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId: badge.id, campaignParticipationId });

          const beforeResetDate = new Date('2022-01-01');
          _buildKnowledgeElements({
            skillIds: ['web1', 'web2', 'web3'],
            userId,
            status: 'validated',
            createdAt: beforeResetDate,
          });

          const resetDate = new Date();
          _buildKnowledgeElements({
            skillIds: ['web1', 'web2', 'web3'],
            userId,
            status: 'reset',
            createdAt: resetDate,
          });

          _buildKnowledgeElements({ skillIds: ['web4'], userId, status: 'invalidated' });

          databaseBuilder.factory.buildBadgeCriterion({
            scope: 'CampaignParticipation',
            badgeId: badge.id,
            threshold: 40,
          });
          await databaseBuilder.commit();
          const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
          mockLearningContent(learningContentObjects);

          // when
          const badgeAcquisitions = await DomainTransaction.execute(async (domainTransaction) => {
            return certificationBadgesService.findStillValidBadgeAcquisitions({ userId, domainTransaction });
          });

          // then
          expect(badgeAcquisitions).to.be.empty;
        });
      });

      context('when a limit date is before the reset', function () {
        it('should return one badge acquisition', async function () {
          // given
          const { id: userId } = databaseBuilder.factory.buildUser();

          const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

          const badge = databaseBuilder.factory.buildBadge.certifiable({ targetProfileId });

          const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
          listSkill.forEach((skillId) => databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId }));
          const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;

          const beforeResetDate = new Date('2022-01-01');
          const resetDate = new Date('2023-01-01');

          databaseBuilder.factory.buildBadgeAcquisition({
            userId,
            badgeId: badge.id,
            campaignParticipationId,
            createdAt: beforeResetDate,
          });
          const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
          databaseBuilder.factory.buildComplementaryCertificationBadge({
            userId,
            badgeId: badge.id,
            complementaryCertificationId: complementaryCertification.id,
            level: 2,
          });

          _buildKnowledgeElements({
            skillIds: ['web1', 'web2', 'web3'],
            userId,
            status: 'validated',
            createdAt: beforeResetDate,
          });

          _buildKnowledgeElements({
            skillIds: ['web1', 'web2', 'web3'],
            userId,
            status: 'reset',
            createdAt: resetDate,
          });

          databaseBuilder.factory.buildBadgeCriterion({
            badgeId: badge.id,
            threshold: 40,
          });
          await databaseBuilder.commit();
          const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
          mockLearningContent(learningContentObjects);

          // when
          const badgeAcquisitions = await DomainTransaction.execute(async (domainTransaction) => {
            return certificationBadgesService.findStillValidBadgeAcquisitions({
              userId,
              limitDate: new Date('2022-01-02'),
              domainTransaction,
            });
          });

          // then
          expect(badgeAcquisitions).not.to.be.empty;
        });
      });
    });
  });
});
