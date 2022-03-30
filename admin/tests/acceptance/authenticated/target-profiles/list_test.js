import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Target Profiles | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/target-profiles/list');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      const user = server.create('user');
      await createAuthenticateSession({ userId: user.id });
    });

    test('it should be accessible for an authenticated user', async function (assert) {
      // when
      await visit('/target-profiles/list');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/target-profiles/list');
    });

    test('it should list target profiles', async function (assert) {
      // given
      server.createList('target-profile', 12);

      // when
      const screen = await visitScreen('/target-profiles/list');

      // then
      assert.strictEqual(screen.getAllByLabelText('Profil cible').length, 12);
    });

    module('when filters are used', function (hooks) {
      hooks.beforeEach(async () => {
        server.createList('target-profile', 12);
      });

      test('it should display the current filter when target profiles are filtered by name', async function (assert) {
        // when
        await visit('/target-profiles/list?name=sav');

        // then
        assert.dom('input#name').hasValue('sav');
      });

      test('it should display the current filter when target profiles are filtered by id', async function (assert) {
        // when
        await visit('/target-profiles/list?id=123');

        // then
        assert.dom('input#id').hasValue('123');
      });
    });

    test('it should redirect to target profile details on click', async function (assert) {
      // given
      const area = server.create('area', { id: 'area1', title: 'Area 1' });
      const competence = server.create('competence', { id: 'competence1', name: 'Competence 1', areaId: 'area1' });
      const tube = server.create('tube', { id: 'tube1', practicalTitle: 'Tube 1', competenceId: 'competence1' });
      const skill = server.create('skill', { id: 'skill1', name: '@web3', difficulty: 1, tubeId: 'tube1' });

      server.create('target-profile', {
        id: 1,
        name: 'Profil Cible',
        areas: [area],
        competences: [competence],
        tubes: [tube],
        skills: [skill],
      });
      const screen = await visitScreen('/target-profiles/list');

      // when
      await clickByName('Profil Cible');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/target-profiles/1');
      assert.dom(screen.getByText('Competence 1')).exists();
    });

    test('it should redirect to target profile creation form on click "Nouveau profil cible', async function (assert) {
      // given
      server.create('target-profile', { id: 1 });
      await visit('/target-profiles/list');

      // when
      await clickByName('Nouveau profil cible');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/target-profiles/new');
    });
  });
});
