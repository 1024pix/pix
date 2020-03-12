import sinon from 'sinon';

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | Routes | login-form', (hooks) => {

  setupTest(hooks);

  let component;

  hooks.beforeEach(function() {
    component = this.owner.lookup('component:routes/login-form');
  });

  module('#authenticate', () => {

    test('should save email without spaces', (assert) => {
      // given
      const emailWithSpaces = '    user@example.net  ';
      component.set('email', emailWithSpaces);

      const _authenticateStub = sinon.stub().resolves();
      component.set('_authenticate', _authenticateStub);

      const expectedEmail = emailWithSpaces.trim();

      // when
      component.send('authenticate', new Event('stub'));

      // then
      assert.ok(_authenticateStub.calledWith(sinon.match.any, expectedEmail));
    });
  });

});
