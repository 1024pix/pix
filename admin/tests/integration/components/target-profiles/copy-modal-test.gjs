import { clickByText, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import Copy from 'pix-admin/components/target-profiles/modal/copy';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Target Profiles | Modal | Copy', function (hooks) {
  setupIntlRenderingTest(hooks);

  const copyTargetProfile = sinon.stub().resolves(true);
  const closeCopyModal = sinon.stub().resolves(true);
  const showCopyModal = true;

  test('it should render the copy modal', async function (assert) {
    // when
    const screen = await render(
      <template>
        <Copy @isOpen={{showCopyModal}} @onClose={{closeCopyModal}} @onSubmit={{copyTargetProfile}} />
      </template>,
    );

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
    await render(
      <template>
        <Copy @isOpen={{showCopyModal}} @onClose={{closeCopyModal}} @onSubmit={{copyTargetProfile}} />
      </template>,
    );

    // when
    await clickByText('Valider');

    // then
    sinon.assert.calledOnce(copyTargetProfile);
    assert.ok(true);
  });

  test('it should call the close method on click on cancel', async function (assert) {
    // given
    const closeCopyModal = sinon.stub().resolves(true);

    await render(
      <template>
        <Copy @isOpen={{showCopyModal}} @onClose={{closeCopyModal}} @onSubmit={{copyTargetProfile}} />
      </template>,
    );

    // when
    await clickByText('Annuler');

    // then
    sinon.assert.calledOnce(closeCopyModal);
    assert.ok(true);
  });

  test('it should call the close method on click on close', async function (assert) {
    // given
    const closeCopyModal = sinon.stub().resolves(true);

    const screen = await render(
      <template>
        <Copy @isOpen={{showCopyModal}} @onClose={{closeCopyModal}} @onSubmit={{copyTargetProfile}} />
      </template>,
    );

    // when
    await click(screen.getByRole('button', { name: 'Fermer' }));

    // then
    sinon.assert.calledOnce(closeCopyModal);
    assert.ok(true);
  });
});
