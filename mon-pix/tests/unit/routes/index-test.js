import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Service from '@ember/service';

describe('Unit | Route | index', function() {

  setupTest('route:index', {
    needs: ['service:metrics', 'service:currentUser', 'service:session']
  });

  describe('model', function() {

    beforeEach(function() {
      this.register('service:session', Service.extend({
        isAuthenticated: true,
      }));
      this.inject.service('session');
    });

    context('when user uses ProfileV2', function() {

      beforeEach(function() {
        this.register('service:currentUser', Service.extend({
          user: { usesProfileV2: true }
        }));
        this.inject.service('currentUser');
      });

      it('should redirect to /profilv2', async function() {
        // Given
        const route = this.subject();
        route.transitionTo = sinon.spy();

        // When
        await route.model();

        // Then
        sinon.assert.calledWith(route.transitionTo, 'profilv2');
      });
    });

    context('when user does not use ProfileV2', function() {

      it('should redirect to /compte', async function() {
        // Given
        const route = this.subject();
        route.transitionTo = sinon.spy();

        // When
        await route.model();

        // Then
        sinon.assert.calledWith(route.transitionTo, 'compte');
      });
    });
  });

});
