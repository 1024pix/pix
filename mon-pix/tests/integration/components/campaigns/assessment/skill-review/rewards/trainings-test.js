import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | Evaluation Results Tabs | Trainings', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when participation is already shared', function () {
    test('it should display the trainings list', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const training1 = store.createRecord('training', {
        title: 'Mon super training',
        link: 'https://exemple.net/',
        duration: { days: 2 },
      });
      const training2 = store.createRecord('training', {
        title: 'Mon autre super training',
        link: 'https://exemple.net/',
        duration: { days: 2 },
      });

      this.set('trainings', [training1, training2]);

      // when
      const screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs::Trainings
  @trainings={{this.trainings}}
  @isParticipationShared='true'
/>`,
      );

      // then
      assert.dom(screen.getByRole('heading', { name: t('pages.skill-review.tabs.trainings.title') })).isVisible();
      assert.dom(screen.getByText(t('pages.skill-review.tabs.trainings.description'))).isVisible();

      assert.strictEqual(screen.getAllByRole('link').length, 2);
      assert.dom(screen.getByText('Mon super training')).isVisible();
      assert.dom(screen.getByText('Mon autre super training')).isVisible();

      assert.dom(screen.queryByRole('dialog')).doesNotExist();
    });
  });

  module('when participation is not already shared', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      this.set('isParticipationShared', false);
      this.set('campaignParticipationResultId', 1);

      // when
      screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs::Trainings
  @isParticipationShared={{this.isParticipationShared}}
  @campaignParticipationResultId={{this.campaignParticipationResultId}}
/>`,
      );
    });

    test('it should display a dialog with share results button', async function (assert) {
      // then
      assert.dom(screen.getByRole('dialog')).isVisible();
      assert.dom(screen.getByText(/Envoyez vos résultats pour permettre/)).isVisible();
      assert.dom(screen.getByRole('button', { name: t('pages.skill-review.actions.send') })).isVisible();
    });

    test('it should have an inert trainings list', async function (assert) {
      // then
      const trainingsListTitle = screen.getByRole('heading', {
        name: t('pages.skill-review.tabs.trainings.title'),
      });
      assert.dom(trainingsListTitle).isVisible();
      assert.dom(trainingsListTitle.closest('[role="presentation"]')).hasAttribute('inert');
    });

    module('when clicking on the share results button', function (hooks) {
      let adapter;

      hooks.beforeEach(function () {
        const store = this.owner.lookup('service:store');
        adapter = store.adapterFor('campaign-participation-result');
      });

      test('it should call the share method of the adapter', async function (assert) {
        // given
        const createShareStub = sinon.stub(adapter, 'share');

        // when
        await click(screen.queryByRole('button', { name: t('pages.skill-review.actions.send') }));

        // then
        assert.ok(createShareStub.calledOnce);
        sinon.assert.calledWithExactly(createShareStub, 1);
      });

      module('when share action succeeds', function () {
        test('it hide the dialog and show the trainings list', async function (assert) {
          // given
          sinon.stub(adapter, 'share');

          // when
          await click(screen.queryByRole('button', { name: t('pages.skill-review.actions.send') }));

          // then
          assert.dom(screen.queryByRole('dialog')).doesNotExist();

          const trainingsListTitle = screen.getByRole('heading', {
            name: t('pages.skill-review.tabs.trainings.title'),
          });
          assert.dom(trainingsListTitle.closest('[role="presentation"]')).doesNotExist();
        });
      });

      module('when share action fails', function () {
        test('it should display an error message', async function (assert) {
          // given
          sinon.stub(adapter, 'share').rejects();

          // when
          await click(screen.queryByRole('button', { name: t('pages.skill-review.actions.send') }));

          // then
          assert.dom(screen.queryByRole('dialog')).exists();
          assert.dom(screen.getByText(t('pages.skill-review.tabs.trainings.modal.share-error'))).exists();
        });
      });
    });
  });
});
