import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | Campaigns | Fill in Campaign Code', function() {

  setupTest();

  let controller;
  let storeStub;

  beforeEach(function() {
    controller = this.owner.lookup('controller:campaigns/fill-in-campaign-code');
    storeStub = { query: sinon.stub() };
    controller.transitionToRoute = sinon.stub();
    controller.set('store', storeStub);
    controller.set('errorMessage', null);
    controller.set('campaignCode', null);
  });

  describe('#startCampaign', () => {

    it('should call start-or-resume', async () => {
      // given
      const campaignCode = 'azerty1';
      controller.set('campaignCode', campaignCode);
      storeStub.query.resolves();

      // when
      await controller.actions.startCampaign.call(controller);

      // then
      sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.start-or-resume', campaignCode.toUpperCase());
    });

    it('should set error when campaign code is empty', async () => {
      // given
      controller.set('campaignCode', '');

      // when
      await controller.actions.startCampaign.call(controller);

      // then
      expect(controller.get('errorMessage')).to.equal('Merci de renseigner le code du parcours.');
    });

    it('should set error when campaign code is wrong', async () => {
      // given
      controller.set('campaignCode', 'SOMECODE');
      storeStub.query.rejects({ errors: [{ status: '404' }] });

      // when
      await controller.actions.startCampaign.call(controller);

      // then
      expect(controller.get('errorMessage')).to.equal('Votre code de parcours est erroné, veuillez vérifier ou contacter la personne organisant le parcours de test.');
    });
  });

});
