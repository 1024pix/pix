import { render } from '@1024pix/ember-testing-library';
import { click, findAll } from '@ember/test-helpers';
import ModulixDetails from 'mon-pix/components/module/details';
import { module, test } from 'qunit';
import sinon from 'sinon';

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

  module('When start module is clicked', function () {
    test('should push an event', async function (assert) {
      // given
      const router = this.owner.lookup('service:router');
      router.transitionTo = sinon.stub();
      const metrics = this.owner.lookup('service:metrics');
      metrics.add = sinon.stub();
      const store = this.owner.lookup('service:store');

      const details = {
        image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
        description: 'description',
        duration: 12,
        level: 'Débutant',
        objectives: ['Objectif 1'],
      };
      const module = store.createRecord('module', { id: 'module-title', title: 'Module title', details });
      const screen = await render(<template><ModulixDetails @module={{module}} /></template>);

      // when
      await click(screen.getByRole('link', { name: this.intl.t('pages.modulix.details.startModule') }));

      // then
      sinon.assert.calledWithExactly(metrics.add, {
        event: 'custom-event',
        'pix-event-category': 'Modulix',
        'pix-event-action': `Détails du module : ${module.id}`,
        'pix-event-name': `Clic sur le bouton Commencer`,
      });
      assert.ok(true);
    });
  });
});
