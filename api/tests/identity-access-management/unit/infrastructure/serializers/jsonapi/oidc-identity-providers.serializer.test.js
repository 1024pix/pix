import * as serializer from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/oidc-identity-providers.serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Identity Access Management | Infrastructure | Serializer | JSONAPI | oidc-identity-providers', function () {
  describe('#serialize', function () {
    it('should convert oidc providers into JSON API data', function () {
      // given
      const code = 'OIDC_PARTNER';
      const organizationName = 'Partenaire OIDC';
      const oidc = { slug: 'oidc-partner', code, organizationName, source: 'oidc-external', shouldCloseSession: true };

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
            'should-close-session': true,
            source: 'oidc-external',
          },
        },
      };
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
