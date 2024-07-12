import { clickByText, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Target Profiles | Modal | Copy', function (hooks) {
  setupIntlRenderingTest(hooks);

  let copyTargetProfile;
  let closeCopyModal;
  let showCopyModal;

  hooks.beforeEach(async function () {
    copyTargetProfile = sinon.stub().resolves(true);
    closeCopyModal = sinon.stub().resolves(true);
    showCopyModal = true;
  });

  test('it should render the copy modal', async function (assert) {
    // given
    this.set('copyTargetProfile', copyTargetProfile);
    this.set('closeCopyModal', closeCopyModal);
    this.set('showCopyModal', showCopyModal);

    // when
    const screen = await render(hbs`<TargetProfiles::Modal::Copy
        @isOpen={{this.showCopyModal}}
        @onClose={{this.closeCopyModal}}
        @onSubmit={{this.copyTargetProfile}}
      />`);

    // then
    assert.dom(screen.getByText('Dupliquer le profil cible ?')).exists();
    assert
      .dom(
        screen.getByText('Cette action dupliquera le profil cible avec ses sujets, résultats thématiques et paliers.'),
      )
      .exists();
    assert.dom(screen.getByRole('button', { name: 'Valider' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Fermer' })).exists();
  });

  test('it should call the copy method on click on submit', async function (assert) {
    // given
    this.set('copyTargetProfile', copyTargetProfile);
    this.set('closeCopyModal', closeCopyModal);
    this.set('showCopyModal', showCopyModal);
    await render(hbs`<TargetProfiles::Modal::Copy
        @isOpen={{this.showCopyModal}}
        @onClose={{this.closeCopyModal}}
        @onSubmit={{this.copyTargetProfile}}
      />`);

    // when
    await clickByText('Valider');

    // then
    sinon.assert.calledOnce(copyTargetProfile);
    assert.ok(true);
  });

  test('it should call the close method on click on cancel', async function (assert) {
    // given
    this.set('copyTargetProfile', copyTargetProfile);
    this.set('closeCopyModal', closeCopyModal);
    this.set('showCopyModal', showCopyModal);
    await render(hbs`<TargetProfiles::Modal::Copy
        @isOpen={{this.showCopyModal}}
        @onClose={{this.closeCopyModal}}
        @onSubmit={{this.copyTargetProfile}}
      />`);

    // when
    await clickByText('Annuler');

    // then
    sinon.assert.calledOnce(closeCopyModal);
    assert.ok(true);
  });

  test('it should call the close method on click on close', async function (assert) {
    // given
    this.set('copyTargetProfile', copyTargetProfile);
    this.set('closeCopyModal', closeCopyModal);
    this.set('showCopyModal', showCopyModal);
    const screen = await render(hbs`<TargetProfiles::Modal::Copy
        @isOpen={{this.showCopyModal}}
        @onClose={{this.closeCopyModal}}
        @onSubmit={{this.copyTargetProfile}}
      />`);

    // when
    await click(screen.getByRole('button', { name: 'Fermer' }));

    // then
    sinon.assert.calledOnce(closeCopyModal);
    assert.ok(true);
  });
});
