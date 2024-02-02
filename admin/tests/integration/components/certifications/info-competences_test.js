import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | certifications/competence-list', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display an entry per competence', async function (assert) {
    // given
    this.set('competences', [
      { index: '1.1', score: '30', level: '3' },
      { index: '2.1', score: '20', level: '2' },
      { index: '5.2', score: '10', level: '1' },
    ]);

    // when
    const screen = await render(hbs`<Certifications::CompetenceList @competences={{this.competences}} />`);

    // then
    assert.dom(screen.getByLabelText('Informations de la compétence 1.1')).exists();
    assert.dom(screen.getByLabelText('Informations de la compétence 2.1')).exists();
    assert.dom(screen.getByLabelText('Informations de la compétence 5.2')).exists();
  });

  test('it should display competence index, score and level', async function (assert) {
    // given
    this.set('competences', [{ index: '1.1', score: '30', level: '3' }]);

    // when
    const screen = await render(
      hbs`<Certifications::CompetenceList @competences={{this.competences}}  @shouldDisplayPixScore={{true}}/>`,
    );

    // then
    assert.dom(screen.getByLabelText('Informations de la compétence 1.1')).containsText('30 Pix');
    assert.dom(screen.getByLabelText('Informations de la compétence 1.1')).containsText('Niveau: 3');
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
      this.set('competences', [
        { index: '1.1', score: '0', level: '3' },
        { index: '2.1', score: '0', level: '2' },
        { index: '2.2', score: '0', level: '5' },
      ]);

      // when
      const screen = await render(
        hbs`<Certifications::CompetenceList @competences={{this.competences}}  @shouldDisplayPixScore={{false}}/>`,
      );

      // then
      assert.dom(screen.queryByText('0 Pix')).doesNotExist();
      assert.dom(screen.getByText('Niveau: 3')).exists();
      assert.dom(screen.getByText('Niveau: 2')).exists();
      assert.dom(screen.getByText('Niveau: 5')).exists();
    });
  });
});
