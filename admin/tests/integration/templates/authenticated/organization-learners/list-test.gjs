import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import List from 'pix-admin/templates/authenticated/organization-learners/list';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Template | admin-organization-learners | list', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should render filters', async function (assert) {
    //given
    const model = [];
    //when
    const screen = await render(<template><List @model={{model}} /></template>);
    //then
    assert.ok(screen.getByRole('textbox', { name: 'Orga ID Externe' }));
    assert.ok(screen.getByRole('textbox', { name: 'Prénom/Nom' }));
    assert.ok(screen.getByRole('radiogroup', { name: 'Masquer les prescrits désactivés' }));
    assert.ok(screen.getByRole('button', { name: t('common.filters.actions.load') }));
    assert.ok(screen.getByRole('button', { name: t('common.filters.actions.clear') }));
  });

  test('it should render list template', async function (assert) {
    // when
    const store = this.owner.lookup('service:store');
    const model = [
      store.createRecord('admin-organization-learner', {
        firstName: 'firstname',
        lastName: 'lastname',
        birthdate: '2000-01-01',
        division: '6e',
        group: 'Groupe A',
        nationalStudentId: '123456789',
        organizationId: 1,
        organizationName: 'Super orga',
        userId: 1,
        updatedAt: new Date(),
        isDisabled: false,
      }),
      store.createRecord('admin-organization-learner', {
        firstName: 'firstname1',
        lastName: 'lastname2',
        birthdate: '2000-01-02',
        division: '5e',
        group: 'Groupe B',
        nationalStudentId: '12345678910',
        organizationId: 2,
        organizationName: 'Meilleure orga',
        userId: 2,
        updatedAt: new Date(),
        isDisabled: true,
      }),
    ];
    const screen = await render(<template><List @model={{model}} /></template>);

    // then
    assert.ok(screen.getByRole('heading', t('pages.organization-learners-list.main-title')));
    assert.ok(screen.getByText('firstname'));
    assert.ok(screen.getByText('firstname1'));
  });
});
