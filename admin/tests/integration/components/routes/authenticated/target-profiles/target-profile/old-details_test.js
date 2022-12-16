import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/target-profiles/target-profile | old-details', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display specific text when profile has no content', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.targetProfile = store.createRecord('target-profile', { oldAreas: [] });

    // when
    const screen = await render(hbs`<TargetProfiles::OldDetails @targetProfile={{this.targetProfile}} />`);

    // then
    assert.dom(screen.getByText('Profil cible vide.')).exists();
  });

  module('when target profile has content', function (hooks) {
    let targetProfile;

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');
      const skill1 = store.createRecord('old-skill', {
        id: 'skill1',
        name: '@skill1',
        difficulty: 5,
      });
      const skill2 = store.createRecord('old-skill', {
        id: 'skill2',
        name: '@skill2',
        difficulty: 2,
      });
      const tube1 = store.createRecord('old-tube', {
        id: 'tube1',
        practicalTitle: 'Tube 1',
        skills: [skill1],
      });
      const tube2 = store.createRecord('old-tube', {
        id: 'tube2',
        practicalTitle: 'Tube 2',
        skills: [skill2],
      });
      const competence1 = store.createRecord('old-competence', {
        id: 'comp1',
        name: 'Competence 1',
        index: '1.1',
        tubes: [tube1],
      });
      const competence2 = store.createRecord('old-competence', {
        id: 'comp2',
        name: 'Competence 2',
        index: '2.1',
        tubes: [tube2],
      });
      const area1 = store.createRecord('old-area', {
        id: 'area1',
        title: 'Area 1',
        code: '1',
        competences: [competence1],
      });
      const area2 = store.createRecord('old-area', {
        id: 'area2',
        title: 'Area 2',
        code: '2',
        competences: [competence2],
      });
      targetProfile = store.createRecord('target-profile', { oldAreas: [area1, area2] });
    });

    test('it should display areas, competences and tubes', async function (assert) {
      // given
      this.targetProfile = targetProfile;

      // when
      const screen = await render(hbs`<TargetProfiles::OldDetails @targetProfile={{this.targetProfile}} />`);

      // then
      assert.dom(screen.queryByText('Area 1')).exists();
      assert.dom(screen.queryByText('Area 2')).exists();
      assert.dom(screen.queryByText('Competence 1')).exists();
      assert.dom(screen.queryByText('Competence 2')).exists();
      assert.dom(screen.queryByText('Tube 1')).exists();
      assert.dom(screen.queryByText('Tube 2')).exists();
    });

    test('it should fill with checks present skills and with crosses missing skills in the table', async function (assert) {
      // given
      this.targetProfile = targetProfile;

      // when
      await render(hbs`<TargetProfiles::OldDetails @targetProfile={{this.targetProfile}} />`);

      // then
      assert.dom('[data-icon="check"]').exists({ count: 2 });
      assert.dom('[data-icon="xmark"]').exists({ count: 14 });
    });
  });
});
