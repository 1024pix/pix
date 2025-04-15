import { clickByName, render } from '@1024pix/ember-testing-library';
import { fillIn } from '@ember/test-helpers';
import ScoringSimulator from 'pix-admin/components/tools/certification/scoring-simulator';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Tools | certification/scoring-simulator', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display form', async function (assert) {
    // given
    // when
    const screen = await render(<template><ScoringSimulator /></template>);

    // then
    assert.dom(screen.getByRole('spinbutton', { name: 'Score global en Pix' })).exists();
    assert.dom(screen.getByRole('spinbutton', { name: 'Capacité' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Générer un profil' })).exists();
  });

  module('when score is superior to 896', function () {
    test('should display an error message', async function (assert) {
      // given
      const screen = await render(<template><ScoringSimulator /></template>);

      // when
      await fillIn(screen.getByRole('spinbutton', { name: 'Score global en Pix' }), 897);
      await clickByName('Générer un profil');

      // then
      assert.dom(screen.getByText('Merci d’indiquer un score en Pix compris entre O et 896')).exists();
    });
  });

  module('when score is inferior to 0', function () {
    test('should display an error message', async function (assert) {
      // given
      const screen = await render(<template><ScoringSimulator /></template>);

      // when
      await fillIn(screen.getByRole('spinbutton', { name: 'Score global en Pix' }), -1);
      await clickByName('Générer un profil');

      // then
      assert.dom(screen.getByText('Merci d’indiquer un score en Pix compris entre O et 896')).exists();
    });
  });

  module('when both inputs are filled', function () {
    test('should display an error message', async function (assert) {
      // given
      const screen = await render(<template><ScoringSimulator /></template>);

      // when
      await fillIn(screen.getByRole('spinbutton', { name: 'Score global en Pix' }), -1);
      await fillIn(screen.getByRole('spinbutton', { name: 'Capacité' }), 1);
      await clickByName('Générer un profil');

      // then
      assert
        .dom(screen.getByText('Merci de ne renseigner que l’un des champs “Score global en Pix” ou “Capacité”'))
        .exists();
    });
  });

  module('when both inputs are empty', function () {
    test('should display an error message', async function (assert) {
      // given
      const screen = await render(<template><ScoringSimulator /></template>);

      // when
      await clickByName('Générer un profil');

      // then
      assert.dom(screen.getByText("Merci de renseigner au moins l'un des deux champs")).exists();
    });
  });
});
