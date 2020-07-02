import { module, test } from 'qunit';
import { visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import Response from 'ember-cli-mirage/response';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | join-request', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await visit('/demande-administration-sco');
  });

  module('When user submits the join request form', function() {

    test('it should fail if the uai does not belong to any organization', async function(assert) {
      // given
      await fillIn('#uai', '1111111A');
      await fillIn('#firstName', 'firstName');
      await fillIn('#lastName', 'lastName');

      // when
      await click('button.join-request-form__button');

      // then
      assert.contains('L\'UAI/RNE de l\'établissement n’est pas reconnu. Merci de contacter le support.');
    });

    test('it should fail if the uai does not belong to a SCO organization', async function(assert) {
      // given
      const proOrganization = server.create('organization', { type: 'PRO', externalId: '1234567P' });

      await fillIn('#uai', proOrganization.externalId);
      await fillIn('#firstName', 'firstName');
      await fillIn('#lastName', 'lastName');

      // when
      await click('button.join-request-form__button');

      // then
      assert.contains('L\'UAI/RNE de l\'établissement n’est pas reconnu. Merci de contacter le support.');
    });

    test('it should fail if the SCO organization does not have an email', async function(assert) {
      // given
      const scoOrganization = server.create('organization', { type: 'SCO', externalId: '1234567S' });

      await fillIn('#uai', scoOrganization.externalId);
      await fillIn('#firstName', 'firstName');
      await fillIn('#lastName', 'lastName');

      // when
      await click('button.join-request-form__button');

      // then
      assert.contains('Nous n’avons pas d’adresse e-mail de contact associée à votre établissement, merci de contacter le support pour récupérer votre accès.');
    });

    test('it should display error message if there is an unknown error', async function(assert) {
      // given
      server.post('/organization-invitations/sco', () => new Response(500, {}, { errors: [{ status: '500', title: 'Internal Server Error' }] }));

      await fillIn('#uai', '1111111A');
      await fillIn('#firstName', 'firstName');
      await fillIn('#lastName', 'lastName');

      // when
      await click('button.join-request-form__button');

      // then
      assert.contains('Une erreur est survenue. Merci de contacter le support.');
    });

    test('it should succeed if there is no errors', async function(assert) {
      // given
      const scoOrganization = server.create('organization', { type: 'SCO', externalId: '1234567S', email: 'sco@example.net' });

      await fillIn('#uai', scoOrganization.externalId);
      await fillIn('#firstName', 'firstName');
      await fillIn('#lastName', 'lastName');

      // when
      await click('button.join-request-form__button');

      // then
      assert.dom('.join-request__success').exists();
    });
  });
});
