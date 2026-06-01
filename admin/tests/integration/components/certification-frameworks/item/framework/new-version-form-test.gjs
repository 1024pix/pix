import { clickByName, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import NewVersionForm from 'pix-admin/components/certification-frameworks/item/framework/new-version-form';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | complementary-certifications/item/framework/new-version-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display framework creation form when there is no active version', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const frameworks = _createFrameworks(store);

    // when
    const screen = await render(<template><NewVersionForm @frameworks={{frameworks}} @scope="DROIT" /></template>);

    assert.dom(screen.getByRole('button', { name: 'Référentiels :' })).exists();
    await click(screen.getByRole('button', { name: 'Référentiels :' }));
    assert.dom(await screen.findByRole('checkbox', { name: 'Pix' })).isChecked();
    assert
      .dom(
        screen.getByRole('button', {
          name: t('components.certification-frameworks.item.framework.new-version-form.submit-button'),
        }),
      )
      .hasAttribute('aria-disabled');

    await click(screen.getByText('1 · Titre domaine'));
    await click(screen.getByText('1 Titre competence'));
    await click(screen.getByLabelText('@tubeName1 : Tube 1'));

    // then
    assert.ok(
      screen.getByRole('heading', {
        name: t('components.certification-frameworks.item.framework.new-version-form.title'),
        level: 2,
      }),
    );
    assert
      .dom(
        screen.getByRole('button', {
          name: t('components.certification-frameworks.item.framework.new-version-form.submit-button'),
        }),
      )
      .doesNotHaveAttribute('aria-disabled');
    assert.ok(screen.getByText(t('common.actions.cancel')));
  });

  test('it should pre-select tubes if an active version is loaded along', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const frameworks = _createFrameworks(store);

    const activeVersion = store.createRecord('certification-version', {
      id: '456',
      startDate: new Date('2023-10-10'),
      assessmentDuration: 90,
      minimumAnswersRequiredForValidation: 20,
      maximumAssessmentLength: 32,
      comments: '',
      areas: [...frameworks[0].hasMany('areas').value(), ...frameworks[1].hasMany('areas').value()],
    });

    // when
    const screen = await render(
      <template><NewVersionForm @frameworks={{frameworks}} @scope="PIX" @activeVersion={{activeVersion}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('button', { name: 'Référentiels :' })).exists();
    await click(screen.getByRole('button', { name: 'Référentiels :' }));
    assert.dom(await screen.findByRole('checkbox', { name: 'Pix' })).isChecked();
    assert.dom(await screen.findByRole('checkbox', { name: 'Pix plus' })).isChecked();

    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    assert.dom(await screen.getByLabelText('@tubeName1 : Tube 1')).isChecked();
    assert.dom(await screen.getByLabelText('@tubeName2 : Tube 2')).isChecked();
    assert.dom(await screen.getByLabelText('@tubeName3 : Tube 3')).isChecked();

    await clickByName('1 · Titre domaine 2');
    await clickByName('1 Titre competence 2');
    assert.dom(await screen.getByLabelText('@tubeName4 : Tube 4')).isChecked();
  });
});

function _createFrameworks(store) {
  const tubes1 = [
    store.createRecord('tube', {
      id: 'tubeId1',
      name: '@tubeName1',
      practicalTitle: 'Tube 1',
      skills: [],
      level: 8,
    }),
    store.createRecord('tube', {
      id: 'tubeId2',
      name: '@tubeName2',
      practicalTitle: 'Tube 2',
      skills: [],
      level: 8,
    }),
  ];

  const tubes2 = [
    store.createRecord('tube', {
      id: 'tubeId3',
      name: '@tubeName3',
      practicalTitle: 'Tube 3',
      skills: [],
      level: 8,
    }),
  ];

  const otherTubes = [
    store.createRecord('tube', {
      id: 'tubeId4',
      name: '@tubeName4',
      practicalTitle: 'Tube 4',
      skills: [],
      level: 8,
    }),
  ];

  const thematics = [
    store.createRecord('thematic', { id: 'thematicId1', name: 'Thématique 1', tubes: tubes1 }),
    store.createRecord('thematic', { id: 'thematicId2', name: 'Thématique 2', tubes: tubes2 }),
  ];

  const thematics2 = [store.createRecord('thematic', { id: 'thematicId3', name: 'Thématique 3', tubes: otherTubes })];

  const competences = [
    store.createRecord('competence', {
      id: 'competenceId',
      index: '1',
      name: 'Titre competence',
      thematics,
    }),
  ];

  const competences2 = [
    store.createRecord('competence', {
      id: 'competenceId2',
      index: '1',
      name: 'Titre competence 2',
      thematics: thematics2,
    }),
  ];

  const areas = [
    store.createRecord('area', {
      id: 'areaId',
      title: 'Titre domaine',
      code: 1,
      competences,
      frameworkId: 'frameworkId',
    }),
  ];

  const areas2 = [
    store.createRecord('area', {
      id: 'areaId2',
      title: 'Titre domaine 2',
      code: 1,
      competences: competences2,
      frameworkId: 'pixPlusFrameworkId',
    }),
  ];

  const framework = store.createRecord('framework', { id: 'frameworkId', name: 'Pix', areas });
  const framework2 = store.createRecord('framework', {
    id: 'pixPlusFrameworkId',
    name: 'Pix plus',
    areas: areas2,
  });

  const framework3 = store.createRecord('framework', {
    id: 'pixPlusDroitId',
    name: 'DROIT',
  });

  return [framework, framework2, framework3];
}
