import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';

module('Integration | Component | certification-details-competence', function(hooks) {
  setupRenderingTest(hooks);

  let answer = (result) => {
    return {
      skill:"@skill1",
      challengeId:"rec12345",
      order:"1",
      result:result
    }
  };

  let competence = (...result) => {
    return {
      name: "Une compétence",
      index: "1.1",
      positionedLevel: 3,
      positionedScore: 26,
      obtainedLevel: -1,
      obtainedScore: 0,
      answers:[answer(result[0]), answer(result[1]), answer(result[2])]
    }
  }

  test('it renders', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ko", "partially"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=false updateRate=(action externalAction)}}`);

    // then
    assert.dom('.certification-details-competence').exists();
  });

  test('it should not render jury values when no jury rate is set', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ko", "partially"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=false updateRate=(action externalAction)}}`);

    // then
    assert.dom('.jury').doesNotExist();
  });

  test('it should render jury values when a jury rate is set and score differs', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ok", "ko"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=70 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').exists();
    assert.dom('.jury.competence-score').exists();
  });

  test('it should not render jury values when a jury rate is set and score does not differ', async function(assert) {
    // given
    this.set("competenceData", competence("ko", "ko", "ko"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=70 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').doesNotExist();
    assert.dom('.jury.competence-score').doesNotExist();
  });

  test('it should give level n when jury rate is set and 3 ok', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ok", "ok"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=70 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').hasText("3");
    assert.dom('.jury.competence-score').hasText("26 Pix");
  });

  test('it should give level n when jury rate is set to 81 and 2 ok and 1 ko', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ok", "ko"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=81 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').hasText("3");
    assert.dom('.jury.competence-score').hasText("26 Pix");
  });

  test('it should give level n when jury rate is set to 81 and 2 ok and 1 aband', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ok", "aband"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=81 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').hasText("3");
    assert.dom('.jury.competence-score').hasText("26 Pix");
  });

  test('it should give level n when jury rate is set to 81 and 2 ok and 1 partially', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ok", "partially"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=81 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').hasText("3");
    assert.dom('.jury.competence-score').hasText("26 Pix");
  });

  test('it should give level n when jury rate is set to 81 and 2 ok and 1 timedout', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ok", "timedout"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=81 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').hasText("3");
    assert.dom('.jury.competence-score').hasText("26 Pix");
  });

  test('it should give level n-1 when jury rate is set to 65 and 2 ok and 1 ko', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ok", "ko"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=65 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').hasText("2");
    assert.dom('.jury.competence-score').hasText("18 Pix");
  });

  test('it should give level n-1 when jury rate is set to 65 and 2 ok and 1 aband', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ok", "aband"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=65 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').hasText("2");
    assert.dom('.jury.competence-score').hasText("18 Pix");
  });

  test('it should give level n-1 when jury rate is set to 65 and 2 ok and 1 partially', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ok", "partially"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=65 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').hasText("2");
    assert.dom('.jury.competence-score').hasText("18 Pix");
  });

  test('it should give level n-1 when jury rate is set to 65 and 2 ok and 1 timedout', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ok", "timedout"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=65 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').hasText("2");
    assert.dom('.jury.competence-score').hasText("18 Pix");
  });

  test('it should give level -1 when jury rate is set and 1 ok', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ko", "aband"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=90 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    // Elements not displayed since score is unchanged (-1)
    assert.dom('.jury.competence-level').doesNotExist();
    assert.dom('.jury.competence-score').doesNotExist();
  });

  test('it should give level -1 when jury rate is set to 49', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ok", "ok"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=49 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    // Elements not displayed since score is unchanged (-1)
    assert.dom('.jury.competence-level').doesNotExist();
    assert.dom('.jury.competence-score').doesNotExist();
  });


  // SKIP

  test('it should give level n when jury rate is set to 81 and 2 ok and 1 skip', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ok", "skip"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=81 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').hasText("3");
    assert.dom('.jury.competence-score').hasText("26 Pix");
  });

  test('it should give level n when jury rate is set to 65 and 2 ok and 1 skip', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ok", "skip"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=65 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').hasText("3");
    assert.dom('.jury.competence-score').hasText("26 Pix");
  });

  test('it should give level n when jury rate is set to 90, 1 ok, 1 partially, 1 skip', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "partially", "skip"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=90 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').hasText("3");
    assert.dom('.jury.competence-score').hasText("26 Pix");
  });

  test('it should give level n when jury rate is set to 65, 1 ok, 1 partially, 1 skip', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "partially", "skip"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=65 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    assert.dom('.jury.competence-level').hasText("2");
    assert.dom('.jury.competence-score').hasText("18 Pix");
  });

  test('it should give level -1 when jury rate is set, 1 ok, 1 ko, 1 skip', async function(assert) {
    // given
    this.set("competenceData", competence("ok", "ko", "skip"));
    this.set("externalAction", () => {
      return resolve();
    });

    // when
    await render(hbs`{{certification-details-competence competence=competenceData rate=60 juryRate=90 updateRate=(action externalAction)}}`);

    // then
    assert.expect(2);
    // Elements not displayed since score is unchanged (-1)
    assert.dom('.jury.competence-level').doesNotExist();
    assert.dom('.jury.competence-score').doesNotExist();
  })

});
