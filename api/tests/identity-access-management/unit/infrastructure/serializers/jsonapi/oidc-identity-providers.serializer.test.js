import * as serializer from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/oidc-identity-providers.serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Identity Access Management | Infrastructure | Serializer | JSONAPI | oidc-identity-providers', function () {
  describe('#serialize', function () {
    it('should convert oidc providers into JSON API data', function () {
      // given
      const oidcIdentityProvider = {
        code: 'OIDC_PARTNER',
        application: 'app',
        applicationTld: '.org',
        organizationName: 'Partenaire OIDC',
        slug: 'oidc-partner',
        source: 'oidc-external',
        shouldCloseSession: true,
        isVisible: true,
      };

      // when
      const json = serializer.serialize(oidcIdentityProvider);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'oidc-identity-providers',
          id: 'OIDC_PARTNER',
          attributes: {
            code: 'OIDC_PARTNER',
            application: 'app',
            'application-tld': '.org',
            'organization-name': 'Partenaire OIDC',
            slug: 'oidc-partner',
            'should-close-session': true,
            source: 'oidc-external',
            'is-visible': true,
          },
        },
      });
    });
  });
});
