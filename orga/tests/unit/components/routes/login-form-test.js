import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import Service from '@ember/service';

module('Unit | Component | Routes | login-form', function(hooks) {
  setupTest(hooks);

  class SessionStub extends Service {
    authenticate = null;
  }

  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:routes/login-form');
    this.owner.register('service:session', SessionStub);
  });

  module('#authenticate', function() {

    test('should save email without spaces', function(assert) {
      // given
      const emailWithSpaces = '    user@example.net  ';
      component.email = emailWithSpaces;
      const authenticateStub = sinon.stub().resolves();
      this.owner.lookup('service:session').set('authenticate', authenticateStub);
      const expectedEmail = emailWithSpaces.trim();

      // when
      component.authenticate(new Event('stub'));

      // then
      assert.ok(authenticateStub.calledWith(sinon.match.any, expectedEmail));
    });
  });

});
