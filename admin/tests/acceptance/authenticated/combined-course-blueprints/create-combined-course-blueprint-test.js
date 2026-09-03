import { clickByName, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl from '../../../helpers/setup-intl';

module('Acceptance | Combined course blueprint | New', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const areas = createAreas();

    server.create('country', { code: '99100', name: 'France' });
    server.create('attestation', {
      templateName: 'parentalite',
      key: 'PARENTHOOD',
      file: 'parentalite.pdf',
      label: 'Parentalite',
    });

    server.create('target-profile', { id: 1, internalName: 'internalName', areas });

    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  test('it should redirect to list after creating successfully', async function (assert) {
    // when
    const screen = await visit('/combined-course-blueprints/new');

    await fillIn(screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }), 1);
    await screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }).click();
    await screen.getByLabelText(t('components.combined-course-blueprints.labels.module')).click();
    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
      'module-123',
    );
    await screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }).click();
    await fillIn(screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }), 1);
    await click(screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }));

    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.name'), { exact: false }),
      'name',
    );
    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.internal-name'), { exact: false }),
      'internalName',
    );

    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.illustration')),
      'illustrations/hello.svg',
    );

    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.description-sublabel'), { exact: false }),
      'description',
    );

    await click(
      screen.getByRole('button', { name: t('components.combined-course-blueprints.attestation.select-label') }),
    );
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Parentalite' }));

    await click(
      screen.getByRole('radio', {
        name: t('components.combined-course-blueprints.labels.reward-requirements.capped-tubes-selection-option'),
      }),
    );

    await click(
      screen.getByRole('button', {
        name: t('components.combined-course-blueprints.labels.reward-requirements.add-new-tubes-selection'),
      }),
    );

    assert.ok(screen.getByRole('heading', { name: 'Critère d’obtention sur une sélection de sujets du profil cible' }));

    await clickByName('1 · Titre domaine 1');
    await clickByName('1 Titre competence 1');
    await clickByName(/Sélection du niveau du sujet suivant : Tube/);
    const tubesListbox = await within(
      screen.getByRole('cell', { name: /Sélection du niveau du sujet suivant : Tube/ }),
    ).findByRole('listbox');
    await click(within(tubesListbox).getByRole('option', { name: '4' }));

    await fillIn(screen.getByLabelText('Taux de réussite requis', { exact: false }), '50');
    await fillIn(
      screen.getByRole('textbox', {
        name: t('components.combined-course-blueprints.labels.reward-requirements.description'),
      }),
      'Atteindre tel niveau sur tel sujet',
    );

    await click(screen.getByRole('button', { name: t('components.combined-course-blueprints.create.createButton') }));

    // then
    assert.strictEqual(currentURL(), '/combined-course-blueprints/list');
    assert.strictEqual(screen.getAllByRole('row').length, 2);
    assert.ok(screen.getByRole('cell', { name: /internalName/ }));
  });

  test('it should unload record when the user does not submit the data', async function (assert) {
    //given
    const screen = await visit('/combined-course-blueprints/new');

    //when
    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.internal-name'), { exact: false }),
      'internalName',
    );
    await click(screen.getByRole('link', { name: t('components.layout.sidebar.combined-course-blueprints') }));
    //then
    assert.ok(screen.getByText(t('common.tables.empty-result')));
  });

  test('it should rerender areas component when target profiles are removed', async function (assert) {
    //given
    const screen = await visit('/combined-course-blueprints/new');

    //when
    await fillIn(screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }), 1);
    await click(screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }));

    await click(
      screen.getByRole('button', { name: t('components.combined-course-blueprints.attestation.select-label') }),
    );
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Parentalite' }));

    await click(
      screen.getByRole('radio', {
        name: t('components.combined-course-blueprints.labels.reward-requirements.capped-tubes-selection-option'),
      }),
    );

    await click(
      screen.getByRole('button', {
        name: t('components.combined-course-blueprints.labels.reward-requirements.add-new-tubes-selection'),
      }),
    );

    await click(screen.getByRole('button', { name: 'Tout déplier' }));

    assert.ok(screen.getByText('@tubeName1 : Tube 1'));
    await click(screen.getByTestId('delete-0'));

    assert.notOk(screen.queryByText('@tubeName1 : Tube 1'));
  });

  function createAreas() {
    const tubes = [
      server.create('tube', {
        id: 'tubeId1',
        name: '@tubeName1',
        practicalTitle: 'Tube 1',
        skills: [],
        level: 8,
      }),
    ];

    const thematics = [server.create('thematic', { id: 'thematicId1', name: 'Thématique 1', tubes })];

    const competences = [
      server.create('competence', {
        id: 'competenceId1',
        index: '1',
        name: 'Titre competence 1',
        thematics,
      }),
    ];

    const tubes2 = [
      server.create('tube', {
        id: 'tubeId2',
        name: '@tubeName2',
        practicalTitle: 'Tube 2',
        skills: [],
        level: 8,
      }),
    ];

    const thematics2 = [server.create('thematic', { id: 'thematicId2', name: 'Thématique 2', tubes: tubes2 })];

    const competences2 = [
      server.create('competence', {
        id: 'competenceId2',
        index: '2',
        name: 'Titre competence 2',
        thematics: thematics2,
      }),
    ];

    const areas = [
      server.create('area', {
        id: 'areaId1',
        title: 'Titre domaine 1',
        code: 1,
        competences,
      }),
      server.create('area', {
        id: 'areaId2',
        title: 'Titre domaine 2',
        code: 2,
        competences: competences2,
      }),
    ];

    return areas;
  }
});
