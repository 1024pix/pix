import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName, visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, currentURL } from '@ember/test-helpers';
import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Module | Routes | navigateIntoTheModuleRecap', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when user arrive on the module recap page', function (hooks) {
    let screen;
    hooks.beforeEach(async function () {
      server.create('module', {
        id: 'bien-ecrire-son-adresse-mail',
        title: 'Bien écrire son adresse mail',
        grains: [],
        details: {
          image: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-details.svg',
          description: 'Description',
          duration: 'duration',
          level: 'level',
          objectives: ['Objectif #1'],
        },
      });

      screen = await visit('/modules/bien-ecrire-son-adresse-mail/passage');
      await clickByName('Terminer');
    });

    test('should include the right page title', async function (assert) {
      // then
      assert.ok(document.title.includes(this.intl.t('pages.modulix.recap.title')));
      assert.ok(screen.getByRole('heading', { level: 1, name: this.intl.t('pages.modulix.recap.title') }));
    });

    test('should display the links to details button and to form builder', async function (assert) {
      // when
      const formLink = screen.getByRole('link', { name: this.intl.t('pages.modulix.recap.goToForm') });

      // then
      const passage = server.schema.passages.all().models[0];
      assert.ok(formLink);
      assert.ok(screen.getByRole('link', { name: this.intl.t('pages.modulix.recap.backToModuleDetails') }));
      assert.strictEqual(
        formLink.getAttribute('href'),
        `https://form-eu.123formbuilder.com/71180/modulix-experimentation?2850087=${passage.id}`,
      );
    });

    test('should navigate to details page by clicking on back to module details button', async function (assert) {
      // when
      await click(screen.getByRole('link', { name: this.intl.t('pages.modulix.recap.backToModuleDetails') }));

      // then
      assert.strictEqual(currentURL(), '/modules/bien-ecrire-son-adresse-mail/details');
    });
  });
});
