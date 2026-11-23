import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import ModulixDetails from 'mon-pix/components/module/instruction/details';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setBreakpoint } from '../../../helpers/set-breakpoint';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Details', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the details of a given module', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const descriptionContent = 'description';
    const details = {
      image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
      description: `<p>${descriptionContent}</p>`,
      duration: 12,
      level: 'novice',
      objectives: ['Objectif 1'],
    };
    const module = store.createRecord('module', { slug: 'module-slug', title: 'Module title', details });

    // when
    const screen = await render(<template><ModulixDetails @module={{module}} /></template>);

    // then
    assert.ok(screen.getByRole('heading', { name: module.title, level: 1 }));
    assert.ok(screen.getByRole('presentation').hasAttribute('src', module.details.image));
    assert.ok(screen.getByText(descriptionContent));
    assert.ok(screen.getByText(`${module.details.duration} min`));
    assert.ok(screen.getByText(t(`pages.modulix.details.levels.${module.details.level}`)));
    assert.ok(screen.getByText(module.details.objectives[0]));
  });

  module('When on desktop', function () {
    module('When start module is clicked', function () {
      test('should push a passage beginning event', async function (assert) {
        // given
        const { module, metrics } = prepareDetailsComponentContext.call(this, 'inconvenient');
        const screen = await render(<template><ModulixDetails @module={{module}} /></template>);

        // when
        await click(screen.getByRole('button', { name: t('pages.modulix.details.startModule') }));

        // then
        sinon.assert.calledWithExactly(metrics.trackEvent, `Clic sur le bouton Commencer un passage`, {
          category: 'Modulix',
          moduleId: module.id,
        });
        assert.ok(true);
      });

      test('should route to module passage', async function (assert) {
        // given
        const { module, router } = prepareDetailsComponentContext.call(this, 'inconvenient');
        const screen = await render(<template><ModulixDetails @module={{module}} /></template>);

        // when
        await click(screen.getByRole('button', { name: t('pages.modulix.details.startModule') }));

        // then
        sinon.assert.calledWithExactly(router.transitionTo, 'module.passage');
        assert.ok(true);
      });
    });
  });

  module('When on tablet', function () {
    module('When module.tabletSupport is comfortable', function () {
      module('When start module is clicked', function () {
        test('should push a passage beginning event', async function (assert) {
          // given
          const { module, metrics } = prepareDetailsComponentContext.call(this, 'comfortable', 'tablet');
          const screen = await render(<template><ModulixDetails @module={{module}} /></template>);

          // when
          await click(screen.getByRole('button', { name: t('pages.modulix.details.startModule') }));

          // then
          sinon.assert.calledWithExactly(metrics.trackEvent, `Clic sur le bouton Commencer un passage`, {
            category: 'Modulix',
            moduleId: module.id,
          });
          assert.ok(true);
        });

        test('should route to module passage', async function (assert) {
          // given
          const { module, router } = prepareDetailsComponentContext.call(this, 'comfortable', 'tablet');
          const screen = await render(<template><ModulixDetails @module={{module}} /></template>);

          // when
          await click(screen.getByRole('button', { name: t('pages.modulix.details.startModule') }));

          // then
          sinon.assert.calledWithExactly(router.transitionTo, 'module.passage');
          assert.ok(true);
        });
      });
    });

    module('When module.tabletSupport is not comfortable', function () {
      module('When start module is clicked', function () {
        test('should push a small screen modal opened event', async function (assert) {
          // given
          const { module, metrics } = prepareDetailsComponentContext.call(this, 'inconvenient', 'tablet');
          const screen = await render(<template><ModulixDetails @module={{module}} /></template>);

          // when
          await click(screen.getByRole('button', { name: t('pages.modulix.details.startModule') }));

          // then
          sinon.assert.calledWithExactly(metrics.trackEvent, `Ouvre la modale d'alerte de largeur d'écran`, {
            category: 'Modulix',
            moduleId: module.id,
          });
          assert.ok(true);
        });

        test('should open a modal', async function (assert) {
          // given
          const { module } = prepareDetailsComponentContext.call(this, 'unusable', 'tablet');
          const screen = await render(<template><ModulixDetails @module={{module}} /></template>);

          // when
          await click(screen.getByRole('button', { name: t('pages.modulix.details.startModule') }));

          // then
          const dialog = await screen.findByRole('dialog');
          assert.dom(dialog).exists();
          assert
            .dom(
              await within(dialog).findByRole('heading', {
                name: t('pages.modulix.details.smallScreenModal.title'),
              }),
            )
            .exists();
          assert.dom(await within(dialog).findByText(t('pages.modulix.details.smallScreenModal.description'))).exists();
        });

        module('When modal start module is clicked', function () {
          test('should push a passage beginning in small screen event if proceeding', async function (assert) {
            // given
            const { module, metrics } = prepareDetailsComponentContext.call(this, 'inconvenient', 'mobile');
            const screen = await render(<template><ModulixDetails @module={{module}} /></template>);

            // when
            await click(screen.getByRole('button', { name: t('pages.modulix.details.startModule') }));
            const dialog = await screen.findByRole('dialog');

            await click(
              within(dialog).getByRole('button', {
                name: t('pages.modulix.details.smallScreenModal.startModule'),
              }),
            );

            // then
            sinon.assert.calledWithExactly(
              metrics.trackEvent,
              `Clic sur le bouton Commencer un passage en petit écran`,
              {
                category: 'Modulix',
                moduleId: module.id,
              },
            );
            assert.ok(true);
          });

          test('should route to module passage', async function (assert) {
            // given
            const { module, router } = prepareDetailsComponentContext.call(this, 'inconvenient', 'tablet');
            const screen = await render(<template><ModulixDetails @module={{module}} /></template>);

            // when
            await click(screen.getByRole('button', { name: t('pages.modulix.details.startModule') }));
            const dialog = await screen.findByRole('dialog');

            await click(
              within(dialog).getByRole('button', {
                name: t('pages.modulix.details.smallScreenModal.startModule'),
              }),
            );

            // then
            sinon.assert.calledWithExactly(router.transitionTo, 'module.passage');
            assert.ok(true);
          });
        });

        module('When modal cancel is clicked', function () {
          test('should push an event if cancelling', async function (assert) {
            // given
            const { module, metrics } = prepareDetailsComponentContext.call(this, 'inconvenient', 'tablet');
            const screen = await render(<template><ModulixDetails @module={{module}} /></template>);

            // when
            await click(screen.getByRole('button', { name: t('pages.modulix.details.startModule') }));
            const dialog = await screen.findByRole('dialog');

            await click(
              within(dialog).getByRole('button', {
                name: t('pages.modulix.details.smallScreenModal.cancel'),
              }),
            );

            // then
            sinon.assert.calledWithExactly(metrics.trackEvent, `Ferme la modale d'alerte de largeur d'écran`, {
              category: 'Modulix',
              moduleId: module.id,
            });
            assert.ok(true);
          });

          test('should not route to module passage', async function (assert) {
            // given
            const { module, router } = prepareDetailsComponentContext.call(this, 'inconvenient', 'tablet');
            const screen = await render(<template><ModulixDetails @module={{module}} /></template>);

            // when
            await click(screen.getByRole('button', { name: t('pages.modulix.details.startModule') }));
            const dialog = await screen.findByRole('dialog');

            await click(
              within(dialog).getByRole('button', {
                name: t('pages.modulix.details.smallScreenModal.cancel'),
              }),
            );

            // then
            sinon.assert.notCalled(router.transitionTo);
            assert.ok(true);
          });
        });
      });
    });
  });
});

function prepareDetailsComponentContext(tabletSupport, breakpoint = 'desktop') {
  const router = this.owner.lookup('service:router');
  router.transitionTo = sinon.stub();
  const metrics = this.owner.lookup('service:pix-metrics');
  metrics.trackEvent = sinon.stub();
  const store = this.owner.lookup('service:store');

  const details = {
    image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
    description: '<p>Description</p>',
    duration: 12,
    level: 'novice',
    objectives: ['Objectif 1'],
    tabletSupport,
  };
  const module = store.createRecord('module', {
    id: 'module-title',
    slug: 'module-slug',
    shortId: '3r7cl7m3',
    title: 'Module title',
    details,
  });
  setBreakpoint(breakpoint);

  return { router, metrics, store, details, module };
}
