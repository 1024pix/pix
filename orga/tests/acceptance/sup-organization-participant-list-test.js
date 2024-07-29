import { clickByName, clickByText, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import { createPrescriberByUser, createUserManagingStudents } from '../helpers/test-init';

module('Acceptance | Sup Organization Participant List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;

  hooks.afterEach(function () {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When admin', function (hooks) {
    hooks.beforeEach(async function () {
      user = createUserManagingStudents('ADMIN', 'SUP');
      createPrescriberByUser({ user });

      await authenticateSession(user.id);

      const { organizationId } = user.memberships.models.firstObject;
      server.create('group', {
        name: 'L1',
      });
      server.create('sup-organization-participant', {
        studentNumber: '123',
        firstName: 'toto',
        lastName: 'banana',
        group: 'L2',
        organizationId,
      });

      server.create('sup-organization-participant', {
        studentNumber: '321',
        firstName: 'tata',
        lastName: 'banana',
        group: 'L1',
        organizationId,
      });
    });

    module('filters', function () {
      test('it filters students by group', async function (assert) {
        // given
        const screen = await visit('/etudiants');

        // when

        const select = await screen.getByRole('textbox', { name: 'Entrer un groupe' });
        await click(select);

        await screen.findByRole('menu');

        await clickByName('L1');

        // then
        assert.notOk(screen.queryByText('toto'));
        assert.ok(screen.getByText('tata'));
      });

      test('it filters by certificability', async function (assert) {
        // given
        const organizationId = user.memberships.models.firstObject.organizationId;

        server.create('organization-participant', { organizationId, firstName: 'Jean', lastName: 'Charles' });

        await authenticateSession(user.id);
        const screen = await visit('/etudiants');

        // when
        const select = screen.getByRole('textbox', {
          name: t('pages.sup-organization-participants.filter.certificability.label'),
        });
        await click(select);
        await clickByText(t('pages.sco-organization-participants.table.column.is-certifiable.eligible'));

        // then
        assert.strictEqual(decodeURI(currentURL()), '/etudiants?certificability=["eligible"]');
      });

      test('it filters by search', async function (assert) {
        // when
        await visit('/etudiants');
        await fillByLabel('Recherche sur le nom et prénom', 'Jo');

        // then
        assert.strictEqual(currentURL(), '/etudiants?search=Jo');
      });
    });

    module('And edit the student number', function () {
      test('it should update the student number', async function (assert) {
        // given
        const screen = await visit('/etudiants');

        // when
        const actions = screen.getAllByRole('button', { name: 'Afficher les actions' });

        await click(actions[0]);
        await clickByName('Éditer le numéro étudiant');

        await screen.findByRole('dialog');

        await fillByLabel('Nouveau numéro étudiant', '1234');
        await clickByName('Mettre à jour');

        // then
        assert.ok(screen.getByText('1234'));
      });

      test('it should not update the student number if exists', async function (assert) {
        // given
        const screen = await visit('/etudiants');

        // when
        const actions = screen.getAllByRole('button', { name: 'Afficher les actions' });

        await click(actions[0]);
        await clickByName('Éditer le numéro étudiant');

        const modal = await screen.findByRole('dialog');

        await fillByLabel('Nouveau numéro étudiant', '321');
        await clickByName('Mettre à jour');

        // then
        assert.ok(within(modal).getByText('123'));
      });
    });
  });
});
