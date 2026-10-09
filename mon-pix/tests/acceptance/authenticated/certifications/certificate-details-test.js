import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../../../helpers/authentication';

module('Acceptance | Authenticated | Certifications | Certificate Details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  hooks.beforeEach(function () {
    user = server.create('user', 'withSomeCertificates');
  });

  module('when user is not connected', function () {
    test('should the candidate certificate page not be accessible', async function (assert) {
      // when
      await visit('/certifications/certificat/1');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('when user is connected', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticate(user);
    });

    module('when algorithm version is v3', function () {
      test('displays v3 candidate certificate page', async function (assert) {
        // given
        const certificate = _getV3Certificate({ user, server });

        // when
        const screen = await visit(`/certifications/certificat/${certificate.id}`);

        // then
        assert.dom(screen.getByRole('heading', { name: t('pages.certificate.title') })).exists();
        const globalLevelLabels = screen.getAllByText('Expert 1');
        assert.strictEqual(globalLevelLabels.length, 2);
      });

      module('when user clicks on the breadcrumb', function () {
        test('should returns to certificates list page', async function (assert) {
          // given
          const certificate = _getV3Certificate({ user, server });
          const screen = await visit(`/certifications/certificat/${certificate.id}`);

          // when
          await click(screen.getByRole('link', { name: t('pages.certifications-list.title') }));

          // then
          assert.strictEqual(currentURL(), '/certifications');
        });
      });
    });

    module('when algorithm version is v3 and framework is Pix Plus', function () {
      test('displays v3 pix plus candidate certificate page', async function (assert) {
        // given
        const certificate = _getV3Certificate({ user, server, certificationFramework: 'EDU_1ER_DEGRE' });

        // when
        const screen = await visit(`/certifications/certificat/${certificate.id}`);

        // then
        assert
          .dom(screen.getByRole('heading', { level: 1, name: t('pages.certificate.framework-title.EDU_1ER_DEGRE') }))
          .exists();
      });
    });

    module('when algorithm version is v2', function () {
      test('displays v2 candidate certificate page', async function (assert) {
        // given
        const certificate = _getV2Certificate({ user, server });

        // when
        const screen = await visit(`/certifications/certificat/${certificate.id}`);

        // then
        assert.dom(screen.getByRole('link', { name: t('pages.certificate.back-link') })).exists();
        assert.dom(screen.getByRole('heading', { level: 1, name: t('pages.certificate.title') })).exists();
        assert.dom(screen.getByRole('heading', { level: 2, name: t('pages.certificate.jury-title') })).exists();
        assert.dom(screen.getByRole('heading', { name: t('pages.certificate.details.competences.title') })).exists();
      });
    });
  });
});

function _getV2Certificate({ user, server }) {
  const certificate = server.create('certification', {
    firstName: user.firstName,
    lastName: user.lastName,
    birthdate: '2000-01-01',
    certificationCenter: 'Université de Pix',
    commentForCandidate: 'Ceci est un commentaire jury à destination du candidat.',
    certifiedBadgeImages: [],
    date: new Date('2018-07-20T14:33:56Z'),
    status: 'validated',
    pixScore: 777,
    isPublished: true,
    algorithmEngineVersion: 2,
    user,
    resultCompetenceTree: _getResultCompetenceTree({ server }),
  });
  server.create('certificate-summary', {
    id: certificate.id,
    certificationCenterName: 'Université de Pix',
    certificationStartedAt: new Date('2018-07-20T14:33:56Z'),
    status: 'VALIDATED',
    pixScore: 777,
  });
  return certificate;
}

function _getV3Certificate({ user, server, certificationFramework = 'CORE' }) {
  const certificate = server.create('certification', {
    firstName: user.firstName,
    lastName: user.lastName,
    birthdate: '2000-01-01',
    certificationCenter: 'Université de Pix',
    certificationDate: new Date('2018-07-20T14:33:56Z'),
    status: 'validated',
    algorithmEngineVersion: 3,
    certificationFramework,
    pixScore: 777,
    isPublished: true,
    globalLevelLabel: 'Expert 1',
    globalDescriptionLabel: 'Vous êtes capable de tout.',
    globalSummaryLabel: 'Expert de tous les domaines, Pix vous dit bravo !',
    level: '7',
    resultCompetenceTree: _getResultCompetenceTree({ server }),
  });
  server.create('certificate-summary', {
    id: certificate.id,
    certificationCenterName: 'Université de Pix',
    certificationStartedAt: new Date('2018-07-20T14:33:56Z'),
    certificationFramework,
    status: 'VALIDATED',
    pixScore: 777,
  });
  return certificate;
}

function _getResultCompetenceTree({ server }) {
  const area = server.create('area', 'withCompetences');
  const competence = server.schema.competences.findBy({ areaId: area.id });
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

  return resultCompetenceTree;
}
