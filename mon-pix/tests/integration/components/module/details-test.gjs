import { render } from '@1024pix/ember-testing-library';
import { findAll } from '@ember/test-helpers';
import ModulixDetails from 'mon-pix/components/module/details';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Details', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the details of a given module', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const details = {
      image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
      description: 'description',
      duration: 12,
      level: 'Débutant',
      objectives: ['Objectif 1'],
    };
    const module = store.createRecord('module', { title: 'Module title', details });

    // when
    const screen = await render(<template><ModulixDetails @module={{module}} /></template>);

    // then
    assert.ok(screen.getByRole('heading', { name: module.title, level: 1 }));
    assert.ok(screen.getByRole('presentation').hasAttribute('src', module.details.image));
    assert.ok(screen.getByText(module.details.description));
    assert.ok(screen.getByText(`${module.details.duration} min`));
    assert.ok(screen.getByText(module.details.level));
    assert.ok(screen.getByText(module.details.objectives[0]));
    assert.ok(screen.getByRole('heading', { name: this.intl.t('pages.modulix.details.explanationTitle'), level: 2 }));
    assert.ok(findAll('.module-details-infos-explanation__title').length > 0);
  });
});
