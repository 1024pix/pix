import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, clickByName } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/target-profiles/target-profile | details', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display specific text when profile has no content', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.targetProfile = store.createRecord('target-profile', { newAreas: [] });

    // when
    const screen = await render(hbs`<TargetProfiles::Details @targetProfile={{this.targetProfile}}/>`);

    // then
    assert.dom(screen.getByText('Profil cible vide.')).exists();
  });

  module('when target profile has content', function (hooks) {
    let targetProfile;

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');
      const tube1 = store.createRecord('new-tube', {
        id: 'tube1',
        name: 'nTube1',
        practicalTitle: 'Tube 1',
        level: 5,
        mobile: true,
        tablet: false,
      });
      const tube2 = store.createRecord('new-tube', {
        id: 'tube2',
        name: 'nTube2',
        practicalTitle: 'Tube 2',
        level: 2,
        mobile: false,
        tablet: true,
      });
      const thematic1 = store.createRecord('new-thematic', {
        id: 'them1',
        name: 'Them 1',
        index: '1',
        tubes: [tube1],
      });
      const thematic2 = store.createRecord('new-thematic', {
        id: 'them2',
        name: 'Them 2',
        index: '2',
        tubes: [tube2],
      });
      const competence1 = store.createRecord('new-competence', {
        id: 'comp1',
        name: 'Competence 1',
        index: '1.1',
        thematics: [thematic1],
      });
      const competence2 = store.createRecord('new-competence', {
        id: 'comp2',
        name: 'Competence 2',
        index: '2.1',
        thematics: [thematic2],
      });
      const area1 = store.createRecord('new-area', {
        id: 'area1',
        title: 'Area 1',
        code: '1',
        competences: [competence1],
      });
      const area2 = store.createRecord('new-area', {
        id: 'area2',
        title: 'Area 2',
        code: '2',
        competences: [competence2],
      });
      targetProfile = store.createRecord('target-profile', { newAreas: [area1, area2] });
    });

    test('it should display areas', async function (assert) {
      // given
      this.targetProfile = targetProfile;

      // when
      const screen = await render(hbs`<TargetProfiles::Details @targetProfile={{this.targetProfile}} />`);

      // then
      assert.dom(screen.queryByText('1 · Area 1')).exists();
      assert.dom(screen.queryByText('2 · Area 2')).exists();
    });

    test('it should display competences when clicking on area', async function (assert) {
      // given
      this.targetProfile = targetProfile;
      const screen = await render(hbs`<TargetProfiles::Details @targetProfile={{this.targetProfile}} />`);

      // when
      await clickByName('1 · Area 1');

      // then
      assert.dom(screen.queryByText('1.1 Competence 1')).exists();
      assert.dom(screen.queryByText('2.1 Competence 2')).doesNotExist();
    });

    test('it should display thematics when clicking on competence', async function (assert) {
      // given
      this.targetProfile = targetProfile;
      const screen = await render(hbs`<TargetProfiles::Details @targetProfile={{this.targetProfile}} />`);

      // when
      await clickByName('1 · Area 1');
      await clickByName('1.1 Competence 1');

      // then
      assert.dom(screen.queryByText('Them 1')).exists();
      assert.dom(screen.queryByText('Them 2')).doesNotExist();
    });

    test('it should display tube details when clicking on competence', async function (assert) {
      // given
      this.targetProfile = targetProfile;
      const screen = await render(hbs`<TargetProfiles::Details @targetProfile={{this.targetProfile}} />`);

      // when
      await clickByName('1 · Area 1');
      await clickByName('1.1 Competence 1');

      // then
      assert.dom(screen.queryByText('nTube1 : Tube 1')).exists();
      assert.dom(screen.queryByText('nTube2 : Tube 2')).doesNotExist();
      assert.dom(screen.queryByText('5')).exists();
      assert.dom('[aria-label="incompatible tablette"]').exists();
      assert.dom('[aria-label="compatible mobile"]').exists();
    });
  });
});
