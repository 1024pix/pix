import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | index', function () {
  setupTest();

  describe('model', function () {
    it('should redirect to /accueil', async function () {
      // Given
      const route = this.owner.lookup('route:index');
      route.router = { replaceWith: sinon.spy() };

      // When
      await route.redirect();

      // Then
      sinon.assert.calledWith(route.router.replaceWith, 'user-dashboard');
    });
  });
});
