import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { render as renderScreen } from '@1024pix/ember-testing-library';

module('Integration | Component | finalization-confirmation-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it shows the finalization confirmation modal', async function (assert) {
    // given
    this.set('closeModal', sinon.stub());
    this.set('hasUncheckedHasSeenEndTestScreen', false);
    this.set('uncheckedHasSeenEndTestScreenCount', 0);
    this.set('shouldDisplayHasSeenEndTestScreenCheckbox', false);
    this.set('finalizeSession', sinon.stub());

    // when
    const screen = await renderScreen(hbs`
    <SessionFinalization::FinalizationConfirmationModal
      @showModal={{true}}
      @closeModal={{this.closeModal}}
      @hasUncheckedHasSeenEndTestScreen={{this.hasUncheckedHasSeenEndTestScreen}}
      @uncheckedHasSeenEndTestScreenCount={{this.uncheckedHasSeenEndTestScreenCount}}
      @shouldDisplayHasSeenEndTestScreenCheckbox={{this.shouldDisplayHasSeenEndTestScreenCheckbox}}
      @finalizeSession={{this.finalizeSession}}
    />
    `);

    // then
    assert.dom(screen.getByText('Finalisation de la session')).exists();
    assert
      .dom(
        screen.getByText(
          "Un délai de traitement est nécessaire avant la mise à disposition des résultats par Pix (ce délai de traitement pouvant varier d'une session à l'autre)."
        )
      )
      .exists();
  });

  module('when hasUncheckedHasSeenEndTestScreen and shouldDisplayHasSeenEndTestScreenCheckbox are true', function () {
    test('it shows unchecked end test screen count', async function (assert) {
      // given
      this.set('closeModal', sinon.stub());
      this.set('hasUncheckedHasSeenEndTestScreen', true);
      this.set('uncheckedHasSeenEndTestScreenCount', 2);
      this.set('shouldDisplayHasSeenEndTestScreenCheckbox', true);
      this.set('finalizeSession', sinon.stub());

      // when
      const screen = await renderScreen(hbs`
      <SessionFinalization::FinalizationConfirmationModal
        @closeModal={{this.closeModal}}
        @hasUncheckedHasSeenEndTestScreen={{this.hasUncheckedHasSeenEndTestScreen}}
        @uncheckedHasSeenEndTestScreenCount={{this.uncheckedHasSeenEndTestScreenCount}}
        @shouldDisplayHasSeenEndTestScreenCheckbox={{this.shouldDisplayHasSeenEndTestScreenCheckbox}}
        @finalizeSession={{this.finalizeSession}}
      />
      `);

      // then
      assert.dom(screen.getByText('La case "Écran de fin du test vu" n\'est pas cochée pour 2 candidat(s)')).exists();
    });
  });

  module('when close button cross icon is clicked', () => {
    test('it closes candidate details modal', async function (assert) {
      // given
      const closeModalStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('hasUncheckedHasSeenEndTestScreen', false);
      this.set('uncheckedHasSeenEndTestScreenCount', 0);
      this.set('shouldDisplayHasSeenEndTestScreenCheckbox', false);
      this.set('finalizeSession', sinon.stub());

      // when
      const screen = await renderScreen(hbs`
      <SessionFinalization::FinalizationConfirmationModal
        @showModal={{true}}
        @closeModal={{this.closeModal}}
        @hasUncheckedHasSeenEndTestScreen={{this.hasUncheckedHasSeenEndTestScreen}}
        @uncheckedHasSeenEndTestScreenCount={{this.uncheckedHasSeenEndTestScreenCount}}
        @shouldDisplayHasSeenEndTestScreenCheckbox={{this.shouldDisplayHasSeenEndTestScreenCheckbox}}
        @finalizeSession={{this.finalizeSession}}
      />
      `);

      await click(screen.getByRole('button', { name: 'Fermer' }));

      // then
      sinon.assert.calledOnce(closeModalStub);
      assert.ok(true);
    });
  });

  module('when cancel bottom button is clicked', () => {
    test('it closes candidate details modal ', async function (assert) {
      // given
      const closeModalStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('hasUncheckedHasSeenEndTestScreen', false);
      this.set('uncheckedHasSeenEndTestScreenCount', 0);
      this.set('shouldDisplayHasSeenEndTestScreenCheckbox', false);
      this.set('finalizeSession', sinon.stub());

      // when
      const screen = await renderScreen(hbs`
      <SessionFinalization::FinalizationConfirmationModal
        @showModal={{true}}
        @closeModal={{this.closeModal}}
        @hasUncheckedHasSeenEndTestScreen={{this.hasUncheckedHasSeenEndTestScreen}}
        @uncheckedHasSeenEndTestScreenCount={{this.uncheckedHasSeenEndTestScreenCount}}
        @shouldDisplayHasSeenEndTestScreenCheckbox={{this.shouldDisplayHasSeenEndTestScreenCheckbox}}
        @finalizeSession={{this.finalizeSession}}
      />
      `);

      await click(screen.getByRole('button', { name: 'Annuler' }));

      // then
      sinon.assert.calledOnce(closeModalStub);
      assert.ok(true);
    });
  });

  module('when the finalization is confirmed', () => {
    test('it should finalize de session', async function (assert) {
      // given
      const finalizeSessionStub = sinon.stub();
      this.set('closeModal', sinon.stub());
      this.set('hasUncheckedHasSeenEndTestScreen', false);
      this.set('uncheckedHasSeenEndTestScreenCount', 0);
      this.set('shouldDisplayHasSeenEndTestScreenCheckbox', false);
      this.set('finalizeSession', finalizeSessionStub);

      // when
      const screen = await renderScreen(hbs`
    <SessionFinalization::FinalizationConfirmationModal
      @showModal={{true}}
      @closeModal={{this.closeModal}}
      @hasUncheckedHasSeenEndTestScreen={{this.hasUncheckedHasSeenEndTestScreen}}
      @uncheckedHasSeenEndTestScreenCount={{this.uncheckedHasSeenEndTestScreenCount}}
      @shouldDisplayHasSeenEndTestScreenCheckbox={{this.shouldDisplayHasSeenEndTestScreenCheckbox}}
      @finalizeSession={{this.finalizeSession}}
    />
    `);

      await click(screen.getByRole('button', { name: 'Confirmer la finalisation' }));

      sinon.assert.calledOnce(finalizeSessionStub);
      assert.ok(true);
    });
  });
});
