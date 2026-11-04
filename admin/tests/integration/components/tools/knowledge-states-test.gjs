import { render } from '@1024pix/ember-testing-library';
import { click, triggerEvent } from '@ember/test-helpers';
import KnowledgeStates from 'pix-admin/components/tools/knowledge-states';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Tools | knowledge-states', function (hooks) {
  setupIntlRenderingTest(hooks);

  const knowledgeElements = [
    {
      skillId: 'skill_web_2',
      competenceId: 'competence_1',
      status: 'validated',
      source: 'direct',
      earnedPix: 2,
      createdAt: '2026-01-10T00:00:00.000Z',
    },
    {
      skillId: 'skill_web_1',
      competenceId: 'competence_1',
      status: 'reset',
      source: 'direct',
      earnedPix: 0,
      createdAt: '2026-01-11T00:00:00.000Z',
    },
  ];

  let simulateStub;

  hooks.beforeEach(function () {
    const adapter = this.owner.lookup('service:store').adapterFor('knowledge-state-simulation');
    simulateStub = sinon.stub(adapter, 'simulate');
  });

  const uploadFile = async (screen, content) => {
    const fileInput = screen.getByLabelText('Envoyer le fichier JSON des knowledge elements');
    Object.defineProperty(fileInput, 'files', {
      value: [new File([content], 'ke_user.json', { type: 'application/json' })],
      writable: false,
    });
    await triggerEvent(fileInput, 'change');
  };

  test('it should display the knowledge states and the competence scores of the pasted knowledge elements', async function (assert) {
    // given
    simulateStub.withArgs(knowledgeElements).resolves({
      data: {
        type: 'knowledge-state-simulations',
        id: '1',
        attributes: {
          'knowledge-element-count': 1,
          'knowledge-state-count': 1,
          'knowledge-states': [
            {
              tubeId: 'tube_web',
              floor: 2,
              ceiling: null,
              ceilingAt: null,
              directLevels: [2],
              updatedAt: '2026-01-10T00:00:00.000Z',
            },
          ],
          'user-competence-scores': [
            {
              competenceId: 'competence_1',
              pix: 2,
              pixFromKnowledgeStates: 2,
              displayedPix: 2,
              displayedPixAfterMigration: 2,
            },
            {
              competenceId: 'competence_2',
              pix: 11.504,
              pixFromKnowledgeStates: 0,
              displayedPix: 11,
              displayedPixAfterMigration: 0,
            },
          ],
          'pix-score': 13,
          'pix-score-after-migration': 2,
          'unknown-skill-ids': ['skill_gone'],
        },
      },
    });
    const screen = await render(<template><KnowledgeStates /></template>);

    // when
    await uploadFile(screen, JSON.stringify(knowledgeElements));

    // then: the report tab is selected
    assert.dom(await screen.findByRole('table', { name: 'Rapport' })).exists();
    assert.dom(screen.getByText('ke_user.json')).exists();
    assert.dom(screen.getByRole('tab', { name: 'Rapport', selected: true })).exists();
    assert.dom(screen.getByRole('cell', { name: 'Somme des scores stockés (pix)' })).exists();
    assert.dom(screen.getByRole('cell', { name: '13.5' })).exists();
    assert
      .dom(screen.getByRole('cell', { name: 'Score affiché aujourd’hui, depuis les knowledge elements (pix)' }))
      .exists();
    assert.dom(screen.getByRole('cell', { name: '13' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'Différence après migration (pix)' })).exists();
    assert.dom(screen.getByRole('cell', { name: '-11' })).exists();
    assert.dom(screen.queryByRole('table', { name: 'Knowledge states par tube' })).doesNotExist();

    // when: the other tabs are selected
    await click(screen.getByRole('tab', { name: 'Knowledge elements du fichier (2)' }));
    assert.dom(screen.getByRole('table', { name: 'Knowledge elements du fichier' })).exists();
    assert
      .dom(screen.getByRole('cell', { name: 'skill_web_2' }))
      .doesNotHaveClass('knowledge-states-simulator__reset-cell');
    assert.dom(screen.getByRole('cell', { name: 'skill_web_1' })).hasClass('knowledge-states-simulator__reset-cell');

    await click(screen.getByRole('tab', { name: 'Knowledge states par tube (1)' }));
    assert.dom(screen.getByRole('table', { name: 'Knowledge states par tube' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'tube_web' })).exists();
    assert.dom(screen.queryByRole('table', { name: 'Rapport' })).doesNotExist();

    await click(screen.getByRole('tab', { name: 'Scores par compétence (2)' }));
    assert.dom(screen.getByRole('table', { name: 'Scores par compétence' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'competence_1' })).exists();

    await click(screen.getByRole('tab', { name: 'Acquis inconnus du référentiel (1)' }));
    assert.dom(screen.getByRole('table', { name: 'Acquis inconnus du référentiel' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'skill_gone' })).exists();
  });

  test('it should display an error when the JSON is invalid, without calling the API', async function (assert) {
    // given
    const screen = await render(<template><KnowledgeStates /></template>);

    // when
    await uploadFile(screen, '[{');

    // then
    assert.dom(await screen.findByText('Le JSON est invalide.')).exists();
    assert.ok(simulateStub.notCalled);
  });

  test('it should display the error of the API', async function (assert) {
    // given
    simulateStub.rejects({ errors: [{ detail: '"data.knowledgeElements[0].skillId" is required' }] });
    const screen = await render(<template><KnowledgeStates /></template>);

    // when
    await uploadFile(screen, '[{}]');

    // then
    assert
      .dom(await screen.findByText('La simulation a échoué : "data.knowledgeElements[0].skillId" is required'))
      .exists();
  });
});
