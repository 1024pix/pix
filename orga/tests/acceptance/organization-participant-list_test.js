import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { visit, clickByText } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import setupIntl from '../helpers/setup-intl';
import authenticateSession from '../helpers/authenticate-session';

import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Organization Participant List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When prescriber is logged in', function () {
    let user;

    module('When organization is not managing students', function (hooks) {
      hooks.beforeEach(async function () {
        user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);
        await authenticateSession(user.id);
      });

      test('it should be accessible and display the no-participant-panel when no participant', async function (assert) {
        // when
        const screen = await visit('/participants');

        // then
        assert.strictEqual(currentURL(), '/participants');
        assert.ok(
          screen.getByText(this.intl.t('pages.organization-participants.empty-state.message'), { exact: false }),
        );
      });

      test('it should return participant-list when having participants', async function (assert) {
        // given
        const organizationId = user.memberships.models.firstObject.organizationId;

        // when
        server.create('organization-participant', { organizationId, firstName: 'Xavier', lastName: 'Charles' });

        await authenticateSession(user.id);
        const screen = await visit('/participants');

        // then
        assert.notOk(screen.queryByText(this.intl.t('pages.organization-participants.empty-state.message')));
        assert.ok(screen.getByText('Charles'));
      });

      test('it should filter by certificability', async function (assert) {
        // given
        const organizationId = user.memberships.models.firstObject.organizationId;

        server.create('organization-participant', { organizationId, firstName: 'Jean', lastName: 'Charles' });

        await authenticateSession(user.id);
        const { getByLabelText } = await visit('/participants');

        // when
        const select = getByLabelText(
          this.intl.t('pages.organization-participants.filters.type.certificability.label'),
        );
        await click(select);
        await clickByText(this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible'));

        // then
        assert.strictEqual(decodeURI(currentURL()), '/participants?certificability=["eligible"]');
      });
    });
  });
});
