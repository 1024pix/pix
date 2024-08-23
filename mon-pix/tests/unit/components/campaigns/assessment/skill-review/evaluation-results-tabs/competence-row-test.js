import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../../../../helpers/create-glimmer-component';

module(
  'Unit | Component | Campaigns | Assessment | SkillReview | EvaluationResultsTabs | ResultsDetails | CompetenceRow',
  function (hooks) {
    setupTest(hooks);

    module('#getIcon', function () {
      module('when the competence is not found', function () {
        test('should return the pix-plus icon', async function (assert) {
          // given
          const component = createGlimmerComponent(
            'campaigns/assessment/skill-review/evaluation-results-tabs/results-details/competence-row',
          );
          // when
          const icon = component.getIcon('unknownCompetenceId');

          // then
          assert.strictEqual(icon, '/images/icons/competences/pix-plus.svg');
        });
      });

      module('when the competence is found', function () {
        test('should return the icon associated to the competence', async function (assert) {
          // given
          const component = createGlimmerComponent(
            'campaigns/assessment/skill-review/evaluation-results-tabs/results-details/competence-row',
          );

          const competenceId = 'recsvLz0W2ShyfD63';

          // when
          const icon = component.getIcon(competenceId);

          // then
          assert.strictEqual(icon, '/images/icons/competences/mener-une-recherche.svg');
        });
      });
    });
  },
);
