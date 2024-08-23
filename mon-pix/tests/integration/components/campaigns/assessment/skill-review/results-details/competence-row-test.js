import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | EvaluationResultsTabs | ResultsDetails | CompetenceRow',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    let screen;

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');
      this.owner.register('service:store', store);

      const competenceResult = store.createRecord('competence-result', {
        id: 'recsvLz0W2ShyfD63',
        name: 'Competence name',
        description: 'Description of competence',
        reachedStage: 2,
        masteryPercentage: 50,
      });

      this.set('competenceResult', competenceResult);
      this.set('total', null);

      // when
      screen = await render(
        hbs`<Campaigns::Assessment::SkillReview::EvaluationResultsTabs::ResultsDetails::CompetenceRow
  @competence={{this.competenceResult}}
  @total={{this.total}}
/>`,
      );
    });

    test('it should render competence content', async function (assert) {
      // then
      assert.strictEqual(
        screen.getByRole('presentation').getAttribute('src'),
        '/images/icons/competences/mener-une-recherche.svg',
      );
      assert.dom(screen.getByRole('heading', { name: 'Competence name' })).exists();
      assert.dom(screen.getByText('Description of competence')).exists();
      assert.dom(screen.getByText('50 % de réussite')).exists();
    });

    module('when there is no total stages count', function () {
      test('it should not display stars', async function (assert) {
        // then
        assert.dom(screen.queryByText('1 étoile acquise sur 3')).doesNotExist();
      });
    });

    module('when there is a total stages count', function () {
      test('it should display stars', async function (assert) {
        // given
        this.set('total', 3);

        // then
        assert.dom(screen.getByText('1 étoile acquise sur 3')).exists();
      });
    });
  },
);
