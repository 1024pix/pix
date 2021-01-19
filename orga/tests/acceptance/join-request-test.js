import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import fillInByLabel from '../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
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
      await fillInByLabel('UAI/RNE de l\'établissement', '1111111A');
      await fillInByLabel('Votre prénom', 'firstName');
      await fillInByLabel('Votre nom', 'lastName');

      // when
      await clickByLabel('Envoyer');

      // then
      assert.contains('L\'UAI/RNE de l\'établissement n’est pas reconnu. Merci de contacter le support.');
    });

    test('it should fail if the uai does not belong to a SCO organization', async function(assert) {
      // given
      const proOrganization = server.create('organization', { type: 'PRO', externalId: '1234567P' });

      await fillInByLabel('UAI/RNE de l\'établissement', proOrganization.externalId);
      await fillInByLabel('Votre prénom', 'firstName');
      await fillInByLabel('Votre nom', 'lastName');

      // when
      await clickByLabel('Envoyer');

      // then
      assert.contains('L\'UAI/RNE de l\'établissement n’est pas reconnu. Merci de contacter le support.');
    });

    test('it should fail if the SCO organization does not have an email', async function(assert) {
      // given
      const scoOrganization = server.create('organization', { type: 'SCO', externalId: '1234567S' });

      await fillInByLabel('UAI/RNE de l\'établissement', scoOrganization.externalId);
      await fillInByLabel('Votre prénom', 'firstName');
      await fillInByLabel('Votre nom', 'lastName');

      // when
      await clickByLabel('Envoyer');

      // then
      assert.contains('Nous n’avons pas d’adresse e-mail de contact associée à votre établissement, merci de contacter le support pour récupérer votre accès.');
    });

    test('it should display error message if there is an unknown error', async function(assert) {
      // given
      server.post('/organization-invitations/sco', () => new Response(500, {}, { errors: [{ status: '500', title: 'Internal Server Error' }] }));

      await fillInByLabel('UAI/RNE de l\'établissement', '1111111A');
      await fillInByLabel('Votre prénom', 'firstName');
      await fillInByLabel('Votre nom', 'lastName');

      // when
      await clickByLabel('Envoyer');

      // then
      assert.contains('Une erreur est survenue. Merci de contacter le support.');
    });

    test('it should succeed if there is no errors', async function(assert) {
      // given
      const scoOrganization = server.create('organization', { type: 'SCO', externalId: '1234567S', email: 'sco@example.net' });

      await fillInByLabel('UAI/RNE de l\'établissement', scoOrganization.externalId);
      await fillInByLabel('Votre prénom', 'firstName');
      await fillInByLabel('Votre nom', 'lastName');

      // when
      await clickByLabel('Envoyer');

      // then
      assert.dom('.join-request__success').exists();
    });
  });
});
