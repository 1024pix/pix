import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Shareable certificate | v3-pix-plus-certificate', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('for all pix-plus v3', function () {
    test('it displays results information', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'EDU_1ER_DEGRE',
        level: 'ADMISSIBLE',
      });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

      // then
      assert.dom(screen.getAllByText(t('pages.certificate.valid-status'))[0]).exists();
      assert.dom(screen.getByText(`${t('pages.certificate.candidate')} Jean Doe`)).exists();
      assert.dom(screen.getByText('Université de Lyon')).exists();
      assert.dom(screen.getByText('15/02/2026')).exists();
      assert.dom(screen.getByText('20/02/2026')).exists();
      assert.dom('.certification-result-hexagon').exists();
    });
  });

  module('for an EDU framework', function () {
    module('stepper', function () {
      test('it displays the stepper when candidate is admissible', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
          birthdate: '2000-01-22',
          birthplace: 'Paris',
          firstName: 'Jean',
          lastName: 'Doe',
          certificationDate: new Date('2026-02-15T10:00:00Z'),
          deliveredAt: new Date('2026-02-20T10:00:00Z'),
          certificationCenter: 'Université de Lyon',
          certificationFramework: 'EDU_1ER_DEGRE',
          level: 'ADMISSIBLE',
        });
        this.set('certification', certification);

        // when
        const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

        // then
        assert.dom(screen.getByText(t('pages.certificate.frameworks.EDU.steps.1'))).exists();
      });

      test('it does not display the stepper when candidate is received', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
          birthdate: '2000-01-22',
          birthplace: 'Paris',
          firstName: 'Jean',
          lastName: 'Doe',
          certificationDate: new Date('2026-02-15T10:00:00Z'),
          deliveredAt: new Date('2026-02-20T10:00:00Z'),
          certificationCenter: 'Université de Lyon',
          certificationFramework: 'EDU_1ER_DEGRE',
          level: 'EXPERT',
        });
        this.set('certification', certification);

        // when
        const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

        // then
        assert.dom(screen.queryByText(t('pages.certificate.frameworks.EDU.steps.1'))).doesNotExist();
      });
    });

    test('it displays the results block when the candidate is admissible', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'EDU_1ER_DEGRE',
        level: 'ADMISSIBLE',
      });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

      // then
      assert.dom(screen.getByRole('heading', { level: 3, name: t('pages.certificate.results.title') })).exists();
    });

    test('it does not display the results block when the candidate is not admissible and has no global labels', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'EDU_1ER_DEGRE',
        level: 'EXPERT',
      });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

      // then
      assert
        .dom(screen.queryByRole('heading', { level: 3, name: t('pages.certificate.results.title') }))
        .doesNotExist();
    });

    test('it displays the results block when the candidate is not admissible but has global labels', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'EDU_1ER_DEGRE',
        level: 'EXPERT',
        globalSummaryLabel: 'Summary label',
        globalDescriptionLabel: 'Description label',
      });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

      // then
      assert.dom(screen.getByRole('heading', { level: 3, name: t('pages.certificate.results.title') })).exists();
      assert.dom(screen.getByText('Summary label')).exists();
      assert.dom(screen.getByText('Description label')).exists();
    });

    test('it displays the admissible sub-title when the candidate is admissible', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'EDU_1ER_DEGRE',
        level: 'ADMISSIBLE',
      });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

      // then
      const subTitle = t('pages.certificate.frameworks.EDU.sub-title.admissible.candidate').replace(/ /g, ' ');
      assert
        .dom(screen.getByRole('heading', { level: 2, name: (name) => name.replace(/ /g, ' ').includes(subTitle) }))
        .exists();
    });

    test('it displays the default sub-title when the candidate is not admissible', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'EDU_1ER_DEGRE',
        level: 'EXPERT',
      });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

      // then
      const subTitle = t('pages.certificate.obtained-certification.candidate', {
        globalLevelLabel: t('pages.user-certifications.meshes.EDU_1ER_DEGRE.EXPERT'),
        frameworkLabel: t('pages.certification-frameworks.EDU_1ER_DEGRE'),
      }).replace(/ /g, ' ');
      assert
        .dom(screen.getByRole('heading', { level: 2, name: (name) => name.replace(/ /g, ' ').includes(subTitle) }))
        .exists();
    });

    module('level tag', function () {
      test('it displays the level tag when the level is ADMISSIBLE', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
          birthdate: '2000-01-22',
          birthplace: 'Paris',
          firstName: 'Jean',
          lastName: 'Doe',
          certificationDate: new Date('2026-02-15T10:00:00Z'),
          deliveredAt: new Date('2026-02-20T10:00:00Z'),
          certificationCenter: 'Université de Lyon',
          certificationFramework: 'EDU_1ER_DEGRE',
          level: 'ADMISSIBLE',
        });
        this.set('certification', certification);

        // when
        const screen = await render(hbs`
            <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

        // then
        assert.dom(screen.getByText(t('pages.user-certifications.meshes.EDU_1ER_DEGRE.ADMISSIBLE'))).exists();
      });

      test('it does not display the level tag and displays the badge when the level is not ADMISSIBLE', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
          birthdate: '2000-01-22',
          birthplace: 'Paris',
          firstName: 'Jean',
          lastName: 'Doe',
          certificationDate: new Date('2026-02-15T10:00:00Z'),
          deliveredAt: new Date('2026-02-20T10:00:00Z'),
          certificationCenter: 'Université de Lyon',
          certificationFramework: 'EDU_1ER_DEGRE',
          level: 'EXPERT',
          badgeUrl: 'https://example.com/badge.png',
        });
        this.set('certification', certification);

        // when
        const screen = await render(hbs`
            <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

        // then
        assert.dom(screen.queryByText(t('pages.user-certifications.meshes.EDU_1ER_DEGRE.EXPERT'))).doesNotExist();
        assert.dom('.v3-pix-plus-certificate-score__badge').exists();
        assert.dom('.certification-result-hexagon').doesNotExist();
      });
    });
  });

  module('when context is "user"', function () {
    test('it displays the congratulations title and hides the valid-status tag', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'DROIT',
        level: 'EXPERT',
        badgeUrl: 'https://example.com/badge.png',
      });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} @context="user" />`);

      // then
      assert.dom(screen.getByText(t('pages.certificate.congratulations'))).exists();
      assert.dom(screen.queryByText(t('pages.certificate.valid-status'))).doesNotExist();
    });

    test('it displays the download pdf section', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'DROIT',
        level: 'EXPERT',
        badgeUrl: 'https://example.com/badge.png',
        verificationCode: 'P-ABC123',
      });
      this.set('certification', certification);

      // when
      await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} @context="user" />`);

      // then
      assert.dom('.download-pdf').exists();
    });

    test('it uses the user-targeted obtained-certification subtitle', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'DROIT',
        level: 'EXPERT',
        badgeUrl: 'https://example.com/badge.png',
      });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} @context="user" />`);

      // then
      assert
        .dom(
          screen.getByText(
            t('pages.certificate.obtained-certification.user', {
              globalLevelLabel: t('pages.user-certifications.meshes.DROIT.EXPERT'),
              frameworkLabel: t('pages.certification-frameworks.DROIT'),
            }),
          ),
        )
        .exists();
      assert
        .dom(
          screen.queryByText(
            t('pages.certificate.obtained-certification.candidate', {
              globalLevelLabel: t('pages.user-certifications.meshes.DROIT.EXPERT'),
              frameworkLabel: t('pages.certification-frameworks.DROIT'),
            }),
          ),
        )
        .doesNotExist();
    });

    test('it uses the user-targeted EDU admissible sub-title and results-sub-title when admissible', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'EDU_1ER_DEGRE',
        level: 'ADMISSIBLE',
      });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} @context="user" />`);

      // then
      const userSubTitle = t('pages.certificate.frameworks.EDU.sub-title.admissible.user').replace(/ /g, ' ');
      assert
        .dom(
          screen.getByRole('heading', {
            level: 2,
            name: (name) => name.replace(/ /g, ' ').includes(userSubTitle),
          }),
        )
        .exists();
      assert.dom(screen.getByText('professionnelle de la certification', { exact: false })).exists();
    });
  });

  module('for a non-EDU framework', function () {
    test('it does not display EDU-specific elements and displays the badge', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'DROIT',
        level: 'EXPERT',
        badgeUrl: 'https://example.com/badge.png',
      });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

      // then
      assert.dom(screen.queryByText(t('pages.certificate.frameworks.EDU.steps.1'))).doesNotExist();
      assert
        .dom(screen.queryByRole('heading', { level: 3, name: t('pages.certificate.results.title') }))
        .doesNotExist();
      assert.dom('.v3-pix-plus-certificate-score__badge').exists();
      assert.dom('.certification-result-hexagon').doesNotExist();
    });

    test('it displays the results block when globalSummaryLabel and globalDescriptionLabel are provided', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'DROIT',
        level: 'EXPERT',
        badgeUrl: 'https://example.com/badge.png',
        globalSummaryLabel: 'Summary label',
        globalDescriptionLabel: 'Description label',
      });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

      // then
      assert.dom(screen.getByRole('heading', { level: 3, name: t('pages.certificate.results.title') })).exists();
      assert.dom(screen.getByText('Summary label')).exists();
      assert.dom(screen.getByText('Description label')).exists();
    });

    test('it does not display the results block when only globalSummaryLabel is provided', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'DROIT',
        level: 'EXPERT',
        badgeUrl: 'https://example.com/badge.png',
        globalSummaryLabel: 'Summary label',
      });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

      // then
      assert
        .dom(screen.queryByRole('heading', { level: 3, name: t('pages.certificate.results.title') }))
        .doesNotExist();
    });

    test('it displays the obtained certification sub-title', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Doe',
        certificationDate: new Date('2026-02-15T10:00:00Z'),
        deliveredAt: new Date('2026-02-20T10:00:00Z'),
        certificationCenter: 'Université de Lyon',
        certificationFramework: 'DROIT',
        level: 'EXPERT',
      });
      this.set('certification', certification);

      // when
      const screen = await render(hbs`
          <Certifications::ShareableCertificate::V3PixPlusCertificate @certificate={{this.certification}} />`);

      // then
      assert
        .dom(
          screen.getByText(
            t('pages.certificate.obtained-certification.candidate', {
              globalLevelLabel: t(`pages.user-certifications.meshes.DROIT.EXPERT`),
              frameworkLabel: t('pages.certification-frameworks.DROIT'),
            }),
          ),
        )
        .exists();
    });
  });
});
