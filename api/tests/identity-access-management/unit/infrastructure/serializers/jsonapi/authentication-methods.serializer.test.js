import { expect } from 'chai';

import { authenticationMethodsSerializer } from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/authentication-methods.serializer.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Identity Access Management | Infrastructure | Serializer | JSONAPI | authentication-methods', function () {
  describe('#serialize()', function () {
    it('formats a authentication method model object into JSON API data', function () {
      // given
      const user = domainBuilder.buildUser();
      const authenticationMethods = [
        domainBuilder.buildAuthenticationMethod.withOidcProviderAsIdentityProvider({
          userId: user.id,
          identityProviderCode: 'ZZZ_ZZZ',
        }),
      ];

      // when
      const json = authenticationMethodsSerializer.serialize(authenticationMethods);

      // then
      const expectedJson = {
        data: [
          {
            type: 'authentication-methods',
            attributes: {
              'identity-provider': 'ZZZ_ZZZ',
            },
          },
        ],
      };
      expect(json).to.deep.equal(expectedJson);
    });
  });
});
