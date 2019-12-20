import sinon from 'sinon';

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Component | login-form', (hooks) => {

  setupTest(hooks);

  const authenticateStub = sinon.stub().resolves();
  const expectedAuthenticator = 'authenticator:oauth2';

  let component;

  hooks.beforeEach(function() {
    const sessionStub = Service.create({
      authenticate: authenticateStub,
    });

    component = this.owner.lookup('component:login-form');
    component.set('session', sessionStub);
  });

  module('#authenticate', () => {

    test('should authenticate user with trimed email', async (assert) => {
      // given
      const emailWithSpaces = '  email@example.net  ';
      component.set('email', emailWithSpaces);

      const expectedEmail = emailWithSpaces.trim();

      // when
      component.send('authenticate');

      // then
      assert.ok(authenticateStub.calledWith(expectedAuthenticator,
        expectedEmail,
        sinon.match.any, sinon.match.any
      ));
    });
  });

});

