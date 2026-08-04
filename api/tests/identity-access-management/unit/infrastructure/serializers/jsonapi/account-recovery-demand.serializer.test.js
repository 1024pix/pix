import { accountRecoveryDemandSerializer } from '../../../../../../src/identity-access-management/infrastructure/serializers/jsonapi/account-recovery-demand.serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Identity Access Management | Unit | Serializer | JSONAPI | account-recovery-demand', function () {
  describe('#serialize()', function () {
    it('converts an account recovery demand into JSON API data', function () {
      // given
      const accountRecoveryDetails = {
        id: 1,
        firstName: 'Jude',
        email: 'judelaw@example.net',
        hasGarAuthenticationMethod: true,
        hasScoUsername: false,
      };

      // when
      const json = accountRecoveryDemandSerializer.serialize(accountRecoveryDetails);

      // then
      const expectedJsonApi = {
        data: {
          type: 'account-recovery-demands',
          id: accountRecoveryDetails.id.toString(),
          attributes: {
            'first-name': accountRecoveryDetails.firstName,
            email: accountRecoveryDetails.email,
            'has-gar-authentication-method': true,
            'has-sco-username': false,
          },
        },
      };
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
