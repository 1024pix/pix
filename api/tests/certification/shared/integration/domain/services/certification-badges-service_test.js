import * as certificationBadgesService from '../../../../../../src/certification/shared/domain/services/certification-badges-service.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { buildLearningContent as learningContentBuilder } from '../../../../../tooling/learning-content-builder/index.js';

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
                level: 1,
                challenges: [],
              },
              {
                id: listSkill[1],
                nom: '@web2',
                status: 'actif',
                level: 2,
                challenges: [],
              },
              {
                id: listSkill[2],
                nom: '@web3',
                status: 'actif',
                level: 3,
                challenges: [],
              },
              {
                id: listSkill[3],
                nom: '@web4',
                status: 'actif',
                level: 4,
                challenges: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

/**
 * Fait répondre l'utilisateur aux acquis donnés.
 *
 * L'historique s'exprime en réponses : c'est la seule source qui les situe dans
 * le temps, l'état de connaissance ne décrivant que le présent.
 */
const _answer = ({ skillIds = [], userId, isOk, createdAt = new Date() }) => {
  const assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
  skillIds.forEach((skillId) => {
    databaseBuilder.factory.buildAnsweredSkill({ userId, assessmentId, skillId, isOk, createdAt, withSkill: false });
  });
};

/**
 * Le référentiel se déclare avant l'historique : c'est lui qui situe chaque
 * acquis sur son tube et à son niveau.
 */
const _buildReferential = () =>
  databaseBuilder.factory.learningContent.build(learningContentBuilder.fromAreas(learningContent));

describe('Integration | Service | Certification-Badges Service', function () {
  describe('#findStillValidBadgeAcquisitions', function () {
    it('should return one badgeAcquisition', async function () {
      // given
      _buildReferential();
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

      _answer({ skillIds: ['web1', 'web2', 'web3'], userId, isOk: true });
      _answer({ skillIds: ['web4'], userId, isOk: false });

      databaseBuilder.factory.buildBadgeCriterion({
        scope: 'CampaignParticipation',
        badgeId: badge.id,
        threshold: 40,
      });
      await databaseBuilder.commit();

      // when
      const badgeAcquisitions = await DomainTransaction.execute(async () => {
        return certificationBadgesService.findStillValidBadgeAcquisitions({ userId });
      });

      // then
      const expectedCertifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
        badgeId: badge.id,
        badgeKey: badge.key,
        campaignId,
        complementaryCertificationId: complementaryCertification.id,
        complementaryCertificationKey: complementaryCertification.key,
        complementaryCertificationBadgeId: complementaryCertificationBadge.id,
        complementaryCertificationBadgeLabel: badge.altMessage,
        complementaryCertificationBadgeImageUrl: badge.imageUrl,
      });
      expect(badgeAcquisitions).to.deepEqualArray([expectedCertifiableBadgeAcquisition]);
    });

    context('when a reset cancelled the current badge acquisition', function () {
      context('when a limit date is after the reset (now by default)', function () {
        it('should return no badge acquisition', async function () {
          // given
          _buildReferential();
          const { id: userId } = databaseBuilder.factory.buildUser();

          const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

          const badge = databaseBuilder.factory.buildBadge.certifiable({ targetProfileId: targetProfileId });

          const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
          listSkill.forEach((skillId) => databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId }));
          const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;

          databaseBuilder.factory.buildBadgeAcquisition({ userId, badgeId: badge.id, campaignParticipationId });

          const beforeResetDate = new Date('2022-01-01');
          _answer({ skillIds: ['web1', 'web2', 'web3'], userId, isOk: true, createdAt: beforeResetDate });
          _answer({ skillIds: ['web4'], userId, isOk: false, createdAt: beforeResetDate });

          databaseBuilder.factory.buildKnowledgeReset({
            userId,
            competenceId: 'competenceId',
            resetAt: new Date('2023-01-01'),
          });

          databaseBuilder.factory.buildBadgeCriterion({
            scope: 'CampaignParticipation',
            badgeId: badge.id,
            threshold: 40,
          });
          await databaseBuilder.commit();

          // when
          const badgeAcquisitions = await DomainTransaction.execute(async () => {
            return certificationBadgesService.findStillValidBadgeAcquisitions({ userId });
          });

          // then
          expect(badgeAcquisitions).to.be.empty;
        });
      });

      context('when a limit date is before the reset', function () {
        // La remise à zéro efface l'état sans en garder trace : il n'existe
        // plus rien à relire, même à une date antérieure. Pour que la
        // certification lise le profil du rattachement malgré une remise à
        // zéro survenue ensuite, il faudrait le figer au rattachement, comme
        // le partage de campagne fige le sien.
        it('should return no badge acquisition either', async function () {
          // given
          _buildReferential();
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

          _answer({ skillIds: ['web1', 'web2', 'web3'], userId, isOk: true, createdAt: beforeResetDate });

          databaseBuilder.factory.buildKnowledgeReset({ userId, competenceId: 'competenceId', resetAt: resetDate });

          databaseBuilder.factory.buildBadgeCriterion({
            badgeId: badge.id,
            threshold: 40,
          });
          await databaseBuilder.commit();

          // when
          const badgeAcquisitions = await DomainTransaction.execute(async () => {
            return certificationBadgesService.findStillValidBadgeAcquisitions({
              userId,
              limitDate: new Date('2022-01-02'),
            });
          });

          // then
          expect(badgeAcquisitions).to.be.empty;
        });
      });
    });
  });
});
