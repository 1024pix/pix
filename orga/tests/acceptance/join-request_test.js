import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { Response } from 'miragejs';
import { module, test } from 'qunit';

import setupIntl from '../helpers/setup-intl';

module('Acceptance | join-request', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When user submits the join request form', function () {
    module('Error cases', function () {
      test('it should fail if the uai does not belong to any organization', async function (assert) {
        // given
        const screen = await visit('/demande-administration-sco');

        await fillByLabel("UAI/RNE de l'établissement", '1111111A');
        await fillByLabel('Votre prénom', 'firstName');
        await fillByLabel('Votre nom', 'lastName');

        // when
        await clickByName(t('common.actions.confirm'));

        // then
        assert
          .dom(
            screen.getByText("L'UAI/RNE de l'établissement n’est pas reconnu.", {
              exact: false,
            }),
          )
          .exists();
      });

      test('it should fail if the uai does not belong to a SCO organization', async function (assert) {
        // given
        const proOrganization = server.create('organization', { type: 'PRO', externalId: '1234567P' });
        const screen = await visit('/demande-administration-sco');

        await fillByLabel("UAI/RNE de l'établissement", proOrganization.externalId);
        await fillByLabel('Votre prénom', 'firstName');
        await fillByLabel('Votre nom', 'lastName');

        // when
        await clickByName(t('common.actions.confirm'));

        // then
        assert
          .dom(
            screen.getByText("L'UAI/RNE de l'établissement n’est pas reconnu.", {
              exact: false,
            }),
          )
          .exists();
      });

      test('it should fail if the SCO organization does not have an email', async function (assert) {
        // given
        const scoOrganization = server.create('organization', { type: 'SCO', externalId: '1234567S' });
        const screen = await visit('/demande-administration-sco');

        await fillByLabel("UAI/RNE de l'établissement", scoOrganization.externalId);
        await fillByLabel('Votre prénom', 'firstName');
        await fillByLabel('Votre nom', 'lastName');

        // when
        await clickByName(t('common.actions.confirm'));

        // then
        assert
          .dom(
            screen.getByText('Nous n’avons pas d’adresse e-mail de contact associée à votre établissement.', {
              exact: false,
            }),
          )
          .exists();
      });

      test('it should display error message if there is an unknown error', async function (assert) {
        // given
        server.post(
          '/organization-invitations/sco',
          () => new Response(500, {}, { errors: [{ status: '500', title: 'Internal Server Error' }] }),
        );
        const screen = await visit('/demande-administration-sco');

        await fillByLabel("UAI/RNE de l'établissement", '1111111A');
        await fillByLabel('Votre prénom', 'firstName');
        await fillByLabel('Votre nom', 'lastName');

        // when
        await clickByName(t('common.actions.confirm'));

        // then
        assert
          .dom(
            screen.getByText('Une erreur est survenue.', {
              exact: false,
            }),
          )
          .exists();
      });

      test('it should display error message if organization is archived', async function (assert) {
        // given
        // when reject 422 response Ember consider it's an internal error ( reject commit because invalid )
        server.post('/organization-invitations/sco', () => new Response(400, {}, { errors: [{ status: '422' }] }));
        const screen = await visit('/demande-administration-sco');
        await fillByLabel("UAI/RNE de l'établissement", '1111111A');
        await fillByLabel('Votre prénom', 'firstName');
        await fillByLabel('Votre nom', 'lastName');

        // when
        await clickByName(t('common.actions.confirm'));
        // then
        assert
          .dom(
            screen.getByText("L'UAI/RNE de l'établissement n’est pas reconnu.", {
              exact: false,
            }),
          )
          .exists();
      });
    });

    test('it should succeed if there is no errors', async function (assert) {
      // given
      const scoOrganization = server.create('organization', {
        type: 'SCO',
        externalId: '1234567S',
        email: 'sco@example.net',
      });
      const screen = await visit('/demande-administration-sco');

      await fillByLabel("UAI/RNE de l'établissement", scoOrganization.externalId);
      await fillByLabel('Votre prénom', 'firstName');
      await fillByLabel('Votre nom', 'lastName');

      // when
      await clickByName(t('common.actions.confirm'));

      // then
      assert
        .dom(
          screen.getByText(
            "Un e-mail contenant la démarche à suivre a été envoyé à l'adresse e-mail de votre établissement.",
            {
              exact: false,
            },
          ),
        )
        .exists();
    });
  });
});
