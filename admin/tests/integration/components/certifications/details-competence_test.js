import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | certifications/details-competence', function (hooks) {
  setupRenderingTest(hooks);

  const answer = (result) => {
    return {
      skill: '@skill1',
      challengeId: 'rec12345',
      order: '1',
      result: result,
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
      answers: [answer(result[0]), answer(result[1]), answer(result[2])],
    };
  };

  test('it renders', async function (assert) {
    // given
    this.set('competenceData', competence('ok', 'ko', 'partially'));

    // when
    const screen = await render(
      hbs`<Certifications::DetailsCompetence
  @competence={{this.competenceData}}
  rate={{60}}
/>`,
    );

    // then
    assert.dom(screen.getByText('1.1 Une compétence')).exists();
    assert.dom(screen.getByLabelText('Jauge de compétences positionnées')).exists();
    assert.dom(screen.getByLabelText('Jauge de compétences certifiées')).exists();
  });
});
