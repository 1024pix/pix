import { expect } from 'chai';
import { setupTest } from 'ember-mocha';
import { afterEach, describe, it } from 'mocha';
import * as jwt from 'mon-pix/helpers/jwt';
import sinon from 'sinon';

describe('Unit | Authenticator | gar', function () {
  setupTest();

  afterEach(function () {
    sinon.restore();
  });

  describe('#authenticate', function () {
    it('should authenticate the user', async function () {
      // given
      const authenticator = this.owner.lookup('authenticator:gar');
      const token = Symbol('mon super token');

      sinon.stub(jwt, 'decodeToken').returns({ user_id: 1, source: 'gar' });

      // when
      const expectedResult = await authenticator.authenticate(token);

      // then
      sinon.assert.calledWith(jwt.decodeToken, token);
      expect(expectedResult).to.deep.equal({
        token_type: 'bearer',
        access_token: token,
        user_id: 1,
        source: 'gar',
      });
    });
  });
});
