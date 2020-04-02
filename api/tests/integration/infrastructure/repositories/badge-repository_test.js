const { expect, databaseBuilder, knex } = require('../../../test-helper');
const endOfParticipationBadgeQuery = require('../../../../lib/infrastructure/repositories/end-of-participation-badge-query');
const EndOfParticipationBadgeViewModel = require('../../../../lib/domain/models/EndOfParticipationBadgeViewModel');
const BadgePartnerCompetenceViewModel = require('../../../../lib/domain/models/BadgePartnerCompetenceViewModel');

describe('Integration | Repository | EndOfParticipationBadgeQuery', () => {

  describe('#findOneByTargetProfileId', () => {

    let targetProfile;
    let targetProfileWithoutBadgePartnerCompetences;
    let anotherTargetProfile;
    let badgeWithoutBadgePartnerCompetences;
    let badgeWithBadgePartnerCompetences;
    let badgePartnerCompetence_1;
    let badgePartnerCompetence_2;

    beforeEach(async () => {
      targetProfile = databaseBuilder.factory.buildTargetProfile();
      targetProfileWithoutBadgePartnerCompetences = databaseBuilder.factory.buildTargetProfile();
      anotherTargetProfile = databaseBuilder.factory.buildTargetProfile();

      badgeWithoutBadgePartnerCompetences = databaseBuilder.factory.buildBadge({
        id: 1,
        altMessage: 'You won the Banana badge!',
        imageUrl: '/img/banana.svg',
        message: 'Congrats, you won the Banana badge!',
        targetProfileId: targetProfileWithoutBadgePartnerCompetences.id,
      });

      badgeWithBadgePartnerCompetences = databaseBuilder.factory.buildBadge({
        id: 2,
        altMessage: 'You won the Toto badge!',
        imageUrl: '/img/toto.svg',
        message: 'Congrats, you won the Toto badge!',
        key: 'TOTO',
        targetProfileId: targetProfile.id,
      });

      badgePartnerCompetence_1 = {
        id: 1,
        color: 'jaffa',
        name: 'Idenfier des éléments',
        skillIds: ['recA1B2', 'recC3D4'],
      };

      badgePartnerCompetence_2 = {
        id: 2,
        color: 'jaffa',
        name: 'Rechercher des éléments',
        skillIds: ['recABC1', 'recDEF2'],
      };

      databaseBuilder.factory.buildBadgePartnerCompetence({ ...badgePartnerCompetence_1, badgeId: badgeWithBadgePartnerCompetences.id });
      databaseBuilder.factory.buildBadgePartnerCompetence({ ...badgePartnerCompetence_2, badgeId: badgeWithBadgePartnerCompetences.id });

      await databaseBuilder.commit();
    });

    afterEach(() => {
      knex('badges').delete();
      return knex('badge-partner-competences').delete();
    });

    it('should return the badge linked to the given target profile with empty badge partner competences array', async () => {
      // given
      const targetProfileId = targetProfileWithoutBadgePartnerCompetences.id;

      // when
      const badgeReturned = await endOfParticipationBadgeQuery.findOneByTargetProfileId(targetProfileId);

      // then
      expect(badgeReturned).to.be.an.instanceOf(EndOfParticipationBadgeViewModel);
      expect(badgeReturned).to.deep.equal({
        id: badgeWithoutBadgePartnerCompetences.id,
        altMessage: badgeWithoutBadgePartnerCompetences.altMessage,
        imageUrl: badgeWithoutBadgePartnerCompetences.imageUrl,
        message: badgeWithoutBadgePartnerCompetences.message,
        badgePartnerCompetences: [],
        key: badgeWithoutBadgePartnerCompetences.key
      });
    });

    it('should return the badge linked to the given target profile with related badge partner competences', async () => {
      // given
      const targetProfileId = targetProfile.id;

      // when
      const badgeReturned = await endOfParticipationBadgeQuery.findOneByTargetProfileId(targetProfileId);

      // then
      expect(badgeReturned).to.be.an.instanceOf(EndOfParticipationBadgeViewModel);
      expect(badgeReturned.badgePartnerCompetences[0]).to.be.an.instanceOf(BadgePartnerCompetenceViewModel);
      expect(badgeReturned).to.deep.equal({
        id: badgeWithBadgePartnerCompetences.id,
        altMessage: badgeWithBadgePartnerCompetences.altMessage,
        imageUrl: badgeWithBadgePartnerCompetences.imageUrl,
        message: badgeWithBadgePartnerCompetences.message,
        key: 'TOTO',
        badgePartnerCompetences: [ badgePartnerCompetence_1, badgePartnerCompetence_2 ],
      });
    });

    it('should return an empty array when the given target profile has no badges', async () => {
      // given
      const targetProfileId = anotherTargetProfile.id;

      // when
      const badge = await endOfParticipationBadgeQuery.findOneByTargetProfileId(targetProfileId);

      // then
      expect(badge).to.equal(null);
    });
  });
});
