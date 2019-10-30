import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | user', function() {
  setupTest();

  let adapter;

  beforeEach(function() {
    adapter = this.owner.lookup('adapter:user');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#queryRecord', () => {

    it('should build /me url', async function() {
      // when
      const url = await adapter.urlForQueryRecord({ me: true }, 'user');

      // then
      expect(url.endsWith('/users/me')).to.be.true;
    });

    it('should build classic url', async function() {
      // when
      const url = await adapter.urlForQueryRecord({}, 'user');

      // then
      expect(url.endsWith('/users')).to.be.true;
    });

  });

  describe('#urlForUpdateRecord', () => {
    it('should build update url from user id', async function() {
      // when
      const snapshot = { adapterOptions: { } };
      const url = await adapter.urlForUpdateRecord(123, 'user', snapshot);

      // then
      expect(url.endsWith('/users/123')).to.be.true;
    });

    it('should redirect to remember-user-has-seen-assessment-instructions', async function() {
      // when
      const snapshot = { adapterOptions: { rememberUserHasSeenAssessmentInstructions: true } };
      const url = await adapter.urlForUpdateRecord(123, 'user', snapshot);

      // then
      expect(url.endsWith('/users/123/remember-user-has-seen-assessment-instructions')).to.be.true;
    });

    it('should include temporaryKey if present in adapterOptions', async function() {
      // when
      const snapshot = { adapterOptions: { updatePassword: true, temporaryKey: 'temp=&key' } };
      const url = await adapter.urlForUpdateRecord(123, 'user', snapshot);

      // then
      expect(url.endsWith('/users/123/password-update?temporary-key=temp%3D%26key')).to.be.true;
    });

  });

});
