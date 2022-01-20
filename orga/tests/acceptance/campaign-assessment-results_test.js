import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';

import setupIntl from '../helpers/setup-intl';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

const pageSize = 25;
const rowCount = 100;

module('Acceptance | Campaign Assessment Results', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

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
      await visit('/campagnes/1/resultats-evaluation');

      // then
      assert.dom(`[aria-label="${this.intl.t('pages.campaign-results.table.row-title')}"]`).exists({ count: pageSize });
      assert.contains('Page 1 / 4');
      assert.dom('.page-size option:checked').hasText('25');
    });

    test('it should display participant list with settings in url for pagination', async function (assert) {
      // given
      const changedPageSize = 50;
      const changedPageNumber = 2;

      // when
      await visit(`/campagnes/1/resultats-evaluation?pageNumber=${changedPageNumber}&pageSize=${changedPageSize}`);

      // then
      assert
        .dom(`[aria-label="${this.intl.t('pages.campaign-results.table.row-title')}"]`)
        .exists({ count: changedPageSize });
      assert.contains('Page 2 / 2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });

    test('it should redirect to participant details when user clicks on row', async function (assert) {
      // given
      await visit('/campagnes/1/resultats-evaluation');

      // when
      await clickByName('AAAAAAAA_IAM_FIRST');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/campagnes/1/evaluations/1/resultats');
    });
  });

  module('When prescriber is already on participants page and changes pagination', function () {
    test('it should display participant list with updated page size', async function (assert) {
      // given
      const changedPageSize = 50;

      // when
      await visit('/campagnes/1/resultats-evaluation');
      await fillByLabel("Nombre d'élément à afficher par page", changedPageSize);

      // then
      assert
        .dom(`[aria-label="${this.intl.t('pages.campaign-results.table.row-title')}"]`)
        .exists({ count: changedPageSize });
      assert.contains('Page 1 / 2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });

    test('it should change participant list page when user clicks on next page', async function (assert) {
      // given
      const changedPageSize = 10;

      await visit('/campagnes/1/resultats-evaluation');
      await fillByLabel("Nombre d'élément à afficher par page", changedPageSize);
      const someElementFromPage1 = this.element.querySelector('[aria-label="Participant"]:nth-child(5)').textContent;

      // when
      await clickByName('Aller à la page suivante');

      // then
      assert.contains('Page 2 / 10');
      assert.dom('table tbody').doesNotContainText(someElementFromPage1);
    });

    test('it should go back to first page when user changes page size', async function (assert) {
      // given
      const changedPageSize = 50;
      const startPage = 3;

      // when
      await visit(`/campagnes/1/resultats-evaluation?pageNumber=${startPage}`);
      await fillByLabel("Nombre d'élément à afficher par page", changedPageSize);

      // then
      assert
        .dom(`[aria-label="${this.intl.t('pages.campaign-results.table.row-title')}"]`)
        .exists({ count: changedPageSize });
      assert.contains('Page 1 / 2');
      assert.dom('.page-size option:checked').hasText(changedPageSize.toString());
    });
  });
});
