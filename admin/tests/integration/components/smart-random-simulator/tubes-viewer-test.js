import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | SmartRandomSimulator::TubesViewer', function (hooks) {
  setupRenderingTest(hooks);

  let screen;
  const numberOfSkillsStillAvailable = 11;
  const numberOfSkillsFromKe = 2;
  const totalNumberOfSkills = numberOfSkillsStillAvailable + numberOfSkillsFromKe;
  const tubes = [
    {
      name: '@outilsRS',
      skills: [
        {
          id: 'recL0AotZshb9quhR',
          name: '@outilsRS1',
          difficulty: 1,
        },
        {
          difficulty: 2,
          id: 'recrOwaV2PTt1N0i5',
          name: '@outilsRS2',
        },
        {
          id: 'recyblYaLq5YHTSRk',
          name: '@outilsRS3',
          difficulty: 3,
        },
      ],
    },
    {
      name: '@fonctionnementStreaming',
      skills: [
        {
          id: 'skill1g2ABCwm6z4pG1',
          name: '@fonctionnementStreaming5',
          difficulty: 5,
        },
        {
          id: 'skill2cyavvqFHbCqHR',
          name: '@fonctionnementStreaming4',
          difficulty: 4,
        },
      ],
    },
    {
      name: '@outilscollaboratifs',
      skills: [
        {
          id: 'skill1iNujN6GvCxIYM',
          name: '@outilscollaboratifs4',
          difficulty: 4,
        },
        {
          id: 'skill1NLQfWipPx9Nt1',
          name: '@outilscollaboratifs3',
          difficulty: 3,
        },
      ],
    },
    {
      name: '@outilsTexte',
      skills: [
        {
          id: 'skill1Zvxih7V7M5S3i',
          name: '@outilsTexte3',
          difficulty: 3,
        },
        {
          id: 'skill2ihqjMA8lQkNA0',
          name: '@outilsTexte1',
          difficulty: 1,
        },
        {
          id: 'skill2Kc2ZaHfK6DQrv',
          name: '@outilsTexte4',
          difficulty: 4,
        },
      ],
    },
    {
      name: '@utiliserVisio',
      skills: [
        {
          id: 'skill29qYgQv0UPtZzI',
          name: '@utiliserVisio2',
          difficulty: 2,
        },
        {
          id: 'skill135DNPBBKppVeo',
          name: '@utiliserVisio4',
          difficulty: 4,
        },
        {
          id: 'skillO9IBV1NC2tNmd',
          name: '@utiliserVisio3',
          difficulty: 3,
        },
      ],
    },
  ];
  const smartRandomLog = {
    steps: [
      {
        name: 'NO_CHALLENGE',
        outputSkills: [
          {
            id: 'recL0AotZshb9quhR',
            name: '@outilsRS1',
          },
          {
            id: 'recrOwaV2PTt1N0i5',
            name: '@outilsRS2',
          },
          {
            id: 'recyblYaLq5YHTSRk',
            name: '@outilsRS3',
          },
          {
            id: 'skill1g2ABCwm6z4pG1',
            name: '@fonctionnementStreaming5',
          },
          {
            id: 'skill1iNujN6GvCxIYM',
            name: '@outilscollaboratifs4',
          },
          {
            id: 'skill1NLQfWipPx9Nt1',
            name: '@outilscollaboratifs3',
          },
          {
            id: 'skill1Zvxih7V7M5S3i',
            name: '@outilsTexte3',
          },
          {
            id: 'skill2cyavvqFHbCqHR',
            name: '@fonctionnementStreaming4',
          },
          {
            id: 'skill2ihqjMA8lQkNA0',
            name: '@outilsTexte1',
          },
          {
            id: 'skill2Kc2ZaHfK6DQrv',
            name: '@outilsTexte4',
          },
          {
            id: 'skill29qYgQv0UPtZzI',
            name: '@utiliserVisio2',
          },
          {
            id: 'skill135DNPBBKppVeo',
            name: '@utiliserVisio4',
          },
          {
            id: 'skillO9IBV1NC2tNmd',
            name: '@utiliserVisio3',
          },
        ],
      },
      {
        name: 'ALREADY_TESTED',
        outputSkills: [
          {
            id: 'recL0AotZshb9quhR',
            name: '@outilsRS1',
          },
          {
            id: 'recrOwaV2PTt1N0i5',
            name: '@outilsRS2',
          },
          {
            id: 'recyblYaLq5YHTSRk',
            name: '@outilsRS3',
          },
          {
            id: 'skill1g2ABCwm6z4pG1',
            name: '@fonctionnementStreaming5',
          },
          {
            id: 'skill1iNujN6GvCxIYM',
            name: '@outilscollaboratifs4',
          },
          {
            id: 'skill1NLQfWipPx9Nt1',
            name: '@outilscollaboratifs3',
          },
          {
            id: 'skill1Zvxih7V7M5S3i',
            name: '@outilsTexte3',
          },
          {
            id: 'skill2cyavvqFHbCqHR',
            name: '@fonctionnementStreaming4',
          },
          {
            id: 'skill2ihqjMA8lQkNA0',
            name: '@outilsTexte1',
          },
          {
            id: 'skill2Kc2ZaHfK6DQrv',
            name: '@outilsTexte4',
          },
          {
            id: 'skill29qYgQv0UPtZzI',
            name: '@utiliserVisio2',
          },
          {
            id: 'skill135DNPBBKppVeo',
            name: '@utiliserVisio4',
          },
          {
            id: 'skillO9IBV1NC2tNmd',
            name: '@utiliserVisio3',
          },
        ],
      },
      {
        name: 'EASY_TUBES',
        outputSkills: [
          {
            id: 'recL0AotZshb9quhR',
            name: '@outilsRS1',
          },
          {
            id: 'recrOwaV2PTt1N0i5',
            name: '@outilsRS2',
          },
          {
            id: 'recyblYaLq5YHTSRk',
            name: '@outilsRS3',
          },
        ],
      },
      {
        name: 'TIMED_SKILLS',
        outputSkills: [
          {
            id: 'recL0AotZshb9quhR',
            name: '@outilsRS1',
          },
          {
            id: 'recrOwaV2PTt1N0i5',
            name: '@outilsRS2',
          },
          {
            id: 'recyblYaLq5YHTSRk',
            name: '@outilsRS3',
          },
        ],
      },
      {
        name: 'DEFAULT_LEVEL',
        outputSkills: [
          {
            id: 'recrOwaV2PTt1N0i5',
            name: '@outilsRS2',
          },
        ],
      },
      {
        name: 'RANDOM_PICK',
        outputSkills: [
          {
            id: 'recrOwaV2PTt1N0i5',
            name: '@outilsRS2',
          },
        ],
      },
    ],
    predictedLevel: 2,
    skillRewards: [
      { skillId: 'recL0AotZshb9quhR', reward: 1.3 },
      { skillId: 'recrOwaV2PTt1N0i5', reward: 3.3 },
      { skillId: 'skill1g2ABCwm6z4pG1', reward: 2.3 },
    ],
  };
  const displayedStepIndex = 3;
  const selectDisplayedStepIndex = () => null;
  const currentSkillId = 'recL0AotZshb9quhR';
  const knowledgeElements = [
    {
      source: 'direct',
      status: 'invalidated',
      answerId: 182331,
      skillId: 'recrOwaV2PTt1N0i5',
    },
    {
      source: 'inferred',
      status: 'invalidated',
      answerId: 182331,
      skillId: 'recyblYaLq5YHTSRk',
    },
    {
      skillId: 'skill1g2ABCwm6z4pG1',
      source: 'direct',
      status: 'validated',
      answerId: 182332,
    },
    {
      skillId: 'skill2cyavvqFHbCqHR',
      source: 'inferred',
      status: 'validated',
      answerId: 182332,
    },
  ];

  hooks.beforeEach(async function () {
    this.tubes = tubes;
    this.currentSkillId = currentSkillId;
    this.knowledgeElements = knowledgeElements;
    this.displayedStepIndex = displayedStepIndex;
    this.smartRandomLog = smartRandomLog;
    this.totalNumberOfSkills = totalNumberOfSkills;
    this.selectDisplayedStepIndex = selectDisplayedStepIndex;
    this.numberOfSkillsStillAvailable = numberOfSkillsStillAvailable;

    screen = await render(hbs`<SmartRandomSimulator::TubesViewer
  @tubes={{this.tubes}}
  @currentSkillId={{this.currentSkillId}}
  @knowledgeElements={{this.knowledgeElements}}
  @smartRandomLog={{this.smartRandomLog}}
  @displayedStepIndex={{this.displayedStepIndex}}
  @totalNumberOfSkills={{this.totalNumberOfSkills}}
  @selectDisplayedStepIndex={{this.selectDisplayedStepIndex}}
  @numberOfSkillsStillAvailable={{this.numberOfSkillsStillAvailable}}
/>`);
  });

  test('should display skills rewards', async function (assert) {
    const outilsRS1Cell = screen.getByRole('cell', { name: '@outilsRS1' });
    const outilsRS2Cell = screen.getByRole('cell', { name: '@outilsRS2' });
    const fonctionnementStreaming5 = screen.getByRole('cell', { name: '@fonctionnementStreaming5' });

    assert.strictEqual(outilsRS1Cell.children[0].innerHTML.trim(), '1.3');
    assert.strictEqual(outilsRS2Cell.children[0].innerHTML.trim(), '3.3');
    assert.strictEqual(fonctionnementStreaming5.children[0].innerHTML.trim(), '2.3');
  });

  test('should display the predicted level', async function (assert) {
    assert.dom(screen.getByText("Niveau prédit de l'utilisateur: 2")).exists();
  });

  test('should display all translated steps', async function (assert) {
    assert.dom(screen.getByRole('listitem', { name: 'Acquis sans épreuves' })).exists();
    assert.dom(screen.getByRole('listitem', { name: 'Déjà testés' })).exists();
    assert.dom(screen.getByRole('listitem', { name: 'Tubes faciles' })).exists();
    assert.dom(screen.getByRole('listitem', { name: 'Épreuves chronométrées' })).exists();
    assert.dom(screen.getByRole('listitem', { name: 'Niveau par défaut' })).exists();
    assert.dom(screen.getByRole('listitem', { name: 'Choix aléatoire' })).exists();
  });

  test('should show current skill on the table', async function (assert) {
    const currentCell = screen.getByRole('cell', { name: '@outilsRS1' });
    assert.true(currentCell.children[0].classList.contains('current'));
  });

  test('should show invalidated skills on the table', async function (assert) {
    assert.expect(2);
    const failedCells = [
      screen.getByRole('cell', { name: '@outilsRS2' }),
      screen.getByRole('cell', { name: '@outilsRS3' }),
    ];

    failedCells.forEach((cell) => {
      const cellContent = cell.children[0].classList;
      assert.true(cellContent.contains('invalidated'));
    });
  });

  test('should show validated skills on the table', async function (assert) {
    assert.expect(2);
    const failedCells = ['@fonctionnementStreaming5', '@fonctionnementStreaming4'].map((name) =>
      screen.getByRole('cell', { name }),
    );

    failedCells.forEach((cell) => {
      const cellContent = cell.children[0].classList;
      assert.true(cellContent.contains('validated'));
    });
  });

  test('should show filtered steps', async function (assert) {
    const skillsExpectedToBeAvailable = [
      '@outilsTexte3',
      '@outilsTexte4',
      '@utiliserVisio2',
      '@utiliserVisio3',
      '@utiliserVisio4',
    ];

    assert.expect(skillsExpectedToBeAvailable.length);

    skillsExpectedToBeAvailable.map((skillName) => {
      const skillCell = screen.getByRole('cell', { name: skillName });
      assert.true(skillCell.children[0].classList.contains('eliminated'));
    });
  });
});
