import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | TargetProfiles:TubesSelection::Tube', function (hooks) {
  setupRenderingTest(hooks);
  let setLevelTube;
  let tube;

  hooks.beforeEach(function () {
    tube = {
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

    setLevelTube = sinon.stub();

    this.set('tube', tube);
    this.set('thematic', thematic);
    this.set('competence', competence);
    this.set('setLevelTube', setLevelTube);
  });

  test('it should disable level select if tube is not selected', async function (assert) {
    // given
    const selectedTubeIds = ['tubeId2', 'tubeId3'];
    this.set('selectedTubeIds', selectedTubeIds);

    // when
    await render(
      hbs`<TargetProfiles::TubesSelection::Tube @competence={{this.competence}}
                          @thematic={{this.thematic}}
                          @tube={{this.tube}}
                          @setLevelTube={{this.setLevelTube}}
                          @selectedTubeIds={{this.selectedTubeIds}}/>`
    );
    const select = document.getElementById('select-level-tube-tubeId1');

    // then
    assert.dom(select).isDisabled();
  });

  test('it should not disable level select is tubes is selected', async function (assert) {
    // given
    const selectedTubeIds = ['tubeId1', 'tubeId2'];
    this.set('selectedTubeIds', selectedTubeIds);

    // when
    await render(
      hbs`<TargetProfiles::TubesSelection::Tube @competence={{this.competence}}
                          @thematic={{this.thematic}}
                          @tube={{this.tube}}
                          @setLevelTube={{this.setLevelTube}}
                          @selectedTubeIds={{this.selectedTubeIds}}/>`
    );
    const select = document.getElementById('select-level-tube-tubeId1');

    // then
    assert.dom(select).isNotDisabled();
  });
});
