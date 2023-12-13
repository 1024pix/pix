import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | certifications/details-competence', function (hooks) {
  setupTest(hooks);

  const answer = (result) => {
    return {
      skill: '@skill1',
      challengeId: 'rec12345',
      order: '1',
      result: result,
    };
  };

  const competence = (result1, result2, result3, ...data) => {
    return {
      name: 'Une compétence',
      index: '1.1',
      positionedLevel: data[2] ? data[2] : 3,
      positionedScore: data[0] ? data[0] : 25,
      obtainedLevel: data[3] ? data[3] : -1,
      obtainedScore: data[1] ? data[1] : 0,
      answers: [answer(result1), answer(result2), answer(result3)],
    };
  };

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:certifications/details-competence');
  });

  test('it should compute widths correctly', async function (assert) {
    // when
    component.args = {
      competence: competence('ok', 'ok', 'ko', 25, 17, 3, 2),
      rate: 60,
      juryRate: 81,
    };

    // then
    assert.strictEqual(component.positionedWidth.toString(), 'width:' + Math.round((3 / 8) * 100) + '%');
    assert.strictEqual(component.certifiedWidth.toString(), 'width:' + Math.round((2 / 8) * 100) + '%');
  });

  test('it should retrieve answers from competence', async function (assert) {
    // when
    component.args = {
      competence: competence('ok', 'partially', 'ko'),
    };

    // then
    assert.deepEqual(component.answers, [answer('ok'), answer('partially'), answer('ko')]);
  });
});
