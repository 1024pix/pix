import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | Certification Banners | Outdated Complementary Certification Banner',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    module('When there are outdated complementary certifications', function () {
      test(`renders the outdated complementary certification`, async function (assert) {
        // given
        const outdatedAndNotAcquiredComplementaryCertifications = [
          { label: 'CléA Numérique', imageUrl: 'http://www.image-clea.com', isOutdated: true, isAcquired: false },
          {
            label: 'Pix+ Édu 1er degré Confirmé',
            imageUrl: 'http://www.image-clea.com',
            isOutdated: true,
            isAcquired: false,
          },
        ];

        this.set(
          'outdatedAndNotAcquiredComplementaryCertifications',
          outdatedAndNotAcquiredComplementaryCertifications,
        );
        this.set('closeBanner', () => {});

        // when
        const screen = await render(
          hbs`<CertificationBanners::OutdatedComplementaryCertificationBanner
          @complementaryCertifications={{this.outdatedAndNotAcquiredComplementaryCertifications}} />`,
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

        assert.ok(screen.getByRole('img', { name: 'Pix+ Édu 1er degré Confirmé' }));
        assert
          .dom(
            screen.getByText(
              "Vous n'êtes plus éligible à la certification Pix+ Édu 1er degré Confirmé suite à son évolution.",
            ),
          )
          .exists();
        assert
          .dom(
            screen.getAllByText(
              "Recontactez votre établissement ou l’organisation vous ayant proposé le parcours afin de repasser une campagne et ainsi redevenir éligible. Votre progression a été conservée et vous n'aurez qu'à jouer les nouvelles épreuves, cela devrait être rapide.",
            )[1],
          )
          .exists();
      });
    });
  },
);
