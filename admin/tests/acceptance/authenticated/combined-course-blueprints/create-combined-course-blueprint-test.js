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
    const store = this.owner.lookup('service:store');
    _createFramework(store);

    server.create('country', { code: '99100', name: 'France' });
    server.create('attestation', {
      templateName: 'parentalite',
      key: 'PARENTHOOD',
      file: 'parentalite.pdf',
      label: 'Parentalite',
    });

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

    await fillIn(screen.getByLabelText(t('components.combined-course-blueprints.labels.description')), 'description');

    await click(
      screen.getByRole('button', { name: t('components.combined-course-blueprints.attestation.select-label') }),
    );
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Parentalite' }));

    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName(/Sélection du niveau du sujet suivant : Tube/);
    const tubesListbox = await within(
      screen.getByRole('cell', { name: /Sélection du niveau du sujet suivant : Tube/ }),
    ).findByRole('listbox');
    await click(within(tubesListbox).getByRole('option', { name: '4' }));
    await fillIn(screen.getByLabelText('Taux de réussite requis', { exact: false }), '50');
    await fillIn(
      screen.getByRole('textbox', { name: t('components.combined-course-blueprints.labels.reward-requirements') }),
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

  function _createFramework(store) {
    const tubes = [
      store.createRecord('tube', {
        id: 'tubeId1',
        name: '@tubeName1',
        practicalTitle: 'Tube 1',
        skills: [],
        level: 8,
      }),
    ];

    const thematics = [store.createRecord('thematic', { id: 'thematicId', name: 'Thématique', tubes: tubes })];

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

    return store.createRecord('framework', { id: 'frameworkId', name: 'Pix', areas });
  }
});
