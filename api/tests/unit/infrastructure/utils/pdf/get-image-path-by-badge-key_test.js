const { expect } = require('../../../../test-helper');
const getImagePathByBadgeKey = require('../../../../../lib/infrastructure/utils/pdf/get-image-path-by-badge-key');
const {
  PIX_EMPLOI_CLEA,
  PIX_EMPLOI_CLEA_V2,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
} = require('../../../../../lib/domain/models/Badge').keys;

describe('Unit | Utils | get-image-path-by-badge-key', function () {
  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    { badge: PIX_EMPLOI_CLEA, path: '/files/macaron_clea.png' },
    { badge: PIX_EMPLOI_CLEA_V2, path: '/files/macaron_clea.png' },
    { badge: PIX_DROIT_MAITRE_CERTIF, path: '/files/macaron_maitre.png' },
    { badge: PIX_DROIT_EXPERT_CERTIF, path: '/files/macaron_expert.png' },
    { badge: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME, path: '/files/macaron_edu_initie.png' },
    { badge: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE, path: '/files/macaron_edu_confirme.png' },
    { badge: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE, path: '/files/macaron_edu_confirme.png' },
    { badge: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT, path: '/files/macaron_edu_avance.png' },
    { badge: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR, path: '/files/macaron_edu_expert.png' },
  ].forEach(({ badge, path }) => {
    it(`should return the path ${path} for the badge ${badge}`, function () {
      // when
      const result = getImagePathByBadgeKey(badge);

      // then
      expect(result).to.include(path);
    });
  });
});
