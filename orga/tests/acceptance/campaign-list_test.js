import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When prescriber is not logged in', function () {
    test('it should not be accessible by an unauthenticated prescriber', async function (assert) {
      // when
      await visit('/campagnes');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function (hooks) {
    let user;

    hooks.beforeEach(async () => {
      user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession(user.id);
    });

    test('it should be accessible for an authenticated prescriber', async function (assert) {
      // when
      await visit('/campagnes');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/campagnes');
    });

    test('it should show title indicate than prescriber can create a campaign', async function (assert) {
      // when
      await visit('/campagnes');

      // then
      assert.dom('.page-title').hasText('Créez votre première campagne');
    });

    test('it should list the campaigns of the current organization', async function (assert) {
      // given
      server.createList('campaign', 12);

      // when
      await visit('/campagnes');

      // then
      assert.dom('.campaign-list .table tbody tr').exists({ count: 12 });
    });

    test('it should redirect to campaign details on click', async function (assert) {
      // given
      server.create('campaign', { id: 1, name: 'CampagneEtPrairie' });
      await visit('/campagnes');

      // when
      await clickByName('CampagneEtPrairie');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/campagnes/1');
    });

    module('When using owner filter', function () {
      test('it should update URL with owner first name filter', async function (assert) {
        // given
        const owner = server.create('user', { firstName: 'Harry', lastName: 'Cojaune' });
        server.create('campaign', { ownerFirstName: owner.firstName, ownerLastName: owner.lastName });
        await visit('/campagnes');

        // when
        await fillByLabel('Rechercher un créateur', owner.firstName);

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), `/campagnes?ownerName=${owner.firstName}`);
      });

      test('it should remove owner filter in URL', async function (assert) {
        // given
        const owner = server.create('user', { firstName: 'Harry', lastName: 'Jaune' });
        server.create('campaign', { ownerFirstName: owner.firstName, ownerLastName: owner.lastName });
        await visit(`/campagnes?ownerName=${owner.firstName}`);

        // when
        await fillByLabel('Rechercher un créateur', '');

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), '/campagnes');
      });

      test('it should filter campaigns by owner first name or last name', async function (assert) {
        // given
        const owner = server.create('user', { firstName: 'Harry', lastName: 'Gole' });
        const otherowner = server.create('user', { firstName: 'Sara', lastName: 'Conte' });
        server.create('campaign', {
          name: 'ma super campagne',
          ownerFirstName: owner.firstName,
          ownerLastName: owner.lastName,
        });
        server.create('campaign', {
          name: 'la campagne de Sara',
          ownerFirstName: otherowner.firstName,
          ownerLastName: otherowner.lastName,
        });
        await visit('/campagnes');

        // when
        await fillByLabel('Rechercher un créateur', owner.firstName);

        // then
        assert.contains('ma super campagne');
        assert.notContains('la campagne de Sara');
      });
    });

    module('When using campaign filter', function () {
      test('it should filter campaigns by campaign name', async function (assert) {
        // given
        server.create('campaign', {
          name: 'ma super campagne',
        });
        server.create('campaign', {
          name: 'la campagne de Sara',
        });
        await visit('/campagnes');

        // when
        await fillByLabel('Rechercher une campagne', 'Sara');

        // then
        assert.contains('la campagne de Sara');
        assert.notContains('ma super campagne');
      });

      test('it should update URL with campaign name filter', async function (assert) {
        // given
        const campaignName = 'CampagneV2';
        server.create('campaign', { name: campaignName });
        await visit('/campagnes');

        // when
        await fillByLabel('Rechercher une campagne', campaignName);

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), `/campagnes?name=${campaignName}`);
      });
    });

    module('When using campaign and owner filters', function () {
      test('it should filter campaigns', async function (assert) {
        // given
        const owner = server.create('user', { firstName: 'Harry', lastName: 'Gole' });
        const otherowner = server.create('user', { firstName: 'Sara', lastName: 'Conte' });
        server.create('campaign', {
          name: 'ma super campagne',
          ownerFirstName: owner.firstName,
          ownerLastName: owner.lastName,
        });
        server.create('campaign', {
          name: 'Evaluation',
          ownerFirstName: owner.firstName,
          ownerLastName: owner.lastName,
        });
        server.create('campaign', {
          name: 'la campagne de Sara',
          ownerFirstName: otherowner.firstName,
          ownerLastName: otherowner.lastName,
        });
        await visit('/campagnes');

        // when
        await fillByLabel('Rechercher un créateur', 'Harry');
        await fillByLabel('Rechercher une campagne', 'campagne');

        // then
        assert.contains('ma super campagne');
        assert.notContains('Evaluation');
        assert.notContains('la campagne de Sara');
      });
    });
  });
});
