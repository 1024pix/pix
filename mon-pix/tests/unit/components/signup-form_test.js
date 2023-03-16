import { module, test } from 'qunit';
import sinon from 'sinon';
import pick from 'lodash/pick';

import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | signup-form', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    class SessionStub extends Service {
      attemptedTransition = {
        from: {
          parent: {
            params: sinon.stub().resolves(),
          },
        },
      };
      authenticateUser = sinon.stub().resolves();
    }
    class CurrentDomainStub extends Service {
      getExtension = sinon.stub().returns('fr');
    }
    class CookiesStub extends Service {
      read = sinon.stub().returns();
    }
    class IntlStub extends Service {
      t = sinon.stub().returns('fr');
      get = sinon.stub().returns(['fr']);
    }
    this.owner.register('service:session', SessionStub);
    this.owner.register('service:currentDomain', CurrentDomainStub);
    this.owner.register('service:cookies', CookiesStub);
    this.owner.register('service:intl', IntlStub);
    component = createGlimmerComponent('component:signup-form');
  });

  module('#signup', function () {
    test('should save user with spaces', function (assert) {
      // given
      const userWithSpaces = EmberObject.create({
        firstName: '  Chris  ',
        lastName: '  MylastName  ',
        email: '    user@example.net  ',
        password: 'Pix12345',
        save: sinon.stub().resolves(),
      });
      component.args.user = userWithSpaces;

      const expectedUser = {
        firstName: userWithSpaces.firstName.trim(),
        lastName: userWithSpaces.lastName.trim(),
        email: userWithSpaces.email.trim(),
      };

      // when
      component.signup();

      // then
      const user = component.args.user;
      assert.deepEqual(pick(user, ['firstName', 'lastName', 'email']), expectedUser);
    });

    module('on international domain', function () {
      test('saves user locale from the pix-site cookie', function (assert) {
        // given
        const user = EmberObject.create({
          firstName: 'Carry',
          lastName: 'Bout',
          email: 'carry.bout@example.net',
          password: 'Pix123',
          save: sinon.stub().resolves(),
        });
        component.args.user = user;
        component.currentDomain.getExtension.returns('org');
        component.cookies.read.returns('fr-CA');

        // when
        component.signup();

        // then
        assert.deepEqual(pick(user, ['locale']), { locale: 'fr-CA' });
      });

      test('saves user locale retrieved from the i18n service when there is no cookie', function (assert) {
        // given
        const user = EmberObject.create({
          firstName: 'Carry',
          lastName: 'Bout',
          email: 'carry.bout@example.net',
          password: 'Pix123',
          save: sinon.stub().resolves(),
        });
        component.args.user = user;
        component.currentDomain.getExtension.returns('org');
        component.intl.get.returns(['de']);

        // when
        component.signup();

        // then
        assert.deepEqual(pick(user, ['locale']), { locale: 'de' });
      });
    });

    module('on french domain', function () {
      test('saves user locale with french locale as default', function (assert) {
        // given
        const user = EmberObject.create({
          firstName: 'Carry',
          lastName: 'Bout',
          email: 'carry.bout@example.net',
          password: 'Pix123',
          save: sinon.stub().resolves(),
        });
        component.args.user = user;
        component.currentDomain.getExtension.returns('fr');

        // when
        component.signup();

        // then
        assert.deepEqual(pick(user, ['locale']), { locale: 'fr-FR' });
      });
    });

    test('should authenticate user after sign up', async function (assert) {
      const userWithSpaces = EmberObject.create({
        firstName: '  Chris  ',
        lastName: '  MylastName  ',
        email: '    user@example.net  ',
        password: 'Pix12345',
        save: sinon.stub().resolves(),
      });
      component.args.user = userWithSpaces;

      // when
      await component.signup();

      // then
      sinon.assert.calledOnce(component.args.user.save);
      sinon.assert.calledWith(component.session.authenticateUser, 'user@example.net', 'Pix12345');
      assert.ok(true);
    });

    test('should send campaignCode when is defined', function (assert) {
      // given
      const userWithSpaces = EmberObject.create({
        firstName: '  Chris  ',
        lastName: '  MylastName  ',
        email: '    user@example.net  ',
        password: 'Pix12345',
        save: sinon.stub().resolves(),
      });
      component.args.user = userWithSpaces;

      const campaignCode = 'AZERTY123';
      component.session.attemptedTransition.from.parent.params.code = campaignCode;

      // when
      component.signup();

      // then
      sinon.assert.calledWith(userWithSpaces.save, { adapterOptions: { campaignCode } });
      assert.ok(true);
    });
  });
});
