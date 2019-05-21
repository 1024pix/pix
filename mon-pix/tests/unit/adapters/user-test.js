import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | subscribers', function() {
  setupTest('adapter:user', {
    needs: ['service:session']
  });

  describe('#queryRecord', () => {

    let adapter;

    beforeEach(function() {
      adapter = this.subject();
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
