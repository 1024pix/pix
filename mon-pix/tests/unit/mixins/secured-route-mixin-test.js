import Mixin from '@ember/object/mixin';
import { setOwner } from '@ember/application';
import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import Service from '@ember/service';
import { describe, beforeEach, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { expect } from 'chai';
import sinonjs from 'sinon';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

describe('Unit | Mixin | secured-route-mixin', function() {
  setupTest();

  let sinon;
  let route;
  let router;
  let transition;

  beforeEach(function() {
    sinon = sinonjs.createSandbox();
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('#beforeModel', function() {
    beforeEach(function() {
      const MixinImplementingBeforeModel = Mixin.create({
        beforeModel() {
          return RSVP.resolve('upstreamReturnValue');
        }
      });

      transition = {
        intent: {
          url: '/transition/target/url'
        },
        send() {}
      };
      this.owner.register('service:router', Service.extend({
        transitionTo() {}
      }));
      router = this.owner.lookup('service:router');

      this.owner.register('service:session', Service.extend());
      this.owner.register('service:currentUser', Service.extend({
        user: {}
      }));

      route = Route.extend(MixinImplementingBeforeModel, SecuredRouteMixin).create();
      setOwner(route, this.owner);

      sinon.spy(transition, 'send');
      sinon.spy(router, 'transitionTo');
    });

    describe('when the session is authenticated', function() {

      beforeEach(function() {
        const session = this.owner.lookup('service:session');
        session.set('isAuthenticated', true);
      });

      describe('when the user has accepted the terms of service', function() {

        beforeEach(function() {
          const currentUser = this.owner.lookup('service:currentUser');
          currentUser.user.mustValidateTermsOfService = false;
        });

        it('returns the upstream promise', async function() {
          const result = await route.beforeModel(transition);

          expect(result).to.equal('upstreamReturnValue');
        });

        it('does not transition to the authentication route', function() {
          route.beforeModel(transition);

          sinon.assert.neverCalledWith(router.transitionTo, 'login');
        });

        it('does not transition to the terms-of-service route', function() {
          route.beforeModel(transition);

          sinon.assert.neverCalledWith(router.transitionTo, 'terms-of-service');
        });
      });

      describe('when the user has not accepted the terms of service', function() {

        beforeEach(function() {
          const currentUser = this.owner.lookup('service:currentUser');
          currentUser.user.mustValidateTermsOfService = true;
        });

        it('does not returns the upstream promise', async function() {
          expect(route.beforeModel(transition)).to.be.undefined;
        });

        it('does not transition to the authentication route', function() {
          route.beforeModel(transition);

          sinon.assert.neverCalledWith(router.transitionTo, 'login');
        });

        it('transitions to terms-of-service route', function() {
          route.beforeModel(transition);

          sinon.assert.calledWith(router.transitionTo, 'terms-of-service');
        });
      });
    });

    describe('when the session is not authenticated', function() {

      it('does not return the upstream promise', function() {
        expect(route.beforeModel(transition)).to.be.undefined;
      });

      it('transitions to "login" as the default authentication route', function() {
        route.beforeModel(transition);
        sinon.assert.calledWith(router.transitionTo, 'login');
      });

      it('does not transition to the terms-of-service route', function() {
        route.beforeModel(transition);
        sinon.assert.neverCalledWith(router.transitionTo, 'terms-of-service');
      });

      it('transitions to the authentication route', function() {
        const authenticationRoute = 'path/to/route';
        route.set('authenticationRoute', authenticationRoute);

        route.beforeModel(transition);
        sinon.assert.calledWith(router.transitionTo, authenticationRoute);
      });

    });
  });
});
