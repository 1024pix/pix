import {
  expect,
  databaseBuilder,
  mockLearningContent,
  learningContentBuilder,
  domainBuilder,
} from '../../../test-helper';

import DomainTransaction from '../../../../lib/infrastructure/DomainTransaction';
import certificationBadgesService from '../../../../lib/domain/services/certification-badges-service';

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

describe('Integration | Service | Certification-Badges Service', function () {
  describe('#findStillValidBadgeAcquisitions', function () {
    it('should return one badgeAcquisition', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();

      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

      const badge = databaseBuilder.factory.buildBadge.certifiable({ targetProfileId: targetProfileId });

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
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web1', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web2', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web3', status: 'validated' });
      databaseBuilder.factory.buildKnowledgeElement({ userId, skillId: 'web4', status: 'invalidated' });

      databaseBuilder.factory.buildBadgeCriterion({
        scope: 'CampaignParticipation',
        badgeId: badge.id,
        threshold: 40,
      });
      await databaseBuilder.commit();
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
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
  });
});
