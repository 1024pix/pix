const {
  expect,
  databaseBuilder,
  domainBuilder,
  mockLearningContent,
  learningContentBuilder,
} = require('../../../test-helper');
const badgeForCalculationRepository = require('../../../../lib/infrastructure/repositories/badge-for-calculation-repository');
const BadgeCriterion = require('../../../../lib/domain/models/BadgeCriterion');

describe('Integration | Repository | BadgeForCalculation', function () {
  const campaignSkillsId = [
    'recSkillA_1',
    'recSkillA_3',
    'recSkillA_4',
    'recSkillA_6',
    'recSkillB_2',
    'recSkillB_3',
    'recSkillB_4',
    'recSkillB_5',
  ];
  let targetProfileId, campaignId;
  beforeEach(function () {
    const learningContent = [
      {
        id: 'recFramework1',
        name: 'monFramework',
        areas: [
          {
            id: 'recArea',
            competences: [
              {
                id: 'recCompetence',
                thematics: [
                  {
                    id: 'recThematic',
                    tubes: [
                      {
                        id: 'recTubeA',
                        skills: [
                          {
                            id: 'recSkillA_1',
                            status: 'actif',
                            level: 1,
                          },
                          {
                            id: 'recSkillA_3',
                            status: 'actif',
                            level: 3,
                          },
                          {
                            id: 'recSkillA_4',
                            status: 'actif',
                            level: 4,
                          },
                          {
                            id: 'recSkillA_6',
                            status: 'actif',
                            level: 6,
                          },
                          {
                            id: 'recSkillA_7',
                            status: 'actif',
                            level: 7,
                          },
                        ],
                      },
                      {
                        id: 'recTubeB',
                        skills: [
                          {
                            id: 'recSkillB_2',
                            status: 'actif',
                            level: 2,
                          },
                          {
                            id: 'recSkillB_3',
                            status: 'actif',
                            level: 3,
                          },
                          {
                            id: 'recSkillB_4',
                            status: 'actif',
                            level: 4,
                          },
                          {
                            id: 'recSkillB_5',
                            status: 'actif',
                            level: 5,
                          },
                        ],
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
    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);
    targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
    campaignSkillsId.map((skillId) => {
      databaseBuilder.factory.buildCampaignSkill({
        campaignId,
        skillId,
      });
    });
    return databaseBuilder.commit();
  });

  describe('#findByCampaignParticipationId', function () {
    it('should return a BadgeForCalculation with criteria', async function () {
      // given
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      const expectedBadgeForCalculation1 = _buildBadgeWithCampaignParticipationAndCappedTubes(
        targetProfileId,
        campaignSkillsId
      );
      const expectedBadgeForCalculation2 = _buildBadgeWithSkillSetsAndCampaignParticipationCriteria(
        targetProfileId,
        campaignSkillsId
      );
      await databaseBuilder.commit();

      // when
      const actualBadgesForCalculation = await badgeForCalculationRepository.findByCampaignParticipationId({
        campaignParticipationId,
      });

      // then
      expect(actualBadgesForCalculation).to.deepEqualArray([
        expectedBadgeForCalculation1,
        expectedBadgeForCalculation2,
      ]);
    });
  });
  describe('#findByCampaignId', function () {
    it('should return a BadgeForCalculation with criteria', async function () {
      // given
      const expectedBadgeForCalculation1 = _buildBadgeWithCampaignParticipationAndCappedTubes(
        targetProfileId,
        campaignSkillsId
      );
      const expectedBadgeForCalculation2 = _buildBadgeWithSkillSetsAndCampaignParticipationCriteria(
        targetProfileId,
        campaignSkillsId
      );
      _buildBadgeWithUnrealisableCriteria(targetProfileId, campaignSkillsId);
      await databaseBuilder.commit();

      // when
      const actualBadgesForCalculation = await badgeForCalculationRepository.findByCampaignId({
        campaignId,
      });

      // then
      expect(actualBadgesForCalculation).to.deepEqualArray([
        expectedBadgeForCalculation1,
        expectedBadgeForCalculation2,
      ]);
    });
  });
  describe('#getByCertifiableBadgeAcquisition', function () {
    it('should return a BadgeForCalculation with criteria', async function () {
      // given
      const expectedBadgeForCalculation1 = _buildBadgeWithCampaignParticipationAndCappedTubes(
        targetProfileId,
        campaignSkillsId
      );
      const certifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
        campaignId,
        badgeId: expectedBadgeForCalculation1.id,
      });
      await databaseBuilder.commit();

      // when
      const actualBadgeForCalculation = await badgeForCalculationRepository.getByCertifiableBadgeAcquisition({
        certifiableBadgeAcquisition,
      });

      // then
      expect(actualBadgeForCalculation).to.deepEqualInstance(expectedBadgeForCalculation1);
    });
  });
});

function _buildBadgeWithCampaignParticipationAndCappedTubes(targetProfileId, campaignSkillsId) {
  const badgeId = databaseBuilder.factory.buildBadge({
    key: 'BADGE_1_KEY',
    targetProfileId,
  }).id;
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
    threshold: 30,
    badgeId,
  });
  const cappedTubesDTO = [
    { id: 'recTubeA', level: 1 },
    { id: 'recTubeB', level: 4 },
    { id: 'recTubeC', level: 1 },
  ];
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.CAPPED_TUBES,
    threshold: 60,
    badgeId,
    cappedTubes: JSON.stringify(cappedTubesDTO),
  });
  const criterion1 = domainBuilder.buildBadgeCriterionForCalculation({
    threshold: 30,
    skillIds: campaignSkillsId,
  });
  const criterion2 = domainBuilder.buildBadgeCriterionForCalculation({
    threshold: 60,
    skillIds: ['recSkillA_1', 'recSkillB_2', 'recSkillB_3', 'recSkillB_4'],
  });
  return domainBuilder.buildBadgeForCalculation({
    id: badgeId,
    key: 'BADGE_1_KEY',
    badgeCriteria: [criterion1, criterion2],
  });
}

function _buildBadgeWithSkillSetsAndCampaignParticipationCriteria(targetProfileId, campaignSkillsId) {
  const badgeId = databaseBuilder.factory.buildBadge({
    key: 'BADGE_2_KEY',
    targetProfileId,
  }).id;
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
    threshold: 65,
    badgeId,
  });
  const skillSet1 = databaseBuilder.factory.buildSkillSet({
    skillIds: ['recSkillA_1', 'recSkillB_2'],
    badgeId,
  });
  const skillSet2 = databaseBuilder.factory.buildSkillSet({
    skillIds: ['recSkillA_4', 'recSkillB_4', 'recSkillB_5'],
    badgeId,
  });
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.SKILL_SET,
    threshold: 28,
    skillSetIds: [skillSet1.id, skillSet2.id],
    badgeId,
  });
  const criterion1 = domainBuilder.buildBadgeCriterionForCalculation({
    threshold: 65,
    skillIds: campaignSkillsId,
  });
  const criterion2 = domainBuilder.buildBadgeCriterionForCalculation({
    threshold: 28,
    skillIds: skillSet1.skillIds,
  });
  const criterion3 = domainBuilder.buildBadgeCriterionForCalculation({
    threshold: 28,
    skillIds: skillSet2.skillIds,
  });
  return domainBuilder.buildBadgeForCalculation({
    id: badgeId,
    key: 'BADGE_2_KEY',
    badgeCriteria: [criterion1, criterion2, criterion3],
  });
}

function _buildBadgeWithUnrealisableCriteria(targetProfileId) {
  const badgeId = databaseBuilder.factory.buildBadge({
    key: 'BADGE_3_KEY',
    targetProfileId,
  }).id;
  const cappedTubesDTO = [{ id: 'recTubeC', level: 1 }];
  databaseBuilder.factory.buildBadgeCriterion({
    scope: BadgeCriterion.SCOPES.CAPPED_TUBES,
    threshold: 60,
    badgeId,
    cappedTubes: JSON.stringify(cappedTubesDTO),
  });
  return null;
}
