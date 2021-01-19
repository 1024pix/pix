import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | User-Dashboard', function() {
  setupTest();

  describe('#model', function() {

    it('should returns the model that contains scorecards and campaignParticipationOverviews', async function() {
      // given
      const scorecards = [EmberObject.create({ id: 3 }), EmberObject.create({ id: 8 })];
      const profile = EmberObject.create({ scorecards });
      const reloadStub = sinon.stub().returns(profile);
      const belongsToStub = sinon.stub().returns({ reload: reloadStub });

      const currentUserStub = Service.create({
        user: {
          belongsTo: belongsToStub,
        },
      });

      const campaignParticipationOverviews = [EmberObject.create({ id: 10 })];
      const storeStub = { query: sinon.stub().returns(campaignParticipationOverviews) };

      const route = this.owner.lookup('route:user-dashboard');
      route.set('currentUser', currentUserStub);
      route.set('store', storeStub);

      // when
      const model = await route.model();

      // then
      expect(model.scorecards).to.deep.equal(scorecards);
      expect(model.campaignParticipationOverviews).to.deep.equal(campaignParticipationOverviews);
    });
  });

});
