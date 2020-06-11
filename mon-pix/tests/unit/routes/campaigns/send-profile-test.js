import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';

describe('Unit | Route | campaigns/send-profile', function() {
  setupTest();

  describe('#model', function() {

    it('should return the user, campaign and campaign participation as the model', async function() {
      // given
      const route = this.owner.lookup('route:campaigns/send-profile');
      route.modelFor = sinon.stub();
      const campaign = { id: 'campaignId' };
      route.modelFor.withArgs('campaigns').returns(campaign);
      const campaignParticipation = 'campaignParticipation';
      route.set('store', Service.create({ queryRecord: sinon.stub().resolves(campaignParticipation) }));
      const user = 'user';
      route.set('currentUser', Service.create({ user }));

      // when
      const model = await route.model();

      // then
      expect(model).to.deep.equal({ campaign, user, campaignParticipation });
    });
  });
});
