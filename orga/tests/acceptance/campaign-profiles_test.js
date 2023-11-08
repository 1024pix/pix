import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Profiles', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  let user;

  const pageSize = 50;
  const rowCount = 100;
  hooks.beforeEach(async () => {
    user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);
    await authenticateSession(user.id);
    server.create('campaign', { id: 1, type: 'PROFILES_COLLECTION', sharedParticipationsCount: 1 });
    server.createList('campaign-participation', rowCount, { campaignId: 1 });
    server.createList('campaign-profiles-collection-participation-summary', rowCount);
  });

  module('When user arrives on profiles page', function () {
    test('it should display profile list with default settings for pagination', async function (assert) {
      // when
      const screen = await visit('/campagnes/1/profils');

      // then
      assert.dom('table tbody tr').exists({ count: pageSize });
      assert.ok(screen.getByText('Page 1 / 2'));
      assert.dom(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size'))).hasText('50');
    });

    test('it should display profile list with settings in url for pagination', async function (assert) {
      // given
      const changedPageSize = 50;
      const changedPageNumber = 2;

      // when
      const screen = await visit(`/campagnes/1/profils?pageNumber=${changedPageNumber}&pageSize=${changedPageSize}`);

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.ok(screen.getByText('Page 2 / 2'));
      assert.dom(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size'))).hasText('50');
    });
  });

  module('When user is already on profiles page and changes pagination', function () {
    test('it should display profile list with updated page size', async function (assert) {
      // given
      const changedPageSize = 50;

      // when
      const screen = await visit('/campagnes/1/profils');
      await click(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size')));
      await click(await screen.findByRole('option', { name: changedPageSize }));

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.ok(screen.getByText('Page 1 / 2'));
      assert.dom(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size'))).hasText('50');
    });

    test('it should change profile list page when user clicks on next page', async function (assert) {
      // given
      const changedPageSize = 10;

      const screen = await visit('/campagnes/1/profils');
      await click(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size')));
      await click(await screen.findByRole('option', { name: changedPageSize }));

      const someElementFromPage1 = document.querySelector('table tbody tr:nth-child(5)').textContent;

      // when
      await clickByName('Aller à la page suivante');

      // then
      assert.ok(screen.getByText('Page 2 / 10'));
      assert.dom('table tbody').doesNotContainText(someElementFromPage1);
    });

    test('it should go back to first page when user changes page size', async function (assert) {
      // given
      const changedPageSize = 50;
      const startPage = 2;

      // when
      const screen = await visit(`/campagnes/1/profils?pageNumber=${startPage}`);
      await click(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size')));
      await click(await screen.findByRole('option', { name: changedPageSize }));

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.ok(screen.getByText('Page 1 / 2'));
      assert.dom(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size'))).hasText('50');
    });
  });

  module('when  user is already on profiles page and set filters', () => {
    test('should set search filter', async function (assert) {
      // when
      await visit('/campagnes/1/profils');

      await fillByLabel('Recherche sur le nom et prénom', 'Choupette');

      // then
      assert.strictEqual(currentURL(), '/campagnes/1/profils?search=Choupette');
    });
  });
});
