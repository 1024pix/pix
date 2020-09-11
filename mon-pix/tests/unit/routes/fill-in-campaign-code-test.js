import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | fill-in-campaign-code', function() {
  setupTest();

  context('#beforeModel', () => {

    it('should store externalUser queryParam in session', function() {
      // given
      const route = this.owner.lookup('route:fill-in-campaign-code');

      const setStub = sinon.stub();
      const session = {
        set: setStub,
      };
      route.set('session', session);

      const externalUser = 'external-user-token';
      const transition = { to: { queryParams: { externalUser } } };

      // when
      route.beforeModel(transition);

      // then
      sinon.assert.calledWith(setStub, 'data.externalUser', externalUser);
    });
  });
});
