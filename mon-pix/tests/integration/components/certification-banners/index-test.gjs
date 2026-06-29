import { render } from '@1024pix/ember-testing-library';
import CertificationBanners from 'mon-pix/components/certification-banners';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Certification Banners | index.js', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there is eligible double certification', function () {
    test(`should render the complementary certification eligibility special message and picture`, async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationEligibility = store.createRecord('is-certifiable', {
        doubleCertificationEligibility: {
          label: 'CléA Numérique',
          imageUrl: 'http://www.image-clea.com',
          isBadgeValid: true,
          validatedDoubleCertification: false,
        },
      });
      const fullName = 'Fifi Brindacier';
      const closeBanner = () => {};

      // when
      const screen = await render(
        <template>
          <CertificationBanners
            @certificationEligibility={{certificationEligibility}}
            @fullName={{fullName}}
            @closeBanner={{closeBanner}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByText('Vous êtes également éligible à la certification complémentaire :'));
      assert.ok(screen.getByText('CléA Numérique'));
      assert.ok(screen.getByRole('img', { name: 'CléA Numérique' }));
    });
  });

  module('when there is an outdated double certification', function () {
    module('when the outdated complementary certification is acquired', function () {
      test(`should not render the outdated complementary certification eligibility special message and picture`, async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certificationEligibility = store.createRecord('is-certifiable', {
          doubleCertificationEligibility: {
            label: 'CléA Numérique',
            imageUrl: 'http://www.image-clea.com',
            isBadgeValid: false,
            validatedDoubleCertification: true,
          },
        });
        const fullName = 'Fifi Brindacier';
        const closeBanner = () => {};

        // when
        const screen = await render(
          <template>
            <CertificationBanners
              @certificationEligibility={{certificationEligibility}}
              @fullName={{fullName}}
              @closeBanner={{closeBanner}}
            />
          </template>,
        );

        // then
        assert.dom(screen.queryByRole('img', { name: 'CléA Numérique' })).doesNotExist();
        assert
          .dom(screen.queryByText("Vous n'êtes plus éligible à la certification CléA Numérique suite à son évolution."))
          .doesNotExist();
        assert
          .dom(
            screen.queryByText(
              "Recontactez votre établissement ou l’organisation vous ayant proposé le parcours afin de repasser une campagne et ainsi redevenir éligible. Votre progression a été conservée et vous n'aurez qu'à jouer les nouvelles épreuves, cela devrait être rapide.",
            ),
          )
          .doesNotExist();
      });
    });
    module('when the outdated complementary certification is not acquired', function () {
      test(`should render the outdated complementary certification eligibility special message and picture`, async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certificationEligibility = store.createRecord('is-certifiable', {
          doubleCertificationEligibility: {
            label: 'CléA Numérique',
            imageUrl: 'http://www.image-clea.com',
            isBadgeValid: false,
            validatedDoubleCertification: false,
          },
        });
        const fullName = 'Fifi Brindacier';
        const closeBanner = () => {};

        // when
        const screen = await render(
          <template>
            <CertificationBanners
              @certificationEligibility={{certificationEligibility}}
              @fullName={{fullName}}
              @closeBanner={{closeBanner}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByRole('img', { name: 'CléA Numérique' })).exists();
        assert
          .dom(screen.getByText("Vous n'êtes plus éligible à la certification CléA Numérique suite à son évolution."))
          .exists();
        assert
          .dom(
            screen.getByText(
              "Recontactez votre établissement ou l’organisation vous ayant proposé le parcours afin de repasser une campagne et ainsi redevenir éligible. Votre progression a été conservée et vous n'aurez qu'à jouer les nouvelles épreuves, cela devrait être rapide.",
            ),
          )
          .exists();
      });
    });
  });
});
