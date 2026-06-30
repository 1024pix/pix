import { clickByName, render } from '@1024pix/ember-testing-library';
import FrameworkContentDetails from 'pix-admin/components/certification-frameworks/certification-framework/modal/framework-content-details';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Component | Complementary certifications/certification-framework/modal | Framework content details',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    module('when the current framework has at least one tube', function () {
      test('it should display the framework areas', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const areas = _buildAreas(store);

        // when
        const screen = await render(<template><FrameworkContentDetails @areas={{areas}} /></template>);

        // then
        await clickByName('area1 code · area1 title');
        await clickByName('competenceForArea1 index competenceForArea1 name');
        assert.dom(screen.getByText('thematicForArea1 name')).exists();
        assert.dom(screen.getByText('tubeForArea1 name : tubeForArea1 practicalTitle')).exists();
        assert.strictEqual(this.element.querySelector('.skill-square__active').innerText, '3');
        assert.dom(screen.getByText('tube2ForArea1 name : tube2ForArea1 practicalTitle')).exists();

        await clickByName('area2 code · area2 title');
        await clickByName('competenceForArea2 index competenceForArea2 name');
        assert.dom(screen.getByText('thematicForArea2 name')).exists();
        assert.dom(screen.getByText('tubeForArea2 name : tubeForArea2 practicalTitle')).exists();
      });
    });
  },
);

function _buildAreas(store) {
  const skill = store.createRecord('skill', { id: 'skill1', difficulty: 3 });
  const tubeForArea1 = store.createRecord('tube', {
    id: 'tubeForArea1',
    name: 'tubeForArea1 name',
    practicalTitle: 'tubeForArea1 practicalTitle',
    skills: [skill],
  });
  const tube2ForArea1 = store.createRecord('tube', {
    id: 'tube2ForArea1',
    name: 'tube2ForArea1 name',
    practicalTitle: 'tube2ForArea1 practicalTitle',
  });
  const thematicForArea1 = store.createRecord('thematic', {
    id: 'thematicForArea1',
    name: 'thematicForArea1 name',
    index: 'thematicForArea1 index',
    tubes: [tubeForArea1, tube2ForArea1],
  });
  const competenceForArea1 = store.createRecord('competence', {
    id: 'competenceForArea1',
    name: 'competenceForArea1 name',
    index: 'competenceForArea1 index',
    thematics: [thematicForArea1],
  });
  const area1 = store.createRecord('area', {
    id: 'area1',
    title: 'area1 title',
    code: 'area1 code',
    color: 'area1 color',
    frameworkId: 'framework-id',
    competences: [competenceForArea1],
  });

  const tubeForArea2 = store.createRecord('tube', {
    id: 'tubeForArea2',
    name: 'tubeForArea2 name',
    practicalTitle: 'tubeForArea2 practicalTitle',
  });
  const thematicForArea2 = store.createRecord('thematic', {
    id: 'thematicForArea2',
    name: 'thematicForArea2 name',
    index: 'thematicForArea2 index',
    tubes: [tubeForArea2],
  });
  const competenceForArea2 = store.createRecord('competence', {
    id: 'competenceForArea2',
    name: 'competenceForArea2 name',
    index: 'competenceForArea2 index',
    thematics: [thematicForArea2],
  });
  const area2 = store.createRecord('area', {
    id: 'area2',
    title: 'area2 title',
    code: 'area2 code',
    color: 'area2 color',
    frameworkId: 'framework-id',
    competences: [competenceForArea2],
  });

  return [area1, area2];
}
