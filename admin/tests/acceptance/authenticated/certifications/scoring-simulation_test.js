import { clickByName, visit } from '@1024pix/ember-testing-library';
import { fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateAdminMemberWithRole } from '../../../helpers/test-init';

module('Acceptance | Route | routes/authenticated/certifications/scoring-simulation', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.server.create('user', { id: 888 });
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  test('it should display form', async function (assert) {
    // when
    const screen = await visit(`/certifications/scoring-simulation`);

    // then
    assert.dom(screen.getByLabelText('Score global en Pix')).exists();
    assert.dom(screen.getByLabelText('Capacité')).exists();
    assert.dom(screen.getByRole('button', { name: 'Générer un profil' })).exists();
  });

  test('should display an error message when score is superior to 896', async function (assert) {
    // given
    const screen = await visit(`/certifications/scoring-simulation`);

    // when
    await fillIn(screen.getByLabelText('Score global en Pix'), 897);
    await clickByName('Générer un profil');

    // then
    assert.dom(screen.getByText('Merci d’indiquer un score en Pix compris entre O et 896')).exists();
  });

  test('should display an error message when score is inferior to 0', async function (assert) {
    // given
    const screen = await visit(`/certifications/scoring-simulation`);

    // when
    await fillIn(screen.getByLabelText('Score global en Pix'), -1);
    await clickByName('Générer un profil');

    // then
    assert.dom(screen.getByText('Merci d’indiquer un score en Pix compris entre O et 896')).exists();
  });

  test('should display an error message when both inputs are filled', async function (assert) {
    // given
    const screen = await visit(`/certifications/scoring-simulation`);

    // when
    await fillIn(screen.getByLabelText('Score global en Pix'), -1);
    await fillIn(screen.getByLabelText('Capacité'), 1);
    await clickByName('Générer un profil');

    // then
    assert
      .dom(screen.getByText('Merci de ne renseigner que l’un des champs “Score global en Pix” ou “Capacité”'))
      .exists();
  });

  test('should display an error message when both inputs are empty', async function (assert) {
    // given
    const screen = await visit(`/certifications/scoring-simulation`);

    // when
    await clickByName('Générer un profil');

    // then
    assert.dom(screen.getByText("Merci de renseigner au moins l'un des deux champs")).exists();
  });

  test('should display a score and competence levels list when a capacity is given', async function (assert) {
    // given
    const screen = await visit(`/certifications/scoring-simulation`);

    // when
    await fillIn(screen.getByLabelText('Capacité'), 1);
    await clickByName('Générer un profil');

    // then
    const termsList = screen.getAllByRole('term');
    const definitionsList = screen.getAllByRole('definition');

    assert.strictEqual(termsList[0].textContent.trim(), 'Score :');
    assert.strictEqual(definitionsList[0].textContent.trim(), '768');

    assert.strictEqual(termsList[1].textContent.trim(), 'Capacité :');
    assert.strictEqual(definitionsList[1].textContent.trim(), '1');

    assert.dom(screen.getByLabelText('Niveau de la compétence 1.1')).exists();
  });

  test('should display a competence and competence levels list when a score is given', async function (assert) {
    // given
    const screen = await visit(`/certifications/scoring-simulation`);

    // when
    await fillIn(screen.getByLabelText('Score global en Pix'), 768);
    await clickByName('Générer un profil');

    // then
    const termsList = screen.getAllByRole('term');
    const definitionsList = screen.getAllByRole('definition');

    assert.strictEqual(termsList[0].textContent.trim(), 'Score :');
    assert.strictEqual(definitionsList[0].textContent.trim(), '768');

    assert.strictEqual(termsList[1].textContent.trim(), 'Capacité :');
    assert.strictEqual(definitionsList[1].textContent.trim(), '1');

    assert.dom(screen.getByLabelText('Niveau de la compétence 1.1')).exists();
  });
});