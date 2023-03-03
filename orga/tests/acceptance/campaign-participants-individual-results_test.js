import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, click } from '@ember/test-helpers';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';
import { within } from '@testing-library/dom';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Campaign Participants Individual Results', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

    server.create('campaign', { id: 1 });

    await authenticateSession(user.id);
  });

  test('it should go to campaigns', async function (assert) {
    // given
    const campaignAssessmentParticipationResult = server.create(
      'campaign-assessment-participation-result',
      'withCompetenceResults',
      { id: 1, campaignId: 1 }
    );
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAssessmentParticipationResult });

    // when
    await visitScreen('/campagnes/1/evaluations/1');
    await click(
      within(document.querySelector('main')).getByRole('link', { name: this.intl.t('navigation.main.campaigns') })
    );

    // then
    assert.strictEqual(currentURL(), '/campagnes/les-miennes');
  });

  test('it should go to CampagneEtPrairie', async function (assert) {
    // given
    const campaignAssessmentParticipationResult = server.create(
      'campaign-assessment-participation-result',
      'withCompetenceResults',
      { id: 1, campaignId: 1 }
    );
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAssessmentParticipationResult });
    server.create('campaign', { id: 1, name: 'CampagneEtPrairie' });

    // when
    await visitScreen('/campagnes/1/evaluations/1');
    await clickByName('CampagneEtPrairie');

    // then
    assert.strictEqual(currentURL(), '/campagnes/1');
  });

  test('[a11y] it should contain accessibility aria-label nav', async function (assert) {
    // given
    const campaignAssessmentParticipationResult = server.create(
      'campaign-assessment-participation-result',
      'withCompetenceResults',
      { id: 1, campaignId: 1 }
    );
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAssessmentParticipationResult });

    // when
    const screen = await visitScreen('/campagnes/1/evaluations/1');

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
      { id: 1, campaignId: 1 }
    );
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAssessmentParticipationResult });

    // when
    const screen = await visitScreen('/campagnes/1/evaluations/1');

    // then
    assert.dom(screen.getByText('Compétences (2)')).exists();
  });

  test('it should not display individual results when competence results are empty', async function (assert) {
    // given
    const campaignAssessmentParticipationResult = server.create(
      'campaign-assessment-participation-result',
      'withEmptyCompetenceResults',
      { id: 1, campaignId: 1 }
    );
    server.create('campaign-assessment-participation', { id: 1, campaignId: 1, campaignAssessmentParticipationResult });

    // when
    const screen = await visitScreen('/campagnes/1/evaluations/1');

    // then
    assert.dom(screen.getByText('Compétences (-)')).exists();
  });
});
