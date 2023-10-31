import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | Certification Banners | Eligible Complementary Certification Banner',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    module('When there are eligible complementary certifications', function () {
      module('When there is only one eligible complementary certification', function () {
        test(`renders the complementary certification eligibility special message and picture`, async function (assert) {
          // given
          const eligibleComplementaryCertifications = [
            {
              label: 'CléA Numérique',
              imageUrl: 'http://www.image-clea.com',
              isOutdated: false,
              isAcquired: false,
            },
          ];
          this.set('eligibleComplementaryCertifications', eligibleComplementaryCertifications);

          // when
          const screen = await render(
            hbs`<CertificationBanners::EligibleComplementaryCertificationBanner @complementaryCertifications={{this.eligibleComplementaryCertifications}} />`,
          );

          // then
          assert.ok(screen.getByText('Vous êtes également éligible à la certification complémentaire :'));
          assert.ok(screen.getByText('CléA Numérique'));
          assert.ok(screen.getByRole('img', { name: 'CléA Numérique' }));
        });
      });

      module('When there are multiple eligible complementary certifications', function () {
        test(`renders the multiple complementary certification eligibility pluralized message and pictures`, async function (assert) {
          // given
          const eligibleComplementaryCertifications = [
            {
              label: 'CléA Numérique',
              imageUrl: 'http://www.image-clea.com',
              isOutdated: false,
              isAcquired: false,
            },
            {
              label: 'Pix+ Édu 1er degré Confirmé',
              imageUrl: 'http://www.image-clea.com',
              isOutdated: false,
              isAcquired: false,
            },
          ];
          this.set('eligibleComplementaryCertifications', eligibleComplementaryCertifications);

          // when
          const screen = await render(
            hbs`<CertificationBanners::EligibleComplementaryCertificationBanner @complementaryCertifications={{this.eligibleComplementaryCertifications}} />`,
          );

          // then
          assert.ok(screen.getByText('Vous êtes également éligible aux certifications complémentaires :'));
          assert.ok(screen.getByText('CléA Numérique'));
          assert.ok(screen.getByText('Pix+ Édu 1er degré Confirmé'));
          assert.ok(screen.getByRole('img', { name: 'CléA Numérique' }));
          assert.ok(screen.getByRole('img', { name: 'Pix+ Édu 1er degré Confirmé' }));
        });
      });
    });
  },
);
