const { expect } = require('../../../test-helper');
const CertifiableBadgeLabels = require('../../../../lib/domain/read-models/CertifiableBadgeLabels');

describe('Unit | Domain | Models | CertifiableBadgeLabels', function () {
  describe('#getComplementaryCertificationLabelByBadgeKey', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        badgeKey: 'PIX_EMPLOI_CLEA',
        expectedLabel: 'CléA Numérique',
      },
      {
        badgeKey: 'PIX_EMPLOI_CLEA_V2',
        expectedLabel: 'CléA Numérique',
      },
      {
        badgeKey: 'PIX_EMPLOI_CLEA_V3',
        expectedLabel: 'CléA Numérique',
      },
      {
        badgeKey: 'PIX_DROIT_MAITRE_CERTIF',
        expectedLabel: 'Pix+ Droit Maître',
      },
      {
        badgeKey: 'PIX_DROIT_EXPERT_CERTIF',
        expectedLabel: 'Pix+ Droit Expert',
      },
      {
        badgeKey: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE',
        expectedLabel: 'Pix+ Édu 2nd degré Initié (entrée dans le métier)',
      },
      {
        badgeKey: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME',
        expectedLabel: 'Pix+ Édu 2nd degré Confirmé',
      },
      {
        badgeKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME',
        expectedLabel: 'Pix+ Édu 2nd degré Confirmé',
      },
      {
        badgeKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE',
        expectedLabel: 'Pix+ Édu 2nd degré Avancé',
      },
      {
        badgeKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT',
        expectedLabel: 'Pix+ Édu 2nd degré Expert',
      },
      {
        badgeKey: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE',
        expectedLabel: 'Pix+ Édu 1er degré Initié (entrée dans le métier)',
      },
      {
        badgeKey: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME',
        expectedLabel: 'Pix+ Édu 1er degré Confirmé',
      },
      {
        badgeKey: 'PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME',
        expectedLabel: 'Pix+ Édu 1er degré Confirmé',
      },
      {
        badgeKey: 'PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE',
        expectedLabel: 'Pix+ Édu 1er degré Avancé',
      },
      {
        badgeKey: 'PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT',
        expectedLabel: 'Pix+ Édu 1er degré Expert',
      },
    ].forEach(({ badgeKey, expectedLabel }) => {
      describe(`when badgeKey is ${badgeKey}`, function () {
        it(`should return the label "${expectedLabel}"`, function () {
          // when
          const label = CertifiableBadgeLabels.getLabelByBadgeKey(badgeKey);

          // then
          expect(label).to.equal(expectedLabel);
        });
      });
    });
  });

  describe('#getCleaLabel', function () {
    it('returns CleA label', function () {
      // when
      const label = CertifiableBadgeLabels.getCleaLabel();

      // then
      expect(label).to.equal('CléA Numérique');
    });
  });
});
