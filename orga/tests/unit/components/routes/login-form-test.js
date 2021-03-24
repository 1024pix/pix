import sinon from 'sinon';

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Routes | login-form', (hooks) => {

  setupTest(hooks);

  let component;

  hooks.beforeEach(() => {
    component = createGlimmerComponent('component:routes/login-form');
  });

  module('#authenticate', () => {

    test('should save email without spaces', (assert) => {
      // given
      const emailWithSpaces = '    user@example.net  ';
      component.email = emailWithSpaces;

      const _authenticateStub = sinon.stub().resolves();
      component._authenticate = _authenticateStub;

      const expectedEmail = emailWithSpaces.trim();

      // when
      component.authenticate(new Event('stub'));

      // then
      assert.ok(_authenticateStub.calledWith(sinon.match.any, expectedEmail));
    });
  });

});
