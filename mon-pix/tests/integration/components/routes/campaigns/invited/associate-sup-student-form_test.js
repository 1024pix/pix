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

describe('Integration | Component | routes/campaigns/invited/associate-sup-student-form', function () {
  setupIntlRenderingTest();

  let sessionStub;
  let storeStub;
  let onSubmitStub;

  beforeEach(function () {
    sessionStub = class StoreStub extends Service {};
    storeStub = class StoreStub extends Service {
      createRecord = () => ({
        unloadRecord: () => sinon.stub(),
      });
    };
    this.owner.register('service:session', sessionStub);
    this.owner.register('service:store', storeStub);
  });

  context('when user fill the form correctly', () => {
    it('should call the submit callback', async function () {
      // given
      onSubmitStub = sinon.stub();
      this.set('onSubmitStub', onSubmitStub);

      // when
      await render(
        hbs`<Routes::Campaigns::Invited::AssociateSupStudentForm @campaignCode={{123}} @onSubmit={{this.onSubmitStub}}/>`
      );

      await fillInByLabel('Numéro étudiant', 'F100');
      await fillInByLabel('Prénom', 'Jean');
      await fillInByLabel('Nom', 'Bon');
      await fillInByLabel('jour de naissance', '01');
      await fillInByLabel('mois de naissance', '01');
      await fillInByLabel('année de naissance', '2000');
      await clickByLabel("C'est parti !");

      // then
      sinon.assert.called(onSubmitStub);
    });
  });

  context('when the server responds an error', () => {
    it('should display server error', async function () {
      // given
      onSubmitStub = sinon.stub().rejects();
      this.set('onSubmitStub', onSubmitStub);

      // when
      await render(
        hbs`<Routes::Campaigns::Invited::AssociateSupStudentForm @campaignCode={{123}} @onSubmit={{this.onSubmitStub}}/>`
      );

      await fillInByLabel('Numéro étudiant', 'F100');
      await fillInByLabel('Prénom', 'Jean');
      await fillInByLabel('Nom', 'Bon');
      await fillInByLabel('jour de naissance', '01');
      await fillInByLabel('mois de naissance', '01');
      await fillInByLabel('année de naissance', '2000');
      await clickByLabel("C'est parti !");

      // then
      expect(
        contains(
          'Veuillez vérifier les informations saisies, ou si vous avez déjà un compte Pix, connectez-vous avec celui-ci.'
        )
      ).to.exist;
    });
  });
});
