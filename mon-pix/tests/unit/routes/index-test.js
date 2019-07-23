import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Service from '@ember/service';

describe('Unit | Route | index', function() {

  setupTest();

  describe('model', function() {

    beforeEach(function() {
      this.owner.register('service:session', Service.extend({
        isAuthenticated: true,
      }));
    });

    context('when user uses ProfileV2', function() {

      beforeEach(function() {
        this.owner.register('service:currentUser', Service.extend({
          user: { usesProfileV2: true }
        }));
      });

      it('should redirect to /profil', async function() {
        // Given
        const route = this.owner.lookup('route:index');
        route.transitionTo = sinon.spy();

        // When
        await route.model();

        // Then
        sinon.assert.calledWith(route.transitionTo, 'profile');
      });
    });

    context('when user does not use ProfileV2', function() {

      it('should redirect to /compte', async function() {
        // Given
        const route = this.owner.lookup('route:index');
        route.transitionTo = sinon.spy();

        // When
        await route.model();

        // Then
        sinon.assert.calledWith(route.transitionTo, 'compte');
      });
    });
  });

});
