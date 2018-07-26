import EmberObject from '@ember/object';
import Service from '@ember/service';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | login page', function() {
  setupTest('route:login', {
    needs: ['service:current-routed-modal', 'service:session']
  });

  const authenticatedStub = sinon.stub();
  const queryRecordStub = sinon.stub();
  const expectedEmail = 'email@example.net';
  const expectedPassword = 'azerty';

  beforeEach(function() {
    this.register('service:session', Service.extend({
      authenticate: authenticatedStub
    }));
    this.inject.service('session', { as: 'session' });

    this.register('service:store', Service.extend({
      queryRecord: queryRecordStub
    }));
    this.inject.service('store', { as: 'store' });
  });

  it('should authenticate the user', function() {
    // Given
    authenticatedStub.resolves();

    const foundUser = EmberObject.create({ id: 12 });
    queryRecordStub.resolves(foundUser);
    const route = this.subject();
    route.transitionTo = () => {
    };

    // When
    const promise = route.actions.signin.call(route, expectedEmail, expectedPassword);

    // Then
    return promise.then(() => {
      sinon.assert.calledWith(authenticatedStub, 'authenticator:simple', expectedEmail, expectedPassword);
    });
  });

});
