import { module, test } from 'qunit';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { fillInByLabel } from '../../../../../helpers/fill-in-by-label';
import { clickByLabel } from '../../../../../helpers/click-by-label';
import { contains } from '../../../../../helpers/contains';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | routes/campaigns/invited/associate-sup-student-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  let sessionStub;
  let storeStub;
  let routerStub;
  let saveStub;
  let transitionToStub;

  hooks.beforeEach(function () {
    saveStub = sinon.stub();
    transitionToStub = sinon.stub();
    sessionStub = class StoreStub extends Service {};
    storeStub = class StoreStub extends Service {
      createRecord = () => ({
        save: saveStub,
        unloadRecord: () => sinon.stub(),
      });
    };
    routerStub = class RouterStub extends Service {
      transitionTo = transitionToStub;
    };
    this.owner.register('service:router', routerStub);
    this.owner.register('service:session', sessionStub);
    this.owner.register('service:store', storeStub);
  });

  module('when user fill the form correctly', function () {
    test('should save form', async function (assert) {
      // when
      await render(hbs`<Routes::Campaigns::Invited::AssociateSupStudentForm @campaignCode={{123}}/>`);

      await fillInByLabel('Numéro étudiant', 'F100');
      await fillInByLabel('Prénom', 'Jean');
      await fillInByLabel('Nom', 'Bon');
      await fillInByLabel('jour de naissance', '01');
      await fillInByLabel('mois de naissance', '01');
      await fillInByLabel('année de naissance', '2000');
      await clickByLabel("C'est parti !");

      // then
      sinon.assert.calledWithExactly(saveStub);
      assert.ok(true);
    });

    test('should transition to fill-in-participant-external-id', async function (assert) {
      // when
      await render(hbs`<Routes::Campaigns::Invited::AssociateSupStudentForm @campaignCode={{123}}/>`);

      await fillInByLabel('Numéro étudiant', 'F100');
      await fillInByLabel('Prénom', 'Jean');
      await fillInByLabel('Nom', 'Bon');
      await fillInByLabel('jour de naissance', '01');
      await fillInByLabel('mois de naissance', '01');
      await fillInByLabel('année de naissance', '2000');
      await clickByLabel("C'est parti !");

      // then
      sinon.assert.calledWithExactly(transitionToStub, 'campaigns.invited.fill-in-participant-external-id', 123);
      assert.ok(true);
    });
  });

  module('when the server responds an error', function () {
    test('should display server error', async function (assert) {
      // given
      saveStub.rejects();

      // when
      await render(hbs`<Routes::Campaigns::Invited::AssociateSupStudentForm @campaignCode={{123}}/>`);

      await fillInByLabel('Numéro étudiant', 'F100');
      await fillInByLabel('Prénom', 'Jean');
      await fillInByLabel('Nom', 'Bon');
      await fillInByLabel('jour de naissance', '01');
      await fillInByLabel('mois de naissance', '01');
      await fillInByLabel('année de naissance', '2000');
      await clickByLabel("C'est parti !");

      // then
      assert.ok(
        contains(
          'Veuillez vérifier les informations saisies, ou si vous avez déjà un compte Pix, connectez-vous avec celui-ci.'
        )
      );
    });
  });
});
