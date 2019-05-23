import EmberObject from '@ember/object';
import Service from '@ember/service';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | login page', function() {

  setupTest('route:login', {
    needs: ['service:session', 'service:metrics']
  });

  context('when user is not authenticated', function() {
    let authenticateStub;
    let queryRecordStub;
    const expectedEmail = 'email@example.net';
    const expectedPassword = 'azerty';

    beforeEach(function() {
      queryRecordStub = sinon.stub();
      authenticateStub = sinon.stub();
      this.register('service:session', Service.extend({
        authenticate: authenticateStub,
      }));
      this.inject.service('session', { as: 'session' });

      this.register('service:store', Service.extend({
        queryRecord: queryRecordStub
      }));
      this.inject.service('store', { as: 'store' });
    });

    it('should authenticate the user given email and password', async function() {
      // Given
      authenticateStub.resolves();

      const foundUser = EmberObject.create({ id: 12 });
      queryRecordStub.resolves(foundUser);
      const route = this.subject();
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

    it('should authenticate the user given token in URL', async function() {
      // Given
      authenticateStub.resolves();

      const route = this.subject();
      sinon.stub(route, 'transitionTo');

      // When
      await route.beforeModel({ to: { queryParams: { token: 'aaa.eyJ1c2VyX2lkIjoxLCJzb3VyY2UiOiJwaXgiLCJpYXQiOjE1NDUxMjg3NzcsImV4cCI6MTU0NTczMzU3N30.bbbb' } } });

      // Then
      sinon.assert.calledWith(authenticateStub, 'authenticator:simple', { token: 'aaa.eyJ1c2VyX2lkIjoxLCJzb3VyY2UiOiJwaXgiLCJpYXQiOjE1NDUxMjg3NzcsImV4cCI6MTU0NTczMzU3N30.bbbb' });
    });
  });
});
