import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
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
        await visit('/participants');

        // then
        assert.strictEqual(currentURL(), '/participants');
        assert.contains(this.intl.t('pages.organization-participants.empty-state.message'));
      });

      test('it should return participant-list when having participants', async function (assert) {
        // given
        const organizationId = user.memberships.models.firstObject.organizationId;

        // when
        server.create('organization-participant', { organizationId, firstName: 'Xavier', lastName: 'Charles' });

        await authenticateSession(user.id);
        await visit('/participants');

        // then
        assert.notContains(this.intl.t('pages.organization-participants.empty-state.message'));
        assert.contains('Charles');
      });
    });
  });
});
