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
      primaryLocale = 'fr';
      get = sinon.stub().returns(['fr']);
    }

    this.owner.register('service:session', SessionStub);
    this.owner.register('service:currentDomain', CurrentDomainStub);
    this.owner.register('service:cookies', CookiesStub);
    this.owner.register('service:intl', IntlStub);

    component = createGlimmerComponent('signup-form');
  });

  module('#signup', function () {
    module('error cases', function () {
      module('when the form is invalid', function () {
        test('does not save the user', async function (assert) {
          // given
          const user = EmberObject.create({
            firstName: 'Chris',
            lastName: 'MylastName',
            email: 'invalid-user-email.com',
            password: 'Pix12345',
            save: sinon.stub().resolves(),
          });
          component.validation.firstName.status = 'success';
          component.validation.lastName.status = 'success';
          component.validation.email.status = 'error';
          component.validation.password.status = 'success';
          component.validation.cgu.status = 'success';
          component.args.user = user;

          // when
          await component.signup();

          // then
          sinon.assert.notCalled(component.args.user.save);
          sinon.assert.notCalled(component.session.authenticateUser);
          assert.ok(true);
        });
      });
    });

    module('success cases', function () {
      test('authenticates the user after sign up', async function (assert) {
        const user = EmberObject.create({
          firstName: 'Chris',
          lastName: 'MylastName',
          email: 'user@example.net',
          password: 'Pix12345',
          save: sinon.stub().resolves(),
        });
        component.args.user = user;

        // when
        await component.signup();

        // then
        sinon.assert.calledOnce(component.args.user.save);
        sinon.assert.calledWith(component.session.authenticateUser, 'user@example.net', 'Pix12345');
        assert.ok(true);
      });

      module('when user information contains spaces', function () {
        test('trims spaces before saving the user information', function (assert) {
          // given
          const userWithSpaces = EmberObject.create({
            firstName: '  Chris  ',
            lastName: '  MylastName  ',
            email: '    user@example.net  ',
            password: 'Pix12345',
            save: sinon.stub().resolves(),
          });
          component.args.user = userWithSpaces;

          // when
          component.signup();

          // then
          const expectedUser = {
            firstName: userWithSpaces.firstName.trim(),
            lastName: userWithSpaces.lastName.trim(),
            email: userWithSpaces.email.trim(),
            lang: 'fr',
          };
          assert.deepEqual(pick(component.args.user, ['firstName', 'lastName', 'email', 'lang']), expectedUser);
        });
      });

      module('when campaign code is available', function () {
        test('sends the campaign code', function (assert) {
          // given
          const user = EmberObject.create({
            firstName: 'Chris',
            lastName: 'MylastName',
            email: 'user@example.net',
            password: 'Pix12345',
            save: sinon.stub().resolves(),
          });
          component.args.user = user;

          const campaignCode = 'AZERTY123';
          component.session.attemptedTransition.from.parent.params.code = campaignCode;

          // when
          component.signup();

          // then
          sinon.assert.calledWith(user.save, { adapterOptions: { campaignCode } });
          assert.ok(true);
        });
      });
    });
  });

  module('#onCguCheckboxChange', function () {
    module('when checkbox is checked', function () {
      test('it registers the cgu as accepted', function (assert) {
        // given
        const event = {
          target: {
            checked: true,
          },
        };
        component.args.user = {
          cgu: false,
        };

        // when
        component.onCguCheckboxChange(event);

        // then
        assert.true(component.args.user.cgu);
      });
    });

    module('when checkbox is unchecked', function () {
      test('it registers the cgu as not accepted', function (assert) {
        // given
        const event = {
          target: {
            checked: false,
          },
        };
        component.args.user = {
          cgu: true,
        };

        // when
        component.onCguCheckboxChange(event);

        // then
        assert.false(component.args.user.cgu);
      });
    });
  });
});
