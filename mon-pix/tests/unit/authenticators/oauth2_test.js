import { setupTest } from 'ember-mocha';
import { describe, it } from 'mocha';
import { expect } from 'chai';

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
    expect(authenticator.serverTokenEndpoint).equal(serverTokenEndpoint);
    expect(authenticator.serverTokenRevocationEndpoint).equal(serverTokenRevocationEndpoint);
  });

});
