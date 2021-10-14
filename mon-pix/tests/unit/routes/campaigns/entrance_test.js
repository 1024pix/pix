import EmberObject from '@ember/object';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Entrance', function () {
  setupTest();

  let route, campaign;

  beforeEach(function () {
    route = this.owner.lookup('route:campaigns.entrance');

    route.modelFor = sinon.stub();
  });

  describe('#model', function () {
    it('should load model', async function () {
      //when
      await route.model();

      //then
      sinon.assert.calledWith(route.modelFor, 'campaigns');
    });
  });

  describe('#redirect', function () {
    beforeEach(function () {
      route.replaceWith = sinon.stub();
    });

    it('should redirect to profiles-collection when campaign is of type PROFILES COLLECTION', async function () {
      //given
      campaign = EmberObject.create({
        isProfilesCollection: true,
      });

      //when
      await route.redirect(campaign);

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.profiles-collection.start-or-resume');
    });

    it('should redirect to assessment when campaign is of type ASSESSMENT', async function () {
      //given
      campaign = EmberObject.create({
        isProfilesCollection: false,
      });

      //when
      await route.redirect(campaign);

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.assessment.start-or-resume');
    });
  });
});
