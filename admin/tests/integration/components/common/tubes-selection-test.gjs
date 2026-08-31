import { clickByName, render, within } from '@1024pix/ember-testing-library';
import { click, triggerEvent } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import TubesSelection from 'pix-admin/components/common/tubes-selection';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Common::TubesSelection', function (hooks) {
  setupRenderingTest(hooks);
  let screen;

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');
    const frameworks = _createFrameworks(store);

    const onChangeFunction = sinon.stub();

    screen = await render(
      <template>
        <TubesSelection
          @frameworks={{frameworks}}
          @onChange={{onChangeFunction}}
          @displayJsonImportButton={{true}}
          @displayDeviceCompatibility={{true}}
        />
      </template>,
    );
  });

  test('it should display a list of tubes', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');

    // then
    assert.dom(screen.getByText('@tubeName1 : Tube 1')).exists();
    assert.dom(screen.getByText('@tubeName2 : Tube 2')).exists();
    assert.dom(screen.getByText('@tubeName3 : Tube 3')).exists();
  });

  test('it should display a list of tubes without clicking on each accordion on expand all', async function (assert) {
    // when
    await clickByName('Tout déplier');

    // then
    assert.dom(screen.getByText('@tubeName1 : Tube 1')).isVisible();
    assert.dom(screen.getByText('@tubeName2 : Tube 2')).isVisible();
    assert.dom(screen.getByText('@tubeName3 : Tube 3')).isVisible();
  });

  test('it should hide the tubes on collapse all', async function (assert) {
    // given
    await clickByName('Tout déplier');

    // when
    await clickByName('Tout replier');

    // then
    assert.dom(screen.getByText('@tubeName1 : Tube 1')).isNotVisible();
  });

  test('it should check the tubes if selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await click(screen.getByLabelText('@tubeName1 : Tube 1'));

    // then
    assert.dom(screen.getByLabelText('@tubeName1 : Tube 1')).isChecked();
  });

  test('it should check tube on level selection', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName(/Sélection du niveau du sujet suivant : Tube 1/);
    await click(within(await screen.findByRole('listbox')).getByRole('option', { name: '4' }));

    // then
    assert.dom(screen.getByLabelText('@tubeName1 : Tube 1')).isChecked();
    assert.strictEqual(
      screen.queryByRole('button', { name: /Sélection du niveau du sujet suivant : Tube 1/ }).innerText,
      '4',
    );
  });

  test('it should unselect tube level on uncheck', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName(/Sélection du niveau du sujet suivant : Tube 1/);
    await click(within(await screen.findByRole('listbox')).getByRole('option', { name: '4' }));
    await click(screen.getByLabelText('@tubeName1 : Tube 1'));

    // then
    assert.strictEqual(
      screen.queryByRole('button', { name: /Sélection du niveau du sujet suivant : Tube 1/ }).innerText,
      'À sélectionner',
    );
  });

  test('it should check all tubes corresponding to the thematics if a thematic is selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Thématique 1');

    // then
    assert.dom(screen.getByLabelText('@tubeName1 : Tube 1')).isChecked();
    assert.dom(screen.getByLabelText('@tubeName2 : Tube 2')).isChecked();

    assert.dom(screen.getByLabelText('Thématiques')).hasClass('pix-checkbox__input--indeterminate');
  });

  test('it should check the thematic if all corresponding tubes are selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await click(screen.getByLabelText('@tubeName1 : Tube 1'));
    await click(screen.getByLabelText('@tubeName2 : Tube 2'));

    // then
    assert.dom(screen.getByLabelText('Thématique 1')).isChecked();
    assert.dom(screen.getByLabelText('Thématiques')).hasClass('pix-checkbox__input--indeterminate');
  });

  test('it should indeterminate the thematic if not all of corresponding tubes are selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await click(screen.getByLabelText('@tubeName1 : Tube 1'));

    // then
    screen.getByLabelText('Thématique 1').classList.value.includes('indeterminate');
    assert.dom(screen.getByLabelText('Thématiques')).hasClass('pix-checkbox__input--indeterminate');
  });

  test('it should check the competence if all corresponding thematics are selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Thématique 1');
    await clickByName('Thématique 2');

    // then
    assert.dom(screen.getByLabelText('Thématiques')).isChecked();
  });

  test('it should check the thematics and tubes if competence is selected', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Thématiques');

    // then
    assert.dom(screen.getByLabelText('Thématique 1')).isChecked();
    assert.dom(screen.getByLabelText('Thématique 2')).isChecked();

    assert.dom(screen.getByLabelText('@tubeName1 : Tube 1')).isChecked();
    assert.dom(screen.getByLabelText('@tubeName2 : Tube 2')).isChecked();
    assert.dom(screen.getByLabelText('@tubeName3 : Tube 3')).isChecked();
  });

  test('it should show the total number of tubes and selected tubes', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await click(screen.getByLabelText('@tubeName1 : Tube 1'));

    // then
    assert.dom(screen.getByText('1/3 sujet(s) sélectionné(s)')).exists();
  });

  test('it should show compatibility column ', async function (assert) {
    // when
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');

    // then
    assert.dom(screen.getByText('Compatibilité')).exists();
  });

  module('#import tubes preselection or target profile export', function () {
    test('it should display a button to import JSON file', async function (assert) {
      // then
      assert.dom(await screen.getByRole('button', { name: 'Référentiels :' })).exists();
      assert.dom(await screen.findByText('Importer un fichier JSON')).exists();
    });

    module('when import succeeds', function () {
      test('it should update areas and skills list', async function (assert) {
        // given
        const jsonFileContent = [
          JSON.stringify([
            {
              id: 'tubeId1',
              level: 2,
              frameworkId: 'pixPlusFrameworkId',
            },
            {
              id: 'tubeId3',
              level: 2,
              frameworkId: 'pixPlusFrameworkId',
            },
          ]),
        ];

        // when
        await triggerEvent('input[type="file"]', 'change', {
          files: [new File(jsonFileContent, 'file-to-upload.json')],
        });

        // then
        assert.dom(await screen.findByText('2/3 sujet(s) sélectionné(s)')).exists();
      });
    });
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

  const thematics = [
    store.createRecord('thematic', { id: 'thematicId1', name: 'Thématique 1', tubes: tubes1 }),
    store.createRecord('thematic', { id: 'thematicId2', name: 'Thématique 2', tubes: tubes2 }),
  ];

  const competences = [
    store.createRecord('competence', {
      id: 'competenceId',
      index: '1',
      name: 'Titre competence',
      thematics,
    }),
  ];

  const areas = [
    store.createRecord('area', {
      id: 'areaId',
      title: 'Titre domaine',
      code: 1,
      competences,
    }),
  ];

  const framework = store.createRecord('framework', { id: 'frameworkId', name: 'Pix', areas });
  const framework2 = store.createRecord('framework', {
    id: 'pixPlusFrameworkId',
    name: 'Pix plus',
    areas: [
      store.createRecord('area', {
        id: 'pixPlusAreaId',
        title: 'Area pix plus',
        code: 2,
        competences,
      }),
    ],
  });

  return [framework, framework2];
}
