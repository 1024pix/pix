import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | User-Tests', function() {
  setupTest();

  describe('#model', function() {
    it('should returns the model that contains campaignParticipationOverviews', async function() {
      // given
      const currentUserStub = Service.create({ user: { id: 1 } });
      const store = this.owner.lookup('service:store');
      sinon.stub(store, 'query');

      const campaignParticipationOverviews = [EmberObject.create({ id: 10 })];
      store.query.withArgs('campaign-participation-overview', {
        userId: 1,
        'page[number]': 1,
        'page[size]': 100,
        'filter[states]': ['ONGOING', 'TO_SHARE', 'ENDED', 'ARCHIVED'],
      }).returns(campaignParticipationOverviews);

      const route = this.owner.lookup('route:user-tests');
      route.set('currentUser', currentUserStub);
      route.set('store', store);

      // when
      const model = await route.model();

      // then
      expect(model).to.deep.equal(campaignParticipationOverviews);
    });
  });

  describe('redirect', function() {
    it('should redirect to default page if there is no campaign participation', function() {
      const route = this.owner.lookup('route:user-tests');
      sinon.stub(route, 'replaceWith');

      route.redirect([], {});
      sinon.assert.calledWithExactly(route.replaceWith, '');
    });

    it('should continue on user-tests if there is some campaign participations', function() {
      const route = this.owner.lookup('route:user-tests');
      sinon.stub(route, 'replaceWith');
      const campaignParticipationOverviews = [EmberObject.create({ id: 10 })];

      route.redirect(campaignParticipationOverviews, {});
      sinon.assert.notCalled(route.replaceWith);
    });
  });
});
