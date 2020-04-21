import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | authenticated/index', function() {

  setupTest();

  describe('model', function() {

    it('should redirect to /profil', async function() {
      // Given
      const route = this.owner.lookup('route:authenticated.index');
      route.replaceWith = sinon.spy();

      // When
      await route.redirect();

      // Then
      sinon.assert.calledWith(route.replaceWith, 'authenticated.profile');
    });
  });
});
