import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
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
    const screen = await render(hbs`<Participant::Assessment::Results @displayResults={{false}} />`);

    // then
    assert.dom(screen.getByText(this.intl.t('pages.assessment-individual-results.table.empty'))).exists();
  });

  test('it should display results when displayResults is true', async function (assert) {
    // given
    const competenceResult = store.createRecord('campaign-assessment-participation-competence-result', {
      name: 'Compétence 1',
      index: '1.1',
      areaColor: 'jaffa',
      competenceMasteryRate: 0.5,
    });

    const campaignAssessmentParticipationResult = store.createRecord('campaign-assessment-participation-result', {
      competenceResults: [competenceResult],
    });

    this.set('campaignAssessmentParticipationResult', campaignAssessmentParticipationResult);

    // when
    const screen = await render(
      hbs`<Participant::Assessment::Results @results={{this.campaignAssessmentParticipationResult}} @displayResults={{true}} />`,
    );

    // then
    assert.dom(screen.getByLabelText(this.intl.t('pages.assessment-individual-results.table.row-title'))).exists();

    assert
      .dom(screen.getByLabelText(this.intl.t('pages.assessment-individual-results.table.row-title')))
      .containsText('Compétence 1');

    assert
      .dom(screen.getByLabelText(this.intl.t('pages.assessment-individual-results.table.row-title')))
      .containsText('50%');
  });
});
