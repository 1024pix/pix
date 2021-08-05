import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import fillInByLabel from '../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';

import {
  createUserManagingStudents,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Sup Student List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When admin', function(hooks) {
    hooks.beforeEach(async function() {
      user = createUserManagingStudents('ADMIN', 'SUP');
      createPrescriberByUser(user);

      await authenticateSession(user.id);
    });

    module('And edit the student number', function(hooks) {
      hooks.beforeEach(() => {
        const { organizationId } = user.memberships.models.firstObject;
        server.create('student', {
          studentNumber: '123',
          firstName: 'toto',
          lastName: 'banana',
          organizationId,
        });
        server.create('student', {
          studentNumber: '321',
          firstName: 'toto',
          lastName: 'banana',
          organizationId,
        });
      });

      test('it should update the student number', async function(assert) {
        // given
        await visit('/etudiants');

        // when
        await clickByLabel('Afficher les actions');
        await clickByLabel('Éditer le numéro étudiant');
        await fillInByLabel('Nouveau numéro étudiant', '1234');
        await clickByLabel('Mettre à jour');

        // then
        assert.contains('1234');
      });

      test('it should not update the student number if exists', async function(assert) {
        // given
        await visit('/etudiants');

        // when
        await clickByLabel('Afficher les actions');
        await clickByLabel('Éditer le numéro étudiant');
        await fillInByLabel('Nouveau numéro étudiant', '321');
        await clickByLabel('Mettre à jour');

        // then
        assert.contains('123');
      });
    });
  });
});
