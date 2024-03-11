import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import { getTableData } from '../helpers/get-table-data';

module('Acceptance | User certification detail page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  hooks.beforeEach(function () {
    user = server.create('user', 'withSomeCertificates');
  });

  module('Access to the user certification detail page', function () {
    test('should not be accessible when user is not connected', async function (assert) {
      // when
      await visit('/mes-certifications/1');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });

    test('should be accessible when user is connected', async function (assert) {
      // given
      await authenticate(user);
      const area = server.create('area', 'withCompetences');

      const competence = this.server.schema.competences.findBy({ areaId: area.id });
      const resultCompetenceTree = server.create('resultCompetenceTree', {
        areas: [area],
      });

      const resultCompetence = server.create('result-competence', {
        id: competence.id,
        index: 1.1,
        level: 6,
        name: competence.name,
        score: 70,
      });
      area.update({ resultCompetences: [resultCompetence] });

      const validatedCertificate = server.create('certification', {
        firstName: user.firstName,
        lastName: user.lastName,
        birthdate: '2000-01-01',
        certificationCenter: 'Université de Pix',
        commentForCandidate: 'Ceci est un commentaire jury à destination du candidat.',
        certifiedBadgeImages: [],
        date: new Date('2018-07-20T14:33:56Z'),
        status: 'validated',
        pixScore: '777',
        isPublished: true,
        user,
        resultCompetenceTree,
      });

      // when
      const screen = await visit(`/mes-certifications/${validatedCertificate.id}`);

      const table = screen.getByRole('table');

      const tableData = await getTableData(table);

      // then
      assert.strictEqual(currentURL(), `/mes-certifications/${validatedCertificate.id}`);
      assert.deepEqual(tableData, [
        {
          'MON SUPER DOMAINE': 'Ma superbe compétence',
          NIVEAU: '6',
        },
      ]);
    });
  });
});
