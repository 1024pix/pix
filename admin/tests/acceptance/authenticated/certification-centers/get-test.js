import moment from 'moment';

import { module, test } from 'qunit';
import {
  click,
  currentURL,
  fillIn,
  findAll,
  triggerEvent,
  visit,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import { createAuthenticateSession } from '../../../helpers/test-init';

module('Acceptance | authenticated/certification-centers/get', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  const certificationCenterData = {
    name: 'Center 1',
    externalId: 'ABCDEF',
    type: 'SCO',
  };

  let certificationCenter;
  let certificationCenterMembership1;
  let currentUser;

  hooks.beforeEach(async function() {
    currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

    certificationCenter = server.create('certification-center', certificationCenterData);

    certificationCenterMembership1 = server.create('certification-center-membership', {
      createdAt: new Date('2018-02-15T05:06:07Z'),
      certificationCenter,
      user: server.create('user'),
    });
    server.create('certification-center-membership', {
      createdAt: new Date('2019-02-15T05:06:07Z'),
      certificationCenter,
      user: server.create('user'),
    });
  });

  test('should access Certification center page by URL /certification-centers/:id', async function(assert) {
    // when
    await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.equal(currentURL(), '/certification-centers/1');
  });

  test('should display Certification center detail', async function(assert) {
    // when
    await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.contains(certificationCenter.name);
    assert.contains(certificationCenter.externalId);
    assert.contains(certificationCenter.type);
  });

  test('should display Certification center memberships', async function(assert) {
    // given
    const expectedDate1 = moment(certificationCenterMembership1.createdAt).format('DD-MM-YYYY - HH:mm:ss');

    // when
    await visit(`/certification-centers/${certificationCenter.id}`);

    // then
    assert.dom('[aria-label="Membre"]').exists({ count: 2 });

    assert.dom('[aria-label="Membre"]:first-child td:nth-child(2)')
      .hasText(certificationCenterMembership1.user.id);

    assert.contains(certificationCenterMembership1.user.firstName);
    assert.contains(certificationCenterMembership1.user.lastName);
    assert.contains(certificationCenterMembership1.user.email);
    assert.contains(expectedDate1);
  });

  module('To add certification center membership', function() {

    test('should display elements to add certification center membership', async function(assert) {
      // when
      await visit(`/certification-centers/${certificationCenter.id}`);

      // then
      assert.contains('Ajouter un membre');
      assert.dom('[placeholder="Adresse e-mail"]').exists();
      assert.dom('button').hasText('Valider');
      assert.dom('.error').notExists;
    });

    test('should disable button if email is empty or contains only spaces', async function(assert) {
      // given
      const spacesEmail = ' ';
      await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await fillIn('#userEmailToAdd', spacesEmail);
      await triggerEvent('#userEmailToAdd', 'focusout');

      // then
      assert.dom('button[data-test-add-membership]')
        .hasAttribute('disabled');
    });

    test('should display error message and disable button if email is invalid', async function(assert) {
      // given
      await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await fillIn('#userEmailToAdd', 'an invalid email');
      await triggerEvent('#userEmailToAdd', 'focusout');

      // then
      assert.contains('L\'adresse e-mail saisie n\'est pas valide.');
      assert.dom('button[data-test-add-membership]')
        .hasAttribute('disabled');
    });

    test('should enable button and not display error message if email is valid', async function(assert) {
      // given
      await visit(`/certification-centers/${certificationCenter.id}`);

      // when
      await fillIn('#userEmailToAdd', 'test@example.net');
      await triggerEvent('#userEmailToAdd', 'focusout');

      // then
      assert.dom('button[data-test-add-membership]')
        .hasNoAttribute('disabled');
      assert.dom('.error').notExists;
    });

    test('should display new certification-center-membership', async function(assert) {
      // given
      const email = 'test@example.net';
      await visit(`/certification-centers/${certificationCenter.id}`);
      await fillIn('#userEmailToAdd', email);
      await triggerEvent('#userEmailToAdd', 'focusout');

      // when
      await click('button[data-test-add-membership]');

      // then
      const foundElement = findAll('td[data-test-user-email]')
        .find((element) => element.innerText.includes(email));
      assert.ok(foundElement);
    });
  });

});
