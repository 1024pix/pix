import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ModuleRecap from 'mon-pix/components/module/recap';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Recap', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a banner at the top of the screen for module recap', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const details = {
      image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
      description: '<p>Description</p>',
      duration: 12,
      level: 'Débutant',
      objectives: ['Objectif 1'],
    };
    const module = store.createRecord('module', { title: 'Module title', details });

    // when
    const screen = await render(<template><ModuleRecap @module={{module}} /></template>);

    // then
    assert.dom(screen.getByRole('alert')).exists();
  });

  test('should display the details of a given module', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const details = {
      image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
      description: '<p>Description</p>',
      duration: 12,
      level: 'Débutant',
      objectives: ['Objectif 1'],
    };
    const module = store.createRecord('module', { title: 'Module title', details });

    // when
    const screen = await render(<template><ModuleRecap @module={{module}} /></template>);

    // then
    assert.ok(screen.getByRole('heading', { level: 1, name: t('pages.modulix.recap.title') }));
    assert.ok(
      screen.getByText((content, element) => {
        return element.innerHTML.trim() === t('pages.modulix.recap.subtitle');
      }),
    );
    assert.ok(screen.getByText('Objectif 1'));
  });
});
