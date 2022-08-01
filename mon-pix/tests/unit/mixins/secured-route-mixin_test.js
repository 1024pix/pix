/* eslint ember/no-classic-classes: 0 */

import Mixin from '@ember/object/mixin';
import { setOwner } from '@ember/application';
import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinonjs from 'sinon';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

module('Unit | Mixin | secured-route-mixin', function (hooks) {
  setupTest(hooks);

  let sinon;
  let route;
  let router;
  let transition;

  hooks.beforeEach(function () {
    sinon = sinonjs.createSandbox();
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('#beforeModel', function (hooks) {
    hooks.beforeEach(function () {
      const MixinImplementingBeforeModel = Mixin.create({
        beforeModel() {
          return RSVP.resolve('upstreamReturnValue');
        },
      });

      transition = {
        intent: {
          url: '/transition/target/url',
        },
        send() {},
      };
      this.owner.register(
        'service:router',
        Service.extend({
          transitionTo() {},
        })
      );
      router = this.owner.lookup('service:router');

      this.owner.register('service:session', Service.extend());
      this.owner.register(
        'service:currentUser',
        Service.extend({
          user: {},
        })
      );

      route = Route.extend(MixinImplementingBeforeModel, SecuredRouteMixin).create();
      setOwner(route, this.owner);

      sinon.spy(transition, 'send');
      sinon.spy(router, 'transitionTo');
    });

    module('when the session is authenticated', function (hooks) {
      hooks.beforeEach(function () {
        const session = this.owner.lookup('service:session');
        session.set('isAuthenticated', true);
      });

      module('when the user has accepted the terms of service', function (hooks) {
        hooks.beforeEach(function () {
          const currentUser = this.owner.lookup('service:currentUser');
          currentUser.user.mustValidateTermsOfService = false;
        });

        test('returns the upstream promise', async function (assert) {
          const result = await route.beforeModel(transition);

          assert.equal(result, 'upstreamReturnValue');
        });

        test('does not transition to the authentication route', function (assert) {
          route.beforeModel(transition);

          assert.expect(0);
          sinon.assert.neverCalledWith(router.transitionTo, 'authentication.login');
        });

        test('does not transition to the terms-of-service route', function (assert) {
          route.beforeModel(transition);

          assert.expect(0);
          sinon.assert.neverCalledWith(router.transitionTo, 'terms-of-service');
        });
      });

      module('when the user has not accepted the terms of service', function (hooks) {
        hooks.beforeEach(function () {
          const currentUser = this.owner.lookup('service:currentUser');
          currentUser.user.mustValidateTermsOfService = true;
        });

        test('does not returns the upstream promise', async function (assert) {
          assert.equal(route.beforeModel(transition), undefined);
        });

        test('does not transition to the authentication route', function (assert) {
          route.beforeModel(transition);

          assert.expect(0);
          sinon.assert.neverCalledWith(router.transitionTo, 'authentication.login');
        });

        test('transitions to terms-of-service route', function (assert) {
          route.beforeModel(transition);

          assert.expect(0);
          sinon.assert.calledWith(router.transitionTo, 'terms-of-service');
        });
      });
    });

    module('when the session is not authenticated', function () {
      test('does not return the upstream promise', function (assert) {
        assert.equal(route.beforeModel(transition), undefined);
      });

      test('transitions to "login" as the default authentication route', function (assert) {
        route.beforeModel(transition);
        assert.expect(0);
        sinon.assert.calledWith(router.transitionTo, 'authentication.login');
      });

      test('does not transition to the terms-of-service route', function (assert) {
        route.beforeModel(transition);
        assert.expect(0);
        sinon.assert.neverCalledWith(router.transitionTo, 'terms-of-service');
      });

      test('transitions to the authentication route', function (assert) {
        const authenticationRoute = 'path/to/route';
        route.set('authenticationRoute', authenticationRoute);

        route.beforeModel(transition);
        assert.expect(0);
        sinon.assert.calledWith(router.transitionTo, authenticationRoute);
      });
    });
  });
});
