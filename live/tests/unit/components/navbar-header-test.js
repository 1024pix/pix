import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Ember from 'ember';

describe('Unit | Component | Navbar Header Component', function() {
  setupTest('component:navbar-header', {});
  const sessionStubResolve = Ember.Service.extend({ isAuthenticated: true });
  const sessionStubReject = Ember.Service.extend({ isAuthenticated: false });

  describe('#isUserLogged true case', function() {

    beforeEach(function() {
      this.register('service:session', sessionStubResolve);
      this.inject.service('session', { as: 'session' });
    });

    it('should return true, when user is authenticated', function() {
      // when
      const component = this.subject();

      // then
      expect(component.get('isUserLogged')).to.equal(true);
    });

  });

  describe('#isUserLogged false case', function() {

    beforeEach(function() {
      this.register('service:session', sessionStubReject);
      this.inject.service('session', { as: 'session' });
    });

    it('should return false, when user is unauthenticated', function() {
      // when
      const component = this.subject();

      // then
      expect(component.get('isUserLogged')).to.equal(false);
    });
  });
});
