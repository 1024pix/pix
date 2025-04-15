import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Participant::Assessment::Results', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('it should display a sentence when displayResults is false', async function (assert) {
    // when
    const competenceResults = [];

    this.set('competenceResults', competenceResults);
    const screen = await render(hbs`<Participant::Assessment::Results @results={{this.competenceResults}} />`);

    // then
    assert.dom(screen.getByText(t('pages.assessment-individual-results.table.empty'))).exists();
  });

  test('it should display results when displayResults is true', async function (assert) {
    // given
    const competenceResult = store.createRecord('campaign-assessment-participation-competence-result', {
      name: 'Compétence 1',
      index: '1.1',
      areaColor: 'jaffa',
      competenceMasteryRate: 0.5,
    });

    const competenceResults = [competenceResult];

    this.set('competenceResults', competenceResults);

    // when
    const screen = await render(hbs`<Participant::Assessment::Results @results={{this.competenceResults}} />`);

    // then
    assert.ok(screen.getByRole('cell', { name: 'Compétence 1' }));
    // For some reason getByRole does not work locally but is ok in CI
    assert.ok(screen.getAllByText('50%')[0]);
  });
});
