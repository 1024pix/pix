import { render } from '@1024pix/ember-testing-library';
import ParticipantAssessmentResult from 'pix-orga/components/participant/assessment/results';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Participant::Assessment::Results', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('it should hide table when there is no results', async function (assert) {
    // when
    const competenceResults = [];

    const screen = await render(<template><ParticipantAssessmentResult @results={{competenceResults}} /></template>);

    // then
    assert.dom(screen.getByText(t('pages.assessment-individual-results.table.empty'))).exists();
  });

  test('it should display results when there are results', async function (assert) {
    // given
    const competenceResult = store.createRecord('campaign-assessment-participation-competence-result', {
      name: 'Compétence 1',
      index: '1.1',
      areaColor: 'jaffa',
      competenceMasteryRate: 0.5,
    });

    const competenceResults = [competenceResult];

    // when
    const screen = await render(<template><ParticipantAssessmentResult @results={{competenceResults}} /></template>);

    // then
    assert.ok(screen.getByRole('cell', { name: 'Compétence 1' }));
    // For some reason getByRole does not work locally but is ok in CI
    assert.ok(screen.getAllByText('50 %')[0]);
  });
});
