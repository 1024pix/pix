import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';

module('Integration | Component | certification-details-competence', function(hooks) {
  setupRenderingTest(hooks);

  const answer = (result) => {
    return {
      skill:'@skill1',
      challengeId:'rec12345',
      order:'1',
      result:result
    };
  };

  const competence = (...result) => {
    return {
      name: 'Une compétence',
      index: '1.1',
      positionedLevel: 3,
      positionedScore: 26,
      obtainedLevel: -1,
      obtainedScore: 0,
      answers:[answer(result[0]), answer(result[1]), answer(result[2])]
    };
  };

  test('it renders', async function(assert) {
    // given
    this.set('competenceData', competence('ok', 'ko', 'partially'));
    this.set('externalAction', () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=false onUpdateRate=(action externalAction)}}`);

    // then
    assert.dom('.certification-details-competence').exists();
  });

  test('it should not render jury values when no jury values are set', async function(assert) {
    // given
    this.set('competenceData', competence('ok', 'ko', 'partially'));
    this.set('externalAction', () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=false onUpdateRate=(action externalAction)}}`);

    // then
    assert.dom('.jury').doesNotExist();
  });

  test('it should render jury values when these values are set', async function(assert) {
    // given
    this.set('competenceData', competence('ok', 'ok', 'ko'));
    this.set('externalAction', () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=70 onUpdateRate=(action externalAction)}}`);

    // then
    assert.dom('.jury.competence-level').exists();
    assert.dom('.jury.competence-score').exists();
    assert.dom('.jury.competence-level').hasText('2');
    assert.dom('.jury.competence-score').hasText('18 Pix');
    assert.dom('.progress-bar.competence-level.certificate').hasText('-1');
  });

});
