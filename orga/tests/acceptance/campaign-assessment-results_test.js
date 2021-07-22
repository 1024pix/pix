import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import fillInByLabel from '../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

const pageSize = 25;
const rowCount = 100;

module('Acceptance | Campaign Assessment Results', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);
    server.create('campaign-assessment-participation', { id: 1, lastName: 'AAAAAAAA_IAM_FIRST', campaignId: 1 });
    server.create('campaign-assessment-result-minimal', { id: 1, lastName: 'AAAAAAAA_IAM_FIRST' });
    server.createList('campaign-assessment-participation', rowCount, { campaignId: 1 });
    server.createList('campaign-assessment-participation-result', rowCount, { campaignId: 1 });
    server.createList('campaign-assessment-result-minimal', 99);

    const campaignCollectiveResult = server.create('campaign-collective-result', 'withCompetenceCollectiveResults');
    server.create('campaign', { id: 1, campaignCollectiveResult, sharedParticipationsCount: 2 });

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
      await visit('/campagnes/1/resultats-evaluation');

      // then
      assert.dom('table tbody tr').exists({ count: pageSize });
      assert.contains('Page 1 / 4');
      assert.dom('.page-size option:checked').hasText('25');
    });

    test('it should display participant list with settings in url for pagination', async function(assert) {
      // given
      const changedPageSize = 50;
      const changedPageNumber = 2;

      // when
      await visit(`/campagnes/1/resultats-evaluation?pageNumber=${changedPageNumber}&pageSize=${changedPageSize}`);

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.contains('Page 2 / 2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });

    test('it should redirect to participant details when user clicks on row', async function(assert) {
      // given
      await visit('/campagnes/1/resultats-evaluation');

      // when
      await clickByLabel('AAAAAAAA_IAM_FIRST');

      // then
      assert.equal(currentURL(), '/campagnes/1/evaluations/1/resultats');
    });
  });

  module('When prescriber is already on participants page and changes pagination', function() {

    test('it should display participant list with updated page size', async function(assert) {
      // given
      const changedPageSize = 50;

      // when
      await visit('/campagnes/1/resultats-evaluation');
      await fillInByLabel('Sélectionner une pagination', changedPageSize);

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.contains('Page 1 / 2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });

    test('it should change participant list page when user clicks on next page', async function(assert) {
      // given
      const changedPageSize = 10;

      await visit('/campagnes/1/resultats-evaluation');
      await fillInByLabel('Sélectionner une pagination', changedPageSize);
      const someElementFromPage1 = this.element.querySelector('table tbody tr:nth-child(5)').textContent;

      // when
      await clickByLabel('Aller à la page suivante');

      // then
      assert.contains('Page 2 / 10');
      assert.dom('table tbody').doesNotContainText(someElementFromPage1);
    });

    test('it should go back to first page when user changes page size', async function(assert) {
      // given
      const changedPageSize = 50;
      const startPage = 3;

      // when
      await visit(`/campagnes/1/resultats-evaluation?pageNumber=${startPage}`);
      await fillInByLabel('Sélectionner une pagination', changedPageSize);

      // then
      assert.dom('table tbody tr').exists({ count: changedPageSize });
      assert.contains('Page 1 / 2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });
  });
});
