import EmberObject from '@ember/object';
import Service from '@ember/service';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | login page', function() {

  setupTest();

  describe('#authenticate', function() {

    context('when user is not authenticated', function() {

      const authenticateStub = sinon.stub();
      const queryRecordStub = sinon.stub();

      const sessionStub = Service.create({
        authenticate: authenticateStub,
      });
      const storeStub = Service.create({
        queryRecord: queryRecordStub
      });

      const foundUser = EmberObject.create({ id: 12 });

      const expectedAuthenticator = 'authenticator:oauth2';
      const email = 'email@example.net';
      const password = 'azerty';
      const scope = 'mon-pix';

      it('should authenticate the user given email and password', async function() {
        // Given
        authenticateStub.resolves();
        queryRecordStub.resolves(foundUser);

        const route = this.owner.lookup('route:login');
        route.set('store', storeStub);
        route.set('session', sessionStub);
        sinon.stub(route, 'transitionTo').throws('Must not be called');
        await route.beforeModel({ to: {} });

        // When
        await route.actions.authenticate.call(route, email, password);

        // Then
        sinon.assert.calledWith(authenticateStub,
          expectedAuthenticator,
          { email, password, scope }
        );
      });
    });
  });
});
