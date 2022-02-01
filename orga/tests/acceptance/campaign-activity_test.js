import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Activity', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let campaignId;

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);
    campaignId = 1;
    server.create('campaign', 'ofTypeAssessment', { id: campaignId, participationsCount: 1 });
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
        await clickByName('Bacri');

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), '/campagnes/1/evaluations/1/resultats');
      });
    });

    module('When campaign is of type profiles collection', function (hooks) {
      hooks.beforeEach(async () => {
        campaignId = 2;
        server.create('campaign', 'ofTypeProfilesCollection', { id: campaignId, participationsCount: 1 });
        server.create('campaign-profile', { id: 1, campaignId, lastName: 'Bacri' });
        server.create('campaign-participant-activity', { id: 1, lastName: 'Bacri' });
      });

      test('it could click on profile to go to details', async function (assert) {
        // when
        await visit('/campagnes/2');
        await clickByName('Bacri');

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), '/campagnes/2/profils/1');
      });
    });

    test('it could return on list of participants', async function (assert) {
      // when
      await visit('/campagnes/1/evaluations/1');
      await clickByName('Retour');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/campagnes/1');
    });
  });

  module('when prescriber reset filters', () => {
    test('should reset status filter', async function (assert) {
      // when
      const screen = await visit('/campagnes/1');

      await fillByLabel('Statut', 'STARTED');
      await clickByName('Effacer les filtres');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(screen.getByLabelText('Statut').value, '');
    });
  });
});
