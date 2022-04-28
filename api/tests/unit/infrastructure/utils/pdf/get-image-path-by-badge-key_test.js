const { expect } = require('../../../../test-helper');
const getImagePathByBadgeKey = require('../../../../../lib/infrastructure/utils/pdf/get-image-path-by-badge-key');
const {
  PIX_EMPLOI_CLEA_V1,
  PIX_EMPLOI_CLEA_V2,
  PIX_EMPLOI_CLEA_V3,
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
} = require('../../../../../lib/domain/models/Badge').keys;

describe('Unit | Utils | get-image-path-by-badge-key', function () {
  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    { badge: PIX_EMPLOI_CLEA_V1, path: '/files/stickers/macaron_clea.pdf' },
    { badge: PIX_EMPLOI_CLEA_V2, path: '/files/stickers/macaron_clea.pdf' },
    { badge: PIX_EMPLOI_CLEA_V3, path: '/files/stickers/macaron_clea.pdf' },
    { badge: PIX_DROIT_MAITRE_CERTIF, path: '/files/stickers/macaron_droit_maitre.pdf' },
    { badge: PIX_DROIT_EXPERT_CERTIF, path: '/files/stickers/macaron_droit_expert.pdf' },
    { badge: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE, path: '/files/stickers/macaron_edu_2nd_initie.pdf' },
    { badge: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, path: '/files/stickers/macaron_edu_2nd_confirme.pdf' },
    { badge: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME, path: '/files/stickers/macaron_edu_2nd_confirme.pdf' },
    { badge: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE, path: '/files/stickers/macaron_edu_2nd_avance.pdf' },
    { badge: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT, path: '/files/stickers/macaron_edu_2nd_expert.pdf' },
    { badge: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE, path: '/files/stickers/macaron_edu_1er_initie.pdf' },
    { badge: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME, path: '/files/stickers/macaron_edu_1er_confirme.pdf' },
    { badge: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME, path: '/files/stickers/macaron_edu_1er_confirme.pdf' },
    { badge: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE, path: '/files/stickers/macaron_edu_1er_avance.pdf' },
    { badge: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT, path: '/files/stickers/macaron_edu_1er_expert.pdf' },
  ].forEach(({ badge, path }) => {
    it(`should return the path ${path} for the badge ${badge}`, function () {
      // when
      const result = getImagePathByBadgeKey(badge);

      // then
      expect(result).to.include(path);
    });
  });
});
