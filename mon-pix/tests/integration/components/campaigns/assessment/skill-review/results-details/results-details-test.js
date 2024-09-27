import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | EvaluationResultsTabs | ResultsDetails', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');
    this.owner.register('service:store', store);

    const competenceResultArea1 = store.createRecord('competence-result', {
      areaTitle: 'Area 1',
      name: 'Competence area 1',
    });

    const competenceResultArea1bis = store.createRecord('competence-result', {
      areaTitle: 'Area 1',
      name: 'Competence area 1',
    });

    const competenceResultArea2 = store.createRecord('competence-result', {
      areaTitle: 'Area 2',
      name: 'Competence area 2',
    });

    this.set('competenceResults', [competenceResultArea1, competenceResultArea1bis, competenceResultArea2]);

    // when
    screen = await render(
      hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs::ResultsDetails
  @competenceResults={{this.competenceResults}}
/>`,
    );
  });

  test('it should render tab title and description', async function (assert) {
    // then
    assert.dom(screen.getByRole('heading', { name: t('pages.skill-review.tabs.results-details.title') })).isVisible();
    assert.dom(screen.getByText(t('pages.skill-review.tabs.results-details.description'))).isVisible();
  });

  test('it should display a list of areas with competences', async function (assert) {
    // then
    assert.dom(screen.getByRole('heading', { name: 'Area 1' })).exists();
    assert.strictEqual(screen.getAllByRole('cell', { name: 'Competence area 1' }).length, 2);

    assert.dom(screen.getByRole('heading', { name: 'Area 2' })).exists();
    assert.strictEqual(screen.getAllByRole('cell', { name: 'Competence area 2' }).length, 1);
  });
});
