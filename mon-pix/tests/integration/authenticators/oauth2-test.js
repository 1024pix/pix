import { setupTest } from 'ember-mocha';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Integration | Authenticator | oauth2', function() {

  setupTest();
  setupMirage();

  const tokenType = 'bearer';
  const scope = 'mon-pix';

  it('should retrieve token type and token', async function() {
    // Given
    const login = 'jane@acme.com';
    const password = 'Jane1234';
    const authenticator = this.owner.lookup('authenticator:oauth2');

    // When
    const data = await authenticator.authenticate({ login, password, scope });

    // Then
    expect(data.token_type).to.equal(tokenType);
    expect(data.access_token).to.match(/^aaa\.(.+)\.bbb$/);
  });

  it('should extract user_id and source from token', async function() {
    // Given
    const login = 'john@acme.com';
    const password = 'John1234';
    const expectedUserId = 2;
    const authenticator = this.owner.lookup('authenticator:oauth2');

    // When
    const data = await authenticator.authenticate({ login, password, scope });

    // Then
    const tokenData = authenticator.extractDataFromToken(data.access_token);
    expect(tokenData.user_id).to.equal(expectedUserId);
    expect(tokenData.source).to.equal(scope);
  });

  it('should accept pre-generated token', async function() {
    // Given
    const userId = 1;
    const token = 'aaa.' + btoa(`{
        "user_id": ${userId},
        "source": "${scope}",
        "iat": 1545321469,
        "exp": 4702193958
      }`) + '.bbb';

    const authenticator = this.owner.lookup('authenticator:oauth2');

    // When
    const data = await authenticator.authenticate({ token });

    // Then
    expect(data.token_type).to.equal(tokenType);
    expect(data.access_token).to.equal(token);
    expect(data.user_id).to.equal(userId);
    expect(data.source).to.equal(scope);
  });

});
