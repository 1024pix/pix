import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | routes/authenticated/target-profiles/target-profile | details', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display specific text when profile has no content', async function (assert) {
    // given
    this.areas = [];

    // when
    const screen = await render(hbs`<TargetProfiles::Details @areas={{this.areas}} />`);

    // then
    assert.dom(screen.getByText('Profil cible vide.')).exists();
  });

  module('when target profile has content', function (hooks) {
    let areas;

    hooks.beforeEach(async function () {
      areas = [
        {
          title: `Titre Area 1`,
          color: 'Couleur Area 1',
          competences: [
            {
              title: `Titre Competence 1 Area 1`,
              thematics: [
                {
                  name: 'Nom Thematic 1 Competence 1 Area 1',
                  nbTubes: 1,
                  tubes: [
                    {
                      id: 'id-du-tube',
                      title: `Titre Tube 1 Nom Thematic 1 Competence 1 Area 1`,
                      level: 5,
                      mobile: true,
                      tablet: false,
                      skills: [
                        {
                          difficulty: 4,
                        },
                        {
                          difficulty: 2,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          title: `Titre Area 2`,
          color: 'Couleur Area 2',
          competences: [
            {
              title: `Titre Competence 2 Area 2`,
              thematics: [
                {
                  name: 'Nom Thematic 2 Competence 2 Area 2',
                  nbTubes: 1,
                  tubes: [
                    {
                      title: `Titre Tube 2 Nom Thematic 2 Competence 2 Area 2`,
                      level: 2,
                      mobile: false,
                      tablet: true,
                      skills: [
                        {
                          difficulty: 1,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
    });

    test('it should display areas', async function (assert) {
      // given
      this.areas = areas;

      // when
      const screen = await render(hbs`<TargetProfiles::Details @areas={{this.areas}} />`);

      // then
      assert.dom(screen.queryByText('Titre Area 1')).exists();
      assert.dom(screen.queryByText('Titre Area 2')).exists();
    });

    test('it should display competences when clicking on area', async function (assert) {
      // given
      this.areas = areas;
      const screen = await render(hbs`<TargetProfiles::Details @areas={{this.areas}} />`);

      // when
      await clickByName('Titre Area 1');

      // then
      assert.dom(screen.queryByText('Titre Competence 1 Area 1')).exists();
      assert.dom(screen.queryByText('Titre Competence 2 Area 2')).doesNotExist();
    });

    test('it should display thematics when clicking on competence', async function (assert) {
      // given
      this.areas = areas;
      const screen = await render(hbs`<TargetProfiles::Details @areas={{this.areas}} />`);

      // when
      await clickByName('Titre Area 1');
      await clickByName('Titre Competence 1 Area 1');

      // then
      assert.dom(screen.queryByText('Nom Thematic 1 Competence 1 Area 1')).exists();
      assert.dom(screen.queryByText('Nom Thematic 2 Competence 2 Area 2')).doesNotExist();
    });

    test('it should display tube details when clicking on competence', async function (assert) {
      // given
      this.areas = areas;
      const screen = await render(hbs`<TargetProfiles::Details @areas={{this.areas}} />`);

      // when
      await clickByName('Titre Area 1');
      await clickByName('Titre Competence 1 Area 1');

      // then
      assert.dom(screen.queryByText('Titre Tube 1 Nom Thematic 1 Competence 1 Area 1')).exists();
      assert.dom(screen.queryByText('Titre Tube 2 Nom Thematic 2 Competence 2 Area 2')).doesNotExist();
      assert.deepEqual(screen.getByTestId('level-id-du-tube').innerText, '5');
      const squares = screen.getByTestId('skill-availability-id-du-tube').children;
      assert.dom(squares[0]).hasClass('skill-square__missing');
      assert.dom(squares[0]).hasText('1');
      assert.dom(squares[1]).hasClass('skill-square__active');
      assert.dom(squares[1]).hasText('2');
      assert.dom(squares[2]).hasClass('skill-square__missing');
      assert.dom(squares[2]).hasText('3');
      assert.dom(squares[3]).hasClass('skill-square__active');
      assert.dom(squares[3]).hasText('4');
      assert.dom(squares[4]).hasClass('skill-square__missing');
      assert.dom(squares[4]).hasText('5');
      assert.dom(squares[5]).hasClass('skill-square__missing');
      assert.dom(squares[5]).hasText('6');
      assert.dom(squares[6]).hasClass('skill-square__missing');
      assert.dom(squares[6]).hasText('7');
      assert.dom(squares[7]).hasClass('skill-square__missing');
      assert.dom(squares[7]).hasText('8');
      assert.dom('[aria-label="incompatible tablette"]').exists();
      assert.dom('[aria-label="compatible mobile"]').exists();
    });
  });
});
