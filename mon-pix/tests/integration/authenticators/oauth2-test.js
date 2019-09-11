import { setupTest } from 'ember-mocha';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Integration | Authenticator | oauth2', function() {

  setupTest();
  setupMirage();

  const scope = 'mon-pix';

  it('should retrieve token', async function() {
    // Given
    const email = 'jane@acme.com';
    const password = 'Jane1234';
    const expectedTokenType = 'bearer';
    const expectedUserId = 1;
    const authenticator = this.owner.lookup('authenticator:oauth2');

    // When
    const data = await authenticator.authenticate(email, password, scope);

    // Then
    expect(data.token_type).to.equal(expectedTokenType);
    expect(data.access_token).to.match(/^aaa\.(.+)\.bbb$/);
    expect(data.user_id).to.equal(expectedUserId);
  });

  it('should extract userId and source from token', async function() {
    // Given
    const email = 'john@acme.com';
    const password = 'John1234';
    const expectedUserId = 2;
    const authenticator = this.owner.lookup('authenticator:oauth2');

    // When
    const data = await authenticator.authenticate(email, password, scope);

    // Then
    const payloadOfToken = data.access_token.split('.')[1];
    const tokenData = JSON.parse(atob(payloadOfToken));
    expect(tokenData.user_id).to.equal(expectedUserId);
    expect(tokenData.source).to.equal(scope);
  });
});
