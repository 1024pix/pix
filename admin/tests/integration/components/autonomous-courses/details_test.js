import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { click } from '@ember/test-helpers';
import sinon from 'sinon';

module('Integration | Component | AutonomousCourses::Details', function (hooks) {
  setupRenderingTest(hooks);

  let screen;

  const autonomousCourse = {
    id: 123,
    publicTitle: 'Parkour',
    internalTitle: 'titre interne',
    customLandingPageText: "texte de la page d'accueil",
    code: 'CODE',
    createdAt: '2023-12-27T15:07:57.376Z',
  };

  hooks.beforeEach(async function () {
    // given
    this.set('autonomousCourse', autonomousCourse);
    this.update = sinon.stub().callsFake(() => {
      return Promise.resolve();
    });
    this.reset = sinon.stub().callsFake(() => {
      return Promise.resolve();
    });

    screen = await render(
      hbs`
        <AutonomousCourses::Details
          @autonomousCourse={{this.autonomousCourse}}
          @update={{this.update}}
          @reset={{this.reset}}
        />
        `,
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
    const button = screen.getByText('Éditer');
    await click(button);

    // then
    assert.dom(screen.getByLabelText(/Nom interne/)).exists();
    assert.dom(screen.getByLabelText(/Nom public/)).exists();
    assert.dom(screen.getByLabelText(/Texte de la page d'accueil/)).exists();
    assert.dom(screen.queryByText('Éditer')).doesNotExist();
    assert.dom(screen.getByText('Sauvegarder les modifications')).exists();
  });

  test('it should call reset argument function on reset', async function (assert) {
    // when
    const editButton = screen.getByText('Éditer');
    await click(editButton);

    await fillByLabel(/Nom interne/, 'Une erreur de frappe');

    const cancelButton = screen.getByText('Annuler');
    await click(cancelButton);

    // then
    assert.ok(this.reset.calledOnce);
  });

  test('it should call update argument function on update', async function (assert) {
    // when
    const button = screen.getByText('Éditer');
    await click(button);

    await fillByLabel(/Nom interne/, 'Parcours professionnel');

    const submitButton = screen.getByRole('button', { name: 'Sauvegarder les modifications' });
    await click(submitButton);

    // then
    assert.ok(this.update.calledOnce);
  });
});
