import { setupTest } from 'ember-mocha';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { get } from '@ember/object';

import ENV from '../../../config/environment';

describe('Unit | Authenticator | oauth2', function() {

  setupTest();

  it('should have token and token revocation endpoints', function() {
    // Given
    const serverTokenEndpoint = `${ENV.APP.API_HOST}/api/token`;
    const serverTokenRevocationEndpoint = `${ENV.APP.API_HOST}/api/revoke`;

    // When
    const authenticator = this.owner.lookup('authenticator:oauth2');

    // Then
    expect(get(authenticator, 'serverTokenEndpoint')).equal(serverTokenEndpoint);
    expect(get(authenticator, 'serverTokenRevocationEndpoint')).equal(serverTokenRevocationEndpoint);
  });

  describe('#extractDataFromToken', function() {
    it('should extract userId and source from token', function() {
      // given
      const user_id = 1;
      const source = 'mon-pix';
      const token = 'aaa.' + btoa(`{
        "user_id": ${user_id},
        "source": "${source}",
        "iat": 1545321469,
        "exp": 4702193958
      }`) + '.bbb';

      const authenticator = this.owner.lookup('authenticator:oauth2');

      // when
      const dataFromToken = authenticator.extractDataFromToken(token);

      // then
      expect(dataFromToken.user_id).to.equal(user_id);
      expect(dataFromToken.source).to.equal(source);
    });
  });

});
