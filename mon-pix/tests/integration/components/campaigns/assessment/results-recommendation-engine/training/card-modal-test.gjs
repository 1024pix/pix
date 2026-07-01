import { render, within } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import TrainingCardModal from 'mon-pix/components/campaigns/assessment/results-recommendation-engine/training/card-modal';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | ResultsRecommendationEngine | Training | CardModal',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test('should display a modal with training information', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const training = store.createRecord(
        'training',
        _buildTraining({ type: 'modulix', duration: { days: 1, hours: 2, minutes: 10 } }),
      );
      const deliveryMode = t('pages.skill-review.recommended-engine.training-card.delivery-mode.remote');

      // when
      const screen = await render(
        <template>
          <TrainingCardModal @training={{training}} @deliveryMode={{deliveryMode}} @isOpen={{true}} />
        </template>,
      );

      // then
      const modal = await screen.findByRole('dialog', { name: training.title });
      assert
        .dom(within(modal).getByRole('heading', { name: 'Apprendre à manger un croissant comme les français' }))
        .exists();
      assert
        .dom(
          within(modal).getByText(t('pages.skill-review.recommended-engine.training-card.registration-required.yes')),
        )
        .exists();
      assert.dom(within(modal).getByText(t('pages.skill-review.recommended-engine.modal.duration'))).exists();
      assert.dom(within(modal).getByText(training.editorName)).exists();
      assert.dom(within(modal).getByText(t('pages.skill-review.recommended-engine.modal.localisation'))).exists();
      assert
        .dom(within(modal).getByText(t('pages.skill-review.recommended-engine.training-card.delivery-mode.remote')))
        .exists();
      assert.dom(within(modal).getByText(training.description)).exists();
      assert.dom(within(modal).getByText(t('pages.skill-review.recommended-engine.modal.objectives'))).exists();
      assert.dom(within(modal).getByText(t('pages.skill-review.recommended-engine.modal.program'))).exists();

      const actionButtons = within(modal).getByRole('list');
      assert.dom(within(actionButtons).getByRole('button', { name: t('common.actions.close') })).exists();
    });

    module('when training has no program', function () {
      test('it does not display program accordion', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const training = store.createRecord('training', _buildTraining({ program: null }));

        // when
        const screen = await render(<template><TrainingCardModal @training={{training}} @isOpen={{true}} /></template>);

        // then
        const modal = await screen.findByRole('dialog', { name: training.title });
        assert.dom(within(modal).queryByText(t('pages.skill-review.recommended-engine.modal.program'))).doesNotExist();
      });
    });

    module('when training has no objectives', function () {
      test('it does not display objectives accordion', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const training = store.createRecord('training', _buildTraining({ objectives: [] }));

        // when
        const screen = await render(<template><TrainingCardModal @training={{training}} @isOpen={{true}} /></template>);

        // then
        const modal = await screen.findByRole('dialog', { name: training.title });
        assert
          .dom(within(modal).queryByText(t('pages.skill-review.recommended-engine.modal.objectives')))
          .doesNotExist();
      });
    });

    module('when training is modulix type', function () {
      test('it displays a link button to redirect to a module', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const training = store.createRecord('training', _buildTraining({ type: 'modulix' }));

        // when
        const screen = await render(<template><TrainingCardModal @training={{training}} @isOpen={{true}} /></template>);

        // then
        const modal = await screen.findByRole('dialog', { name: training.title });
        assert
          .dom(
            within(modal).getByRole('link', {
              name: t('pages.skill-review.recommended-engine.modal.actions.discover-module'),
            }),
          )
          .exists();
      });
    });

    module('when training is a other type than modulix', function () {
      test('it displays a link button to redirect to an external website', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const training = store.createRecord('training', _buildTraining({ type: 'webinaire' }));

        // when
        const screen = await render(<template><TrainingCardModal @training={{training}} @isOpen={{true}} /></template>);

        // then
        const modal = await screen.findByRole('dialog', { name: training.title });
        assert
          .dom(
            within(modal).getByRole('link', {
              name: `${t('pages.skill-review.recommended-engine.modal.actions.discover-program')} ${t('navigation.external-link-title')}`,
            }),
          )
          .exists();
      });
    });

    test('should display a feedback for the relevance of the training', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const training = store.createRecord('training', _buildTraining({}));

      // when
      const screen = await render(<template><TrainingCardModal @training={{training}} @isOpen={{true}} /></template>);

      // then
      const modal = await screen.findByRole('dialog', { name: training.title });
      assert.dom(within(modal).getByRole('button', { name: t('common.yes') })).exists();
      assert.dom(within(modal).getByRole('button', { name: t('common.no') })).exists();
      assert.dom(within(modal).getByText(t('pages.skill-review.recommended-engine.modal.feedback.question'))).exists();
    });
  },
);

function _buildTraining({
  deliveryMode = 'remote',
  registrationRequired = true,
  type = 'webinaire',
  duration = { days: 1, hours: 2, minutes: 0 },
  program = 'Heure 1 : Théorie & culture du croissant, Heure 2 : Pratique et technique de dégustation',
  objectives = ['Repérer si le croissant est de bonne qualité', 'Rechercher un croissant pour le manger'],
}) {
  return {
    title: 'Apprendre à manger un croissant comme les français',
    link: 'https://example.net/',
    duration,
    editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
    editorName: "Ministère de l'éducation nationale et de la jeunesse. Liberté égalité fraternité",
    locale: 'fr-fr',
    type,
    deliveryMode,
    objectives,
    program,
    description:
      "Aujourd'hui, manger un croissant est tout un art en France. De nombreux touristes viennent en France et font le tour des meilleures boulangeries pour en manger, mais sans connaître les différentes manières de le savourer pleinement.",
    registrationRequired,
  };
}
