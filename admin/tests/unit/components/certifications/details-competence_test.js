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

  module('#competenceJury', function () {
    test('it should not give jury values when no jury rate is set', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ko', 'partially'),
        rate: 40,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.false(actual);
    });

    test('it should give jury values when a jury rate is set and score differs', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'ko', 25, 17),
        rate: 60,
        juryRate: 81,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 3);
      assert.strictEqual(actual.score, 25);
    });

    test('it should not give jury values when a jury rate is set and score does not differ', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'ko', 25, 17),
        rate: 60,
        juryRate: 79,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.false(actual);
    });

    test('it should give level n and positioned score when jury rate is set and 3 ok', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'ok', 25, 17, 3, 2),
        rate: 60,
        juryRate: 79,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 3);
      assert.strictEqual(actual.score, 25);
    });

    test('it should give level n and positioned score when jury rate is set to 81 and 2 ok and 1 ko', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'ko', 25, 17, 3, 2),
        rate: 60,
        juryRate: 81,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 3);
      assert.strictEqual(actual.score, 25);
    });

    test('it should give level n and positioned score when jury rate is set to 81 and 2 ok and 1 aband', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'aband', 25, 17, 3, 2),
        rate: 60,
        juryRate: 81,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 3);
      assert.strictEqual(actual.score, 25);
    });

    test('it should give level n and positioned score when jury rate is set to 81 and 2 ok and 1 partially', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'partially', 25, 17, 3, 2),
        rate: 60,
        juryRate: 81,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 3);
      assert.strictEqual(actual.score, 25);
    });

    test('it should give level n and positioned score when jury rate is set to 81 and 2 ok and 1 timedout', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'timedout', 25, 17, 3, 2),
        rate: 60,
        juryRate: 81,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 3);
      assert.strictEqual(actual.score, 25);
    });

    test('it should give level n-1 and score positionedScore-8 when jury rate is set to 65 and 2 ok and 1 ko', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'ko', 25, 25, 3, 3),
        rate: 60,
        juryRate: 65,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 2);
      assert.strictEqual(actual.score, 17);
    });

    test('it should give level n-1 and score positionedScore-8 when jury rate is set to 65 and 2 ok and 1 aband', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'aband', 25, 25, 3, 3),
        rate: 81,
        juryRate: 65,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 2);
      assert.strictEqual(actual.score, 17);
    });

    test('it should give level n-1 and score positionedScore-8 when jury rate is set to 65 and 2 ok and 1 partiallyx  x', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'partially', 25, 25, 3, 3),
        rate: 81,
        juryRate: 65,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 2);
      assert.strictEqual(actual.score, 17);
    });

    test('it should give level n-1 and score positionedScore-8 when jury rate is set to 65 and 2 ok and 1 timedout', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'timedout', 25, 25, 3, 3),
        rate: 81,
        juryRate: 65,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 2);
      assert.strictEqual(actual.score, 17);
    });

    test('it should give level -1 and score 0 when jury rate is set and 1 ok', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ko', 'aband', 25, 25, 3, 3),
        rate: 81,
        juryRate: 90,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, -1);
      assert.strictEqual(actual.score, 0);
    });

    test('it should give level -1 and score 0 when jury rate is set to 49', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'ok', 25, 25, 3, 3),
        rate: 81,
        juryRate: 49,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, -1);
      assert.strictEqual(actual.score, 0);
    });

    test('it should give level n and positioned score when jury rate is set to 81 and 2 ok and 1 skip', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'skip', 25, 0, 3, -1),
        rate: 49,
        juryRate: 81,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 3);
      assert.strictEqual(actual.score, 25);
    });

    test('it should give level n and positioned score when jury rate is set to 65 and 2 ok and 1 skip', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'skip', 25, 0, 3, -1),
        rate: 65,
        juryRate: 81,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 3);
      assert.strictEqual(actual.score, 25);
    });

    test('it should give level n when jury rate is set to 90, 1 ok, 1 partially, 1 skip', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ok', 'skip', 25, 0, 3, -1),
        rate: 49,
        juryRate: 90,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 3);
      assert.strictEqual(actual.score, 25);
    });

    test('it should give level n-1 when jury rate is set to 65, 1 ok, 1 partially, 1 skip', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'partially', 'skip', 25, 0, 3, -1),
        rate: 49,
        juryRate: 65,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, 2);
      assert.strictEqual(actual.score, 17);
    });

    test('it should give level -1 when jury rate is set, 1 ok, 1 ko, 1 skip', async function (assert) {
      // given
      component.args = {
        competence: competence('ok', 'ko', 'skip', 25, 25, 3, 3),
        rate: 85,
        juryRate: 81,
      };

      // when
      const actual = component.competenceJury;

      // then
      assert.strictEqual(actual.level, -1);
      assert.strictEqual(actual.score, 0);
    });
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
    assert.strictEqual(component.competenceJury.width.toString(), 'width:' + Math.round((3 / 8) * 100) + '%');
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
