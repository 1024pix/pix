import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { htmlSafe } from '@ember/string';

module('Unit | Component | certification-details-competence', function(hooks) {
  setupTest(hooks);

  const answer = (result) => {
    return {
      skill:'@skill1',
      challengeId:'rec12345',
      order:'1',
      result:result
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
      answers:[answer(result1), answer(result2), answer(result3)]
    };
  };

  test('it should not give jury values when no jury rate is set', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ko', 'partially'));
    component.set('rate', 60);

    // when
    component.set('juryRate', false);

    // then
    assert.equal(component.get('competenceJury'), false);
  });

  test('it should give jury values when a jury rate is set and score differs', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'ko', 25, 17));
    component.set('rate', 60);

    // when
    component.set('juryRate', 81);

    // then
    assert.notEqual(component.get('competenceJury'), false);
  });

  test('it should not give jury values when a jury rate is set and score does not differ', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'ko', 25, 17));
    component.set('rate', 60);

    // when
    component.set('juryRate', 79);

    // then
    assert.equal(component.get('competenceJury'), false);
  });

  test('it should give level n and positioned score when jury rate is set and 3 ok', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'ok', 25, 17, 3, 2));
    component.set('rate', 60);
    assert.expect(2);

    // when
    component.set('juryRate', 79);

    // then
    assert.equal(component.get('competenceJury.level'), 3);
    assert.equal(component.get('competenceJury.score'), 25);
  });

  test('it should give level n and positioned score when jury rate is set to 81 and 2 ok and 1 ko', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'ko', 25, 17, 3, 2));
    component.set('rate', 60);
    assert.expect(2);

    // when
    component.set('juryRate', 81);

    // then
    assert.equal(component.get('competenceJury.level'), 3);
    assert.equal(component.get('competenceJury.score'), 25);
  });

  test('it should give level n and positioned score when jury rate is set to 81 and 2 ok and 1 aband', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'aband', 25, 17, 3, 2));
    component.set('rate', 60);
    assert.expect(2);

    // when
    component.set('juryRate', 81);

    // then
    assert.equal(component.get('competenceJury.level'), 3);
    assert.equal(component.get('competenceJury.score'), 25);
  });

  test('it should give level n and positioned score when jury rate is set to 81 and 2 ok and 1 partially', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'partially', 25, 17, 3, 2));
    component.set('rate', 60);
    assert.expect(2);

    // when
    component.set('juryRate', 81);

    // then
    assert.equal(component.get('competenceJury.level'), 3);
    assert.equal(component.get('competenceJury.score'), 25);
  });

  test('it should give level n and positioned score when jury rate is set to 81 and 2 ok and 1 timedout', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'timedout', 25, 17, 3, 2));
    component.set('rate', 60);
    assert.expect(2);

    // when
    component.set('juryRate', 81);

    // then
    assert.equal(component.get('competenceJury.level'), 3);
    assert.equal(component.get('competenceJury.score'), 25);
  });

  test('it should give level n-1 and score positionedScore-8 when jury rate is set to 65 and 2 ok and 1 ko', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'ko', 25, 25, 3, 3));
    component.set('rate', 81);
    assert.expect(2);

    // when
    component.set('juryRate', 65);

    // then
    assert.equal(component.get('competenceJury.level'), 2);
    assert.equal(component.get('competenceJury.score'), 17);
  });

  test('it should give level n-1 and score positionedScore-8 when jury rate is set to 65 and 2 ok and 1 aband', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'aband', 25, 25, 3, 3));
    component.set('rate', 81);
    assert.expect(2);

    // when
    component.set('juryRate', 65);

    // then
    assert.equal(component.get('competenceJury.level'), 2);
    assert.equal(component.get('competenceJury.score'), 17);
  });

  test('it should give level n-1 and score positionedScore-8 when jury rate is set to 65 and 2 ok and 1 partially', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'partially', 25, 25, 3, 3));
    component.set('rate', 81);
    assert.expect(2);

    // when
    component.set('juryRate', 65);

    // then
    assert.equal(component.get('competenceJury.level'), 2);
    assert.equal(component.get('competenceJury.score'), 17);
  });

  test('it should give level n-1 and score positionedScore-8 when jury rate is set to 65 and 2 ok and 1 timedout', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'timedout', 25, 25, 3, 3));
    component.set('rate', 81);
    assert.expect(2);

    // when
    component.set('juryRate', 65);

    // then
    assert.equal(component.get('competenceJury.level'), 2);
    assert.equal(component.get('competenceJury.score'), 17);
  });

  test('it should give level -1 and score 0 when jury rate is set and 1 ok', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ko', 'aband', 25, 25, 3, 3));
    component.set('rate', 81);
    assert.expect(2);

    // when
    component.set('juryRate', 90);

    // then
    assert.equal(component.get('competenceJury.level'), -1);
    assert.equal(component.get('competenceJury.score'), 0);
  });

  test('it should give level -1 and score 0 when jury rate is set to 49', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'ok', 25, 25, 3, 3));
    component.set('rate', 81);
    assert.expect(2);

    // when
    component.set('juryRate', 49);

    // then
    assert.equal(component.get('competenceJury.level'), -1);
    assert.equal(component.get('competenceJury.score'), 0);
  });

  // SKIP

  test('it should give level n and positioned score when jury rate is set to 81 and 2 ok and 1 skip', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'skip', 25, 0, 3, -1));
    component.set('rate', 49);
    assert.expect(2);

    // when
    component.set('juryRate', 81);

    // then
    assert.equal(component.get('competenceJury.level'), 3);
    assert.equal(component.get('competenceJury.score'), 25);
  });

  test('it should give level n and positioned score when jury rate is set to 65 and 2 ok and 1 skip', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'skip', 25, 0, 3, -1));
    component.set('rate', 65);
    assert.expect(2);

    // when
    component.set('juryRate', 81);

    // then
    assert.equal(component.get('competenceJury.level'), 3);
    assert.equal(component.get('competenceJury.score'), 25);
  });

  test('it should give level n when jury rate is set to 90, 1 ok, 1 partially, 1 skip', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'partially', 'skip', 25, 0, 3, -1));
    component.set('rate', 49);
    assert.expect(2);

    // when
    component.set('juryRate', 90);

    // then
    assert.equal(component.get('competenceJury.level'), 3);
    assert.equal(component.get('competenceJury.score'), 25);
  });

  test('it should give level n-1 when jury rate is set to 65, 1 ok, 1 partially, 1 skip', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'partially', 'skip', 25, 0, 3, -1));
    component.set('rate', 49);
    assert.expect(2);

    // when
    component.set('juryRate', 65);

    // then
    assert.equal(component.get('competenceJury.level'), 2);
    assert.equal(component.get('competenceJury.score'), 17);
  });

  test('it should give level -1 when jury rate is set, 1 ok, 1 ko, 1 skip', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ko', 'skip', 25, 25, 3, 3));
    component.set('rate', 85);
    assert.expect(2);

    // when
    component.set('juryRate', 81);

    // then
    assert.equal(component.get('competenceJury.level'), -1);
    assert.equal(component.get('competenceJury.score'), 0);
  });

  // check computed widths
  test('it should compute widths correctly', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();
    component.set('competence', competence('ok', 'ok', 'ko', 25, 17, 3, 2));
    component.set('rate', 60);
    assert.expect(3);

    // when
    component.set('juryRate', 81);

    // then
    assert.equal(component.get('positionedWidth').toString(), htmlSafe('width:' + Math.round((3 / 8) * 100) + '%'));
    assert.equal(component.get('certifiedWidth').toString(), htmlSafe('width:' + Math.round((2 / 8) * 100) + '%'));
    assert.equal(component.get('competenceJury.width').toString(), htmlSafe('width:' + Math.round((3 / 8) * 100) + '%'));
  });

  test('it should retrieve answers from competence', async function(assert) {
    // given
    const component = this.owner.factoryFor('component:certification-details-competence').create();

    // when
    component.set('competence', competence('ok', 'partially', 'ko'));

    // then
    assert.deepEqual(component.get('answers'), [answer('ok'), answer('partially'), answer('ko')]);
  });

});
