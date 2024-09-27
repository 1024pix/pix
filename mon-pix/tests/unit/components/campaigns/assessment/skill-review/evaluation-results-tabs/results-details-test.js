import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../../../../helpers/create-glimmer-component';

module(
  'Unit | Component | Campaigns | Assessment | SkillReview | EvaluationResultsTabs | ResultsDetails',
  function (hooks) {
    setupTest(hooks);

    module('#groupedCompetencesByArea', function () {
      test('should return an array of competences grouped by area', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const component = createGlimmerComponent(
          'campaigns/assessment/skill-review/evaluation-results-tabs/results-details',
        );

        const competenceResult1 = store.createRecord('competence-result', {
          areaTitle: 'areaTitle1',
          name: 'competence1',
        });
        const competenceResult2 = store.createRecord('competence-result', {
          areaTitle: 'areaTitle1',
          name: 'competence2',
        });
        const competenceResult3 = store.createRecord('competence-result', {
          areaTitle: 'areaTitle2',
          name: 'competence3',
        });

        component.args.competenceResults = [competenceResult1, competenceResult2, competenceResult3];

        // when
        const groupedCompetencesByArea = component.groupedCompetencesByArea;

        // then
        assert.deepEqual(groupedCompetencesByArea.length, 2);

        assert.strictEqual(groupedCompetencesByArea[0].areaTitle, 'areaTitle1');
        assert.strictEqual(groupedCompetencesByArea[0].competences.length, 2);
        assert.deepEqual(
          groupedCompetencesByArea[0].competences.map(({ name }) => name),
          ['competence1', 'competence2'],
        );

        assert.strictEqual(groupedCompetencesByArea[1].areaTitle, 'areaTitle2');
        assert.strictEqual(groupedCompetencesByArea[1].competences.length, 1);
        assert.strictEqual(groupedCompetencesByArea[1].competences[0].name, 'competence3');
      });
    });
  },
);
