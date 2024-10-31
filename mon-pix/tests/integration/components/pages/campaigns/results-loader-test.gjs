import { render, waitFor } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ResultsLoader from 'mon-pix/components/pages/campaigns/results-loader';
// eslint-disable-next-line no-restricted-imports
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Components | Pages | Campaigns | Results loader', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders results loader component', async function (assert) {
    // when
    const screen = await render(
      <template>
        <ResultsLoader
          @lineAppearanceInterval={{0}}
          @lineTransitionDuration={{0}}
          @iconTransitionDuration={{0}}
          @code="PROASNULL"
        />
      </template>,
    );

    // then
    assert.ok(screen.getByRole('heading', { name: t('components.campaigns.results-loader.title') }));
    assert.ok(screen.getByText(t('components.campaigns.results-loader.subtitle')));
    assert.ok(screen.getByText(t('components.campaigns.results-loader.steps.competences')));
    assert.ok(screen.getByText(t('components.campaigns.results-loader.steps.trainings')));
    assert.ok(screen.getByText(t('components.campaigns.results-loader.steps.rewards')));
  });

  test('redirects to results page on click on continue', async function (assert) {
    // given
    const routerService = this.owner.lookup('service:router');
    sinon.stub(routerService, 'transitionTo');

    const screen = await render(
      <template>
        <ResultsLoader
          @lineAppearanceInterval={{0}}
          @lineTransitionDuration={{0}}
          @iconTransitionDuration={{0}}
          @code="PROASNULL"
        />
      </template>,
    );

    await waitFor(async () => {
      // when
      await click(screen.getByRole('button', { name: t('common.actions.continue') }));

      // then
      sinon.assert.calledWithExactly(routerService.transitionTo, 'campaigns.assessment.results', 'PROASNULL');
      assert.ok(true);
    });
  });
});
