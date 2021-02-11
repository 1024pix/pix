import sinon from 'sinon';

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | login-form', (hooks) => {

  setupTest(hooks);

  const authenticateStub = sinon.stub().resolves();
  const expectedAuthenticator = 'authenticator:oauth2';
  const eventStub = { preventDefault: sinon.stub().returns() };

  let component;

  hooks.beforeEach(function() {
    class SessionStub extends Service {
      authenticate = authenticateStub;
    }
    this.owner.register('service:session', SessionStub);
    component = createGlimmerComponent('component:login-form');
  });

  module('#authenticate', () => {

    test('should authenticate user with trimmed email', async (assert) => {
      // given
      const emailWithSpaces = '  email@example.net  ';
      component.email = emailWithSpaces;

      const expectedEmail = emailWithSpaces.trim();

      // when
      await component.authenticate(eventStub);

      // then
      assert.ok(authenticateStub.calledWith(expectedAuthenticator,
        expectedEmail,
        sinon.match.any, sinon.match.any,
      ));
    });
  });

});

