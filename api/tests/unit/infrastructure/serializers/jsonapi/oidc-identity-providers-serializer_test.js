import { expect } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/oidc-identity-providers-serializer.js';

describe('Unit | Serializer | JSONAPI | oidc-identity-providers-serializer', function () {
  describe('#serialize', function () {
    it('should convert oidc providers into JSON API data', function () {
      // given
      const code = 'OIDC_PARTNER';
      const organizationName = 'Partenaire OIDC';
      const oidc = { slug: 'oidc-partner', code, organizationName, source: 'oidc-external', hasLogoutUrl: true };

      // when
      const json = serializer.serialize(oidc);

      // then
      const expectedJSON = {
        data: {
          type: 'oidc-identity-providers',
          id: 'oidc-partner',
          attributes: {
            code: 'OIDC_PARTNER',
            'organization-name': 'Partenaire OIDC',
            'use-end-session': false,
            'has-logout-url': true,
            source: 'oidc-external',
          },
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
