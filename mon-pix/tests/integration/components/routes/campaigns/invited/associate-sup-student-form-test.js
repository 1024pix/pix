import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/campaigns/invited/associate-sup-student-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  let sessionStub;
  let storeStub;
  let saveStub;
  let routerObserver;

  hooks.beforeEach(function () {
    routerObserver = this.owner.lookup('service:router');
    routerObserver.transitionTo = sinon.stub();
    saveStub = sinon.stub();
    sessionStub = class StoreStub extends Service {};
    storeStub = class StoreStub extends Service {
      createRecord = () => ({
        save: saveStub,
        unloadRecord: () => sinon.stub(),
      });
    };
    this.owner.register('service:session', sessionStub);
    this.owner.register('service:store', storeStub);
  });

  module('when user fill the form correctly', function () {
    test('should save form', async function (assert) {
      // given
      const screen = await render(hbs`<Routes::Campaigns::Invited::AssociateSupStudentForm @campaignCode={{123}} />`);

      // when
      await _fillInputsAndValidate({ screen });

      // then
      sinon.assert.calledWithExactly(saveStub);
      assert.ok(true);
    });

    test('should transition to fill-in-participant-external-id', async function (assert) {
      // given
      const screen = await render(hbs`<Routes::Campaigns::Invited::AssociateSupStudentForm @campaignCode={{123}} />`);

      // when
      await _fillInputsAndValidate({ screen });

      // then
      sinon.assert.calledWithExactly(
        routerObserver.transitionTo,
        'campaigns.invited.fill-in-participant-external-id',
        123,
      );
      assert.ok(true);
    });
  });

  module('when the server responds an error', function () {
    test('should display server error', async function (assert) {
      // given
      saveStub.rejects();
      const screen = await render(hbs`<Routes::Campaigns::Invited::AssociateSupStudentForm @campaignCode={{123}} />`);

      // when
      await _fillInputsAndValidate({ screen });

      // then
      assert.ok(
        screen.getByText(
          'Veuillez vérifier les informations saisies, ou si vous avez déjà un compte Pix, connectez-vous avec celui-ci.',
        ),
      );
    });
  });

  async function _fillInputsAndValidate({ screen }) {
    await fillIn(screen.getByRole('textbox', { name: 'Numéro étudiant' }), 'F100');
    await fillIn(screen.getByRole('textbox', { name: 'Prénom' }), 'Jean');
    await fillIn(screen.getByRole('textbox', { name: 'Nom' }), 'Bon');
    await fillIn(screen.getByRole('textbox', { name: 'jour de naissance' }), '01');
    await fillIn(screen.getByRole('textbox', { name: 'mois de naissance' }), '01');
    await fillIn(screen.getByRole('textbox', { name: 'année de naissance' }), '2000');
    await click(screen.getByRole('button', { name: "C'est parti !" }));
  }
});
