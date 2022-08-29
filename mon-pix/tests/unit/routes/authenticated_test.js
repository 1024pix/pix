import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | authenticated', function () {
  setupTest();

  it('should check if user is authenticated', function () {
    // given
    const route = this.owner.lookup('route:authenticated');
    const sessionService = this.owner.lookup('service:session');
    sessionService.requireAuthenticationAndApprovedTermsOfService = sinon.stub();
    const transition = Symbol('');

    // when
    route.beforeModel(transition);

    // then
    sinon.assert.calledWith(sessionService.requireAuthenticationAndApprovedTermsOfService, transition);
  });
});
