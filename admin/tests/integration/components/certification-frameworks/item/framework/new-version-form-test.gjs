import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import NewVersionForm from 'pix-admin/components/certification-frameworks/item/framework/new-version-form';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | complementary-certifications/item/framework/new-version-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display framework creation form', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const frameworks = _createFrameworks(store);

    store.createRecord('certification-framework', {
      id: 'DROIT',
      name: 'Pix+Droit',
    });

    // when
    const screen = await render(<template><NewVersionForm @frameworks={{frameworks}} @scope="DROIT" /></template>);

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
    assert.ok(screen.getByRole('button', { name: 'Importer un fichier JSON' }));

    const table = screen.getByRole('table', { name: 'Sélection des sujets' });
    assert.ok(within(table).getByRole('columnheader', { name: 'Niveau' }));
    assert.ok(within(table).getByRole('columnheader', { name: 'Compatibilité' }));
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
