import { clickByName, getByTextWithHtml, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import Statistics from 'pix-orga/components/statistics/index';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Statistics | Index', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there are data to display', function () {
    test('it should display title and extracted date', async function (assert) {
      //given
      const extractionDate = '2024-12-08';
      const model = {
        data: [
          {
            competence_code: '2.1',
            competence: 'Interagir',
            sujet: 'Gérer ses contacts',
            niveau_par_user: '1.30',
            niveau_par_sujet: '1.50',
            extraction_date: extractionDate,
          },
        ],
      };
      const intlService = this.owner.lookup('service:intl');

      //when
      const screen = await render(<template><Statistics @model={{model}} /></template>);

      //then
      assert.ok(screen.getByRole('heading', { name: t('pages.statistics.title'), level: 1 }));
      assert.ok(screen.getByText(intlService.formatDate(extractionDate, { format: 'LLL' }), { exact: false }));
    });

    test('it should display table headers', async function (assert) {
      //given
      const model = {
        data: [
          {
            domaine: '2. Communication et collaboration',
            competence_code: '2.1',
            competence: 'Interagir',
            sujet: 'Gérer ses contacts',
            niveau_par_user: '1.30',
            niveau_par_sujet: '1.50',
          },
        ],
      };

      //when
      const screen = await render(<template><Statistics @model={{model}} /></template>);

      //then
      assert.ok(screen.getByRole('columnheader', { name: t('pages.statistics.table.headers.competences') }));
      assert.ok(screen.getByRole('columnheader', { name: t('pages.statistics.table.headers.topics') }));
      assert.ok(screen.getByRole('columnheader', { name: t('pages.statistics.table.headers.reached-level') }));
      assert.ok(screen.getByRole('columnheader', { name: t('pages.statistics.table.headers.positioning') }));
    });

    test('it should display rows data', async function (assert) {
      //given
      const model = {
        data: [
          {
            domaine: '2. Communication et collaboration',
            competence_code: '2.1',
            competence: 'Interagir',
            sujet: 'Gérer ses contacts',
            niveau_par_user: '1.30',
            niveau_par_sujet: '1.50',
          },
        ],
      };

      //when
      const screen = await render(<template><Statistics @model={{model}} /></template>);

      //then
      assert.ok(screen.getByRole('cell', { name: '2.1 Interagir' }));
      assert.ok(screen.getByRole('cell', { name: 'Gérer ses contacts' }));
      assert.ok(screen.getByRole('cell', { name: t('pages.statistics.level.novice') }));
    });

    test('it should display rows data when tube is null', async function (assert) {
      //given
      const model = {
        data: [
          {
            domaine: '2. Communication et collaboration',
            competence_code: '2.1',
            competence: 'Foo',
            sujet: undefined,
            niveau_par_user: '1.30',
            niveau_par_sujet: '1.50',
          },
          {
            domaine: '3. Communication et collaboration',
            competence_code: '3.1',
            competence: 'Bar',
            sujet: 'Gérer ses contacts',
            niveau_par_user: '3.30',
            niveau_par_sujet: '3.50',
          },
        ],
      };

      //when
      const screen = await render(<template><Statistics @model={{model}} /></template>);

      //then
      assert.ok(screen.getByRole('cell', { name: '2.1 Foo' }));
      assert.ok(screen.getByRole('cell', { name: '' }));
      assert.ok(screen.getByRole('cell', { name: '3.1 Bar' }));
      assert.ok(screen.getByRole('cell', { name: 'Gérer ses contacts' }));
    });
    test('it should display table description', async function (assert) {
      //given
      const model = {
        data: [
          {
            domaine: '2. Communication et collaboration',
            competence_code: '2.1',
            competence: 'Interagir',
            sujet: 'Gérer ses contacts',
            niveau_par_user: '1.30',
            niveau_par_sujet: '1.50',
          },
        ],
      };

      //when
      await render(<template><Statistics @model={{model}} /></template>);

      //then
      assert.ok(
        getByTextWithHtml(
          'Le tableau ci-dessous vous permet de visualiser le positionnement de vos participants par sujet.<br> Le positionnement rend compte du niveau moyen de vos participants sur le niveau maximum qu’ils auraient pu atteindre.<br> Ces données tiennent compte de toutes les participations partagées dans le cadre des campagnes d’évaluation non supprimées de votre organisation.',
        ),
      );
    });

    module('pagination', function () {
      test('should have pagination on page', async function (assert) {
        //given
        const model = {
          data: [
            {
              domaine: '2. Communication et collaboration',
              competence_code: '2.1',
              competence: 'Interagir',
              sujet: 'Gérer ses contacts',
              niveau_par_user: '1.30',
              niveau_par_sujet: '1.50',
            },
            {
              domaine: '2. Communication et collaboration',
              competence_code: '2.1',
              competence: 'Interagir',
              sujet: 'Gérer ses contacts',
              niveau_par_user: '1.30',
              niveau_par_sujet: '1.50',
            },
          ],
        };
        class Router extends Service {
          currentRoute = {
            queryParams: {
              pageSize: 1,
            },
          };
        }
        this.owner.register('service:router', Router);

        //when
        const screen = await render(<template><Statistics @model={{model}} /></template>);
        //then
        assert.ok(screen.getByText('1-1 sur 2 éléments'));
        assert.ok(screen.getByLabelText("Nombre d'élément à afficher par page"));
        assert.ok(screen.getByRole('button', { name: 'Aller à la page précédente' }));
        assert.ok(screen.getByRole('button', { name: 'Aller à la page suivante' }));
      });

      test('should show first page without pageNumber in query params', async function (assert) {
        //given
        const model = {
          data: [
            {
              domaine: '2. Communication et collaboration',
              competence_code: '2.1',
              competence: 'Interagir',
              sujet: 'Gérer ses contacts',
              niveau_par_user: '1.30',
              niveau_par_sujet: '1.50',
            },
            {
              domaine: '2. Communication et collaboration',
              competence_code: '2.1',
              competence: 'Interagir',
              sujet: 'Gérer ses contacts',
              niveau_par_user: '1.30',
              niveau_par_sujet: '1.50',
            },
          ],
        };
        class Router extends Service {
          currentRoute = {
            queryParams: {
              pageSize: 1,
            },
          };
        }
        this.owner.register('service:router', Router);

        //when
        const screen = await render(<template><Statistics @model={{model}} /></template>);

        //then
        assert.ok(screen.getByRole('cell', { name: '2.1 Interagir' }));
        assert.ok(screen.getByRole('cell', { name: t('pages.statistics.level.novice') }));
      });

      test('should show specific page when pageNumber is set', async function (assert) {
        //given
        const model = {
          data: [
            {
              domaine: '2. Communication et collaboration',
              competence_code: '2.1',
              competence: 'Foo',
              sujet: 'Gérer ses contacts',
              niveau_par_user: '1.30',
              niveau_par_sujet: '1.50',
            },
            {
              domaine: '2. Communication et collaboration',
              competence_code: '2.1',
              competence: 'Interagir',
              sujet: 'Gérer ses contacts',
              niveau_par_user: '1.30',
              niveau_par_sujet: '1.50',
            },
          ],
        };
        class Router extends Service {
          currentRoute = {
            queryParams: {
              pageSize: 1,
              pageNumber: 2,
            },
          };
        }
        this.owner.register('service:router', Router);

        //when
        const screen = await render(<template><Statistics @model={{model}} /></template>);

        //then
        assert.ok(screen.getByRole('cell', { name: '2.1 Interagir' }));
        assert.ok(screen.getByRole('cell', { name: t('pages.statistics.level.novice') }));
      });
    });

    module('filter', function () {
      test('should filtered analysis', async function (assert) {
        //given
        const model = {
          data: [
            {
              domaine: '1. Information et données',
              competence_code: '1.1 ',
              competence: 'Mener une recherche et une veille d’information',
              sujet: "Indices de qualité d'une page web",
              niveau_par_user: '1.30',
              niveau_par_sujet: '1.50',
            },
            {
              domaine: '2. Communication et collaboration',
              competence_code: '2.1',
              competence: 'Interagir',
              sujet: 'Gérer ses contacts',
              niveau_par_user: '1.30',
              niveau_par_sujet: '1.50',
            },
          ],
        };
        class Router extends Service {
          currentRoute = {
            queryParams: {
              pageSize: 1,
              pageNumber: 2,
            },
          };
          replaceWith = ({ queryParams }) => {
            this.currentRoute.queryParams.pageNumber = queryParams.pageNumber;
          };
        }
        this.owner.register('service:router', Router);

        //when
        const screen = await render(<template><Statistics @model={{model}} /></template>);

        //then
        assert.ok(screen.getByText('2-2 sur 2 éléments'));

        // when
        const select = screen.getByRole('button', { name: t('pages.statistics.select-label') });
        await click(select);
        const option = await screen.findByRole('option', { name: '2. Communication et collaboration' });
        await click(option);

        // then
        assert.ok(screen.getByText('1 élément'));
        assert.ok(screen.getByRole('cell', { name: '2.1 Interagir' }));
        assert.ok(screen.getByRole('cell', { name: 'Gérer ses contacts' }));
        assert.ok(screen.getByRole('cell', { name: t('pages.statistics.level.novice') }));

        // when
        await clickByName(t('common.filters.actions.clear'));

        // then
        assert.ok(screen.getByText('1-1 sur 2 éléments'));
      });
    });
  });

  module('when there is no data to display', function () {
    test('should display title without extracted date', async function (assert) {
      //given
      const extractionDate = '2024-12-08';
      const model = {
        data: [],
      };
      const intlService = this.owner.lookup('service:intl');

      //when
      const screen = await render(<template><Statistics @model={{model}} /></template>);

      //then
      assert.ok(screen.getByRole('heading', { name: t('pages.statistics.title'), level: 1 }));
      assert.notOk(screen.queryByText(intlService.formatDate(extractionDate, { format: 'LLL' }), { exact: false }));
    });

    test('should display empty state if data did not exists', async function (assert) {
      //given
      const model = {
        data: undefined,
      };

      //when
      const screen = await render(<template><Statistics @model={{model}} /></template>);

      //then
      assert.ok(screen.getByText(t('pages.statistics.empty-state')));
    });

    test('should display empty state if data is empty', async function (assert) {
      //given
      const model = {
        data: [],
      };

      //when
      const screen = await render(<template><Statistics @model={{model}} /></template>);

      //then
      assert.ok(screen.getByText(t('pages.statistics.empty-state')));
    });
  });
});
