import { render, within } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | certifications/competence-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display an entry per competence', async function (assert) {
    // given
    this.set('competences', [
      { index: '1.1', score: '30', level: '3' },
      { index: '2.1', score: '20', level: '2' },
      { index: '5.2', score: '10', level: '1' },
    ]);

    // when
    const screen = await render(
      hbs`<Certifications::CompetenceList @competences={{this.competences}} @shouldDisplayPixScore={{true}} />`,
    );

    // then
    const table = screen.getByRole('table', { name: 'Détails du résultat par compétence' });
    const rows = await within(table).findAllByRole('row');

    assert.dom(within(rows[0]).getByRole('columnheader', { name: 'Compétence' })).exists();
    assert.dom(within(rows[0]).getByRole('columnheader', { name: 'Score' })).exists();
    assert.dom(within(rows[0]).getByRole('columnheader', { name: 'Niveau' })).exists();

    assert.dom(within(rows[1]).getByRole('rowheader', { name: '1.1' })).exists();
    assert.dom(within(rows[1]).getByRole('cell', { name: '30' })).exists();
    assert.dom(within(rows[1]).getByRole('cell', { name: '3' })).exists();

    assert.dom(within(rows[2]).getByRole('rowheader', { name: '2.1' })).exists();
    assert.dom(within(rows[2]).getByRole('cell', { name: '20' })).exists();
    assert.dom(within(rows[2]).getByRole('cell', { name: '2' })).exists();

    assert.dom(within(rows[3]).getByRole('rowheader', { name: '5.2' })).exists();
    assert.dom(within(rows[3]).getByRole('cell', { name: '10' })).exists();
    assert.dom(within(rows[3]).getByRole('cell', { name: '1' })).exists();
  });

  test('it should display competence index, score and level', async function (assert) {
    // given
    this.set('competences', [{ index: '1.1', score: '30', level: '3' }]);

    // when
    const screen = await render(
      hbs`<Certifications::CompetenceList @competences={{this.competences}} @shouldDisplayPixScore={{true}} />`,
    );

    // then
    const table = screen.getByRole('table', { name: 'Détails du résultat par compétence' });
    const rows = await within(table).findAllByRole('row');

    assert.dom(within(table).getByRole('columnheader', { name: 'Compétence' })).exists();
    assert.dom(within(table).getByRole('columnheader', { name: 'Score' })).exists();
    assert.dom(within(table).getByRole('columnheader', { name: 'Niveau' })).exists();
    assert.dom(within(rows[1]).getByRole('rowheader', { name: '1.1' })).exists();
    assert.dom(within(rows[1]).getByRole('cell', { name: '30' })).exists();
    assert.dom(within(rows[1]).getByRole('cell', { name: '3' })).exists();
  });

  test('it should display 16 entries in edition mode', async function (assert) {
    // given
    this.set('competences', [
      { index: '1.1', score: '30', level: '3' },
      { index: '2.1', score: '30', level: '3' },
      { index: '5.2', score: '30', level: '3' },
    ]);

    // when
    const screen = await render(
      hbs`<Certifications::CompetenceList @competences={{this.competences}} @edition='true' />`,
    );

    // then
    assert.strictEqual(screen.getAllByLabelText('Informations de la compétence', { exact: false }).length, 16);
  });

  module('when certification is V2', function () {
    test('it should display competence levels and scores at the right places in edition mode', async function (assert) {
      // given
      this.set('competences', [
        { index: '1.1', score: '30', level: '3' },
        { index: '2.1', score: '16', level: '2' },
        { index: '2.2', score: '42', level: '5' },
      ]);

      // when
      const screen = await render(
        hbs`<Certifications::CompetenceList @competences={{this.competences}} @edition='true' />`,
      );

      // then
      assert.dom(screen.getByRole('textbox', { name: '1.1' })).hasValue('30');
      assert.dom(screen.getByRole('textbox', { name: '2.1' })).hasValue('16');
      assert.dom(screen.getByRole('textbox', { name: '2.2' })).hasValue('42');

      const certificationInfoLevelInputs = screen.getAllByRole('textbox', { name: 'Niveau:' });
      assert.dom(certificationInfoLevelInputs[0]).hasValue('3');
      assert.dom(certificationInfoLevelInputs[3]).hasValue('2');
      assert.dom(certificationInfoLevelInputs[4]).hasValue('5');
    });
  });

  module('when certification is V3', function () {
    test('it should not display competence scores', async function (assert) {
      // given
      this.set('competences', [{ index: '1.1', score: '0', level: '3' }]);

      // when
      const screen = await render(
        hbs`<Certifications::CompetenceList @competences={{this.competences}} @shouldDisplayPixScore={{false}} />`,
      );

      // then
      assert.dom(screen.queryByText('0 Pix')).doesNotExist();

      const table = screen.getByRole('table', { name: 'Détails du résultat par compétence' });
      const rows = await within(table).findAllByRole('row');

      assert.dom(within(rows[0]).getByRole('columnheader', { name: 'Compétence' })).exists();
      assert.dom(within(rows[0]).getByRole('columnheader', { name: 'Niveau' })).exists();

      assert.dom(within(rows[1]).getByRole('rowheader', { name: '1.1' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: '3' })).exists();

      assert.dom(screen.queryByText('Score')).doesNotExist();
      assert.dom(screen.queryByText('O')).doesNotExist();
    });
  });
});
