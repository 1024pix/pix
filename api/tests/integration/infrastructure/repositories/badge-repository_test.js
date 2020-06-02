const { expect, databaseBuilder, knex } = require('../../../test-helper');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');
const Badge = require('../../../../lib/domain/models/Badge');
const BadgeCriterion = require('../../../../lib/domain/models/BadgeCriterion');
const BadgePartnerCompetence = require('../../../../lib/domain/models/BadgePartnerCompetence');

describe('Integration | Repository | Badge', () => {

  let targetProfileWithPartnerCompetences;
  let targetProfileWithoutBadgePartnerCompetences;
  let targetProfileWithoutBadge;
  let targetProfileWithSeveralBadges;

  let badgeWithoutBadgePartnerCompetences;
  let badgeWithBadgePartnerCompetences;
  let badgeCriterionForBadgeWithPartnerCompetences;
  let badgePartnerCompetence_1;
  let badgePartnerCompetence_2;
  let badgeWithSameTargetProfile_1;
  let badgeWithSameTargetProfile_2;
  let badgeCriterionForBadgeWithSameTargetProfile_1;
  let badgeCriterionForBadgeWithSameTargetProfile_2;

  beforeEach(async () => {
    targetProfileWithoutBadgePartnerCompetences = databaseBuilder.factory.buildTargetProfile();
    targetProfileWithoutBadge = databaseBuilder.factory.buildTargetProfile();
    badgeWithoutBadgePartnerCompetences = databaseBuilder.factory.buildBadge({
      id: 1,
      altMessage: 'You won the Banana badge!',
      imageUrl: '/img/banana.svg',
      key: 'BANANA',
      message: 'Congrats, you won the Banana badge!',
      targetProfileId: targetProfileWithoutBadgePartnerCompetences.id,
    });
    setupTargetProfileWithPartnerCompetences();
    setupTargetProfileWithSeveralBadges();

    await databaseBuilder.commit();
  });

  function setupTargetProfileWithPartnerCompetences() {
    targetProfileWithPartnerCompetences = databaseBuilder.factory.buildTargetProfile();

    badgeWithBadgePartnerCompetences = databaseBuilder.factory.buildBadge({
      id: 2,
      altMessage: 'You won the Toto badge!',
      imageUrl: '/img/toto.svg',
      message: 'Congrats, you won the Toto badge!',
      key: 'TOTO',
      targetProfileId: targetProfileWithPartnerCompetences.id,
    });

    badgePartnerCompetence_1 = {
      id: 1,
      color: 'jaffa',
      name: 'Idenfier des éléments',
      skillIds: ['recA1B2', 'recC3D4'],
      badgeId: badgeWithBadgePartnerCompetences.id,
    };

    badgePartnerCompetence_2 = {
      id: 2,
      color: null,
      name: 'Rechercher des éléments',
      skillIds: ['recABC1', 'recDEF2'],
      badgeId: badgeWithBadgePartnerCompetences.id,
    };

    badgeCriterionForBadgeWithPartnerCompetences = {
      id: 123,
      scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
      threshold: 53,
    };

    databaseBuilder.factory.buildBadgeCriterion({ ...badgeCriterionForBadgeWithPartnerCompetences, badgeId: badgeWithBadgePartnerCompetences.id });
    databaseBuilder.factory.buildBadgePartnerCompetence(badgePartnerCompetence_1);
    databaseBuilder.factory.buildBadgePartnerCompetence(badgePartnerCompetence_2);
  }

  function setupTargetProfileWithSeveralBadges() {
    targetProfileWithSeveralBadges = databaseBuilder.factory.buildTargetProfile();

    badgeWithSameTargetProfile_1 = databaseBuilder.factory.buildBadge({
      id: 3,
      altMessage: 'You won the YELLOW badge!',
      imageUrl: '/img/toto.svg',
      message: 'Congrats, you won the yellow badge!',
      key: 'YELLOW',
      targetProfileId: targetProfileWithSeveralBadges.id,
    });
    badgeCriterionForBadgeWithSameTargetProfile_1 = {
      id: 456,
      scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
      threshold: 88,
    };
    databaseBuilder.factory.buildBadgeCriterion({ ...badgeCriterionForBadgeWithSameTargetProfile_1, badgeId: badgeWithSameTargetProfile_1.id });

    badgeWithSameTargetProfile_2 =  databaseBuilder.factory.buildBadge({
      id: 4,
      altMessage: 'You won the GREEN badge!',
      imageUrl: '/img/toto.svg',
      message: 'Congrats, you won the green badge!',
      key: 'GREEN',
      targetProfileId: targetProfileWithSeveralBadges.id,
    });
    badgeCriterionForBadgeWithSameTargetProfile_2 = ({
      id: 789,
      scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
      threshold: 35
    });
    databaseBuilder.factory.buildBadgeCriterion({ ...badgeCriterionForBadgeWithSameTargetProfile_2, badgeId: badgeWithSameTargetProfile_2.id });
  }

  afterEach(() => {
    knex('badges').delete();
    knex('badge-criteria').delete();
    return knex('badge-partner-competences').delete();
  });

  describe('#findByTargetProfileId', () => {

    it('should return two badges for same target profile', async function() {
      // given
      const targetProfileId = targetProfileWithSeveralBadges.id;

      // when
      const badges = await badgeRepository.findByTargetProfileId(targetProfileId);

      expect(badges.length).to.equal(2);
      expect(badges[0]).to.deep.equal({
        ...badgeWithSameTargetProfile_2,
        badgeCriteria: [ badgeCriterionForBadgeWithSameTargetProfile_2 ],
        badgePartnerCompetences: [],
      });
      expect(badges[1]).to.deep.equal({
        ...badgeWithSameTargetProfile_1,
        badgeCriteria: [ badgeCriterionForBadgeWithSameTargetProfile_1 ],
        badgePartnerCompetences: [],
      });
    });

    it('should return the badge linked to the given target profile with related badge criteria and badge partner competences', async () => {
      // given
      const targetProfileId = targetProfileWithPartnerCompetences.id;

      // when
      const badges = await badgeRepository.findByTargetProfileId(targetProfileId);

      // then
      expect(badges.length).to.equal(1);
      expect(badges[0]).to.be.an.instanceOf(Badge);
      expect(badges[0].badgeCriteria[0]).to.be.an.instanceOf(BadgeCriterion);
      expect(badges[0].badgePartnerCompetences[0]).to.be.an.instanceOf(BadgePartnerCompetence);
      expect(badges[0]).to.deep.equal({
        ...badgeWithBadgePartnerCompetences,
        badgeCriteria: [ badgeCriterionForBadgeWithPartnerCompetences ],
        badgePartnerCompetences: [ badgePartnerCompetence_1, badgePartnerCompetence_2 ],
      });
    });

    it('should return an empty array when the given target profile has no badges', async function() {
      // given
      const targetProfileId = targetProfileWithoutBadge.id;

      // when
      const badges = await badgeRepository.findByTargetProfileId(targetProfileId);

      // then
      expect(badges.length).to.equal(0);
    });
  });

  describe('#findOneByKey', () => {

    it('should return the badge linked to the given key with empty badge partner competences array', async () => {
      // given
      const key = badgeWithoutBadgePartnerCompetences.key;

      // when
      const badgeReturned = await badgeRepository.findOneByKey(key);

      // then
      expect(badgeReturned).to.be.an.instanceOf(Badge);
      expect(badgeReturned).to.deep.equal({
        ...badgeWithoutBadgePartnerCompetences,
        badgeCriteria: [],
        badgePartnerCompetences: [],
      });
    });

    it('should return the badge linked to the given target profile with related badge partner competences', async () => {
      // given
      const key = badgeWithBadgePartnerCompetences.key;

      // when
      const badgeReturned = await badgeRepository.findOneByKey(key);

      // then
      expect(badgeReturned).to.be.an.instanceOf(Badge);
      expect(badgeReturned.badgePartnerCompetences[0]).to.be.an.instanceOf(BadgePartnerCompetence);
      expect(badgeReturned).to.deep.equal({
        ...badgeWithBadgePartnerCompetences,
        badgeCriteria: [ badgeCriterionForBadgeWithPartnerCompetences ],
        badgePartnerCompetences: [ badgePartnerCompetence_1, badgePartnerCompetence_2 ],
      });
    });

    it('should return an empty array when the given target profile has no badges', async () => {
      // given
      const key = Symbol('AnotherBadge');

      // when
      const badge = await badgeRepository.findOneByKey(key);

      // then
      expect(badge).to.equal(null);
    });
  });
});
