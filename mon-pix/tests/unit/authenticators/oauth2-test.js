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
});
