import { module, test } from 'qunit';
import { visit, click, currentURL, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Participants', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  const pageSize = 10;
  const rowCount = 50;

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

    server.create('campaign', { id: 1 });
    server.createList('campaign-assessment-participation', rowCount, { campaignId: 1 });
    server.createList('campaign-assessment-participation-result', rowCount, { campaignId: 1 });
    server.createList('campaign-assessment-participation-summary', 20, 'completed');
    server.createList('campaign-assessment-participation-summary', 10, 'ongoing');
    server.createList('campaign-assessment-participation-summary', 20, 'shared');

    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
  });

  module('When prescriber arrives on participants page', function() {

    test('it should display participant list with default settings for pagination', async function(assert) {
      // when
      await visit('/campagnes/1/evaluations');

      // then
      assert.dom('table tbody tr').exists({ count: pageSize });
      assert.contains('Page 1 / 5');
      assert.dom('.page-size option:checked').hasText(pageSize.toString());
    });

    test('it should display participant list with settings in url for pagination', async function(assert) {
      // given
      const changedPageSize = 25;
      const changedPageNumber = 2;

      // when
      await visit(`/campagnes/1/evaluations?pageNumber=${changedPageNumber}&pageSize=${changedPageSize}`);

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.contains('Page 2 / 2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });

    test('it should redirect to participant details when user clicks on row', async function(assert) {
      // given
      await visit('/campagnes/1/evaluations');

      // when
      await click('table tbody .tr--clickable');

      // then
      assert.equal(currentURL(), '/campagnes/1/evaluations/1/resultats');
    });
  });

  module('When prescriber is already on participants page and changes pagination', function() {

    test('it should display participant list with updated page size', async function(assert) {
      // given
      const changedPageSize = 25;

      // when
      await visit('/campagnes/1/evaluations');
      await fillIn('.page-size select', changedPageSize);

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.contains('Page 1 / 2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });

    test('it should change participant list page when user clicks on next page', async function(assert) {
      // given
      const changedPageSize = 25;

      await visit('/campagnes/1/evaluations');
      await fillIn('.page-size select', changedPageSize);
      const someElementFromPage1 = this.element.querySelector('table tbody tr:nth-child(5)').textContent;

      // when
      await click('.page-navigation__arrow--next .icon-button');

      // then
      assert.contains('Page 2 / 2');
      assert.dom('table tbody').doesNotContainText(someElementFromPage1);
    });

    test('it should go back to first page when user changes page size', async function(assert) {
      // given
      const changedPageSize = 25;
      const startPage = 3;

      // when
      await visit(`/campagnes/1/evaluations?pageNumber=${startPage}`);
      await fillIn('.page-size select', changedPageSize);

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.contains('Page 1 / 2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });
  });
});
