import { expect } from 'chai';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | campaigns/join-restricted-campaign', function() {
  setupTest();

  describe('#beforeModel', function() {

    it('should redirect to campaigns.start-or-resume when an association already exists', async function() {
      // given
      const route = this.owner.lookup('route:campaigns/join-restricted-campaign');
      const campaign_code = 'campaignCode';
      route.paramsFor = sinon.stub().returns({ campaign_code });
      route.set('store', Service.create({
        queryRecord: sinon.stub().resolves('a student user association')
      }));
      route.set('currentUser', Service.create({
        user: { id: 'id' },
      }));
      route.replaceWith = sinon.stub();

      // when
      await route.beforeModel();

      // then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.start-or-resume', campaign_code, { queryParams: { associationDone: true } });
    });
  });

  describe('#setupController', function() {
    it('should set firstName and lastName attributes in controller when coming from an external source', async function() {
      // given
      const route = this.owner.lookup('route:campaigns/join-restricted-campaign');
      const controller = EmberObject.create();
      route.set('session', Service.create({
        data: { authenticated: { source: 'external' } },
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
