import { visit } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

module('Acceptance | Campaign Analysis', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser({ user });
    await authenticateSession(user.id);
  });

  module('when campaign has shared participations', function () {
    test('it should display analysis header', async function (assert) {
      // given
      const campaignCollectiveResult = server.create('campaign-collective-result');
      const campaignResultLevelsPerTubesAndCompetence = server.create(
        'campaign-result-levels-per-tubes-and-competence',
      );
      server.create('campaign', {
        id: 1,
        type: 'ASSESSMENT',
        sharedParticipationsCount: 2,
        campaignCollectiveResult,
        campaignResultLevelsPerTubesAndCompetence,
      });

      // when
      const screen = await visit('/campagnes/1/analyse');

      // then
      assert.ok(screen.getByText(t('pages.campaign-analysis.description.resume', { count: 2 })));
      assert.ok(screen.getByRole('heading', { name: t('pages.campaign-analysis.levels-correspondence.title') }));
      assert.notOk(screen.queryByText(t('pages.campaign.empty-state-with-copy-link')));
    });
  });

  module('when campaign has no shared participations', function () {
    test('it should display empty state instead of analysis header', async function (assert) {
      // given
      const campaignCollectiveResult = server.create('campaign-collective-result');
      const campaignResultLevelsPerTubesAndCompetence = server.create(
        'campaign-result-levels-per-tubes-and-competence',
      );
      server.create('campaign', {
        id: 1,
        type: 'ASSESSMENT',
        code: 'CAMPAIGN1',
        sharedParticipationsCount: 0,
        campaignCollectiveResult,
        campaignResultLevelsPerTubesAndCompetence,
      });

      // when
      const screen = await visit('/campagnes/1/analyse');

      // then
      assert.ok(screen.getByText(t('pages.campaign.empty-state-with-copy-link')));
      assert.notOk(screen.queryByText(t('pages.campaign-analysis.description.resume', { count: 2 })));
    });
  });
});
