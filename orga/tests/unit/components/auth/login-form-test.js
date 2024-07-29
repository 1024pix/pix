import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Routes | login-form', (hooks) => {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:auth/login-form');
    component.session = {
      authenticate: sinon.stub(),
    };
    component.store = {
      createRecord: sinon.stub(),
    };
  });

  module('#authenticate', () => {
    test('should save email without spaces', function (assert) {
      // given
      const emailWithSpaces = '    user@example.net  ';
      component.email = emailWithSpaces;
      component.password = 'pix123';

      const _authenticateStub = sinon.stub().resolves();
      component._authenticate = _authenticateStub;

      const expectedEmail = emailWithSpaces.trim();

      // when
      component.authenticate(new Event('stub'));

      // then
      assert.ok(_authenticateStub.calledWith(sinon.match.any, expectedEmail));
    });

    module('When there is an invitation', () => {
      test('should not accept organization invitation when form is invalid', function (assert) {
        // given
        component.email = '';
        component.password = 'pix123';
        component.args.isWithInvitation = true;

        component._acceptOrganizationInvitation = sinon.stub().resolves();

        // when
        component.authenticate(new Event('stub'));

        // then
        assert.ok(component._acceptOrganizationInvitation.notCalled);
      });

      test('should accept organization invitation when form is valid', function (assert) {
        // given
        component.email = 'sco.admin@example.net';
        component.password = 'pix123';
        component.args.isWithInvitation = true;

        component._acceptOrganizationInvitation = sinon.stub().resolves();

        // when
        component.authenticate(new Event('stub'));

        // then
        assert.ok(component._acceptOrganizationInvitation.calledOnce);
      });
    });

    module('When there is no invitation', () => {
      test('should not call authenticate session when form is invalid', function (assert) {
        // given
        component.email = '';
        component.password = 'pix123';
        component.args.isWithInvitation = false;

        // when
        component.authenticate(new Event('stub'));

        // then
        assert.ok(component.session.authenticate.notCalled);
      });

      test('should call authenticate session when form is valid', function (assert) {
        // given
        component.email = 'sco.admin@example.net';
        component.password = 'pix123';
        component.args.isWithInvitation = false;

        // when
        component.authenticate(new Event('stub'));

        // then
        assert.ok(component.session.authenticate.calledOnce);
      });
    });
  });

  module('#updateEmail', () => {
    test('should update email without spaces', function (assert) {
      // given
      const emailWithSpaces = '    user@example.net  ';
      const event = { target: { value: emailWithSpaces } };

      // when
      component.updateEmail(event);

      // then
      const expectedEmail = emailWithSpaces.trim();
      assert.strictEqual(component.email, expectedEmail);
    });
  });
});
