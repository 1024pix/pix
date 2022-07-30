import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import pick from 'lodash/pick';

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
    }
    this.owner.register('service:session', SessionStub);
    component = createGlimmerComponent('component:signup-form');
  });

  module('#signup', function () {
    test('should save user without spaces', function (assert) {
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
      assert.expect(0);
      sinon.assert.calledWith(userWithSpaces.save, { adapterOptions: { campaignCode } });
    });
  });
});
