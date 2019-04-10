import { module, test } from 'qunit';
import { visit, click, currentURL, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Participants', function (hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  const defaultPage = '1';
  const pageSize = 10;
  const rowCount = 50;
  hooks.beforeEach(async () => {
    user = createUserWithMembership();
    await authenticateSession({
      user_id: user.id,
    });
    server.create('campaign', { id: 1 });
    server.createList('campaign-participation', rowCount, { campaignId: 1 });
  });

  module('When user arrives on participants page', function () {

    test('it should display participant list with default settings for pagination', async function (assert) {
      // when
      await visit('/campagnes/1/participants');

      // then
      assert.dom('table tbody tr').exists({ count: pageSize });
      assert.dom('.page-navigation__current-page').hasText(defaultPage);
      assert.dom('.page-navigation__last-page').containsText('5');
      assert.dom('.page-size option:checked').hasText(pageSize.toString());
    });

    test('it should display participant list with settings in url for pagination', async function (assert) {
      // given
      const changedPageSize = 25;
      const changedPageNumber = 2;

      // when
      await visit(`/campagnes/1/participants?pageNumber=${changedPageNumber}&pageSize=${changedPageSize}`);

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.dom('.page-navigation__current-page').hasText(changedPageNumber.toString());
      assert.dom('.page-navigation__last-page').containsText('2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });


    test('it should redirect to participant details when user clicks on row', async function (assert) {
      // given
      await visit(`/campagnes/1/participants`);

      // when
      await click('table tbody .tr--clickable');

      // then
      assert.equal(currentURL(), '/campagnes/1/participants/1');
    });
  });

  module('When user is already on participants page and changes pagination', function () {

    test('it should display participant list with updated page size', async function (assert) {
      // given
      const changedPageSize = 25;

      // when
      await visit('/campagnes/1/participants');
      await fillIn('.page-size .select', changedPageSize);

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.dom('.page-navigation__current-page').hasText(defaultPage);
      assert.dom('.page-navigation__last-page').containsText('2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });

    test('it should change participant list page when user clicks on next page', async function (assert) {
      // given
      await visit('/campagnes/1/participants');
      const someElementFromPage1 = this.element.querySelector('table tbody tr:nth-child(5)').textContent;

      // when
      await click('.page-navigation__arrow--next .icon-button');

      // then
      assert.dom('.page-navigation__current-page').hasText('2');
      assert.dom('table tbody').doesNotContainText(someElementFromPage1);
    });

    test('it should go back to first page when user changes page size', async function (assert) {
      // given
      const changedPageSize = 25;
      const startPage = 3;

      // when
      await visit(`/campagnes/1/participants?pageNumber=${startPage}`);
      await fillIn('.page-size .select', changedPageSize);

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.dom('.page-navigation__current-page').hasText(defaultPage);
      assert.dom('.page-navigation__last-page').containsText('2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });
  });
});
