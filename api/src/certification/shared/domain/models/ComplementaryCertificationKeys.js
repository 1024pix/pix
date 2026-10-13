/**
 * Complementary certification key identifiers
 * @readonly
 * @enum {string}
 */
export const ComplementaryCertificationKeys = Object.freeze({
  PIX_PLUS_DROIT: 'DROIT',
  CLEA: 'CLEA',
  PIX_PLUS_EDU_1ER_DEGRE: 'EDU_1ER_DEGRE',
  PIX_PLUS_EDU_2ND_DEGRE: 'EDU_2ND_DEGRE',
  PIX_PLUS_EDU_CPE: 'EDU_CPE',
  PIX_PLUS_PRO_SANTE: 'PRO_SANTE',
});

/**
 * @typedef {typeof ComplementaryCertificationKeys[keyof typeof ComplementaryCertificationKeys]} ComplementaryCertificationKey
 */
