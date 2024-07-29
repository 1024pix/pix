import { getDefaultNormalizer, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui::LastParticipationDateTooltip', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render the aria label of the component', async function (assert) {
    const screen = await render(hbs`<Ui::LastParticipationDateTooltip />`);

    // then
    assert.ok(screen.getByLabelText(t('pages.participants-list.latest-participation-information-tooltip.aria-label')));
  });

  test('it should display campaign name', async function (assert) {
    // given
    this.participant = { campaignName: 'Campagne annuelle' };

    // when
    const screen = await render(
      hbs`<Ui::LastParticipationDateTooltip @campaignName={{this.participant.campaignName}} />`,
    );

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
    this.participant = { campaignType: 'ASSESSMENT' };

    // when
    const screen = await render(
      hbs`<Ui::LastParticipationDateTooltip @campaignType={{this.participant.campaignType}} />`,
    );

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
    this.participant = { campaignType: 'PROFILES_COLLECTION' };

    // when
    const screen = await render(
      hbs`<Ui::LastParticipationDateTooltip @campaignType={{this.participant.campaignType}} />`,
    );

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
    this.participant = { participationStatus: 'SHARED' };

    // when
    const screen = await render(
      hbs`<Ui::LastParticipationDateTooltip @participationStatus={{this.participant.participationStatus}} />`,
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

  test('it should display participation status with TO_SHARE status', async function (assert) {
    // given
    this.participant = { participationStatus: 'TO_SHARE' };

    // when
    const screen = await render(
      hbs`<Ui::LastParticipationDateTooltip @participationStatus={{this.participant.participationStatus}} />`,
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
        t('pages.participants-list.latest-participation-information-tooltip.participation-TO_SHARE-status'),
      ),
    );
  });

  test('it should display participation status with STARTED status', async function (assert) {
    // given
    this.participant = { participationStatus: 'STARTED' };

    // when
    const screen = await render(
      hbs`<Ui::LastParticipationDateTooltip @participationStatus={{this.participant.participationStatus}} />`,
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
