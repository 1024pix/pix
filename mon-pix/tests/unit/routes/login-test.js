import EmberObject from '@ember/object';
import Service from '@ember/service';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | login page', function() {

  setupTest();

  context('when user is not authenticated', function() {
    let authenticateStub;
    let queryRecordStub;
    const expectedEmail = 'email@example.net';
    const expectedPassword = 'azerty';

    beforeEach(function() {
      queryRecordStub = sinon.stub();
      authenticateStub = sinon.stub();
      this.owner.register('service:session', Service.extend({
        authenticate: authenticateStub,
      }));

      this.owner.register('service:store', Service.extend({
        queryRecord: queryRecordStub
      }));
    });

    it('should authenticate the user given email and password', async function() {
      // Given
      authenticateStub.resolves();

      const foundUser = EmberObject.create({ id: 12 });
      queryRecordStub.resolves(foundUser);
      const route = this.owner.lookup('route:login');
      sinon.stub(route, 'transitionTo').throws('Must not be called');

      // When
      await route.beforeModel({ to: {} });
      await route.actions.signin.call(route, expectedEmail, expectedPassword);

      // Then
      sinon.assert.calledWith(authenticateStub, 'authenticator:simple', {
        email: expectedEmail,
        password: expectedPassword
      });
    });
  });
});
