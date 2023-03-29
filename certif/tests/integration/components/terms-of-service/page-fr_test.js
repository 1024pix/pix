import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | terms-of-service | page-fr', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display cgu information with titles', async function (assert) {
    // when
    const screen = await render(hbs`<TermsOfService::PageFr />`);

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
        })
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
