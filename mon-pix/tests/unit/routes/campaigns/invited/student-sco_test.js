import Service from '@ember/service';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | campaigns/invited/student-sco', function () {
  setupTest();

  describe('#afterModel', function () {
    it('should redirect to campaigns.invited.fill-in-participant-external-id when an association already exists', async function () {
      // given
      const route = this.owner.lookup('route:campaigns.invited.student-sco');
      const campaign = { code: 'campaignCode' };
      route.paramsFor = sinon.stub().returns(campaign);
      route.set(
        'store',
        Service.create({
          queryRecord: sinon.stub().resolves('a student user association'),
        })
      );
      route.set(
        'currentUser',
        Service.create({
          user: { id: 'id' },
        })
      );
      route.replaceWith = sinon.stub();

      // when
      await route.afterModel(campaign);

      // then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.invited.fill-in-participant-external-id', campaign.code);
    });
  });
});
