import { clickByName, clickByText, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl, { t } from '../helpers/setup-intl';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

module('Acceptance | Organization Participant List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When prescriber is logged in', function () {
    let user;

    module('When organization is not managing students', function (hooks) {
      hooks.beforeEach(async function () {
        user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser({ user });
        await authenticateSession(user.id);
      });

      test('it should be accessible and display the no-participant-panel when no participant', async function (assert) {
        // when
        const screen = await visit('/participants');

        // then
        assert.strictEqual(currentURL(), '/participants');
        assert.ok(screen.getByText(t('pages.organization-participants.empty-state.message'), { exact: false }));
      });

      test('it should return participant-list when having participants', async function (assert) {
        // given
        const organizationId = user.memberships.models[0].organizationId;

        // when
        server.create('organization-participant', { organizationId, firstName: 'Xavier', lastName: 'Charles' });

        const screen = await visit('/participants');

        // then
        assert.notOk(screen.queryByText(t('pages.organization-participants.empty-state.message')));
        assert.ok(screen.getByText('Charles'));
      });

      test('it should filter by certificability', async function (assert) {
        // given
        const organizationId = user.memberships.models[0].organizationId;

        server.create('organization-participant', { organizationId, firstName: 'Jean', lastName: 'Charles' });

        const { getByLabelText } = await visit('/participants');

        // when
        const select = getByLabelText(t('pages.organization-participants.filters.type.certificability.label'));
        await click(select);
        await clickByText(t('pages.sco-organization-participants.table.column.is-certifiable.eligible'));

        // then
        assert.strictEqual(decodeURI(currentURL()), '/participants?certificability=["eligible"]');
      });

      test('it should successfully update participant name', async function (assert) {
        // given
        const organizationId = user.memberships.models[0].organizationId;
        server.create('organization-participant', {
          organizationId,
          firstName: 'Jean',
          lastName: 'Charles',
        });
        const screen = await visit('/participants');

        // when
        const dropdownButton = screen.getByText(t('pages.sco-organization-participants.actions.show-actions'));
        await click(dropdownButton);

        const editButton = screen.getByText(t('components.ui.edit-participant-name-modal.label'));
        await click(editButton);

        const firstNameLabel = t('components.ui.edit-participant-name-modal.fields.first-name') + ' *';
        const lastNameLabel = t('components.ui.edit-participant-name-modal.fields.last-name') + ' *';

        await fillByLabel(firstNameLabel, 'Pierre');
        await fillByLabel(lastNameLabel, 'Martin');

        await clickByName(t('common.actions.save'));

        // then
        assert.ok(await screen.findByText('Pierre'));
        assert.ok(await screen.findByText('Martin'));
        assert.notOk(screen.queryByText('Jean'));
        assert.notOk(screen.queryByText('Charles'));
      });
    });

    module('when organization has oralization management feature', function (hooks) {
      let user;

      hooks.beforeEach(async function () {
        user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser({ user, features: { ORALIZATION: { active: true } } });
        await authenticateSession(user.id);
      });

      test('should allow to deactivate oralization when feature is active', async function (assert) {
        // given
        const organizationId = user.memberships.models[0].organizationId;
        server.create('organization-participant', {
          organizationId,
          firstName: 'Xavier',
          lastName: 'Charles',
          extraColumns: { ORALIZATION: true },
        });

        const screen = await visit('/participants');

        // when
        await clickByName(t('pages.sup-organization-participants.actions.show-actions'));

        // then
        assert.ok(screen.getByText(t('pages.organization-participants.table.actions.disable-oralization')));
      });
    });
  });
});
