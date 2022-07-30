/* eslint ember/no-classic-classes: 0 */

import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

const SplashServiceStub = EmberObject.extend({
  hideCount: 0,
  hide() {
    this.hideCount++;
  },
});

module('Unit | Route | application', function (hooks) {
  setupTest(hooks);

  test('hides the splash when the route is activated', function (assert) {
    // Given
    const splashStub = SplashServiceStub.create();
    const route = this.owner.lookup('route:application');
    route.set('splash', splashStub);

    // When
    route.activate();

    // Then
    assert.equal(splashStub.hideCount, 1);
  });

  module('#sessionAuthenticated', function () {
    test('should load the current user', function (assert) {
      // given
      const currentUserStub = {
        called: false,
        load() {
          this.called = true;
        },
      };
      const route = this.owner.lookup('route:application');
      route.set('currentUser', currentUserStub);

      // when
      route.sessionAuthenticated();

      // then
      assert.true(currentUserStub.called);
    });

    test('should redirect to campaign after login in external oidc page', async function (assert) {
      // given
      const route = this.owner.lookup('route:application');
      const sessionStub = Service.create({
        data: {
          nextURL: '/campagnes/PIXCNAV01/access',
          authenticated: {
            identity_provider_code: 'CNAV',
          },
        },
      });
      route.set('session', sessionStub);
      sinon.stub(route.router, 'replaceWith');
      route.router.replaceWith.resolves();

      // when
      await route.sessionAuthenticated();

      // then
      assert.expect(0);
      sinon.assert.calledWith(route.router.replaceWith, '/campagnes/PIXCNAV01/access');
    });
  });

  module('#__handleLocale', function (hooks) {
    let intlSetLocaleStub;
    let momentSetLocaleStub;
    let intlStub;
    let momentStub;
    let route;

    hooks.beforeEach(function () {
      intlSetLocaleStub = sinon.stub();
      momentSetLocaleStub = sinon.stub();

      intlStub = Service.create({
        setLocale: intlSetLocaleStub,
      });
      momentStub = Service.create({
        setLocale: momentSetLocaleStub,
      });

      route = this.owner.lookup('route:application');
      route.set('intl', intlStub);
      route.set('moment', momentStub);
    });

    module('when user is not connected', function () {
      module('when domain is pix.org', function () {
        module('when supplying locale in queryParam', function () {
          test('should update locale', async function (assert) {
            // given
            route.set('currentDomain', {
              getExtension() {
                return 'org';
              },
            });

            // when
            await route._handleLocale('en');

            // then
            assert.expect(0);
            sinon.assert.called(intlSetLocaleStub);
            sinon.assert.called(momentSetLocaleStub);
            sinon.assert.calledWith(intlSetLocaleStub, ['en', 'fr']);
            sinon.assert.calledWith(momentSetLocaleStub, 'en');
          });

          test('should ignore locale switch when is neither "fr" nor "en"', async function (assert) {
            // given
            route.set('currentDomain', {
              getExtension() {
                return 'org';
              },
            });

            // when
            await route._handleLocale('bouh');

            // then
            assert.expect(0);
            sinon.assert.called(intlSetLocaleStub);
            sinon.assert.called(momentSetLocaleStub);
            sinon.assert.calledWith(intlSetLocaleStub, ['bouh', 'fr']);
          });
        });

        module('when supplying no locale in queryParam', function () {
          test('should set locale to default locale', async function (assert) {
            // given
            route.set('currentDomain', {
              getExtension() {
                return 'org';
              },
            });

            const locale = undefined;
            // when
            await route._handleLocale(locale);

            // then
            assert.expect(0);
            sinon.assert.called(intlSetLocaleStub);
            sinon.assert.called(momentSetLocaleStub);
            sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
            sinon.assert.calledWith(momentSetLocaleStub, 'fr');
          });
        });
      });

      module('when domain is pix.fr', function () {
        test('should keep locale in "fr"', async function (assert) {
          // given
          route.set('currentDomain', {
            getExtension() {
              return 'fr';
            },
          });

          // when
          await route._handleLocale('en');

          // then
          assert.expect(0);
          sinon.assert.called(intlSetLocaleStub);
          sinon.assert.called(momentSetLocaleStub);
          sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
          sinon.assert.calledWith(momentSetLocaleStub, 'fr');
        });
      });
    });

    module('when user is connected', function () {
      module('when domain is pix.org', function () {
        test('should set locale from user', async function (assert) {
          // given
          const user = {
            lang: 'fr',
          };
          const load = sinon.stub().resolves(user);
          const currentUserStub = Service.create({ load, user });

          route.set('session', { isAuthenticated: true });
          route.set('currentUser', currentUserStub);
          route.set('currentDomain', {
            getExtension() {
              return 'org';
            },
          });

          // when
          await route._handleLocale();

          // then
          assert.expect(0);
          sinon.assert.called(intlSetLocaleStub);
          sinon.assert.called(momentSetLocaleStub);
          sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
          sinon.assert.calledWith(momentSetLocaleStub, 'fr');
        });

        module('when user change locale', function () {
          test('should save user locale', async function (assert) {
            // given
            const saveStub = sinon.stub().resolves();

            const user = {
              lang: 'fr',
              save: saveStub,
            };
            const loadStub = sinon.stub().resolves(user);
            const currentUserStub = Service.create({ load: loadStub, user });

            route.set('session', { isAuthenticated: true });
            route.set('currentUser', currentUserStub);
            route.set('currentDomain', {
              getExtension() {
                return 'org';
              },
            });

            // when
            await route._handleLocale('en');

            // then
            assert.expect(0);
            sinon.assert.called(saveStub);
            sinon.assert.calledWith(saveStub, { adapterOptions: { lang: 'en' } });
          });

          test('should ignore locale switch when is neither "fr" nor "en"', async function (assert) {
            // given
            const saveStub = sinon.stub().rejects({ errors: [{ status: '400' }] });
            const rollbackAttributesStub = sinon.stub().resolves();

            const user = {
              lang: 'fr',
              save: saveStub,
              rollbackAttributes: rollbackAttributesStub,
            };
            const loadStub = sinon.stub().resolves(user);
            const currentUserStub = Service.create({ load: loadStub, user });

            route.set('session', { isAuthenticated: true });
            route.set('currentUser', currentUserStub);
            route.set('currentDomain', {
              getExtension() {
                return 'org';
              },
            });

            // when
            await route._handleLocale('bouh');

            // then
            assert.expect(0);
            sinon.assert.called(rollbackAttributesStub);
          });
        });
      });

      module('when domain is pix.fr', function () {
        test('should ignore locale from user', async function (assert) {
          // given
          const user = {
            lang: 'en',
          };
          const load = sinon.stub().resolves(user);
          const currentUserStub = Service.create({ load, user });

          route.set('session', { isAuthenticated: true });
          route.set('currentUser', currentUserStub);
          route.set('currentDomain', {
            getExtension() {
              return 'fr';
            },
          });

          // when
          await route._handleLocale();

          // then
          assert.expect(0);
          sinon.assert.called(intlSetLocaleStub);
          sinon.assert.called(momentSetLocaleStub);
          sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
          sinon.assert.calledWith(momentSetLocaleStub, 'fr');
        });

        module('when user change locale', function () {
          test('should not save user locale', async function (assert) {
            // given
            const saveStub = sinon.stub().resolves();

            const user = {
              lang: 'fr',
              save: saveStub,
            };
            const loadStub = sinon.stub().resolves(user);
            const currentUserStub = Service.create({ load: loadStub, user });

            route.set('session', { isAuthenticated: true });
            route.set('currentUser', currentUserStub);
            route.set('currentDomain', {
              getExtension() {
                return 'fr';
              },
            });

            // when
            await route._handleLocale('en');

            // then
            assert.expect(0);
            sinon.assert.notCalled(saveStub);
          });
        });
      });
    });
  });
});
