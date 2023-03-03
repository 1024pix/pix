import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';
import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Campaign Activity', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let campaignId;

  hooks.beforeEach(async function () {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);
    campaignId = 1;
    server.create('campaign', 'ofTypeAssessment', { id: campaignId, participationsCount: 1, ownerId: user.id });
    const campaignAssessmentParticipationResult = server.create(
      'campaign-assessment-participation-result',
      'withCompetenceResults',
      { id: 1, campaignId }
    );
    server.create('campaign-assessment-participation', {
      id: 1,
      campaignId,
      campaignAssessmentParticipationResult,
      lastName: 'Bacri',
    });
    server.create('campaign-participant-activity', { id: 1, lastName: 'Bacri' });

    await authenticateSession(user.id);
  });

  module('When prescriber arrives on activity page', function () {
    module('When campaign is of type assessment', function () {
      test('it could click on user to go to details', async function (assert) {
        // when
        await visit('/campagnes/1');
        await clickByName('Voir les résultats de Bacri');

        // then
        assert.strictEqual(currentURL(), '/campagnes/1/evaluations/1/resultats');
      });
    });

    module('When campaign is of type profiles collection', function (hooks) {
      hooks.beforeEach(async function () {
        campaignId = 2;
        server.create('campaign', 'ofTypeProfilesCollection', { id: campaignId, participationsCount: 1 });
        server.create('campaign-profile', { id: 1, campaignId, lastName: 'Bacri' });
        server.create('campaign-participant-activity', { id: 1, lastName: 'Bacri' });
      });

      test('it could click on profile to go to details', async function (assert) {
        // when
        await visit('/campagnes/2');
        await clickByName('Voir les résultats de Bacri');

        // then
        assert.strictEqual(currentURL(), '/campagnes/2/profils/1');
      });
    });
  });

  module('when prescriber reset filters', function () {
    test('should reset status filter', async function (assert) {
      // when
      const screen = await visit('/campagnes/1');

      await click(screen.getByLabelText(this.intl.t('pages.campaign-activity.table.column.status')));
      await click(
        await screen.findByRole('option', { name: this.intl.t('components.participation-status.STARTED-ASSESSMENT') })
      );
      await clickByName('Effacer les filtres');

      // then
      assert.strictEqual(screen.getByLabelText('Statut').value, '');
    });
  });

  module('when prescriber deletes a participation', function () {
    test('Success case: should display empty sentence and success notification', async function (assert) {
      // when
      const screen = await visit('/campagnes/1');
      await click(screen.getByLabelText('Supprimer la participation'));

      await screen.findByRole('dialog');

      await clickByName('Oui, je supprime');
      // then
      assert.contains('Aucun participant');
      assert.contains('La participation a été supprimée avec succès.');
    });

    test('Error case: should display an error notification', async function (assert) {
      // when
      this.server.delete(
        '/campaigns/:campaignId/campaign-participations/:campaignParticipationId',
        () => ({
          errors: [{ detail: "You're not allowed to delete" }],
        }),
        422
      );

      const screen = await visit('/campagnes/1');
      await click(screen.getByLabelText('Supprimer la participation'));

      await screen.findByRole('dialog');

      await clickByName('Oui, je supprime');

      // then
      assert.contains('Bacri');
      assert.contains('Un problème est survenu lors de la suppression de la participation.');
    });
  });

  module('when prescriber set filters', () => {
    test('should set status filter', async function (assert) {
      // when
      const screen = await visit('/campagnes/1');

      await click(screen.getByLabelText(this.intl.t('pages.campaign-activity.table.column.status')));
      await click(
        await screen.findByRole('option', { name: this.intl.t('components.participation-status.STARTED-ASSESSMENT') })
      );

      // then
      assert.strictEqual(currentURL(), '/campagnes/1?status=STARTED');
    });

    test('should set search filter', async function (assert) {
      // when
      await visit('/campagnes/1');

      await fillByLabel('Recherche sur le nom et prénom', 'Choupette');

      // then
      assert.strictEqual(currentURL(), '/campagnes/1?search=Choupette');
    });
  });
});
