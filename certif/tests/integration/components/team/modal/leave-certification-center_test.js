import { module, test } from 'qunit';
import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Components | Team::Modal::LeaveCertificationCenter', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the modal is open', function (hooks) {
    let screen;
    let closeModal, leaveCertificationCenter;

    hooks.beforeEach(async function () {
      closeModal = sinon.stub();
      leaveCertificationCenter = sinon.stub();

      this.set('certificationCenterName', 'Havana Certification');
      this.set('isOpen', true);
      this.set('leaveCertificationCenter', leaveCertificationCenter);
      this.set('closeModal', closeModal);

      screen = await render(
        hbs`<Team::Modal::LeaveCertificationCenter @certificationCenterName={{this.certificationCenterName}} @isOpen={{this.isOpen}} @onSubmit={{this.leaveCertificationCenter}} @onClose={{this.closeModal}} />`,
      );
    });

    test('displays modal content', function (assert) {
      // then
      assert.dom(screen.getByRole('heading', { level: 1, name: 'Quitter cet espace Pix Certif' })).exists();
      assert.dom(screen.getByText('Havana Certification')).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Confirmer' })).exists();
    });

    module('when clicking on "Confirm" button', function () {
      test('calls "onSubmit" function', async function (assert) {
        // when
        await clickByName('Confirmer');

        // then
        assert.true(leaveCertificationCenter.calledOnce);
      });
    });

    module('when clicking on "Cancel" button', function () {
      test('calls "onClose" button', async function (assert) {
        // when
        await clickByName('Annuler');

        // then
        assert.true(closeModal.calledOnce);
      });
    });
  });
});
