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
    let sessionStub;
    let storeStub;
    const expectedEmail = 'email@example.net';
    const expectedPassword = 'azerty';

    beforeEach(function() {
      queryRecordStub = sinon.stub();
      authenticateStub = sinon.stub();
      sessionStub = Service.create({
        authenticate: authenticateStub,
      });
      storeStub = Service.create({
        queryRecord: queryRecordStub
      });
    });

    it('should authenticate the user given email and password', async function() {
      // Given
      authenticateStub.resolves();

      const foundUser = EmberObject.create({ id: 12 });
      queryRecordStub.resolves(foundUser);
      const route = this.owner.lookup('route:login');
      route.set('store', storeStub);
      route.set('session', sessionStub);
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
