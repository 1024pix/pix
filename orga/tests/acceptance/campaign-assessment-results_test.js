import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';

import setupIntl from '../helpers/setup-intl';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

const pageSize = 50;
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
      const screen = await visit('/campagnes/1/resultats-evaluation');

      // then
      assert.dom(`[aria-label="${this.intl.t('pages.campaign-results.table.row-title')}"]`).exists({ count: pageSize });
      assert.contains('Page 1 / 2');
      assert.dom(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size'))).hasText('50');
    });

    test('it should display participant list with settings in url for pagination', async function (assert) {
      // given
      const changedPageSize = 50;
      const changedPageNumber = 2;

      // when
      const screen = await visit(
        `/campagnes/1/resultats-evaluation?pageNumber=${changedPageNumber}&pageSize=${changedPageSize}`
      );

      // then
      assert
        .dom(`[aria-label="${this.intl.t('pages.campaign-results.table.row-title')}"]`)
        .exists({ count: changedPageSize });
      assert.contains('Page 2 / 2');
      assert
        .dom(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size')))
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
      await click(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size')));
      await click(await screen.findByRole('option', { name: changedPageSize }));

      // then
      assert
        .dom(`[aria-label="${this.intl.t('pages.campaign-results.table.row-title')}"]`)
        .exists({ count: changedPageSize });
      assert.contains('Page 1 / 2');
      assert
        .dom(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size')))
        .hasText(changedPageSize.toString());
    });

    test('it should change participant list page when user clicks on next page', async function (assert) {
      // given
      const changedPageSize = 10;

      const screen = await visit('/campagnes/1/resultats-evaluation');
      await click(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size')));
      await click(await screen.findByRole('option', { name: changedPageSize }));
      const someElementFromPage1 = this.element.querySelector('[aria-label="Participant"]:nth-child(5)').textContent;

      // when
      await clickByName('Aller à la page suivante');

      // then
      assert.contains('Page 2 / 10');
      assert.dom('table tbody').doesNotContainText(someElementFromPage1);
    });

    test('it should go back to first page when user changes page size', async function (assert) {
      // given
      const changedPageSize = 25;
      const startPage = 2;

      // when
      const screen = await visit(`/campagnes/1/resultats-evaluation?pageNumber=${startPage}`);

      await click(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size')));
      await click(await screen.findByRole('option', { name: changedPageSize }));

      // then
      assert
        .dom(`[aria-label="${this.intl.t('pages.campaign-results.table.row-title')}"]`)
        .exists({ count: changedPageSize });
      assert.contains('Page 1 / 4');
      assert
        .dom(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size')))
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
});
