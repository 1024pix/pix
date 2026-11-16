import { visit } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

module('Acceptance | Campaign Participant Assessment Analysis', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser({ user });
    server.create('campaign', { id: 1, type: 'ASSESSMENT' });
    await authenticateSession(user.id);
  });

  module('when participation is shared', function () {
    test('it should display analysis header', async function (assert) {
      // given
      const campaignParticipationLevelsPerTubesAndCompetence = server.create(
        'campaign-participation-levels-per-tubes-and-competence',
      );
      server.create('campaign-assessment-participation', {
        id: 1,
        campaignId: 1,
        isShared: true,
        campaignParticipationLevelsPerTubesAndCompetence,
      });

      // when
      const screen = await visit('/campagnes/1/evaluations/1/analyse');

      // then
      assert.ok(screen.getByText(t('pages.campaign-analysis.description.resume', { count: 1 })));
      assert.ok(screen.getByRole('heading', { name: t('pages.campaign-analysis.levels-correspondence.title') }));
      assert.notOk(screen.queryByText(t('pages.assessment-individual-results.table.empty')));
    });
  });

  module('when participation is not shared', function () {
    test('it should display empty state instead of analysis header', async function (assert) {
      // given
      server.create('campaign-assessment-participation', { id: 1, campaignId: 1, isShared: false });

      // when
      const screen = await visit('/campagnes/1/evaluations/1/analyse');

      // then
      assert.ok(screen.getByText(t('pages.assessment-individual-results.table.empty')));
      assert.notOk(screen.queryByText(t('pages.campaign-analysis.description.resume', { count: 1 })));
    });
  });
});
