import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import Details from 'pix-admin/components/autonomous-courses/details';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | AutonomousCourses::Details', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;

  const autonomousCourse = {
    id: 123,
    publicTitle: 'Parkour',
    internalTitle: 'titre interne',
    customLandingPageText: "texte de la page d'accueil",
    code: 'CODE',
    createdAt: '2023-12-27T15:07:57.376Z',
  };

  const update = sinon.stub().callsFake(() => {
    return Promise.resolve();
  });
  const reset = sinon.stub().callsFake(() => {
    return Promise.resolve();
  });

  hooks.beforeEach(async function () {
    screen = await render(
      <template><Details @autonomousCourse={{autonomousCourse}} @update={{update}} @reset={{reset}} /></template>,
    );
  });

  test('it should display autonomous course', async function (assert) {
    // when
    const link = screen.getByRole('link', { name: 'Lien vers la campagne CODE (nouvelle fenêtre)' }).textContent;

    // then
    assert.dom(screen.getByText('123')).exists();
    assert.strictEqual(screen.getAllByText('titre interne').length, 2);
    assert.dom(screen.getByText("texte de la page d'accueil")).exists();
    assert.dom(screen.getByText('27/12/2023')).exists();
    assert.ok(link.trim().endsWith('/campagnes/CODE'));
  });

  test('it should display update form when requested', async function (assert) {
    // when
    const button = screen.getByText('Modifier');
    await click(button);

    // then
    assert.dom(screen.getByLabelText(/Nom interne/)).exists();
    assert.dom(screen.getByLabelText(/Nom public/)).exists();
    assert.dom(screen.getByLabelText(/Texte de la page d'accueil/)).exists();
    assert.dom(screen.queryByText('Modifier')).doesNotExist();
    assert.dom(screen.getByText('Sauvegarder les modifications')).exists();
  });

  test('it should call reset argument function on reset', async function (assert) {
    // when
    const editButton = screen.getByText('Modifier');
    await click(editButton);

    await fillByLabel(/Nom interne/, 'Une erreur de frappe');

    const cancelButton = screen.getByText('Annuler');
    await click(cancelButton);

    // then
    assert.ok(reset.calledOnce);
  });

  test('it should call update argument function on update', async function (assert) {
    // when
    const button = screen.getByText('Modifier');
    await click(button);

    await fillByLabel(/Nom interne/, 'Parcours professionnel');

    const submitButton = screen.getByRole('button', { name: 'Sauvegarder les modifications' });
    await click(submitButton);

    // then
    assert.ok(update.calledOnce);
  });
});
