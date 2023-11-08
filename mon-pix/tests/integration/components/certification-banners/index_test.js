import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Certification Banners | index.js', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there are eligible complementary certifications', function () {
    test(`should render the complementary certification eligibility special message and picture`, async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationEligibility = store.createRecord('is-certifiable', {
        complementaryCertifications: [
          {
            label: 'CléA Numérique',
            imageUrl: 'http://www.image-clea.com',
            isOutdated: false,
            isAcquired: false,
          },
          {
            label: 'Pix+ Droit',
            imageUrl: 'http://www.image-droit.com',
            isOutdated: false,
            isAcquired: true,
          },
        ],
      });
      this.set('certificationEligibility', certificationEligibility);
      this.set('fullName', 'Fifi Brindacier');
      this.set('closeBanner', () => {});

      // when
      const screen = await render(
        hbs`<CertificationBanners @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}} @closeBanner={{this.closeBanner}}/>`,
      );

      // then
      assert.ok(screen.getByText('Vous êtes également éligible aux certifications complémentaires :'));
      assert.ok(screen.getByText('CléA Numérique'));
      assert.ok(screen.getByRole('img', { name: 'CléA Numérique' }));
      assert.ok(screen.getByText('Pix+ Droit'));
      assert.ok(screen.getByRole('img', { name: 'Pix+ Droit' }));
    });
  });

  module('when there is an outdated complementary certification', function () {
    module('when the outdated complementary certification is acquired', function () {
      test(`should not render the outdated complementary certification eligibility special message and picture`, async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certificationEligibility = store.createRecord('is-certifiable', {
          complementaryCertifications: [
            {
              label: 'CléA Numérique',
              imageUrl: 'http://www.image-clea.com',
              isOutdated: true,
              isAcquired: true,
            },
          ],
        });
        this.set('certificationEligibility', certificationEligibility);
        this.set('fullName', 'Fifi Brindacier');
        this.set('closeBanner', () => {});

        // when
        const screen = await render(
          hbs`<CertificationBanners @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}} @closeBanner={{this.closeBanner}}/>`,
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
          complementaryCertifications: [
            {
              label: 'CléA Numérique',
              imageUrl: 'http://www.image-clea.com',
              isOutdated: true,
              isAcquired: false,
            },
          ],
        });
        this.set('certificationEligibility', certificationEligibility);
        this.set('fullName', 'Fifi Brindacier');
        this.set('closeBanner', () => {});

        // when
        const screen = await render(
          hbs`<CertificationBanners @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}} @closeBanner={{this.closeBanner}}/>`,
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
