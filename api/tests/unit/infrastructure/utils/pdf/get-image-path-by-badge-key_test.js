const { expect } = require('../../../../test-helper');
const getImagePathByBadgeKey = require('../../../../../lib/infrastructure/utils/pdf/get-image-path-by-badge-key');
const { PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2, PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF } =
  require('../../../../../lib/domain/models/Badge').keys;

describe('Unit | Utils | get-image-path-by-badge-key', function () {
  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    { badge: PIX_EMPLOI_CLEA, path: '/files/macaron_clea.png' },
    { badge: PIX_EMPLOI_CLEA_V2, path: '/files/macaron_clea.png' },
    { badge: PIX_DROIT_MAITRE_CERTIF, path: '/files/macaron_maitre.png' },
    { badge: PIX_DROIT_EXPERT_CERTIF, path: '/files/macaron_expert.png' },
  ].forEach(({ badge, path }) => {
    it(`should return the ${path} for the badge ${badge}`, function () {
      // when
      const result = getImagePathByBadgeKey(badge);

      // then
      expect(result).to.include(path);
    });
  });
});
