import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Ui::LastParticipationDateTooltip', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render the aria label of the component', async function (assert) {
    const screen = await render(hbs`<Ui::LastParticipationDateTooltip />`);

    // then
    assert
      .dom(
        screen.getByLabelText(
          this.intl.t('pages.participants-list.latest-participation-information-tooltip.aria-label')
        )
      )
      .exists();
  });

  test('it should display campaign name', async function (assert) {
    // given
    this.participant = { campaignName: 'Campagne annuelle' };

    // when
    await render(hbs`<Ui::LastParticipationDateTooltip @campaignName={{this.participant.campaignName}} />`);

    // then
    assert.contains('Campagne :');
    assert.contains('Campagne annuelle');
  });

  test('it should display campaign type with ASSESSMENT type', async function (assert) {
    // given
    this.participant = { campaignType: 'ASSESSMENT' };

    // when
    await render(hbs`<Ui::LastParticipationDateTooltip @campaignType={{this.participant.campaignType}} />`);

    // then
    assert.contains('Type :');
    assert.contains('Évaluation');
  });

  test('it should display campaign type with PROFILES_COLLECTION type', async function (assert) {
    // given
    this.participant = { campaignType: 'PROFILES_COLLECTION' };

    // when
    await render(hbs`<Ui::LastParticipationDateTooltip @campaignType={{this.participant.campaignType}} />`);

    // then
    assert.contains('Type :');
    assert.contains('Collecte de profils');
  });

  test('it should display participation status with SHARED status', async function (assert) {
    // given
    this.participant = { participationStatus: 'SHARED' };

    // when
    await render(
      hbs`<Ui::LastParticipationDateTooltip @participationStatus={{this.participant.participationStatus}} />`
    );

    // then
    assert.contains('Statut :');
    assert.contains('Reçu');
  });

  test('it should display participation status with TO_SHARE status', async function (assert) {
    // given
    this.participant = { participationStatus: 'TO_SHARE' };

    // when
    await render(
      hbs`<Ui::LastParticipationDateTooltip @participationStatus={{this.participant.participationStatus}} />`
    );

    // then
    assert.contains('Statut :');
    assert.contains("En attente d'envoi");
  });

  test('it should display participation status with STARTED status', async function (assert) {
    // given
    this.participant = { participationStatus: 'STARTED' };

    // when
    await render(
      hbs`<Ui::LastParticipationDateTooltip @participationStatus={{this.participant.participationStatus}} />`
    );

    // then
    assert.contains('Statut :');
    assert.contains('En cours');
  });
});
