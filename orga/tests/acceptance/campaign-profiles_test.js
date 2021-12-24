import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Profiles', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  const pageSize = 25;
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
      await visit('/campagnes/1/profils');

      // then
      assert.dom('table tbody tr').exists({ count: pageSize });
      assert.contains('Page 1 / 4');
      assert.dom('.page-size option:checked').hasText(pageSize.toString());
    });

    test('it should display profile list with settings in url for pagination', async function (assert) {
      // given
      const changedPageSize = 50;
      const changedPageNumber = 2;

      // when
      await visit(`/campagnes/1/profils?pageNumber=${changedPageNumber}&pageSize=${changedPageSize}`);

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.contains('Page 2 / 2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });
  });

  module('When user is already on profiles page and changes pagination', function () {
    test('it should display profile list with updated page size', async function (assert) {
      // given
      const changedPageSize = 50;

      // when
      await visit('/campagnes/1/profils');
      await fillByLabel("Nombre d'élément à afficher par page", changedPageSize);

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.contains('Page 1 / 2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });

    test('it should change profile list page when user clicks on next page', async function (assert) {
      // given
      const changedPageSize = 10;

      await visit('/campagnes/1/profils');
      await fillByLabel("Nombre d'élément à afficher par page", changedPageSize);
      const someElementFromPage1 = this.element.querySelector('table tbody tr:nth-child(5)').textContent;

      // when
      await clickByName('Aller à la page suivante');

      // then
      assert.contains('Page 2 / 10');
      assert.dom('table tbody').doesNotContainText(someElementFromPage1);
    });

    test('it should go back to first page when user changes page size', async function (assert) {
      // given
      const changedPageSize = 50;
      const startPage = 2;

      // when
      await visit(`/campagnes/1/profils?pageNumber=${startPage}`);
      await fillByLabel("Nombre d'élément à afficher par page", changedPageSize);

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.contains('Page 1 / 2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });
  });
});
