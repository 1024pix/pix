import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { waitFor } from '@testing-library/dom';
import { t } from 'ember-intl/test-support';
import List from 'pix-orga/components/catalogue/list';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Catalogue::List', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('it displays an empty state when there are no items', async function (assert) {
    // given
    const courses = [];
    const updateFilter = sinon.stub();

    // when
    const screen = await render(<template><List @courses={{courses}} @updateFilter={{updateFilter}} /></template>);

    // then
    assert.dom(screen.getByText(t('pages.catalogue.empty-state'))).exists();
  });

  test('it shows all items', async function (assert) {
    // given
    const courses = [
      { name: 'Ma super formation', type: 'targetProfile', nbTubes: 5, category: 'PREDEFINED' },
      { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2 },
    ];
    const updateFilter = sinon.stub();

    // when
    const screen = await render(
      <template><List @updateFilter={{updateFilter}} @courses={{courses}} @type="all" /></template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { level: 3, name: 'Ma super formation' })).exists();
    assert.dom(screen.getByRole('heading', { level: 3, name: 'Mon parcours combiné' })).exists();
  });

  module('filters', function (hooks) {
    let router;

    hooks.beforeEach(function () {
      router = this.owner.lookup('service:router');
      sinon.stub(router, 'transitionTo');
    });

    module('type filters', function () {
      test('it displays navigation links to filter by type', async function (assert) {
        // given
        const courses = [
          { name: 'Ma super formation', type: 'targetProfile', nbTubes: 5, category: 'PREDEFINED' },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2 },
        ];
        const updateFilter = sinon.stub();

        // when
        const screen = await render(
          <template><List @courses={{courses}} @updateFilter={{updateFilter}} @type="blueprint" /></template>,
        );

        // then
        const allLink = screen.getByRole('link', { name: t('pages.catalogue.tab-filters.all') });
        assert.ok(allLink.href.endsWith('/catalogue/all'));
        const targetProfilLink = screen.getByRole('link', { name: t('pages.catalogue.tab-filters.target-profiles') });
        assert.ok(targetProfilLink.href.endsWith('/catalogue/targetProfile'));
        const blueprintLink = screen.getByRole('link', { name: t('pages.catalogue.tab-filters.blueprints') });
        assert.ok(blueprintLink.href.endsWith('/catalogue/blueprint'));
      });

      test('it filters list by type', async function (assert) {
        // given
        const courses = [
          { name: 'Ma super formation', type: 'targetProfile', nbTubes: 5, category: 'PREDEFINED' },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2 },
        ];

        const updateFilter = sinon.stub();

        // when
        const screen = await render(
          <template><List @courses={{courses}} @updateFilter={{updateFilter}} @type="blueprint" /></template>,
        );

        // then
        const items = screen.getAllByRole('heading', { level: 3 });
        assert.strictEqual(items.length, 1);
      });
    });

    module('search filter', function () {
      test('it prefills search input with initials values', async function (assert) {
        // given
        const updateFilter = sinon.stub();
        const search = 'toto';
        const courses = [
          { name: 'Ma super formation', type: 'targetProfile', nbTubes: 5, category: 'PREDEFINED' },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2 },
        ];

        // when
        const screen = await render(
          <template>
            <List @search={{search}} @updateFilter={{updateFilter}} @courses={{courses}} @type="all" />
          </template>,
        );

        // then
        assert.dom(screen.getByLabelText(t('pages.catalogue.filters.name.label'))).hasValue('toto');
      });
      test('it filters items list that match search pattern', async function (assert) {
        // given
        const updateFilter = sinon.stub();
        const search = 'super';
        const courses = [
          { name: 'Ma super formation', type: 'targetProfile', nbTubes: 5, category: 'PREDEFINED' },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2 },
        ];

        // when
        const screen = await render(
          <template>
            <List @search={{search}} @updateFilter={{updateFilter}} @courses={{courses}} @type="all" />
          </template>,
        );

        // then
        assert.strictEqual(screen.getAllByRole('heading', { level: 3 }).length, 1);
        assert.dom(screen.getByRole('heading', { level: 3, name: 'Ma super formation' })).exists();
      });
    });

    module('category filter', function () {
      test('it hides category filter on all page', async function (assert) {
        // given
        const updateFilter = sinon.stub();
        const courses = [
          { name: 'Ma super formation', type: 'targetProfile', nbTubes: 5, category: 'PREDEFINED' },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2 },
        ];

        // when
        const screen = await render(
          <template><List @updateFilter={{updateFilter}} @courses={{courses}} @type="all" /></template>,
        );

        // then
        assert
          .dom(screen.queryByRole('button', { name: t('pages.catalogue.filters.categories.label') }))
          .doesNotExist();
      });
      test('it should be disabled if there are no categories to filter', async function (assert) {
        // given
        const updateFilter = sinon.stub();
        const search = 'combiné';
        const courses = [
          { name: 'Ma super formation', type: 'targetProfile', nbTubes: 5, category: 'PREDEFINED' },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2 },
        ];

        // when
        const screen = await render(
          <template>
            <List @search={{search}} @updateFilter={{updateFilter}} @courses={{courses}} @type="targetProfile" />
          </template>,
        );

        // then
        assert
          .dom(screen.getByRole('button', { name: t('pages.catalogue.filters.categories.label'), hidden: true }))
          .exists();
      });

      test('it preselects category filter with initials values', async function (assert) {
        // given
        const updateFilter = sinon.stub();
        const category = 'PREDEFINED';
        const courses = [
          { name: 'Ma super formation', type: 'targetProfile', nbTubes: 5, category: 'PREDEFINED' },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2 },
        ];

        // when
        const screen = await render(
          <template>
            <List @category={{category}} @updateFilter={{updateFilter}} @courses={{courses}} @type="targetProfile" />
          </template>,
        );
        await click(screen.getByRole('button', { name: t('pages.catalogue.filters.categories.label') }));
        await waitFor(() => screen.findByRole('listbox'));
        // then
        const selectedOption = screen.getByRole('option', { selected: true });
        assert.strictEqual(selectedOption.innerText, t(`pages.campaign-creation.tags.${category}`));
      });

      test('it filters items list that match selected categories', async function (assert) {
        // given
        const updateFilter = sinon.stub();
        const category = 'PREDEFINED';
        const courses = [
          { name: 'Ma super formation', type: 'targetProfile', nbTubes: 5, category: 'PREDEFINED' },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2 },
        ];

        // when
        const screen = await render(
          <template>
            <List @category={{category}} @updateFilter={{updateFilter}} @courses={{courses}} @type="targetProfile" />
          </template>,
        );

        // then
        assert.strictEqual(screen.getAllByRole('heading', { level: 3 }).length, 1);
        assert.dom(screen.getByRole('heading', { level: 3, name: 'Ma super formation' })).exists();
      });
    });

    module('areas filter', function () {
      test('it disables filter when there are no areas to filter', async function (assert) {
        // given
        const updateFilter = sinon.stub();
        const search = 'combiné';
        const area1 = store.createRecord('area', { code: '1', name: 'comp 1', competences: [] });
        const area2 = store.createRecord('area', { code: '1', name: 'comp 2', competences: [] });
        const courses = [
          {
            name: 'Ma super formation',
            type: 'targetProfile',
            nbTubes: 5,
            category: 'PREDEFINED',
            areas: [area1, area2],
          },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2, areas: [area1] },
        ];

        // when
        const screen = await render(
          <template>
            <List @search={{search}} @updateFilter={{updateFilter}} @courses={{courses}} @type="all" />
          </template>,
        );

        // then
        assert
          .dom(
            screen.getByRole('button', {
              name: t('pages.catalogue.filters.areas.label', { count: null }),
              hidden: true,
            }),
          )
          .exists();
      });

      test('it preselects areas filter with initials values', async function (assert) {
        // given
        const updateFilter = sinon.stub();
        const area1 = store.createRecord('area', { id: 1, title: 'area1', code: '1', competences: [] });
        const area2 = store.createRecord('area', { id: 2, title: 'area2', code: '2', competences: [] });
        const selectedAreas = [area1.id];

        const courses = [
          {
            name: 'Ma super formation',
            type: 'targetProfile',
            nbTubes: 5,
            category: 'PREDEFINED',
            areas: [area1, area2],
          },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2, areas: [area1] },
          { name: 'Parcours nul', type: 'targetProfile', category: 'OTHER', nbModules: 2, areas: [area2] },
        ];

        // when
        const screen = await render(
          <template>
            <List @areas={{selectedAreas}} @updateFilter={{updateFilter}} @courses={{courses}} @type="all" />
          </template>,
        );
        await click(screen.getByRole('button', { name: t('pages.catalogue.filters.areas.label') }));
        await waitFor(() => screen.findByRole('menu'));
        // then
        assert.dom(screen.getByRole('checkbox', { name: `${area1.code}. ${area1.title}` })).isChecked();
      });

      test('it filters items list that match selected areas using a AND', async function (assert) {
        // given
        const updateFilter = sinon.stub();
        const area1 = store.createRecord('area', { id: 1, title: 'area1', code: '1', competences: [] });
        const area2 = store.createRecord('area', { id: 2, title: 'area2', code: '2', competences: [] });

        const selectedAreas = [area1.id, area2.id];

        const courses = [
          {
            name: 'Ma super formation',
            type: 'targetProfile',
            nbTubes: 5,
            category: 'PREDEFINED',
            areas: [area1, area2],
          },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2, areas: [area1] },
        ];

        // when
        const screen = await render(
          <template>
            <List @areas={{selectedAreas}} @updateFilter={{updateFilter}} @courses={{courses}} @type="all" />
          </template>,
        );

        // then
        assert.strictEqual(screen.getAllByRole('heading', { level: 3 }).length, 1);
        assert.dom(screen.getByRole('heading', { level: 3, name: 'Ma super formation' })).exists();
      });

      module('when a tab is selected', function () {
        test('it only display areas of the filtered courses', async function (assert) {
          // given
          const updateFilter = sinon.stub();
          const area1 = store.createRecord('area', { id: 1, title: 'area1', code: '1', competences: [] });
          const area2 = store.createRecord('area', { id: 2, title: 'area2', code: '2', competences: [] });

          const courses = [
            { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2, areas: [area1] },
            { name: 'Ma super formation', type: 'targetProfile', category: 'OTHER', nbModules: 2, areas: [area2] },
          ];

          // when
          const screen = await render(
            <template><List @updateFilter={{updateFilter}} @courses={{courses}} @type="blueprint" /></template>,
          );
          await click(screen.getByRole('button', { name: t('pages.catalogue.filters.areas.label') }));
          await waitFor(() => screen.findByRole('menu'));
          // then
          assert.dom(screen.getByRole('menuitem', { name: `${area1.code}. ${area1.title}` })).exists();
          assert.dom(screen.queryByRole('menuitem', { name: `${area2.code}. ${area2.title}` })).doesNotExist();
        });
      });
    });

    module('competences filter', function () {
      test('it disables filter when there are no competences to filter', async function (assert) {
        // given
        const updateFilter = sinon.stub();
        const search = 'combiné';
        const comp1 = store.createRecord('competence', { id: 1, name: 'comp1', index: '1.1' });
        const comp2 = store.createRecord('competence', { id: 2, name: 'comp2', index: '2.1' });
        const area1 = store.createRecord('area', { id: 1, title: 'area1', code: '1', competences: [comp1] });
        const area2 = store.createRecord('area', { id: 2, title: 'area2', code: '2', competences: [comp2] });

        const courses = [
          {
            name: 'Ma super formation',
            type: 'targetProfile',
            nbTubes: 5,
            category: 'PREDEFINED',
            areas: [area1, area2],
          },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2, areas: [area1] },
        ];

        // when
        const screen = await render(
          <template>
            <List @search={{search}} @updateFilter={{updateFilter}} @courses={{courses}} @type="all" />
          </template>,
        );

        // then
        assert
          .dom(screen.getByRole('button', { name: t('pages.catalogue.filters.competences.label'), hidden: true }))
          .exists();
      });

      test('it preselects competences filter with initials values', async function (assert) {
        // given
        const updateFilter = sinon.stub();
        const comp1 = store.createRecord('competence', { id: 1, name: 'comp1', index: '1.1' });
        const comp2 = store.createRecord('competence', { id: 2, name: 'comp2', index: '2.1' });
        const area1 = store.createRecord('area', { id: 1, title: 'area1', code: '1', competences: [comp1] });
        const area2 = store.createRecord('area', { id: 2, title: 'area2', code: '2', competences: [comp2] });
        const selectedCompetences = [comp1.id];
        const courses = [
          {
            name: 'Ma super formation',
            type: 'targetProfile',
            nbTubes: 5,
            category: 'PREDEFINED',
            areas: [area1, area2],
          },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2, areas: [area1] },
        ];

        // when
        const screen = await render(
          <template>
            <List
              @competences={{selectedCompetences}}
              @updateFilter={{updateFilter}}
              @courses={{courses}}
              @type="all"
            />
          </template>,
        );
        await click(screen.getByRole('button', { name: t('pages.catalogue.filters.competences.label') }));
        await waitFor(() => screen.findByRole('menu'));

        // then
        assert.dom(screen.getByRole('checkbox', { name: `${comp1.index} ${comp1.name}` })).isChecked();
      });

      test('it filters items list that match selected competences using a AND', async function (assert) {
        // given
        const updateFilter = sinon.stub();
        const comp1 = store.createRecord('competence', { id: 1, name: 'comp1', index: '1.1' });
        const comp2 = store.createRecord('competence', { id: 2, name: 'comp2', index: '2.1' });
        const area1 = store.createRecord('area', { id: 1, title: 'area1', code: '1', competences: [comp1] });
        const area2 = store.createRecord('area', { id: 2, title: 'area2', code: '2', competences: [comp2] });
        const selectedCompetences = [comp2.id];
        const courses = [
          {
            name: 'Ma super formation',
            type: 'targetProfile',
            nbTubes: 5,
            category: 'PREDEFINED',
            areas: [area1, area2],
          },
          { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2, areas: [area1] },
        ];
        // when
        const screen = await render(
          <template>
            <List
              @competences={{selectedCompetences}}
              @updateFilter={{updateFilter}}
              @courses={{courses}}
              @type="all"
            />
          </template>,
        );
        await click(screen.getByRole('button', { name: t('pages.catalogue.filters.competences.label') }));
        await waitFor(() => screen.findByRole('menu'));

        // then
        assert.strictEqual(screen.getAllByRole('heading', { level: 3 }).length, 1);
        assert.dom(screen.getByRole('heading', { level: 3, name: 'Ma super formation' })).exists();
      });

      module('when a tab is selected', function () {
        test('it only display areas of the filtered courses', async function (assert) {
          // given
          const updateFilter = sinon.stub();
          const comp1 = store.createRecord('competence', { id: 1, name: 'comp1', index: '1.1' });
          const comp2 = store.createRecord('competence', { id: 2, name: 'comp2', index: '2.1' });
          const area1 = store.createRecord('area', { id: 1, title: 'area1', code: '1', competences: [comp1] });
          const area2 = store.createRecord('area', { id: 2, title: 'area2', code: '2', competences: [comp2] });

          const courses = [
            { name: 'Mon parcours combiné', type: 'blueprint', nbModules: 2, areas: [area1] },
            { name: 'Ma super formation', type: 'targetProfile', category: 'OTHER', nbModules: 2, areas: [area2] },
          ];

          // when
          const screen = await render(
            <template><List @updateFilter={{updateFilter}} @courses={{courses}} @type="blueprint" /></template>,
          );
          await click(screen.getByRole('button', { name: t('pages.catalogue.filters.competences.label') }));
          await waitFor(() => screen.findByRole('menu'));
          // then
          assert.dom(screen.getByRole('menuitem', { name: `${comp1.index} ${comp1.name}` })).exists();
          assert.dom(screen.queryByRole('menuitem', { name: `${comp2.index} ${comp2.name}` })).doesNotExist();
        });
      });
    });

    module('reset filters', function () {
      test('it resets filter values', async function (assert) {
        // given
        const resetFilters = sinon.stub();
        const updateFilter = sinon.stub();
        const search = 'parcours';
        const category = 'PREDEFINED';
        const areas = [1];
        const competences = [1];
        const comp1 = store.createRecord('competence', { id: 1, name: 'comp1', index: '1.1' });
        const comp2 = store.createRecord('competence', { id: 2, name: 'comp2', index: '2.1' });
        const area1 = store.createRecord('area', { id: 1, title: 'area1', code: '1', competences: [comp1] });
        const area2 = store.createRecord('area', { id: 2, title: 'area2', code: '2', competences: [comp2] });
        const courses = [
          {
            name: 'Ma super formation',
            type: 'targetProfile',
            nbTubes: 5,
            category: 'PREDEFINED',
            areas: [area1, area2],
          },
          {
            name: 'Mon parcours combiné',
            type: 'blueprint',
            nbModules: 2,
            areas: [area2],
          },
        ];

        // when
        const screen = await render(
          <template>
            <List
              @search={{search}}
              @category={{category}}
              @area={{areas}}
              @competences={{competences}}
              @updateFilter={{updateFilter}}
              @resetFilters={{resetFilters}}
              @courses={{courses}}
              @type="all"
            />
          </template>,
        );
        await click(screen.getByRole('button', { name: t('common.filters.actions.clear') }));

        // then
        assert.ok(resetFilters.calledOnce);
      });
    });
  });

  module('modal', function () {
    test('it shows the modal if a currentCourse has been fetched', async function (assert) {
      // given
      const updateFilter = sinon.stub();
      const courses = [{ name: 'Ma super formation', type: 'targetProfile' }];
      const currentCourse = store.createRecord('target-profile-overview', {
        name: 'Ma super formation',
        description: 'description',
      });

      // when
      const screen = await render(
        <template>
          <List @courses={{courses}} @updateFilter={{updateFilter}} @type="all" @currentCourse={{currentCourse}} />
        </template>,
      );

      assert.dom(await screen.findByRole('dialog', { name: currentCourse.name })).exists();
    });

    test('it does not show the modal if no currentCourse has been fetched', async function (assert) {
      // given
      const updateFilter = sinon.stub();
      const courses = [{ name: 'Ma super formation', type: 'targetProfile' }];

      // when
      const screen = await render(
        <template>
          <List @courses={{courses}} @updateFilter={{updateFilter}} @type="all" @currentCourse={{null}} />
        </template>,
      );

      assert.dom(screen.queryByRole('dialog')).doesNotExist();
    });

    test('it redirects to close the modal with empty query params on exit button click', async function (assert) {
      // given
      const router = this.owner.lookup('service:router');
      const updateFilter = sinon.stub();

      const type = 'all';
      const transitionToStub = sinon.stub(router, 'transitionTo').withArgs('authenticated.catalogue.list', type, {
        queryParams: { targetProfileId: null, blueprintId: null },
      });

      const courses = [{ name: 'Ma super formation', type: 'targetProfile' }];
      const currentCourse = store.createRecord('target-profile-overview', {
        name: 'Ma super formation',
        description: 'description',
      });

      // when
      const screen = await render(
        <template>
          <List @courses={{courses}} @updateFilter={{updateFilter}} @type={{type}} @currentCourse={{currentCourse}} />
        </template>,
      );

      await click(screen.getByRole('button', { name: t('common.actions.exit') }));

      // then
      sinon.assert.calledOnce(transitionToStub);
      assert.ok(true);
    });
  });
});
