import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { visit, clickByText, fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';

import { createUserManagingStudents, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

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
      createPrescriberByUser(user);

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
        const { getByPlaceholderText, findByRole } = await visit('/etudiants');

        // when

        const select = await getByPlaceholderText('Rechercher par groupe');
        await click(select);

        await findByRole('menu');

        await clickByName('L1');

        // then
        assert.notContains('toto');
        assert.contains('tata');
      });

      test('it filters by certificability', async function (assert) {
        // given
        const organizationId = user.memberships.models.firstObject.organizationId;

        server.create('organization-participant', { organizationId, firstName: 'Jean', lastName: 'Charles' });

        await authenticateSession(user.id);
        const { getByLabelText } = await visit('/etudiants');

        // when
        const select = getByLabelText(this.intl.t('pages.sup-organization-participants.filter.certificability.label'));
        await click(select);
        await clickByText(this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible'));

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
        const { getAllByRole, findByRole } = await visit('/etudiants');

        // when
        const actions = getAllByRole('button', { name: 'Afficher les actions' });

        await click(actions[0]);
        await clickByName('Éditer le numéro étudiant');

        await findByRole('dialog');

        await fillByLabel('Nouveau numéro étudiant', '1234');
        await clickByName('Mettre à jour');

        // then
        assert.contains('1234');
      });

      test('it should not update the student number if exists', async function (assert) {
        // given
        const { getAllByRole, findByRole } = await visit('/etudiants');

        // when
        const actions = getAllByRole('button', { name: 'Afficher les actions' });

        await click(actions[0]);
        await clickByName('Éditer le numéro étudiant');

        await findByRole('dialog');

        await fillByLabel('Nouveau numéro étudiant', '321');
        await clickByName('Mettre à jour');

        // then
        assert.contains('123');
      });
    });
  });
});
