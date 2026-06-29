import { render } from '@1024pix/ember-testing-library';
import OutdatedDoubleCertificationBanner from 'mon-pix/components/certification-banners/outdated-double-certification-banner';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Certification Banners | Outdated Double Certification Banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When the double certification badge is outdated', function () {
    test(`renders the outdated complementary certification`, async function (assert) {
      // given
      const outdatedDoubleCertification = {
        label: 'CléA Numérique',
        imageUrl: 'http://www.image-clea.com',
        isBadgeValid: false,
        validatedDoubleCertification: false,
      };

      // when
      const screen = await render(
        <template><OutdatedDoubleCertificationBanner @doubleCertification={{outdatedDoubleCertification}} /></template>,
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
