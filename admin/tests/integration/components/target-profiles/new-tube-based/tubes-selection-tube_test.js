import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | targetProfiles:NewTubeBased::TubesSelectionTube', function (hooks) {
  setupRenderingTest(hooks);
  let updateSelectedTubes;
  let setLevelTube;

  hooks.beforeEach(function () {
    const tube = {
      id: 'tubeId1',
      practicalTitle: 'Tube 1',
      practicalDescription: 'Description 1',
    };

    const thematic = { id: 'thematicId1', name: 'thematic1' };

    const competence = {
      id: 'competenceId',
      index: '1',
      name: 'Titre competence',
    };

    updateSelectedTubes = sinon.stub();
    setLevelTube = sinon.stub();

    this.set('tube', tube);
    this.set('thematic', thematic);
    this.set('competence', competence);
    this.set('updateSelectedTubes', updateSelectedTubes);
    this.set('setLevelTube', setLevelTube);
  });

  test('it should disable level select is tubes is not selected', async function (assert) {
    // given
    this.set('tubesSelected', []);

    // when
    await render(
      hbs`<TargetProfiles::NewTubeBased::TubesSelectionTube @competence={{this.competence}}
                          @thematic={{this.thematic}}
                          @tube={{this.tube}}
                          @updateSelectedTubes={{this.updateSelectedTubes}}
                          @setLevelTube={{this.setLevelTube}}
                          @tubesSelected={{this.tubesSelected}}/>`
    );
    const select = document.getElementById('select-level-tube-tubeId1');

    // then
    assert.dom(select).isDisabled();
  });

  test('it should not disable level select is tubes is selected', async function (assert) {
    // given
    this.set('tubesSelected', [{ id: 'tubeId1' }]);

    // when
    await render(
      hbs`<TargetProfiles::NewTubeBased::TubesSelectionTube @competence={{this.competence}}
                          @thematic={{this.thematic}}
                          @tube={{this.tube}}
                          @updateSelectedTubes={{this.updateSelectedTubes}}
                          @setLevelTube={{this.setLevelTube}}
                          @tubesSelected={{this.tubesSelected}}/>`
    );
    const select = document.getElementById('select-level-tube-tubeId1');

    // then
    assert.dom(select).isNotDisabled();
  });
});
