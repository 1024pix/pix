import { clickByName, render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import TubeList from 'pix-orga/components/tube/list';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | tube:list', function (hooks) {
  setupIntlRenderingTest(hooks);
  let allFrameworks;
  const MOCK_TODAY = '2020-08-05-1152';

  hooks.beforeEach(function () {
    sinon.useFakeTimers({
      now: new Date('2020-08-05T11:52:00Z'),
      shouldAdvanceTime: true,
    });
    const tubesPix = [
      {
        id: 'tubeId1Pix',
        practicalTitle: 'Titre 1 Tube Pix',
        practicalDescription: 'Description 1',
        skills: [
          { id: 'tubeId1Pix_skill1', difficulty: 1 },
          { id: 'tubeId1Pix_skill2', difficulty: 2 },
        ],
      },
      {
        id: 'tubeId2Pix',
        practicalTitle: 'Titre 2 Tube Pix',
        practicalDescription: 'Description 2',
        skills: [
          { id: 'tubeId2Pix_skill1', difficulty: 2 },
          { id: 'tubeId2Pix_skill2', difficulty: 3 },
        ],
      },
    ];
    const thematicsPix = [
      {
        id: 'thematicId',
        name: 'thematic1',
        tubes: tubesPix,
        get sortedTubes() {
          return tubesPix;
        },
      },
    ];
    const competencesPix = [
      {
        thematics: thematicsPix,
        get sortedThematics() {
          return thematicsPix;
        },
      },
    ];
    const areasPix = [
      {
        title: 'Titre domaine Pix',
        code: 1,
        competences: competencesPix,
        get sortedCompetences() {
          return competencesPix;
        },
      },
    ];

    const tubesEdu = [
      {
        id: 'tubeIdEdu1',
        practicalTitle: 'Titre 1 Tube Edu',
        practicalDescription: 'Description 1',
        skills: [
          { id: 'tubeIdEdu1_skill1', difficulty: 2 },
          { id: 'tubeIdEdu1_skill2', difficulty: 4 },
        ],
      },
    ];
    const thematicsEdu = [
      {
        id: 'thematicId',
        name: 'thematic1',
        tubes: tubesEdu,
        get sortedTubes() {
          return tubesEdu;
        },
      },
    ];
    const competencesEdu = [
      {
        thematics: thematicsEdu,
        get sortedThematics() {
          return thematicsEdu;
        },
      },
    ];
    const areasEdu = [
      {
        title: 'Titre domaine Edu',
        code: 1,
        competences: competencesEdu,
        get sortedCompetences() {
          return competencesEdu;
        },
      },
    ];

    allFrameworks = [
      {
        id: 'fmkId1',
        name: 'Pix',
        areas: areasPix,
        get sortedAreas() {
          return areasPix;
        },
      },
      {
        id: 'fmkId2',
        name: 'Edu+',
        areas: areasEdu,
        get sortedAreas() {
          return areasEdu;
        },
      },
    ];
  });

  test('it should display frameworks title', async function (assert) {
    // given
    const frameworks = allFrameworks.slice();

    // when
    const screen = await render(<template><TubeList @frameworks={{frameworks}} /></template>);
    assert.ok(screen.getByRole('heading', { level: 2, name: 'Pix' }));
    assert.ok(screen.getByRole('heading', { level: 2, name: 'Edu+' }));
  });

  test('it should display a list of tubes', async function (assert) {
    // given
    const frameworks = allFrameworks.slice();

    // when
    const screen = await render(<template><TubeList @frameworks={{frameworks}} /></template>);
    const button = screen.getByRole('button', { name: '1 · Titre domaine Pix' });
    await click(button);

    // then
    assert.dom(screen.getByLabelText('Titre 1 Tube Pix : Description 1')).exists();
    assert.dom(screen.getByLabelText('Titre 2 Tube Pix : Description 2')).exists();
  });

  test('it should disable the download button if not tube is selected', async function (assert) {
    // given
    const frameworks = allFrameworks.slice();

    // when
    const screen = await render(<template><TubeList @frameworks={{frameworks}} /></template>);

    // then
    assert
      .dom(screen.getByRole('button', { name: 'Télécharger la sélection des sujets (JSON, 0.00ko)', hidden: true }))
      .hasAttribute('aria-disabled', 'true');
  });

  test('it should enable the download button if a tube is selected', async function (assert) {
    // given
    const expectedAttr = `selection-sujets-mon orga-${MOCK_TODAY}.json`;
    const organization = { name: 'mon orga' };
    const frameworks = allFrameworks.slice();

    const screen = await render(
      <template><TubeList @frameworks={{frameworks}} @organization={{organization}} /></template>,
    );

    await clickByName('1 · Titre domaine Pix');
    await clickByName('Titre 1 Tube Pix : Description 1');

    // then

    assert.dom(screen.getByText(/Télécharger la sélection des sujets \(1\)/)).doesNotHaveClass('pix-button--disabled');
    assert.dom(screen.getByText(/Télécharger la sélection des sujets \(1\)/)).hasAttribute('download', expectedAttr);
  });

  test('it should track the download event when the download button is clicked', async function (assert) {
    // given
    sinon.stub(URL, 'createObjectURL').returns('blob:fake-url');
    sinon.stub(URL, 'revokeObjectURL');

    const frameworks = allFrameworks.slice();
    const organization = { name: 'mon orga' };
    const pixMetrics = this.owner.lookup('service:pix-metrics');
    const trackEventStub = sinon.stub(pixMetrics, 'trackEvent');

    await render(<template><TubeList @frameworks={{frameworks}} @organization={{organization}} /></template>);

    await clickByName('1 · Titre domaine Pix');
    await clickByName('Titre 1 Tube Pix : Description 1');

    // when
    await clickByName(/Télécharger la sélection des sujets \(1\)/);

    // then
    assert.ok(trackEventStub.calledOnceWith('tubesSelectionDownloadJsonClick'));
  });

  test('Enable the download button if a thematic is selected', async function (assert) {
    // given
    const frameworks = allFrameworks.slice();

    // when
    await render(<template><TubeList @frameworks={{frameworks}} /></template>);

    await clickByName('1 · Titre domaine Pix');
    await clickByName('thematic1');

    // then
    assert.dom('.download-file__button').doesNotHaveClass('pix-button--disabled');
  });

  test('Should check all tubes corresponding to the thematics if a thematic is selected', async function (assert) {
    // given
    const frameworks = allFrameworks.slice();

    // when
    const screen = await render(<template><TubeList @frameworks={{frameworks}} /></template>);

    await clickByName('1 · Titre domaine Pix');
    await clickByName('thematic1');

    // then
    assert.dom(screen.getByLabelText('Titre 1 Tube Pix : Description 1')).isChecked();
    assert.dom(screen.getByLabelText('Titre 2 Tube Pix : Description 2')).isChecked();
  });

  test('Should check the thematics if all corresponding tubes are selected', async function (assert) {
    // given
    const frameworks = allFrameworks.slice();

    // when
    const screen = await render(<template><TubeList @frameworks={{frameworks}} /></template>);

    await clickByName('1 · Titre domaine Pix');
    await clickByName('Titre 1 Tube Pix : Description 1');
    await clickByName('Titre 2 Tube Pix : Description 2');

    // then
    assert.dom(screen.getByLabelText('thematic1')).isChecked();
  });
  module('tube levels', function () {
    test('it should select corresponding tube and thematics when user select a level', async function (assert) {
      // given
      const frameworks = allFrameworks.slice();

      // when
      const screen = await render(<template><TubeList @frameworks={{frameworks}} /></template>);

      await click(screen.getByRole('button', { name: /1 · Titre domaine Pix/ }));

      await click(
        screen.getByLabelText(t('pages.preselect-target-profile.levels.label', { title: 'Titre 1 Tube Pix' })),
      );

      const listbox = await screen.findByRole('listbox');
      await click(within(listbox).getByRole('option', { name: 3 }));

      assert.dom(screen.getByLabelText('Titre 1 Tube Pix : Description 1')).isChecked();
      assert.dom(screen.getByLabelText('thematic1')).isChecked();
    });

    test('it should set tube level in downloaded file', async function (assert) {
      // given
      let capturedBlob;
      sinon.stub(URL, 'createObjectURL').callsFake((blob) => {
        capturedBlob = blob;
        return 'blob:fake-url';
      });

      const frameworks = allFrameworks.slice();
      const screen = await render(<template><TubeList @frameworks={{frameworks}} /></template>);

      await click(screen.getByRole('button', { name: /1 · Titre domaine Pix/ }));
      await click(
        screen.getByLabelText(t('pages.preselect-target-profile.levels.label', { title: 'Titre 1 Tube Pix' })),
      );
      const listbox = await screen.findByRole('listbox');
      await click(within(listbox).getByRole('option', { name: 3 }));

      // when
      const text = await capturedBlob.text();
      const content = JSON.parse(text);

      // then
      assert.deepEqual(content, [{ id: 'tubeId1Pix', frameworkId: 'fmkId1', level: 3 }]);
    });
  });
});
