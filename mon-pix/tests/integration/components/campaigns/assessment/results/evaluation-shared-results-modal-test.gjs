import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import EvaluationSharedResultsModal from 'mon-pix/components/campaigns/assessment/results/evaluation-shared-results-modal';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | evaluation-shared-results-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when showModal is true', function () {
    test('should display modal', async function (assert) {
      // given
      const showModal = true;
      const trainings = [
        {
          title: 'Mon super training 1',
          link: 'https://training.net/',
          type: 'webinaire',
          locale: 'fr-fr',
          duration: { hours: 6 },
          editorName: "Ministère de l'éducation nationale et de la jeunesse. Liberté égalité fraternité",
          editorLogoUrl:
            'https://images.pix.fr/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
        },
        {
          title: 'Mon super training 2',
          link: 'https://training.net/',
          type: 'webinaire',
          locale: 'fr-fr',
          duration: { hours: 8 },
          editorName: "Ministère de l'éducation nationale et de la jeunesse. Liberté égalité fraternité",
          editorLogoUrl:
            'https://images.pix.fr/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
        },
        {
          title: 'Mon super training 3',
          link: 'https://training.net/',
          type: 'webinaire',
          locale: 'fr-fr',
          duration: { hours: 10 },
          editorName: "Ministère de l'éducation nationale et de la jeunesse. Liberté égalité fraternité",
          editorLogoUrl:
            'https://images.pix.fr/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
        },
      ];

      // when
      const screen = await render(
        <template><EvaluationSharedResultsModal @showModal={{showModal}} @trainings={{trainings}} /></template>,
      );

      // then
      assert.dom(screen.getByRole('dialog')).exists();
      assert.strictEqual(screen.getAllByRole('heading', { level: 3 }).length, 3);
      assert.dom(screen.getByRole('heading', { name: trainings[0].title, level: 3 })).exists();
      assert.dom(screen.getByRole('heading', { name: trainings[1].title, level: 3 })).exists();
      assert.dom(screen.getByRole('heading', { name: trainings[2].title, level: 3 })).exists();
    });

    module('when click on close button', function () {
      test('should call onCloseButtonClick method', async function (assert) {
        // given
        const showModal = true;
        const onCloseButtonClick = sinon.stub();
        const screen = await render(
          <template>
            <EvaluationSharedResultsModal @showModal={{showModal}} @onCloseButtonClick={{onCloseButtonClick}} />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: 'Fermer' }));

        // then
        sinon.assert.calledOnce(onCloseButtonClick);
        assert.ok(true);
      });
    });

    module('when click on close and send results button', function () {
      test('should call onCloseButtonClick method', async function (assert) {
        // given
        const showModal = true;
        const onCloseButtonClick = sinon.stub();
        const screen = await render(
          <template>
            <EvaluationSharedResultsModal @showModal={{showModal}} @onCloseButtonClick={{onCloseButtonClick}} />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: 'Fermer et revenir aux résultats' }));

        // then
        sinon.assert.calledOnce(onCloseButtonClick);
        assert.ok(true);
      });
    });
  });

  module('when showModal is false', function () {
    test('should not display modal', async function (assert) {
      // given
      const showModal = false;

      // when
      const screen = await render(<template><EvaluationSharedResultsModal @showModal={{showModal}} /></template>);

      // then
      assert.dom(screen.queryByRole('dialog')).doesNotExist();
    });
  });
});
