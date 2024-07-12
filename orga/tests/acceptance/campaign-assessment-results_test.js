import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import {
  createPrescriberByUser,
  createPrescriberForOrganization,
  createUserWithMembershipAndTermsOfServiceAccepted,
} from '../helpers/test-init';

const pageSize = 50;
const rowCount = 100;

module('Acceptance | Campaign Assessment Results', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser({ user });

    server.create('campaign', { id: 1, participationsCount: 1 });
    server.create('campaign-assessment-participation', { id: 1, lastName: 'AAAAAAAA_IAM_FIRST', campaignId: 1 });
    server.create('campaign-assessment-result-minimal', { id: 1, lastName: 'AAAAAAAA_IAM_FIRST' });
    server.createList('campaign-assessment-participation', rowCount, { campaignId: 1 });
    server.createList('campaign-assessment-participation-result', rowCount, { campaignId: 1 });
    server.createList('campaign-assessment-result-minimal', 99);

    const campaignCollectiveResult = server.create('campaign-collective-result', 'withCompetenceCollectiveResults');
    server.create('campaign', { id: 1, campaignCollectiveResult, sharedParticipationsCount: 2 });

    await authenticateSession(user.id);
  });

  module('When prescriber arrives on participants page', function () {
    test('it should display participant list with default settings for pagination', async function (assert) {
      // when
      const screen = await visit('/campagnes/1/resultats-evaluation');

      // then
      assert.dom(`[aria-label="${t('pages.campaign-results.table.row-title')}"]`).exists({ count: pageSize });
      assert.ok(screen.getByText('Page 1 / 2'));
      assert.dom(screen.getByLabelText(t('common.pagination.action.select-page-size'))).hasText('50');
    });

    test('it should display participant list with settings in url for pagination', async function (assert) {
      // given
      const changedPageSize = 50;
      const changedPageNumber = 2;

      // when
      const screen = await visit(
        `/campagnes/1/resultats-evaluation?pageNumber=${changedPageNumber}&pageSize=${changedPageSize}`,
      );

      // then
      assert.dom(`[aria-label="${t('pages.campaign-results.table.row-title')}"]`).exists({ count: changedPageSize });
      assert.ok(screen.getByText('Page 2 / 2'));
      assert
        .dom(screen.getByLabelText(t('common.pagination.action.select-page-size')))
        .hasText(changedPageSize.toString());
    });

    test('it should redirect to participant details when user clicks on row', async function (assert) {
      // given
      await visit('/campagnes/1/resultats-evaluation');

      // when
      await clickByName('AAAAAAAA_IAM_FIRST');

      // then
      assert.strictEqual(currentURL(), '/campagnes/1/evaluations/1/resultats');
    });
  });

  module('When prescriber is already on participants page and changes pagination', function () {
    test('it should display participant list with updated page size', async function (assert) {
      // given
      const changedPageSize = 50;

      // when
      const screen = await visit('/campagnes/1/resultats-evaluation');
      await click(screen.getByLabelText(t('common.pagination.action.select-page-size')));
      await click(await screen.findByRole('option', { name: changedPageSize }));

      // then
      assert.dom(`[aria-label="${t('pages.campaign-results.table.row-title')}"]`).exists({ count: changedPageSize });
      assert.ok(screen.getByText('Page 1 / 2'));
      assert
        .dom(screen.getByLabelText(t('common.pagination.action.select-page-size')))
        .hasText(changedPageSize.toString());
    });

    test('it should change participant list page when user clicks on next page', async function (assert) {
      // given
      const changedPageSize = 10;

      const screen = await visit('/campagnes/1/resultats-evaluation');
      await click(screen.getByLabelText(t('common.pagination.action.select-page-size')));
      await click(await screen.findByRole('option', { name: changedPageSize }));
      const someElementFromPage1 = document.querySelector('[aria-label="Participant"]:nth-child(5)').textContent;

      // when
      await clickByName('Aller à la page suivante');

      // then
      assert.ok(screen.getByText('Page 2 / 10'));
      assert.dom('table tbody').doesNotContainText(someElementFromPage1);
    });

    test('it should go back to first page when user changes page size', async function (assert) {
      // given
      const changedPageSize = 25;
      const startPage = 2;

      // when
      const screen = await visit(`/campagnes/1/resultats-evaluation?pageNumber=${startPage}`);

      await click(screen.getByLabelText(t('common.pagination.action.select-page-size')));
      await click(await screen.findByRole('option', { name: changedPageSize }));

      // then
      assert.dom(`[aria-label="${t('pages.campaign-results.table.row-title')}"]`).exists({ count: changedPageSize });
      assert.ok(screen.getByText('Page 1 / 4'));
      assert
        .dom(screen.getByLabelText(t('common.pagination.action.select-page-size')))
        .hasText(changedPageSize.toString());
    });
  });

  module('when prescriber is already on participants page and set filters', () => {
    test('should set search filter', async function (assert) {
      // when
      await visit('/campagnes/1/resultats-evaluation');

      await fillByLabel('Recherche sur le nom et prénom', 'Choupette');

      // then
      assert.strictEqual(currentURL(), '/campagnes/1/resultats-evaluation?search=Choupette');
    });
  });

  module('when organization uses "GAR" as identity provider for campaigns', function () {
    module('when there is no assessment result', function () {
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

        server.create('campaign', 'ofTypeAssessment', { id: 7654, participationsCount: 0, ownerId: user.id });

        await authenticateSession(user.id);

        // when
        const screen = await visit('/campagnes/7654/resultats-evaluation');

        // then
        assert.dom(screen.getByText(t('pages.campaign.empty-state'))).exists();
        assert.dom(screen.queryByRole('button', { name: t('pages.campaign.copy.link.default') })).doesNotExist();
      });
    });
  });
});
