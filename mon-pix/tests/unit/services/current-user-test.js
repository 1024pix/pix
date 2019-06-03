import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';
import sinon from 'sinon';

describe('Unit | Service | current-user', function() {
  setupTest();

  describe('user is authenticated', function() {
    beforeEach(function() {
      this.owner.register('service:session', Service.extend({ isAuthenticated: true }));
      this.owner.register('service:store', Service.extend({
        queryRecord: sinon.stub().resolves({ id: 1 })
      }));
    });

    it('should load the current user', async function() {
      // Given
      const currentUser = this.owner.lookup('service:currentUser');

      // When
      await currentUser.load();

      // Then
      expect(currentUser.user).to.be.defined;
    });
  });

  describe('user is not authenticated', function() {

    beforeEach(function() {
      this.owner.register('service:session', Service.extend({ isAuthenticated: false }));
    });

    it('should do nothing', async function() {
      // Given
      const currentUser = this.owner.lookup('service:currentUser');

      // When
      await currentUser.load();

      // Then
      expect(currentUser.user).to.be.undefined;
    });
  });

  describe('user token is expired', function() {

    beforeEach(function() {
      this.owner.register('service:session', Service.extend({
        isAuthenticated: true,
        invalidate: sinon.stub().resolves('invalidate'),
      }));
      this.owner.register('service:store', Service.extend({
        queryRecord: sinon.stub().rejects({ errors: [{ code: 401 }] })
      }));
    });

    it('should redirect to login', async function() {
      // Given
      const currentUser = this.owner.lookup('service:currentUser');

      // When
      const result = await currentUser.load();

      // Then
      expect(result).to.equal('invalidate');
    });
  });
});
