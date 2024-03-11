import { clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import { createPrescriberByUser, createUserManagingStudents } from '../helpers/test-init';

module('Acceptance | Campaign Parameters', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const user = createUserManagingStudents('ADMIN');
    createPrescriberByUser(user);

    await authenticateSession(user.id);
  });

  test('it should allow to archive a campaign when user is admin', async function (assert) {
    // given
    const campaign = server.create('campaign', { id: 1, isArchived: false });

    const screen = await visitScreen(`/campagnes/${campaign.id}/parametres`);

    // when
    await clickByName('Archiver');

    // then
    assert.dom(screen.getByText(this.intl.t('pages.campaign.archived'))).exists();
  });

  test('it should display error notification when something bad happened', async function (assert) {
    // given
    const campaign = server.create('campaign', { id: 1, isArchived: false });
    this.server.put('/campaigns/:id/archive', {}, 500);

    const screen = await visitScreen(`/campagnes/${campaign.id}/parametres`);

    // when
    await clickByName('Archiver');

    // then
    assert.dom(screen.getByText(this.intl.t('api-error-messages.global'))).exists();
  });
});
