import { render, within } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import FilterBanner from 'pix-admin/components/organization-learners/filter-banner';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | OrganizationLearners | FilterBanner', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should render filters', async function (assert) {
    //when
    const screen = await render(<template><FilterBanner /></template>);
    //then
    assert.ok(screen.getByRole('textbox', { name: 'Orga ID Externe' }));
    assert.ok(screen.getByRole('textbox', { name: 'Prénom/Nom' }));
    assert.ok(screen.getByRole('radiogroup', { name: 'Masquer les prescrits désactivés' }));
    assert.ok(screen.getByRole('button', { name: t('common.filters.actions.load') }));
    assert.ok(screen.getByRole('button', { name: t('common.filters.actions.clear') }));
  });
  test('it should filter by organizationExternalId', async function (assert) {
    //given
    const router = this.owner.lookup('service:router');
    const transitionToStub = sinon.stub(router, 'transitionTo');
    //when
    const screen = await render(<template><FilterBanner /></template>);
    await fillIn(screen.getByRole('textbox', { name: 'Orga ID Externe' }), 'ID');
    await click(screen.getByRole('button', { name: t('common.filters.actions.load') }));
    //then
    sinon.assert.calledWith(transitionToStub, {
      queryParams: {
        organizationExternalId: 'ID',
        fullName: undefined,
        hideDisabled: undefined,
        organizationSort: undefined,
        birthdateSort: undefined,
        updatedAtSort: undefined,
        pageNumber: undefined,
      },
    });
    assert.ok(true);
  });
  test('it should filter by fullName', async function (assert) {
    //given
    const router = this.owner.lookup('service:router');
    const transitionToStub = sinon.stub(router, 'transitionTo');
    //when
    const screen = await render(<template><FilterBanner /></template>);
    await fillIn(screen.getByRole('textbox', { name: 'Prénom/Nom' }), 'attestation');
    await click(screen.getByRole('button', { name: t('common.filters.actions.load') }));
    //then
    sinon.assert.calledWith(transitionToStub, {
      queryParams: {
        organizationExternalId: undefined,
        fullName: 'attestation',
        hideDisabled: undefined,
        organizationSort: undefined,
        birthdateSort: undefined,
        updatedAtSort: undefined,
        pageNumber: undefined,
      },
    });
    assert.ok(true);
  });
  test('it should hide disabled learners if toggle is on', async function (assert) {
    //given
    const router = this.owner.lookup('service:router');
    const transitionToStub = sinon.stub(router, 'transitionTo');
    //when
    const screen = await render(<template><FilterBanner /></template>);
    const toggle = screen.getByRole('radiogroup', { name: 'Masquer les prescrits désactivés' });
    await click(within(toggle).getByRole('radio', { name: 'Oui' }));
    //then
    sinon.assert.calledWith(transitionToStub, {
      queryParams: {
        organizationExternalId: undefined,
        fullName: undefined,
        hideDisabled: true,
        organizationSort: undefined,
        birthdateSort: undefined,
        updatedAtSort: undefined,
        pageNumber: undefined,
      },
    });
    assert.ok(true);
  });
  test('it should show disabled learners if toggle is off', async function (assert) {
    //given
    const router = this.owner.lookup('service:router');
    const transitionToStub = sinon.stub(router, 'transitionTo');
    //when
    const screen = await render(<template><FilterBanner /></template>);
    const toggle = screen.getByRole('radiogroup', { name: 'Masquer les prescrits désactivés' });
    await click(within(toggle).getByRole('radio', { name: 'Oui' }));
    await click(within(toggle).getByRole('radio', { name: 'Non' }));
    //then
    sinon.assert.calledWith(transitionToStub, {
      queryParams: {
        organizationExternalId: undefined,
        fullName: undefined,
        hideDisabled: undefined,
        organizationSort: undefined,
        birthdateSort: undefined,
        updatedAtSort: undefined,
        pageNumber: undefined,
      },
    });
    assert.ok(true);
  });
  test('it should clear filters but not toggle', async function (assert) {
    //given
    const router = this.owner.lookup('service:router');
    const transitionToStub = sinon.stub(router, 'transitionTo');
    //when
    const screen = await render(<template><FilterBanner /></template>);
    await fillIn(screen.getByRole('textbox', { name: 'Orga ID Externe' }), 'ID');
    await fillIn(screen.getByRole('textbox', { name: 'Prénom/Nom' }), 'attestation');
    const toggle = screen.getByRole('radiogroup', { name: 'Masquer les prescrits désactivés' });
    await click(within(toggle).getByRole('radio', { name: 'Oui' }));
    await click(screen.getByRole('button', { name: t('common.filters.actions.clear') }));
    //then
    sinon.assert.calledWith(transitionToStub, {
      queryParams: {
        organizationExternalId: undefined,
        fullName: undefined,
        hideDisabled: true,
        organizationSort: undefined,
        birthdateSort: undefined,
        updatedAtSort: undefined,
        pageNumber: undefined,
      },
    });
    assert.ok(true);
  });
});
