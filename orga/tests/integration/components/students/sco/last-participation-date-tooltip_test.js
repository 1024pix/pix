import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Student::Sco::LastParticipationDateTooltip', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display campaign name', async function (assert) {
    // given
    this.student = { campaignName: 'Campagne annuelle' };

    // when
    await render(hbs`<Student::Sco::LastParticipationDateTooltip @campaignName={{student.campaignName}}/>`);

    // then
    assert.contains('Campagne : Campagne annuelle');
  });

  test('it should display campaign type with ASSESSMENT type', async function (assert) {
    // given
    this.student = { campaignType: 'ASSESSMENT' };

    // when
    await render(hbs`<Student::Sco::LastParticipationDateTooltip @campaignType={{student.campaignType}}/>`);

    // then
    assert.contains('Type : Évaluation');
  });

  test('it should display campaign type with PROFILES_COLLECTION type', async function (assert) {
    // given
    this.student = { campaignType: 'PROFILES_COLLECTION' };

    // when
    await render(hbs`<Student::Sco::LastParticipationDateTooltip @campaignType={{student.campaignType}}/>`);

    // then
    assert.contains('Type : Collecte de profils');
  });

  test('it should display participation status with SHARED status', async function (assert) {
    // given
    this.student = { participationStatus: 'SHARED' };

    // when
    await render(
      hbs`<Student::Sco::LastParticipationDateTooltip @participationStatus={{student.participationStatus}}/>`
    );

    // then
    assert.contains('Statut : Reçu');
  });

  test('it should display participation status with TO_SHARE status', async function (assert) {
    // given
    this.student = { participationStatus: 'TO_SHARE' };

    // when
    await render(
      hbs`<Student::Sco::LastParticipationDateTooltip @participationStatus={{student.participationStatus}}/>`
    );

    // then
    assert.contains("Statut : En attente d'envoi");
  });

  test('it should display participation status with STARTED status', async function (assert) {
    // given
    this.student = { participationStatus: 'STARTED' };

    // when
    await render(
      hbs`<Student::Sco::LastParticipationDateTooltip @participationStatus={{student.participationStatus}}/>`
    );

    // then
    assert.contains('Statut : En cours');
  });
});
