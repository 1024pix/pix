import Service from '@ember/service';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { expect } from 'chai';

describe('Unit | Route | fill-in-campaign-code', function() {
  setupTest();

  context('#beforeModel', function() {

    it('should store externalUser queryParam in session', function() {
      // given
      const externalUser = 'external-user-token';
      const route = this.owner.lookup('route:fill-in-campaign-code');

      const sessionStub = Service.create({
        data: { externalUser: null },
      });
      route.set('session', sessionStub);

      const transition = { to: { queryParams: { externalUser } } };

      // when
      route.beforeModel(transition);

      // then
      expect(sessionStub.data.externalUser).to.equal(externalUser);
    });
  });
});
