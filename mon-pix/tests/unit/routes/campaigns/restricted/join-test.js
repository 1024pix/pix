import { expect } from 'chai';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import ENV from 'mon-pix/config/environment';

const AUTHENTICATED_SOURCE_FROM_MEDIACENTRE = ENV.APP.AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;

describe('Unit | Route | campaigns/restricted/join', function() {
  setupTest();

  describe('#afterModel', function() {

    it('should redirect to campaigns.start-or-resume when an association already exists', async function() {
      // given
      const route = this.owner.lookup('route:campaigns.restricted.join');
      const campaign = { code: 'campaignCode' };
      route.paramsFor = sinon.stub().returns(campaign);
      route.set('store', Service.create({
        queryRecord: sinon.stub().resolves('a student user association'),
      }));
      route.set('currentUser', Service.create({
        user: { id: 'id' },
      }));
      route.replaceWith = sinon.stub();
      const transition = { to: { queryParams: {} } };

      // when
      await route.afterModel(campaign, transition);

      // then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.start-or-resume', campaign.code, { queryParams: { associationDone: true } });
    });
  });

  describe('#setupController', function() {
    it('should set firstName and lastName attributes in controller when coming from an external source', async function() {
      // given
      const route = this.owner.lookup('route:campaigns.restricted.join');
      const controller = EmberObject.create();
      route.set('session', Service.create({
        data: { authenticated: { source: AUTHENTICATED_SOURCE_FROM_MEDIACENTRE } },
      }));
      const firstName = 'firstName', lastName = 'lastName';
      route.set('currentUser', Service.create({
        user: { firstName, lastName },
      }));

      // when
      await route.setupController(controller);

      // then
      expect(controller.firstName).to.equal(firstName);
      expect(controller.lastName).to.equal(lastName);
    });
  });
});
