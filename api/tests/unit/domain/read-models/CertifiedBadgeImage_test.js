const { expect } = require('../../../test-helper');
const CertifiedBadgeImage = require('../../../../lib/domain/read-models/CertifiedBadgeImage');
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
} = require('../../../../lib/domain/models/Badge').keys;

const badgeInfos = {
  [PIX_DROIT_MAITRE_CERTIF]: {
    path: 'https://images.pix.fr/badges-certifies/pix-droit/maitre.svg',
    isTemporaryBadge: false,
  },
  [PIX_DROIT_EXPERT_CERTIF]: {
    path: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg',
    isTemporaryBadge: false,
  },
  [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME]: {
    path: 'https://images.pix.fr/badges-certifies/pix-edu/autonome.svg',
    isTemporaryBadge: true,
    levelName: 'Autonome',
  },
  [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE]: {
    path: 'https://images.pix.fr/badges-certifies/pix-edu/avance.svg',
    isTemporaryBadge: true,
    levelName: 'Avancé',
  },
  [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE]: {
    path: 'https://images.pix.fr/badges-certifies/pix-edu/avance.svg',
    isTemporaryBadge: true,
    levelName: 'Avancé',
  },
  [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT]: {
    path: 'https://images.pix.fr/badges-certifies/pix-edu/expert.svg',
    isTemporaryBadge: true,
    levelName: 'Expert',
  },
  [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR]: {
    path: 'https://images.pix.fr/badges-certifies/pix-edu/formateur.svg',
    isTemporaryBadge: true,
    levelName: 'Formateur',
  },
};

describe('Unit | Domain | Models | CertifiedBadgeImage', function () {
  describe('#fromPartnerKey', function () {
    for (const partnerKey in badgeInfos) {
      it(`returns badge infos for ${partnerKey}`, function () {
        // when
        const result = CertifiedBadgeImage.fromPartnerKey(partnerKey);

        // then
        expect(result).to.deepEqualInstance(new CertifiedBadgeImage(badgeInfos[partnerKey]));
      });
    }
  });
});
