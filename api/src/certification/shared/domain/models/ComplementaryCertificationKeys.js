/**
 * Complementary certification key identifiers
 * @readonly
 * @enum {string}
 */
const COMPLEMENTARY_CERTIFICATION_KEYS = {
  PIX_PLUS_DROIT: 'DROIT',
  CLEA: 'CLEA',
  PIX_PLUS_EDU_1ER_DEGRE: 'EDU_1ER_DEGRE',
  PIX_PLUS_EDU_2ND_DEGRE: 'EDU_2ND_DEGRE',
};

export const ComplementaryCertificationKeys = Object.freeze({
  ...COMPLEMENTARY_CERTIFICATION_KEYS,

  contains: (value) => {
    return Object.keys(COMPLEMENTARY_CERTIFICATION_KEYS).some((key) => COMPLEMENTARY_CERTIFICATION_KEYS[key] === value);
  },
});
