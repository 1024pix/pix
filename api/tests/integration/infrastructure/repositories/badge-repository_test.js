const { expect, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');
const Badge = require('../../../../lib/domain/models/Badge');
const BadgeCriterion = require('../../../../lib/domain/models/BadgeCriterion');
const BadgePartnerCompetence = require('../../../../lib/domain/models/BadgePartnerCompetence');
const omit = require('lodash/omit');
const { AlreadyExistingEntityError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Badge', function () {
  let targetProfileWithPartnerCompetences;
  let targetProfileWithoutBadge;
  let targetProfileWithSeveralBadges;

  let badgeWithBadgePartnerCompetences;
  let badgeCriterionForBadgeWithPartnerCompetences;
  let badgePartnerCompetence_1;
  let badgePartnerCompetence_2;
  let badgeWithSameTargetProfile_1;
  let badgeWithSameTargetProfile_2;
  let badgeCriterionForBadgeWithSameTargetProfile_1;
  let badgeCriterionForBadgeWithSameTargetProfile_2;

  beforeEach(async function () {
    targetProfileWithoutBadge = databaseBuilder.factory.buildTargetProfile();
    setupTargetProfileWithPartnerCompetences();
    setupTargetProfileWithSeveralBadges();

    await databaseBuilder.commit();
  });

  function setupTargetProfileWithPartnerCompetences() {
    targetProfileWithPartnerCompetences = databaseBuilder.factory.buildTargetProfile();

    badgeWithBadgePartnerCompetences = databaseBuilder.factory.buildBadge({
      altMessage: 'You won the Toto badge!',
      imageUrl: '/img/toto.svg',
      message: 'Congrats, you won the Toto badge!',
      key: 'TOTO',
      targetProfileId: targetProfileWithPartnerCompetences.id,
    });

    badgePartnerCompetence_1 = {
      id: 1,
      name: 'Idenfier des éléments',
      skillIds: ['recA1B2', 'recC3D4'],
    };

    badgePartnerCompetence_2 = {
      id: 2,
      name: 'Rechercher des éléments',
      skillIds: ['recABC1', 'recDEF2'],
    };

    badgeCriterionForBadgeWithPartnerCompetences = {
      id: 123,
      scope: BadgeCriterion.SCOPES.SKILL_SET,
      threshold: 53,
      partnerCompetenceIds: [1, 2],
    };

    databaseBuilder.factory.buildBadgeCriterion({
      ...badgeCriterionForBadgeWithPartnerCompetences,
      badgeId: badgeWithBadgePartnerCompetences.id,
    });
    databaseBuilder.factory.buildBadgePartnerCompetence({
      ...badgePartnerCompetence_1,
      badgeId: badgeWithBadgePartnerCompetences.id,
    });
    databaseBuilder.factory.buildBadgePartnerCompetence({
      ...badgePartnerCompetence_2,
      badgeId: badgeWithBadgePartnerCompetences.id,
    });
  }

  function setupTargetProfileWithSeveralBadges() {
    targetProfileWithSeveralBadges = databaseBuilder.factory.buildTargetProfile();

    badgeWithSameTargetProfile_1 = databaseBuilder.factory.buildBadge({
      altMessage: 'You won the YELLOW badge!',
      imageUrl: '/img/toto.svg',
      message: 'Congrats, you won the yellow badge!',
      key: 'YELLOW',
      targetProfileId: targetProfileWithSeveralBadges.id,
    });
    badgeCriterionForBadgeWithSameTargetProfile_1 = {
      id: 456,
      scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
      threshold: 88,
      partnerCompetenceIds: [],
    };
    databaseBuilder.factory.buildBadgeCriterion({
      ...badgeCriterionForBadgeWithSameTargetProfile_1,
      badgeId: badgeWithSameTargetProfile_1.id,
    });

    badgeWithSameTargetProfile_2 = databaseBuilder.factory.buildBadge({
      altMessage: 'You won the GREEN badge!',
      imageUrl: '/img/toto.svg',
      message: 'Congrats, you won the green badge!',
      key: 'GREEN',
      targetProfileId: targetProfileWithSeveralBadges.id,
    });
    badgeCriterionForBadgeWithSameTargetProfile_2 = {
      id: 789,
      scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
      threshold: 35,
      partnerCompetenceIds: [],
    };
    databaseBuilder.factory.buildBadgeCriterion({
      ...badgeCriterionForBadgeWithSameTargetProfile_2,
      badgeId: badgeWithSameTargetProfile_2.id,
    });
  }

  afterEach(async function () {
    await knex('badge-partner-competences').delete();
    await knex('badge-criteria').delete();
    await knex('badges').delete();
  });

  describe('#findByTargetProfileId', function () {
    it('should return two badges for same target profile', async function () {
      // given
      const targetProfileId = targetProfileWithSeveralBadges.id;

      // when
      const badges = await badgeRepository.findByTargetProfileId(targetProfileId);

      expect(badges.length).to.equal(2);

      const firstBadge = badges.find(({ id }) => id === badgeWithSameTargetProfile_1.id);
      expect(omit(firstBadge, 'id')).deep.equal(
        omit(
          {
            ...badgeWithSameTargetProfile_1,
            badgeCriteria: [badgeCriterionForBadgeWithSameTargetProfile_1],
            badgePartnerCompetences: [],
          },
          'id'
        )
      );

      const secondBadge = badges.find(({ id }) => id === badgeWithSameTargetProfile_2.id);
      expect(omit(secondBadge, 'id')).deep.equal(
        omit(
          {
            ...badgeWithSameTargetProfile_2,
            badgeCriteria: [badgeCriterionForBadgeWithSameTargetProfile_2],
            badgePartnerCompetences: [],
          },
          'id'
        )
      );
    });

    it('should return the badge linked to the given target profile with related badge criteria and badge partner competences', async function () {
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
        badgeCriteria: [badgeCriterionForBadgeWithPartnerCompetences],
        badgePartnerCompetences: [badgePartnerCompetence_1, badgePartnerCompetence_2],
      });
    });

    it('should return an empty array when the given target profile has no badges', async function () {
      // given
      const targetProfileId = targetProfileWithoutBadge.id;

      // when
      const badges = await badgeRepository.findByTargetProfileId(targetProfileId);

      // then
      expect(badges.length).to.equal(0);
    });
  });

  describe('#findByCampaignId', function () {
    it('should return two badges for same target profile', async function () {
      // given
      const targetProfileId = targetProfileWithSeveralBadges.id;
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      await databaseBuilder.commit();

      // when
      const badges = await badgeRepository.findByCampaignId(campaignId);

      // then
      expect(badges).to.have.length(2);

      const firstBadge = badges.find(({ id }) => id === badgeWithSameTargetProfile_1.id);
      expect(firstBadge).deep.equal({
        ...badgeWithSameTargetProfile_1,
        badgeCriteria: [badgeCriterionForBadgeWithSameTargetProfile_1],
        badgePartnerCompetences: [],
      });

      const secondBadge = badges.find(({ id }) => id === badgeWithSameTargetProfile_2.id);
      expect(secondBadge).deep.equal({
        ...badgeWithSameTargetProfile_2,
        badgeCriteria: [badgeCriterionForBadgeWithSameTargetProfile_2],
        badgePartnerCompetences: [],
      });
    });

    it('should return the badge linked to the given campaign with related badge criteria and badge partner competences', async function () {
      // given
      const targetProfileId = targetProfileWithPartnerCompetences.id;
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      await databaseBuilder.commit();

      // when
      const badges = await badgeRepository.findByCampaignId(campaignId);

      // then
      expect(badges).to.have.lengthOf(1);
      expect(badges[0]).to.be.an.instanceOf(Badge);
      expect(badges[0].badgeCriteria[0]).to.be.an.instanceOf(BadgeCriterion);
      expect(badges[0].badgePartnerCompetences[0]).to.be.an.instanceOf(BadgePartnerCompetence);
      expect(badges[0]).to.deep.equal({
        ...badgeWithBadgePartnerCompetences,
        badgeCriteria: [badgeCriterionForBadgeWithPartnerCompetences],
        badgePartnerCompetences: [badgePartnerCompetence_1, badgePartnerCompetence_2],
      });
    });

    it('should return an empty array when the given campaign has no badges', async function () {
      // given
      const targetProfileId = targetProfileWithoutBadge.id;
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      await databaseBuilder.commit();

      // when
      const badges = await badgeRepository.findByCampaignId(campaignId);

      // then
      expect(badges).to.have.lengthOf(0);
    });

    it('should not return a badge from another campaign', async function () {
      // given
      const targetProfileId = targetProfileWithSeveralBadges.id;
      databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      const anotherCampaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();

      // when
      const badges = await badgeRepository.findByCampaignId(anotherCampaignId);

      // then
      expect(badges).to.have.lengthOf(0);
    });
  });

  describe('#findByCampaignParticipationId', function () {
    beforeEach(function () {
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildBadge({ targetProfileId, key: 'mille_feuilles' });
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId });
      return databaseBuilder.commit();
    });

    it('should return the badges linked to the target profile of the given campaign participation', async function () {
      // given
      const targetProfileId = targetProfileWithSeveralBadges.id;
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      // when
      const badges = await badgeRepository.findByCampaignParticipationId(campaignParticipationId);

      expect(badges.length).to.equal(2);

      const firstBadge = badges.find(({ id }) => id === badgeWithSameTargetProfile_1.id);
      expect(firstBadge).deep.equal({
        ...badgeWithSameTargetProfile_1,
        badgeCriteria: [badgeCriterionForBadgeWithSameTargetProfile_1],
        badgePartnerCompetences: [],
      });

      const secondBadge = badges.find(({ id }) => id === badgeWithSameTargetProfile_2.id);
      expect(secondBadge).deep.equal({
        ...badgeWithSameTargetProfile_2,
        badgeCriteria: [badgeCriterionForBadgeWithSameTargetProfile_2],
        badgePartnerCompetences: [],
      });
    });

    it('should return the badge linked to the target profile of the given campaign participation with related badge criteria and badge partner competences', async function () {
      // given
      const targetProfileId = targetProfileWithPartnerCompetences.id;
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      // when
      const badges = await badgeRepository.findByCampaignParticipationId(campaignParticipationId);

      // then
      expect(badges.length).to.equal(1);
      expect(badges[0]).to.be.an.instanceOf(Badge);
      expect(badges[0].badgeCriteria[0]).to.be.an.instanceOf(BadgeCriterion);
      expect(badges[0].badgePartnerCompetences[0]).to.be.an.instanceOf(BadgePartnerCompetence);
      expect(badges[0]).to.deep.equal({
        ...badgeWithBadgePartnerCompetences,
        badgeCriteria: [badgeCriterionForBadgeWithPartnerCompetences],
        badgePartnerCompetences: [badgePartnerCompetence_1, badgePartnerCompetence_2],
      });
    });

    it('should return an empty array when the given target profile has no badges', async function () {
      // given
      const targetProfileId = targetProfileWithoutBadge.id;

      // when
      const badges = await badgeRepository.findByTargetProfileId(targetProfileId);

      // then
      expect(badges.length).to.equal(0);
    });
  });

  describe('#get', function () {
    let badge;

    beforeEach(async function () {
      badge = databaseBuilder.factory.buildBadge({
        id: 1,
        altMessage: 'You won the Toto badge!',
        imageUrl: 'data:,',
        message: 'Congrats, you won the Toto badge!',
        key: 'TOTO2',
      });
      databaseBuilder.factory.buildBadgeCriterion({ badgeId: badge.id });
      databaseBuilder.factory.buildBadgePartnerCompetence({ badgeId: badge.id });
      await databaseBuilder.commit();
    });

    it('should return a badge', async function () {
      const myBadge = await badgeRepository.get(badge.id);

      expect(myBadge.id).to.equal(1);
    });

    it('should return a badge with badgeCriteria and badgePartnerCompetences', async function () {
      const myBadge = await badgeRepository.get(badge.id);

      expect(myBadge.badgeCriteria.length).to.equal(1);
      expect(myBadge.badgePartnerCompetences.length).to.equal(1);
    });
  });

  describe('#getByKey', function () {
    let badge;

    beforeEach(async function () {
      badge = databaseBuilder.factory.buildBadge({
        id: 1,
        altMessage: 'You won the Toto badge!',
        imageUrl: 'data:,',
        message: 'Congrats, you won the Toto badge!',
        key: 'TOTO2',
      });
      databaseBuilder.factory.buildBadgeCriterion({ badgeId: badge.id });
      databaseBuilder.factory.buildBadgePartnerCompetence({ badgeId: badge.id });
      await databaseBuilder.commit();
    });

    it('should return a badge', async function () {
      const myBadge = await badgeRepository.getByKey(badge.key);

      expect(myBadge.id).to.equal(1);
    });

    it('should return a badge with badgeCriteria and badgePartnerCompetences', async function () {
      const myBadge = await badgeRepository.getByKey(badge.key);

      expect(myBadge.badgeCriteria.length).to.equal(1);
      expect(myBadge.badgePartnerCompetences.length).to.equal(1);
    });
  });

  describe('#save', function () {
    it('should persist badge in database', async function () {
      // given
      const badge = {
        altMessage: 'You won the Toto badge!',
        imageUrl: 'data:,',
        message: 'Congrats, you won the Toto badge!',
        key: 'TOTO230',
        badgeCriteria: [],
        badgePartnerCompetences: [],
        targetProfileId: null,
        isCertifiable: false,
        isAlwaysVisible: false,
        title: 'title',
      };

      // when
      const result = await badgeRepository.save(badge);

      // then
      expect(result).to.be.instanceOf(Badge);
      expect(omit(result, 'id')).to.deep.equal(omit(badge, 'id'));
    });

    describe('when the badge key already exists', function () {
      it('should throw an AlreadyExistingEntityError', async function () {
        // given
        const alreadyExistingBadge = {
          altMessage: 'You won the Toto badge!',
          imageUrl: 'data:,',
          message: 'Congrats, you won the Toto badge!',
          key: 'TOTO28',
          badgeCriteria: [],
          badgePartnerCompetences: [],
          targetProfileId: null,
          isCertifiable: false,
          isAlwaysVisible: true,
          title: 'title',
        };
        databaseBuilder.factory.buildBadge(alreadyExistingBadge);
        await databaseBuilder.commit();

        // when
        const error = await catchErr(badgeRepository.save)(alreadyExistingBadge);

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntityError);
      });
    });
  });

  describe('#isKeyAvailable', function () {
    it('should return true', async function () {
      // given
      const key = 'NOT_EXISTING_KEY';

      // when
      const result = await badgeRepository.isKeyAvailable(key);

      // then
      expect(result).to.be.true;
    });

    describe('when key is already exists', function () {
      it('should return AlreadyExistEntityError', async function () {
        // given
        const key = 'AN_EXISTING_KEY';
        databaseBuilder.factory.buildBadge({ key });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(badgeRepository.isKeyAvailable)(key);

        // then
        expect(error).to.instanceOf(AlreadyExistingEntityError);
      });
    });
  });
});
