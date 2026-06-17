/* eslint-disable ember/template-no-let-reference */
import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Training from 'pix-admin/templates/authenticated/trainings/training';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Trainings | Training', function (hooks) {
  let model, store;

  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.lookup('service:router');
    store = this.owner.lookup('service:store');
    model = store.createRecord('training', {
      id: '12',
      title: 'title',
      internalTitle: 'internalTitle',
      link: 'my-training-link',
      type: 'webinaire',
      locales: ['fr-fr'],
      editorName: 'Albert',
      editorLogoUrl: 'http://localhost:4202/logo-placeholder.png',
      isRecommendable: true,
      isDisabled: false,
    });
    store.createRecord('module-metadata', { title: 'Bac à sable', link: '/modules/bac-a-sable' });
  });

  test('should display header training information', async function (assert) {
    // when
    const screen = await render(<template><Training @model={{model}} /></template>);

    // then
    assert.ok(screen.getByRole('heading', { name: 'internalTitle' }));
    assert.ok(screen.getByRole('img', { name: 'Albert' }));
    assert.ok(screen.getByText('Actif'));
  });

  test('should display training tabs', async function (assert) {
    // when
    const screen = await render(<template><Training @model={{model}} /></template>);

    // then
    assert.ok(screen.getByText(t('pages.trainings.training.details.tab')));
    assert.ok(screen.getByText(t('pages.trainings.training.triggers.tabName')));
    assert.ok(screen.getByText(t('pages.trainings.training.targetProfiles.tabName')));
  });

  test('it should display "Actif" when training is not disabled', async function (assert) {
    // given
    model.isDisabled = false;
    const screen = await render(<template><Training @model={{model}} /></template>);

    // then
    assert.dom(screen.getByText('Actif')).exists();
  });

  test('it should display "En pause" when training is disabled', async function (assert) {
    // given
    model.isDisabled = true;
    const screen = await render(<template><Training @model={{model}} /></template>);

    // then
    assert.dom(screen.getByText('En pause')).exists();
  });
});
/* eslint-enable ember/template-no-let-reference */
