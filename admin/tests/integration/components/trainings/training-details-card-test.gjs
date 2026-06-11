import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import TrainingDetailsCard from 'pix-admin/components/trainings/training-details-card';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Trainings::TrainingDetailsCard', function (hooks) {
  setupIntlRenderingTest(hooks);

  const training = {
    title: 'Un contenu formatif',
    internalTitle: 'Mon titre interne',
    link: 'https://un-contenu-formatif',
    type: 'webinaire',
    locales: ['fr-fr'],
    editorName: 'Un éditeur de contenu formatif',
    editorLogoUrl: 'http://localhost:4202/logo-placeholder.png',
    duration: {
      days: 2,
    },
    isRecommendable: true,
  };

  test('it should display the details', async function (assert) {
    // when
    const screen = await render(<template><TrainingDetailsCard @training={{training}} /></template>);

    // then
    assert.dom(screen.getByText(training.title)).exists();
    assert.dom(screen.getByText('https://un-contenu-formatif')).exists();
    assert.dom(screen.getByText('Webinaire')).exists();
    assert.dom(screen.getByText('2j')).exists();
    assert.dom(screen.getByText('Franco-français (fr-fr)')).exists();
    assert.dom(screen.getByText('Un éditeur de contenu formatif')).exists();
    assert.dom(screen.getByText('http://localhost:4202/logo-placeholder.png')).exists();
  });

  test('it should display "Déclenchable" when training is recommendable', async function (assert) {
    // given
    training.isRecommendable = true;
    const screen = await render(<template><TrainingDetailsCard @training={{training}} /></template>);

    // then
    assert.dom(screen.getByText(t('pages.trainings.training.details.status-label.enabled'))).exists();
  });

  test('it should display "Non déclenchable" when training is not recommendable', async function (assert) {
    // given
    training.isRecommendable = false;
    const screen = await render(<template><TrainingDetailsCard @training={{training}} /></template>);

    // then
    assert.dom(screen.getByText(t('pages.trainings.training.details.status-label.disabled'))).exists();
  });

  module('Duration formatting', function () {
    [
      { duration: { days: 2 }, expectedResult: '2j' },
      { duration: { hours: 2 }, expectedResult: '2h' },
      { duration: { minutes: 2 }, expectedResult: '2min' },
      { duration: { hours: 10, minutes: 2 }, expectedResult: '10h 2min' },
      { duration: { days: 1, hours: 4 }, expectedResult: '1j 4h' },
      { duration: { days: 1, minutes: 30 }, expectedResult: '1j 30min' },
      { duration: { days: 1, hours: 4, minutes: 30 }, expectedResult: '1j 4h 30min' },
    ].forEach(function ({ duration, expectedResult }) {
      test(`should display "${expectedResult}" for duration ${JSON.stringify(duration)}`, async function (assert) {
        // given
        const trainingWithDuration = {
          title: 'Un contenu formatif',
          internalTitle: 'Mon titre interne',
          link: 'https://un-contenu-formatif',
          type: 'webinaire',
          locales: ['fr-fr'],
          editorName: 'Un éditeur de contenu formatif',
          editorLogoUrl: 'http://localhost:4202/logo-placeholder.png',
          duration,
          isRecommendable: true,
        };

        // when
        const screen = await render(<template><TrainingDetailsCard @training={{trainingWithDuration}} /></template>);

        // then
        assert.dom(screen.getByText(expectedResult)).exists();
      });
    });
  });

  module('when there is one value in locales', function () {
    test('it should display locales with a singular label', async function (assert) {
      // given
      const trainingWithOneLocale = { ...training, locales: ['fr'] };

      // when
      const screen = await render(<template><TrainingDetailsCard @training={{trainingWithOneLocale}} /></template>);

      // then
      assert.dom(screen.getByText(t('pages.trainings.training.details.locales', { count: 1 }))).exists();
      assert.dom(screen.getByText('Francophone (fr)')).exists();
    });
  });

  module('when there are multiple value in locales', function () {
    test('it should display locales with a plural label', async function (assert) {
      // given
      const trainingWithMultipleLocales = { ...training, locales: ['fr', 'en'] };

      // when
      const screen = await render(
        <template><TrainingDetailsCard @training={{trainingWithMultipleLocales}} /></template>,
      );

      // then
      assert.dom(screen.getByText(t('pages.trainings.training.details.locales', { count: 2 }))).exists();
      assert.dom(screen.getByText('Francophone (fr), Anglophone (en)')).exists();
    });
  });

  module('when training type is modulix', function () {
    test('should display a link to a Pix App module', async function (assert) {
      // given
      const domainService = this.owner.lookup('service:current-domain');
      sinon.stub(domainService, 'getExtension').returns('fr');

      const training = {
        title: 'Un contenu formatif',
        internalTitle: 'Mon titre interne',
        link: '/modules/123/soleil',
        type: 'modulix',
        locales: ['fr-fr'],
        editorName: 'Un éditeur de contenu formatif',
        editorLogoUrl: 'http://localhost:4202/logo-placeholder.png',
        duration: {
          days: 2,
        },
        isRecommendable: true,
      };

      // when
      const screen = await render(<template><TrainingDetailsCard @training={{training}} /></template>);

      // then
      assert
        .dom(screen.getByRole('link', { name: 'https://app.pix.fr/modules/123/soleil (nouvelle fenêtre)' }))
        .exists();
    });
  });
});
