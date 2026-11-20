import { render } from '@1024pix/ember-testing-library';
import V3Certificate from 'mon-pix/components/certifications/shareable-certificate/v3-certificate';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Shareable certificate | v3-certificate', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the global level label is pre-beginner', function () {
    test('it displays certificate information without resultCompetenceTree', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        certificationDate: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: new Date('2018-02-17T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        pixScore: 31,
        maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
        certificationFramework: 'CORE',
      });

      // when
      const screen = await render(<template><V3Certificate @certificate={{certification}} /></template>);

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            level: 2,
            name: t('pages.certificate.global.progress-bar-explanation.shareable-progress-bar-title'),
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('progressbar', {
            name: t('pages.certificate.global.progress-bar-explanation.pre-beginner-level'),
          }),
        )
        .exists();
      assert
        .dom(screen.queryByRole('heading', { level: 3, name: t('pages.certificate.results.title') }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('heading', { name: t('pages.certificate.details.competences.shareable-title') }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('tablist', { name: t('pages.certificate.details.competences.shareable-title') }))
        .doesNotExist();
    });
  });

  module('when the global level label is not pre-beginner', function () {
    test('it displays certificate information with resultCompetenceTree', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        certificationDate: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: new Date('2018-02-17T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        pixScore: 654,
        resultCompetenceTree: store.createRecord('result-competence-tree'),
        maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
        globalLevelLabel: 'Expert 1',
        globalDescriptionLabel: 'Vous êtes capable de tout.',
        globalSummaryLabel: 'Expert de tous les domaines, Pix vous dit bravo !',
        certificationFramework: 'CORE',
      });

      // when
      const screen = await render(<template><V3Certificate @certificate={{certification}} /></template>);

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            level: 2,
            name: `${t('pages.certificate.valid-status')} ${t('pages.certificate.obtained-certification.shareable-core')}`,
          }),
        )
        .exists();
      assert.dom(screen.getByText(certification.pixScore)).exists();
      assert.dom(screen.getByText(`${t('pages.certificate.candidate')} Jean Bon`)).exists();
      const globalLevelLabels = screen.getAllByText(certification.globalLevelLabel);
      assert.strictEqual(globalLevelLabels.length, 2);
      assert
        .dom(
          screen.getByRole('heading', {
            level: 2,
            name: t('pages.certificate.global.progress-bar-explanation.shareable-progress-bar-title'),
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('heading', {
            level: 3,
            name: `${t('pages.certificate.results.title')} ${certification.globalLevelLabel}`,
          }),
        )
        .exists();
      assert.dom(screen.getByText(certification.globalSummaryLabel)).exists();
      assert.dom(screen.getByText(certification.globalDescriptionLabel)).exists();
      assert
        .dom(screen.getByRole('heading', { name: t('pages.certificate.details.competences.shareable-title') }))
        .exists();
    });
  });

  module('when the certification framework is Pix Plus EDU', function () {
    test('it displays the Pix Plus certificate component', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        certificationDate: new Date('2024-06-15T10:00:00Z'),
        deliveredAt: new Date('2024-06-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'EDU_1ER_DEGRE',
      });

      // when
      const screen = await render(<template><V3Certificate @certificate={{certification}} /></template>);

      // then
      assert.dom(screen.getAllByText(t('pages.certificate.frameworks.EDU.status'))[0]).exists();
      assert
        .dom(screen.queryByRole('heading', { name: t('pages.certificate.details.competences.shareable-title') }))
        .doesNotExist();
    });
  });

  module('when the candidate acquired a complementary certification (clea only)', function () {
    test('it displays complementary certification information', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        certificationDate: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: new Date('2018-02-17T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        pixScore: 31,
        maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
        acquiredComplementaryCertification: 'http://example.com/clea.svg',
        certificationFramework: 'CORE',
      });

      // when
      const screen = await render(<template><V3Certificate @certificate={{certification}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { level: 2, name: t('pages.certificate.complementary.title') })).exists();
      assert.dom(screen.getByText(t('pages.certificate.complementary.clea'))).exists();
      assert
        .dom(screen.getByRole('img', { name: t('pages.certificate.complementary.alternative') }))
        .hasAttribute('src', 'http://example.com/clea.svg');
    });
  });
});
