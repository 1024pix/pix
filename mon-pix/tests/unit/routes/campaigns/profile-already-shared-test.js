import { expect } from 'chai';
import Service from '@ember/service';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | campaigns/profile-already-shared', function() {
  setupTest();

  describe('#model', function() {

    it('should return the user, campaign and shared profile as the model', async function() {
      // given
      const route = this.owner.lookup('route:campaigns/profile-already-shared');
      const campaign = { id: 'campaignId' };
      route.modelFor = sinon.stub().returns(campaign);
      const sharedProfile = 'sharedProfile';
      route.set('store', Service.create({
        queryRecord: sinon.stub().resolves(sharedProfile)
      }));
      const user = { id: 'userId' };
      route.set('currentUser', Service.create({ user }));

      // when
      const model = await route.model();

      // then
      expect(model).to.deep.equal({ campaign, user, sharedProfile });
    });
  });
});
