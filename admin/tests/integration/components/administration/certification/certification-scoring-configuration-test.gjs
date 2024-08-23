import { render } from '@1024pix/ember-testing-library';
import CertificationScoringConfiguration from 'pix-admin/components/administration/certification/certification-scoring-configuration';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component |  administration/certification/certification-scoring-configuration', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display all details', async function (assert) {
    // given
    // when
    const screen = await render(<template><CertificationScoringConfiguration /></template>);

    // then
    assert
      .dom(screen.getByRole('heading', { name: 'Configuration des mailles pour le score global', level: 2 }))
      .exists();
    assert
      .dom(screen.getByRole('textbox', { name: 'Ajout de la configuration de score de certification (JSON)' }))
      .exists();
    assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
  });
});
