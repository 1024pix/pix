/* eslint ember/no-classic-classes: 0 */

import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
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

  describe('#_handleLanguage', function() {
    it('should set locales from users', async function() {
      // given
      const user = {
        lang: 'en',
      };
      const load = sinon.stub().resolves(user);
      const currentUserStub = Service.create({ load, user });
      const setLocaleStub = sinon.stub();
      const intlStub = Service.create({
        setLocale: setLocaleStub,
      });
      const route = this.owner.lookup('route:application');
      route.set('currentUser', currentUserStub);
      route.set('intl', intlStub);

      // when
      await route._handleLanguage();

      // then
      sinon.assert.called(setLocaleStub);
      sinon.assert.calledWith(setLocaleStub, ['en', 'fr']);
    });

    it('should update users when there is a params', async function() {
      // given
      const saveStub = sinon.stub().resolves();

      const user = {
        lang: 'en',
        save: saveStub,
      };
      const loadStub = sinon.stub().resolves(user);
      const currentUserStub = Service.create({ load: loadStub, user });
      const setLocaleStub = sinon.stub();
      const intlStub = Service.create({
        setLocale: setLocaleStub,
      });
      const route = this.owner.lookup('route:application');
      route.set('currentUser', currentUserStub);
      route.set('intl', intlStub);

      // when
      await route._handleLanguage('en');

      // then
      sinon.assert.called(saveStub);
      sinon.assert.calledWith(saveStub, { adapterOptions: { lang: 'en' } });
    });

  });

});
