const { expect, domainBuilder } = require('../../../test-helper');
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
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

  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    {
      methodName: 'isPixDroit',
      keys: [PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF],
    },
    {
      methodName: 'isPixEdu1erDegre',
      keys: [
        PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
        PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
        PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
        PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
      ],
    },
    {
      methodName: 'isPixEdu2ndDegre',
      keys: [
        PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
        PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
        PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
      ],
    },
  ].forEach(({ methodName, keys }) => {
    describe(`#${methodName}`, function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      keys.forEach((badgeKey) => {
        it(`should return true for badge ${badgeKey}`, function () {
          // given
          const badgeAcquisition = domainBuilder.buildBadgeAcquisition({
            badge: domainBuilder.buildBadge({ key: badgeKey }),
          });

          // when
          const isIt = badgeAcquisition[methodName]();

          // then
          expect(isIt).to.be.true;
        });
      });

      it('should return false otherwise', function () {
        // given
        const badgeAcquisition = domainBuilder.buildBadgeAcquisition({
          badge: domainBuilder.buildBadge({ key: 'IT_S_NOT' }),
        });

        // when
        const isIt = badgeAcquisition[methodName]();

        // then
        expect(isIt).to.be.false;
      });
    });
  });
});
