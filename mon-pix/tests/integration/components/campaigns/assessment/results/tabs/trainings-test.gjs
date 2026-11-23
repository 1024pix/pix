import { render } from '@1024pix/ember-testing-library';
import Trainings from 'mon-pix/components/campaigns/assessment/results/evaluation-results-tabs/trainings';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | Evaluation Results Tabs | Trainings', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display the trainings list', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const trainings = [
      store.createRecord('training', {
        title: 'Mon super training',
        link: 'https://exemple.net/',
        duration: { days: 2 },
      }),
      store.createRecord('training', {
        title: 'Mon autre super training',
        link: 'https://exemple.net/',
        duration: { days: 2 },
      }),
    ];

    const campaignParticipationResult = {
      isDisabled: false,
    };

    // when
    const screen = await render(
      <template>
        <Trainings @trainings={{trainings}} @campaignParticipationResult={{campaignParticipationResult}} />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { name: t('pages.skill-review.tabs.trainings.title') })).isVisible();
    assert.dom(screen.getByText(t('pages.skill-review.tabs.trainings.description'))).isVisible();

    assert.strictEqual(screen.getAllByRole('link').length, 2);
    assert.dom(screen.getByText('Mon super training')).isVisible();
    assert.dom(screen.getByText('Mon autre super training')).isVisible();
  });
});
