import { module, test } from 'qunit';
import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Components | Team::Modal::RemoveMemberModal', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('when the modal is open', function (hooks) {
    let screen;
    let closeRemoveMembershipModal, onRemoveButtonClicked;

    hooks.beforeEach(async function () {
      closeRemoveMembershipModal = sinon.stub();
      onRemoveButtonClicked = sinon.stub();
      this.set('isOpen', true);
      this.set('onRemoveButtonClicked', onRemoveButtonClicked);
      this.set('closeRemoveMembershipModal', closeRemoveMembershipModal);

      screen = await render(
        hbs`<Team::Modal::RemoveMemberModal  @isOpen={{this.isOpen}} @onSubmit={{this.onRemoveButtonClicked}} @onClose={{this.closeRemoveMembershipModal}} />`,
      );
    });

    test("should display the confirmation modal's elements", async function (assert) {
      // then
      assert.dom(screen.getByRole('dialog', { name: 'Confirmez-vous la suppression ?' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Oui, supprimer le membre' })).exists();
    });

    module('when delete member is confirmed', () => {
      test('should call "onRemoveButtonClicked"', async function (assert) {
        // when
        await clickByName('Oui, supprimer le membre');

        // then
        assert.true(onRemoveButtonClicked.calledOnce);
      });
    });

    module('when confirmation is canceled', () => {
      test('should call "closeRemoveMembershipModal"', async function (assert) {
        // when
        await clickByName('Annuler');

        // then
        assert.true(closeRemoveMembershipModal.calledOnce);
      });
    });
  });
});
