import { clickByName, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl, { t } from '../helpers/setup-intl';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

module('Acceptance | Campaign Participants Individual Results', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let user;

  hooks.beforeEach(async () => {
    user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser({ user });

    server.create('campaign', { id: 1 });

    await authenticateSession(user.id);
  });

  test('it should go to participant details', async function (assert) {
    // given
    const organizationId = user.memberships.models[0].organizationId;
    server.create('campaign', { id: 1 });
    server.create('campaignProfile', { campaignId: 1, campaignParticipationId: 1 });
    server.create('organization-participant', { id: 1, organizationId });

    // when
    const screen = await visit('/campagnes/1/profils/1');
    await click(screen.getByRole('link', { name: t('common.actions.link-to-participant') }));

    // then
    assert.strictEqual(currentURL(), '/participants/1');
  });

  test('it should go to campaigns', async function (assert) {
    // given
    const campaignAssessmentParticipationResult = server.create(
      'campaign-assessment-participation-result',
      'withCompetenceResults',
      { id: 1, campaignId: 1 },
    );
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAssessmentParticipationResult });

    // when
    await visit('/campagnes/1/evaluations/1');
    await click(within(document.querySelector('main')).getByRole('link', { name: t('navigation.main.campaigns') }));

    // then
    assert.strictEqual(currentURL(), '/campagnes/les-miennes');
  });

  test('it should go to CampagneEtPrairie', async function (assert) {
    // given
    const campaignAssessmentParticipationResult = server.create(
      'campaign-assessment-participation-result',
      'withCompetenceResults',
      { id: 1, campaignId: 1 },
    );
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAssessmentParticipationResult });
    server.create('campaign', { id: 1, name: 'CampagneEtPrairie' });

    // when
    await visit('/campagnes/1/evaluations/1');
    await clickByName('CampagneEtPrairie');

    // then
    assert.strictEqual(currentURL(), '/campagnes/1');
  });

  test('[a11y] it should contain accessibility aria-label nav', async function (assert) {
    // given
    const campaignAssessmentParticipationResult = server.create(
      'campaign-assessment-participation-result',
      'withCompetenceResults',
      { id: 1, campaignId: 1 },
    );
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAssessmentParticipationResult });

    // when
    const screen = await visit('/campagnes/1/evaluations/1');

    // then
    assert.dom(screen.getByLabelText('Navigation principale')).exists();
    assert.dom(screen.getByLabelText("Navigation de la section résultat d'une évaluation individuelle")).exists();
    assert.dom(screen.getByLabelText('Navigation de pied de page')).exists();
  });

  test('it should display individual results', async function (assert) {
    // given
    const campaignAssessmentParticipationResult = server.create(
      'campaign-assessment-participation-result',
      'withCompetenceResults',
      { id: 1, campaignId: 1 },
    );
    server.create('campaign-assessment-participation', {
      id: 1,
      campaignId: 1,
      isShared: true,
      masteryRate: 0.5,
      campaignAssessmentParticipationResult,
    });

    // when
    const screen = await visit('/campagnes/1/evaluations/1');

    // then

    assert
      .dom(screen.getByText(t('pages.assessment-individual-results.table.column.competences', { count: 2 })))
      .exists();
  });

  test('it should not display individual results when competence results are empty', async function (assert) {
    // given
    const campaignAssessmentParticipationResult = server.create(
      'campaign-assessment-participation-result',
      'withEmptyCompetenceResults',
      { id: 1, campaignId: 1 },
    );
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAssessmentParticipationResult });

    // when
    const screen = await visit('/campagnes/1/evaluations/1');

    // then
    assert.dom(screen.getByText(t('pages.assessment-individual-results.table.empty'))).exists();
  });

  test('it should not display individual results when participation is not shared', async function (assert) {
    // given
    const campaignAssessmentParticipationResult = server.create(
      'campaign-assessment-participation-result',
      'withCompetenceResults',
      { id: 1, campaignId: 1, isShared: false },
    );
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAssessmentParticipationResult });

    // when
    const screen = await visit('/campagnes/1/evaluations/1');

    // then
    assert.dom(screen.getByText(t('pages.assessment-individual-results.table.empty'))).exists();
  });
});
