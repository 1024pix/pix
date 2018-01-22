import { run } from '@ember/runloop';
import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | Navbar mobile menu Component', function() {
  setupTest('component:navbar-mobile-menu', {
    needs: ['service:side-menu'],
    unit: true
  });
  const sessionStubResolve = Service.extend({ isAuthenticated: true });

  describe('#closeMenu', function() {
    beforeEach(function() {
      this.register('service:session', sessionStubResolve);
      this.inject.service('session', { as: 'session' });
    });

    context('when close button is clicked', function() {
      it('should be handled', function() {
        // given
        const component = this.subject();

        // when
        run(() => {
          component.send('closeMenu');
        });

        // then
        expect(component.get('sideMenu.isClosed')).to.equal(true);
      });
    });
  });
});
