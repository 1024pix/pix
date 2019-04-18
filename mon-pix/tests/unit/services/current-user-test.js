import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';
import sinon from 'sinon';

describe('Unit | Service | current-user', function() {
  setupTest('service:currentUser');

  describe('user is authenticated', function() {
    beforeEach(function() {
      this.register('service:session', Service.extend({ isAuthenticated: true }));
      this.inject.service('session', { as: 'session' });

      this.register('service:store', Service.extend({
        queryRecord: sinon.stub().resolves({ id: 1 })
      }));
      this.inject.service('store', { as: 'store' });
    });

    it('should load the current user', async function() {
      // Given
      const currentUser = this.subject();

      // When
      await currentUser.load();

      // Then
      expect(currentUser.user).to.be.defined;
    });
  });

  describe('user is not authenticated', function() {

    beforeEach(function() {
      this.register('service:session', Service.extend({ isAuthenticated: false }));
      this.inject.service('session', { as: 'session' });
    });

    it('should do nothing', async function() {
      // Given
      const currentUser = this.subject();

      // When
      await currentUser.load();

      // Then
      expect(currentUser.user).to.be.undefined;
    });
  });

  describe('user token is expired', function() {

    beforeEach(function() {
      this.register('service:session', Service.extend({
        isAuthenticated: true,
        invalidate: sinon.stub().resolves('invalidate'),
      }));
      this.inject.service('session', { as: 'session' });

      this.register('service:store', Service.extend({
        queryRecord: sinon.stub().rejects({ errors: [{ code: 401 }] })
      }));
      this.inject.service('store', { as: 'store' });
    });

    it('should redirect to login', async function() {
      // Given
      const currentUser = this.subject();

      // When
      const result = await currentUser.load();

      // Then
      expect(result).to.equal('invalidate');
    });
  });
});
