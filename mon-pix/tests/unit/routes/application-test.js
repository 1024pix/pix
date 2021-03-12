/* eslint ember/no-classic-classes: 0 */

import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

const SplashServiceStub = EmberObject.extend({
  hideCount: 0,
  hide() {
    this.hideCount++;
  },
});

describe('Unit | Route | application', function() {

  setupTest();

  it('hides the splash when the route is activated', function() {
    // Given
    const splashStub = SplashServiceStub.create();
    const route = this.owner.lookup('route:application');
    route.set('splash', splashStub);

    // When
    route.activate();

    // Then
    expect(splashStub.hideCount).to.equal(1);
  });

  it('should load the current user', function() {
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
    expect(currentUserStub.called).to.be.true;
  });

  describe('#__handleLocale', function() {

    let intlSetLocaleStub;
    let momentSetLocaleStub;
    let intlStub;
    let momentStub;
    let route;

    beforeEach(function() {
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

    describe('when user is not connected', function() {

      describe('when domain is pix.org', function() {

        describe('when supplying locale in queryParam', function() {

          it('should update locale', async function() {
            // given
            route.set('currentDomain', {
              getExtension() {
                return 'org';
              },
            });

            // when
            await route._handleLocale('en');

            // then
            sinon.assert.called(intlSetLocaleStub);
            sinon.assert.called(momentSetLocaleStub);
            sinon.assert.calledWith(intlSetLocaleStub, ['en', 'fr']);
            sinon.assert.calledWith(momentSetLocaleStub, 'en');
          });

          it('should ignore locale switch when is neither "fr" nor "en"', async function() {
            // given
            route.set('currentDomain', {
              getExtension() {
                return 'org';
              },
            });

            // when
            await route._handleLocale('bouh');

            // then
            sinon.assert.called(intlSetLocaleStub);
            sinon.assert.called(momentSetLocaleStub);
            sinon.assert.calledWith(intlSetLocaleStub, ['bouh', 'fr']);
          });

        });

        describe('when supplying no locale in queryParam', function() {

          it('should set locale to default locale, but does not (bug)', async function() {
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
            sinon.assert.called(intlSetLocaleStub);
            sinon.assert.called(momentSetLocaleStub);
            sinon.assert.calledWith(intlSetLocaleStub, [null, 'fr']);
            sinon.assert.calledWith(momentSetLocaleStub, null);
          });

        });

      });

      describe('when domain is pix.fr', function() {

        it('should keep locale in "fr"', async function() {
          // given
          route.set('currentDomain', { getExtension() { return 'fr'; } });

          // when
          await route._handleLocale('en');

          // then
          sinon.assert.called(intlSetLocaleStub);
          sinon.assert.called(momentSetLocaleStub);
          sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
          sinon.assert.calledWith(momentSetLocaleStub, 'fr');
        });
      });
    });

    describe('when user is connected', function() {

      describe('when domain is pix.org', function() {

        it('should set locale from user', async function() {
          // given
          const user = {
            lang: 'fr',
          };
          const load = sinon.stub().resolves(user);
          const currentUserStub = Service.create({ load, user });

          route.set('session', { isAuthenticated: true });
          route.set('currentUser', currentUserStub);
          route.set('currentDomain', { getExtension() { return 'org'; } });

          // when
          await route._handleLocale();

          // then
          sinon.assert.called(intlSetLocaleStub);
          sinon.assert.called(momentSetLocaleStub);
          sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
          sinon.assert.calledWith(momentSetLocaleStub, 'fr');
        });

        describe('when user change locale', function() {

          it('should save user locale', async function() {
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
            route.set('currentDomain', { getExtension() { return 'org'; } });

            // when
            await route._handleLocale('en');

            // then
            sinon.assert.called(saveStub);
            sinon.assert.calledWith(saveStub, { adapterOptions: { lang: 'en' } });
          });

          it('should ignore locale switch when is neither "fr" nor "en"', async function() {
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
            route.set('currentDomain', { getExtension() { return 'org'; } });

            // when
            await route._handleLocale('bouh');

            // then
            sinon.assert.called(rollbackAttributesStub);
          });
        });
      });

      describe('when domain is pix.fr', function() {

        it('should ignore locale from user', async function() {
          // given
          const user = {
            lang: 'en',
          };
          const load = sinon.stub().resolves(user);
          const currentUserStub = Service.create({ load, user });

          route.set('session', { isAuthenticated: true });
          route.set('currentUser', currentUserStub);
          route.set('currentDomain', { getExtension() { return 'fr'; } });

          // when
          await route._handleLocale();

          // then
          sinon.assert.called(intlSetLocaleStub);
          sinon.assert.called(momentSetLocaleStub);
          sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
          sinon.assert.calledWith(momentSetLocaleStub, 'fr');
        });

        describe('when user change locale', function() {

          it('should not save user locale', async function() {
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
            route.set('currentDomain', { getExtension() { return 'fr'; } });

            // when
            await route._handleLocale('en');

            // then
            sinon.assert.notCalled(saveStub);
          });
        });
      });
    });
  });
});
