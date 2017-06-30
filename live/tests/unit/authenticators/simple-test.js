import {describe, it} from 'mocha';
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';

const expectedUserId = 1;
const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJlbWFpbCI6InBpeEBjb250YWN0LmNvbSIsImlhdCI6MTQ5Njg0NTY3OSwiZXhwIjoxNDk3NDUwNDc5fQ.6Mkkstj-9SjXX4lsXrsZ2KL91Ol3kbxn6tlus2apGVY';

class AjaxStub {
  request() {
    this.callArgs = Array.from(arguments);
    return Promise.resolve({
      'data': {
        'type': 'authentication',
        'attributes': {
          'user-id': expectedUserId,
          'token': expectedToken,
          'password': ''
        },
        'id': expectedUserId
      }
    });
  }
}

describe('Unit | Authenticator | simple', function() {

  setupTest('authenticator:simple', {
    needs: [ 'service:ajax' ]
  });

  it('should post a request to retrieve token', function() {
    // Given
    const email = 'test@example.net';
    const password = 'Hx523è9#';
    const ajaxStub = new AjaxStub();
    const authenticator = this.subject();
    authenticator.set('ajax', ajaxStub);

    // When
    const promise = authenticator.authenticate(email, password);

    // Then
    return promise.then(_ => {
      expect(ajaxStub.callArgs[0]).to.deep.equal('/api/authentications');
      expect(ajaxStub.callArgs[1]).to.deep.equal({
        method: 'POST',
        data: '{"data":{"attributes":{"password":"Hx523è9#","email":"test@example.net"}}}'
      });
    });
  });

  it('should return the token', function() {
    // Given
    const email = 'test@example.net';
    const password = 'Hx523è9#';
    const ajaxStub = new AjaxStub();
    const authenticator = this.subject();
    authenticator.set('ajax', ajaxStub);

    // When
    const promise = authenticator.authenticate(email, password);

    // Then
    return promise.then(data => {
      expect(data.userId).to.equal(expectedUserId);
      expect(data.token).to.equal(expectedToken);
    });
  });
});
