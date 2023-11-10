import { module, test } from 'qunit';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';
import setupIntl from '../helpers/setup-intl';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Analysis', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

    const campaignAnalysis = server.create('campaign-analysis', 'withTubeRecommendations');
    const campaignCollectiveResult = server.create('campaign-collective-result');
    server.create('campaign', {
      campaignAnalysis,
      campaignCollectiveResult,
      sharedParticipationsCount: 2,
      participationsCount: 2,
    });

    await authenticateSession(user.id);
  });

  test('it should display campaign analysis', async function (assert) {
    // when
    const screen = await visit('/campagnes/1/analyse');

    // then
    assert.ok(screen.getByLabelText(this.intl.t('pages.campaign-review.table.analysis.title')));
    assert.ok(screen.getByText(this.intl.t('pages.campaign-review.table.analysis.column.subjects', { count: 2 })));
  });
});
