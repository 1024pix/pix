const { expect, domainBuilder } = require('../../../test-helper');
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
} = require('../../../../lib/domain/models/Badge').keys;

describe('Unit | Domain | Models | BadgeAcquisition', function () {
  describe('#get badgeKey', function () {
    it('should return the key of the related badge', function () {
      // given
      const badge = domainBuilder.buildBadge({ id: 123, key: 'someKey' });
      const badgeAcquisition = domainBuilder.buildBadgeAcquisition({ badge, badgeId: 123 });

      // when
      const badgeKey = badgeAcquisition.badgeKey;

      // then
      expect(badgeKey).to.equal('someKey');
    });
  });

  describe('#isPixDroit', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF].forEach((badgeKey) => {
      it(`should return true for badge ${badgeKey}`, function () {
        // given
        const badgeAcquisition = domainBuilder.buildBadgeAcquisition({
          badge: domainBuilder.buildBadge({ key: badgeKey }),
        });

        // when
        const isPixDroit = badgeAcquisition.isPixDroit();

        // then
        expect(isPixDroit).to.be.true;
      });
    });

    it('should return false otherwise', function () {
      // given
      const badgeAcquisition = domainBuilder.buildBadgeAcquisition({
        badge: domainBuilder.buildBadge({ key: 'NOT_PIX_DROIT' }),
      });

      // when
      const isPixDroit = badgeAcquisition.isPixDroit();

      // then
      expect(isPixDroit).to.be.false;
    });
  });

  describe('#isPixEdu', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
    ].forEach((badgeKey) => {
      it(`should return true for badge ${badgeKey}`, function () {
        // given
        const badgeAcquisition = domainBuilder.buildBadgeAcquisition({
          badge: domainBuilder.buildBadge({ key: badgeKey }),
        });

        // when
        const isPixEdu = badgeAcquisition.isPixEdu();

        // then
        expect(isPixEdu).to.be.true;
      });
    });

    it('should return false otherwise', function () {
      // given
      const badgeAcquisition = domainBuilder.buildBadgeAcquisition({
        badge: domainBuilder.buildBadge({ key: 'NOT_PIX_EDU' }),
      });

      // when
      const isPixEdu = badgeAcquisition.isPixEdu();

      // then
      expect(isPixEdu).to.be.false;
    });
  });
});
