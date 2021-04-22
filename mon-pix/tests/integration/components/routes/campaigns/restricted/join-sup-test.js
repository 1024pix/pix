import { describe, it, beforeEach } from 'mocha';
import sinon from 'sinon';
import { expect } from 'chai';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { fillInByLabel } from '../../../../../helpers/fill-in-by-label';
import { clickByLabel } from '../../../../../helpers/click-by-label';
import { contains } from '../../../../../helpers/contains';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

describe('Integration | Component | routes/campaigns/restricted/join-sup', function() {
  setupIntlRenderingTest();

  let sessionStub;
  let storeStub;
  let onSubmitToReconcileStub;

  beforeEach(function() {
    sessionStub = class StoreStub extends Service {};
    storeStub = class StoreStub extends Service {
      createRecord = () => ({
        unloadRecord: () => sinon.stub(),
      })
    };
    this.owner.register('service:session', sessionStub);
    this.owner.register('service:store', storeStub);
  });

  context('when user fill the form correctly', () => {
    it('should call the submit callback', async function() {
      // given
      onSubmitToReconcileStub = sinon.stub();
      this.set('onSubmitToReconcileStub', onSubmitToReconcileStub);

      // when
      await render(hbs`<Routes::Campaigns::Restricted::JoinSup @campaignCode={{123}} @onSubmitToReconcile={{this.onSubmitToReconcileStub}}/>`);

      await fillInByLabel('Numéro étudiant', 'F100');
      await fillInByLabel('Prénom', 'Jean');
      await fillInByLabel('Nom', 'Bon');
      await fillInByLabel('jour de naissance', '01');
      await fillInByLabel('mois de naissance', '01');
      await fillInByLabel('année de naissance', '2000');
      await clickByLabel('C\'est parti !');

      // then
      sinon.assert.called(onSubmitToReconcileStub);
    });
  });

  context('when the server responds an error', () => {
    it('should display server error', async function() {
      // given
      onSubmitToReconcileStub = sinon.stub().rejects();
      this.set('onSubmitToReconcileStub', onSubmitToReconcileStub);

      // when
      await render(hbs`<Routes::Campaigns::Restricted::JoinSup @campaignCode={{123}} @onSubmitToReconcile={{this.onSubmitToReconcileStub}}/>`);

      await fillInByLabel('Numéro étudiant', 'F100');
      await fillInByLabel('Prénom', 'Jean');
      await fillInByLabel('Nom', 'Bon');
      await fillInByLabel('jour de naissance', '01');
      await fillInByLabel('mois de naissance', '01');
      await fillInByLabel('année de naissance', '2000');
      await clickByLabel('C\'est parti !');

      // then
      expect(contains('Veuillez vérifier les informations saisies, ou si vous avez déjà un compte Pix, connectez-vous avec celui-ci.')).to.exist;
    });
  });
});
