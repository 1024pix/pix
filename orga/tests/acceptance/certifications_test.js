import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createUserManagingStudents, createPrescriberByUser } from '../helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import sinon from 'sinon';

module('Acceptance | Certifications page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserManagingStudents('ADMIN');
    createPrescriberByUser(user);

    await authenticateSession(user.id);
  });

  module('When user arrives on certifications page', function (hooks) {
    let dayjs;
    hooks.afterEach(function () {
      sinon.restore();
    });

    test('should display certification banner when it is time to', async function (assert) {
      dayjs = this.owner.lookup('service:dayjs');
      sinon.stub(dayjs.self.prototype, 'format').returns('04');

      // given / when
      await visit('/certifications');

      // then
      assert.dom('.pix-banner').exists();
    });

    test('should not show any banner outside certification period', async function (assert) {
      dayjs = this.owner.lookup('service:dayjs');
      sinon.stub(dayjs.self.prototype, 'format').returns('10');

      // given / when
      await visit('/certifications');

      // then
      assert.dom('.pix-banner').doesNotExist();
    });

    module('When organizations has no students imported yet', function () {
      test('should show warning message inviting user to import students on Certifications page', async function (assert) {
        // given / when
        await visit('/certifications');

        // then
        assert
          .dom('.certifications-page__text')
          .containsText(
            'Dans cet onglet, vous retrouverez les résultats et les attestations de certification des élèves. Vous devez, dans un premier temps, importer la base élèves de votre établissement.'
          );
      });
    });

    module('When organizations has imported students', function (hooks) {
      hooks.beforeEach(async () => {
        const division = server.create('division', {
          name: '3eme',
        });
        const organization = server.schema.organizations.all().models[0];
        organization.update({ divisions: [division] });
      });

      test('should show Certifications page', async function (assert) {
        // given / when
        await visit('/certifications');

        // then
        assert
          .dom('.certifications-page__text')
          .containsText(
            'Sélectionnez la classe pour laquelle vous souhaitez exporter les résultats de certification (.csv) ou télécharger les attestations (.pdf). Vous pouvez filtrer cette liste en renseignant le nom de la classe directement dans le champ.'
          );
        assert.contains('Exporter les résultats');
        assert.contains('Certifications');
        assert.contains('Classe');
      });

      test('should show documentation about certification results link', async function (assert) {
        // given / when
        await visit('/certifications');

        // then
        assert.dom('a[href="https://cloud.pix.fr/s/cRaeKT4ErrXs4X8"]').exists();
      });

      test('should display attestation download button', async function (assert) {
        // when
        await visit('/certifications');

        // then
        assert.dom('button[id="download_attestations"]').exists();
      });
    });
  });
});
