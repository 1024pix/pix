import { render } from '@1024pix/ember-testing-library';
import TermsOfService from 'pix-certif/components/terms-of-service';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | terms-of-service | index', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display cgu action buttons, title and pix Certif logo', async function (assert) {
    // given & when
    const screen = await render(<template><TermsOfService @isEnglishLocale={{false}} /></template>);

    // then
    assert
      .dom(
        screen.getByRole('heading', {
          name: "Conditions générales d'utilisation de la plateforme Pix Certif",
          level: 1,
        }),
      )
      .exists();
    assert.dom(screen.getByRole('button', { name: 'J’accepte les conditions d’utilisation' })).exists();
    assert.dom(screen.getByRole('link', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('img', { name: 'Pix Certif' })).exists();
  });

  module('when current language is french', function () {
    test('it should display cgu information with titles', async function (assert) {
      // when
      const screen = await render(<template><TermsOfService @isEnglishLocale={{false}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { name: 'Article 1. Préambule', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 2. Définitions', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 3. Objet', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 4. Entrée en vigueur - Durée', level: 2 })).exists();

      assert
        .dom(
          screen.getByRole('heading', {
            name: 'Article 5. Acceptation et opposabilité des conditions générales',
            level: 2,
          }),
        )
        .exists();
      assert.dom(screen.getByRole('heading', { name: '5.1 Acceptation', level: 3 })).exists();
      assert.dom(screen.getByRole('heading', { name: '5.2 Modification', level: 3 })).exists();
      assert.dom(screen.getByRole('heading', { name: '5.3 Opposabilité', level: 3 })).exists();

      assert.dom(screen.getByRole('heading', { name: 'Article 6. Compte utilisateur', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 7. Description des services', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 8. Accès à Pix Certif', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 9. Spécificités techniques', level: 2 })).exists();
      assert
        .dom(screen.getByRole('heading', { name: 'Article 10. Gestion des sessions de certification', level: 2 }))
        .exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 11. Utilisation', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 12. Sécurité', level: 2 })).exists();

      assert.dom(screen.getByRole('heading', { name: 'Article 13. Maintenance et support', level: 2 })).exists();
      assert
        .dom(screen.getByRole('heading', { name: '13.1 Support et assistance auprès de l’utilisateur', level: 3 }))
        .exists();
      assert.dom(screen.getByRole('heading', { name: '13.2 Maintenance évolutive', level: 3 })).exists();

      assert.dom(screen.getByRole('heading', { name: 'Article 14. Responsabilité', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: '14.1 Responsabilité de l’utilisateur', level: 3 })).exists();
      assert.dom(screen.getByRole('heading', { name: '14.2 Responsabilité du GIP Pix', level: 3 })).exists();

      assert.dom(screen.getByRole('heading', { name: 'Article 15. Propriété intellectuelle', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 16. Liens hypertextes', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 17. Données à caractère personnel', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: '17.1 Information de l’utilisation', level: 3 })).exists();
      assert.dom(screen.getByRole('heading', { name: '17.2 Sous-traitance', level: 3 })).exists();

      assert.dom(screen.getByRole('heading', { name: '18. Résolution et résiliation', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: '18.1 Désinscription', level: 3 })).exists();
      assert.dom(screen.getByRole('heading', { name: '18.2 Suspension et exclusion', level: 3 })).exists();

      assert.dom(screen.getByRole('heading', { name: '19. Convention de preuve', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: '20. Nullité', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: '21. Loi applicable', level: 2 })).exists();
    });
  });

  module('when current language is english', function () {
    test('it should display cgu information with titles', async function (assert) {
      // when
      const screen = await render(<template><TermsOfService @isEnglishLocale={{true}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { name: 'Article 1. Preamble', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 2. Definitions', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 3. Purpose', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 4. Acceptance and enforcement', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: '4.1 Acceptance', level: 3 })).exists();
      assert.dom(screen.getByRole('heading', { name: '4.2 Enforcement', level: 3 })).exists();

      assert
        .dom(
          screen.getByRole('heading', {
            name: 'Article 5. User account',
            level: 2,
          }),
        )
        .exists();

      assert.dom(screen.getByRole('heading', { name: 'Article 6. Description of services', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 7. Access to Pix Certif', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 8. Technical features', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 9. Management of certification sessions', level: 2 })).exists();
      assert
        .dom(screen.getByRole('heading', { name: 'Article 10. Use', level: 2 }))
        .exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 11. Security', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 12. Maintenance and support', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: '12.1 Support and assistance to the user', level: 3 })).exists();
      assert.dom(screen.getByRole('heading', { name: '12.2 Progressive maintenance', level: 3 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 13. Liability', level: 2 })).exists();
      assert
        .dom(screen.getByRole('heading', { name: '13.1 User’s liability', level: 3 }))
        .exists();
      assert.dom(screen.getByRole('heading', { name: '13.2 The Pix HIP’s liability', level: 3 })).exists();

      assert.dom(screen.getByRole('heading', { name: 'Article 14. Intellectual property rights', level: 2 })).exists();

      assert.dom(screen.getByRole('heading', { name: 'Article 15. Hyperlinks', level: 2 })).exists();

      assert.dom(screen.getByRole('heading', { name: 'Article 16. Personal data', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: '16.1 Information of use', level: 3 })).exists();
      assert.dom(screen.getByRole('heading', { name: '16.2 Subcontracting', level: 3 })).exists();
      assert.dom(screen.getByRole('heading', { name: 'Article 17. Cookies', level: 2 })).exists();

      assert.dom(screen.getByRole('heading', { name: '18. Termination', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: '18.1 De-registration', level: 3 })).exists();
      assert.dom(screen.getByRole('heading', { name: '18.2 Suspension and exclusion', level: 3 })).exists();

      assert.dom(screen.getByRole('heading', { name: '19. Agreement of proof', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: '20. Invalidity', level: 2 })).exists();
      assert.dom(screen.getByRole('heading', { name: '21. Applicable law', level: 2 })).exists();
    });
  });
});
