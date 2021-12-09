import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';

import { createUserManagingStudents, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Sup Student List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
      server.create('student', {
        studentNumber: '123',
        firstName: 'toto',
        lastName: 'banana',
        group: 'L2',
        organizationId,
      });

      server.create('student', {
        studentNumber: '321',
        firstName: 'tata',
        lastName: 'banana',
        group: 'L1',
        organizationId,
      });
    });

    module('filters', function () {
      test('it should filter students by group', async function (assert) {
        // given
        const { getByPlaceholderText } = await visit('/etudiants');

        // when

        const select = await getByPlaceholderText('Rechercher par groupe');
        await click(select);
        await clickByName('L1');

        // then
        assert.notContains('toto');
        assert.contains('tata');
      });
    });

    module('And edit the student number', function () {
      test('it should update the student number', async function (assert) {
        // given
        const { getAllByRole } = await visit('/etudiants');

        // when
        const actions = getAllByRole('button', { name: 'Afficher les actions' });

        await click(actions[0]);
        await clickByName('Éditer le numéro étudiant');
        await fillByLabel('Nouveau numéro étudiant', '1234');
        await clickByName('Mettre à jour');

        // then
        assert.contains('1234');
      });

      test('it should not update the student number if exists', async function (assert) {
        // given
        const { getAllByRole } = await visit('/etudiants');

        // when
        const actions = getAllByRole('button', { name: 'Afficher les actions' });

        await click(actions[0]);
        await clickByName('Éditer le numéro étudiant');
        await fillByLabel('Nouveau numéro étudiant', '321');
        await clickByName('Mettre à jour');

        // then
        assert.contains('123');
      });
    });
  });
});
