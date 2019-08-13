import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | Navbar Mobile Header Component', function() {
  setupTest();
  const sessionStubResolve = Service.extend({ isAuthenticated: true });
  const sessionStubReject = Service.extend({ isAuthenticated: false });

  let component;

  describe('When user is logged', function() {
    beforeEach(function() {
      this.owner.register('service:session', sessionStubResolve);
      component = this.owner.lookup('component:navbar-mobile-header');
    });

    context('#isUserLogged', function() {
      it('should return true', function() {
        // then
        expect(component.get('isUserLogged')).to.equal(true);
      });
    });
  });

  describe('When user is not logged', function() {
    beforeEach(function() {
      this.owner.register('service:session', sessionStubReject);
      component = this.owner.lookup('component:navbar-mobile-header');
    });

    context('#isUserLogged', function() {
      it('should return false, when user is unauthenticated', function() {
        // then
        expect(component.get('isUserLogged')).to.equal(false);
      });
    });
  });
});
