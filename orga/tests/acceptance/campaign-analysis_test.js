import { visit } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import {
  createPrescriberByUser,
  createPrescriberForOrganization,
  createUserWithMembershipAndTermsOfServiceAccepted,
} from '../helpers/test-init';

module('Acceptance | Campaign Analysis', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser({ user });

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

  module('when organization uses "GAR" as identity provider for campaigns', function () {
    module('when there is no activity', function () {
      test('displays an empty state message without copy button', async function (assert) {
        // given
        const userAttributes = {
          id: 777,
          firstName: 'Luc',
          lastName: 'Harne',
          email: 'luc@har.ne',
          lang: 'fr',
        };
        const organizationAttributes = {
          id: 777,
          name: 'Cali Ber',
          externalId: 'EXT_CALIBER',
          identityProviderForCampaigns: 'GAR',
        };
        const organizationRole = 'ADMIN';
        const user = createPrescriberForOrganization(userAttributes, organizationAttributes, organizationRole);

        const campaignAnalysis = server.create('campaign-analysis', 'withTubeRecommendations');
        const campaignCollectiveResult = server.create('campaign-collective-result');
        server.create('campaign', 'ofTypeAssessment', {
          id: 7654,
          participationsCount: 0,
          ownerId: user.id,
          campaignAnalysis,
          campaignCollectiveResult,
        });

        await authenticateSession(user.id);

        // when
        const screen = await visit('/campagnes/7654/analyse');

        // then
        assert.dom(screen.getByText(this.intl.t('pages.campaign.empty-state'))).exists();
        assert
          .dom(screen.queryByRole('button', { name: this.intl.t('pages.campaign.copy.link.default') }))
          .doesNotExist();
      });
    });
  });
});
