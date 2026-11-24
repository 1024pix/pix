import { render } from '@1024pix/ember-testing-library';
import { getDefaultNormalizer } from '@testing-library/dom';
import LastParticipationDateTooltip from 'pix-orga/components/ui/last-participation-date-tooltip';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui::LastParticipationDateTooltip', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render the aria label of the component', async function (assert) {
    const screen = await render(<template><LastParticipationDateTooltip /></template>);

    // then
    assert.ok(screen.getByLabelText(t('pages.participants-list.latest-participation-information-tooltip.aria-label')));
  });

  test('it should display campaign name', async function (assert) {
    // given
    const campaignName = 'Campagne annuelle';

    // when
    const screen = await render(<template><LastParticipationDateTooltip @campaignName={{campaignName}} /></template>);

    // then
    assert.ok(
      screen.getByText(t('pages.participants-list.latest-participation-information-tooltip.campaign-name'), {
        exact: false,
        normalizer: getDefaultNormalizer({ trim: false }),
      }),
    );
    assert.ok(screen.getByText('Campagne annuelle'));
  });

  test('it should display campaign type with ASSESSMENT type', async function (assert) {
    // given
    const campaignType = 'ASSESSMENT';

    // when
    const screen = await render(<template><LastParticipationDateTooltip @campaignType={{campaignType}} /></template>);

    // then
    assert.ok(
      screen.getByText(t('pages.participants-list.latest-participation-information-tooltip.campaign-type'), {
        exact: false,
        normalizer: getDefaultNormalizer({ trim: false }),
      }),
    );
    assert.ok(
      screen.getByText(t('pages.participants-list.latest-participation-information-tooltip.campaign-ASSESSMENT-type')),
    );
  });

  test('it should display campaign type with PROFILES_COLLECTION type', async function (assert) {
    // given
    const campaignType = 'PROFILES_COLLECTION';

    // when
    const screen = await render(<template><LastParticipationDateTooltip @campaignType={{campaignType}} /></template>);

    // then
    assert.ok(
      screen.getByText(t('pages.participants-list.latest-participation-information-tooltip.campaign-type'), {
        exact: false,
        normalizer: getDefaultNormalizer({ trim: false }),
      }),
    );
    assert.ok(
      screen.getByText(
        t('pages.participants-list.latest-participation-information-tooltip.campaign-PROFILES_COLLECTION-type'),
      ),
    );
  });

  test('it should display participation status with SHARED status', async function (assert) {
    // given
    const participationStatus = 'SHARED';

    // when
    const screen = await render(
      <template><LastParticipationDateTooltip @participationStatus={{participationStatus}} /></template>,
    );

    // then
    assert.ok(
      screen.getByText(
        t('pages.participants-list.latest-participation-information-tooltip.campaign-status'),
        // WARNING : nous avons ici un problème de rupture de la séparation des responsabilité
        // ce pourquoi nous sommes obligés de renseigner `normalizer: getDefaultNormalizer({ trim: false })z.
        // TODO :gérer les espaces en fin de texte avec du css et non dans les clés de traduction
        { exact: false, normalizer: getDefaultNormalizer({ trim: false }) },
      ),
    );
    assert.ok(
      screen.getByText(
        t('pages.participants-list.latest-participation-information-tooltip.participation-SHARED-status'),
      ),
    );
  });

  test('it should display participation status with STARTED status', async function (assert) {
    // given
    const participationStatus = 'STARTED';

    // when
    const screen = await render(
      <template><LastParticipationDateTooltip @participationStatus={{participationStatus}} /></template>,
    );

    // then
    assert.ok(
      screen.getByText(
        t('pages.participants-list.latest-participation-information-tooltip.campaign-status'),
        // WARNING : nous avons ici un problème de rupture de la séparation des responsabilité
        // ce pourquoi nous sommes obligés de renseigner `normalizer: getDefaultNormalizer({ trim: false })z.
        // TODO :gérer les espaces en fin de texte avec du css et non dans les clés de traduction
        { exact: false, normalizer: getDefaultNormalizer({ trim: false }) },
      ),
    );
    assert.ok(
      screen.getByText(
        t('pages.participants-list.latest-participation-information-tooltip.participation-STARTED-status'),
      ),
    );
  });
});
