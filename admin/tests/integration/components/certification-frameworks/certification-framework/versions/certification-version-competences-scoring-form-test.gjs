import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import CompetencesScoringForm from 'pix-admin/components/certification-frameworks/certification-framework/versions/certification-version-competences-scoring-form';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';

const TITLE_KEY = 'components.certification-frameworks.certification-framework.versions.scoring.competences.title';

module(
  'Integration | Component | certification-frameworks | certification-framework | versions | Certification Version Competences Scoring Form',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    function buildDraftVersion(store, { areas = [] } = {}) {
      store.push({
        data: {
          id: '1',
          type: 'certification-version',
          attributes: { status: 'draft' },
          relationships: {
            areas: { data: areas.map((a) => ({ type: 'area', id: a.id })) },
          },
        },
        included: areas.flatMap((area) => [
          {
            id: area.id,
            type: 'area',
            attributes: { code: area.code, title: area.title, color: null, frameworkId: null },
            relationships: {
              competences: { data: (area.competences ?? []).map((c) => ({ type: 'competence', id: c.id })) },
            },
          },
          ...(area.competences ?? []).map((c) => ({
            id: c.id,
            type: 'competence',
            attributes: { name: c.name, index: c.index },
          })),
        ]),
      });
      return store.peekRecord('certification-version', '1');
    }

    function buildCalibrationScoringConfiguration({ competencesScoringConfiguration = [] } = {}) {
      return { competencesScoringConfiguration };
    }

    module('tabs display', function () {
      test('it renders one tab per area, sorted by code', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = buildDraftVersion(store, {
          areas: [
            { id: 'area2', code: '2', title: 'area2', competences: [] },
            { id: 'area1', code: '1', title: 'area1', competences: [] },
          ],
        });
        const calibrationScoringConfiguration = buildCalibrationScoringConfiguration();

        // when
        const screen = await render(
          <template>
            <CompetencesScoringForm
              @editVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // then
        const tabs = screen.getAllByRole('tab');
        assert.strictEqual(tabs.length, 2);
        assert.dom(tabs[0]).hasText('1 - area1');
        assert.dom(tabs[1]).hasText('2 - area2');
      });
    });

    module('competences display', function () {
      test('it renders the card title', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = buildDraftVersion(store);
        const calibrationScoringConfiguration = buildCalibrationScoringConfiguration();

        // when
        const screen = await render(
          <template>
            <CompetencesScoringForm
              @editVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText(t(TITLE_KEY))).exists();
      });

      test('it renders one accordion per competence in the active area', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = buildDraftVersion(store, {
          areas: [
            {
              id: 'area1',
              code: '1',
              title: 'area1',
              competences: [
                { id: 'comp1', name: 'competence1', index: '1.1' },
                { id: 'comp2', name: 'competence2', index: '1.2' },
              ],
            },
          ],
        });
        const calibrationScoringConfiguration = buildCalibrationScoringConfiguration();

        // when
        const screen = await render(
          <template>
            <CompetencesScoringForm
              @editVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByRole('button', { name: /1\.1 - competence1/ })).exists();
        assert.dom(screen.getByRole('button', { name: /1\.2 - competence2/ })).exists();
      });

      test('it displays scoring values for a competence when its accordion is open', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = buildDraftVersion(store, {
          areas: [
            {
              id: 'area1',
              code: '1',
              title: 'area1',
              competences: [{ id: 'comp1', name: 'competence1', index: '1.1' }],
            },
          ],
        });
        const calibrationScoringConfiguration = buildCalibrationScoringConfiguration({
          competencesScoringConfiguration: [
            {
              competenceId: 'comp1',
              values: [
                { competenceLevel: 0, bounds: { min: -8, max: -2 } },
                { competenceLevel: 1, bounds: { min: -1, max: 2 } },
              ],
            },
          ],
        });

        const screen = await render(
          <template>
            <CompetencesScoringForm
              @editVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: /1\.1 - competence1/ }));

        // then
        const [, levelZeroRow, levelOneRow] = screen.getAllByRole('row');
        assert.dom(levelZeroRow).includesText('0');
        assert.dom(levelZeroRow).includesText('-8');
        assert.dom(levelZeroRow).includesText('-2');
        assert.dom(levelOneRow).includesText('1');
        assert.dom(levelOneRow).includesText('-1');
        assert.dom(levelOneRow).includesText('2');
      });

      test('it displays a message when no scoring configuration exists for a competence', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const draftVersion = buildDraftVersion(store, {
          areas: [
            {
              id: 'area1',
              code: '1',
              title: 'area1',
              competences: [{ id: 'comp1', name: 'competence1', index: '1.1' }],
            },
          ],
        });
        const calibrationScoringConfiguration = buildCalibrationScoringConfiguration();

        const screen = await render(
          <template>
            <CompetencesScoringForm
              @editVersion={{draftVersion}}
              @calibrationScoringConfiguration={{calibrationScoringConfiguration}}
            />
          </template>,
        );

        // when
        await click(screen.getByRole('button', { name: /1\.1 - competence1/ }));

        // then
        assert.dom(screen.queryByRole('table')).doesNotExist();
        assert
          .dom(
            screen.getByText(
              t(
                'components.certification-frameworks.certification-framework.versions.scoring.competences.no-configuration',
              ),
            ),
          )
          .exists();
      });
    });
  },
);
