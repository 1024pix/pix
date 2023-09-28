import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Certification Banners | Congratulations Certification Banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When there are eligible complementary certifications', function () {
    test(`renders the complementary certification eligibility special message and picture`, async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationEligibility = store.createRecord('is-certifiable', {
        complementaryCertifications: [
          {
            label: 'CléA Numérique',
            imageUrl: 'http://www.image-clea.com',
            isOutdated: false,
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
      assert.ok(screen.getByText('Vous êtes également éligible à la certification complémentaire :'));
      assert.ok(screen.getByText('CléA Numérique'));
      assert.ok(screen.getByRole('img', { name: 'CléA Numérique' }));
    });
  });

  module('When there are outdated complementary certifications', function () {
    test(`renders the outdated complementary certification eligibility special message and picture`, async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationEligibility = store.createRecord('is-certifiable', {
        complementaryCertifications: [
          {
            label: 'CléA Numérique',
            imageUrl: 'http://www.image-clea.com',
            isOutdated: true,
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
          screen.getAllByText(
            "Recontactez votre établissement ou l’organisation vous ayant proposé le parcours afin de repasser une campagne et ainsi redevenir éligible. Votre progression a été conservée et vous n'aurez qu'à jouer les nouvelles épreuves, cela devrait être rapide.",
          )[0],
        )
        .exists();
    });
  });
});
