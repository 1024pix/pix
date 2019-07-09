import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | user', function() {
  setupTest();

  describe('#queryRecord', () => {

    let adapter;

    beforeEach(function() {
      adapter = this.owner.lookup('adapter:user');
      adapter.ajax = sinon.stub().resolves();
    });

    it('should build /me url', async function() {
      // when
      const url = await adapter.urlForQueryRecord({ me: true }, 'user');

      // then
      expect(url).to.equal('http://localhost:3000/api/users/me');
    });

    it('should build /me/profile url', async function() {
      // when
      const url = await adapter.urlForQueryRecord({ profile: true }, 'user');

      // then
      expect(url).to.equal('http://localhost:3000/api/users/me/profile');
    });

    it('should build classic url', async function() {
      // when
      const url = await adapter.urlForQueryRecord({}, 'user');

      // then
      expect(url).to.equal('http://localhost:3000/api/users');
    });

  });

});
