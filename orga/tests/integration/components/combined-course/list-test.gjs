import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import CombinedCourseList from 'pix-orga/components/combined-course/list';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | CombinedCourse | List', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display a table with caption', async function (assert) {
    // given
    const combinedCourses = [
      {
        id: '1',
        name: 'Parcours Débutant',
        code: 'ABC123',
        participationsCount: 10,
        completedParticipationsCount: 5,
      },
    ];

    // when
    const screen = await render(<template><CombinedCourseList @combinedCourses={{combinedCourses}} /></template>);

    // then
    assert.dom(screen.getByRole('table', { name: t('pages.combined-courses.table.caption') })).exists();
  });

  test('it should display column headers', async function (assert) {
    // given
    const combinedCourses = [
      {
        id: '1',
        name: 'Parcours Débutant',
        code: 'ABC123',
        participationsCount: 10,
        completedParticipationsCount: 5,
      },
    ];

    // when
    const screen = await render(<template><CombinedCourseList @combinedCourses={{combinedCourses}} /></template>);

    const table = screen.getByRole('table');

    // then
    assert.ok(within(table).getByRole('columnheader', { name: t('pages.combined-courses.table.column.name') }));
    assert.ok(within(table).getByRole('columnheader', { name: t('pages.combined-courses.table.column.code') }));
    assert.ok(within(table).getByRole('columnheader', { name: t('pages.combined-courses.table.column.participants') }));
    assert.ok(within(table).getByRole('columnheader', { name: t('pages.combined-courses.table.column.completed') }));
  });

  test('it should display combined course details', async function (assert) {
    // given
    const combinedCourses = [
      {
        id: '1',
        name: 'Parcours Débutant',
        code: 'ABC123',
        participationsCount: 10,
        completedParticipationsCount: 5,
      },
      {
        id: '2',
        name: 'Parcours Avancé',
        code: 'DEF456',
        participationsCount: 20,
        completedParticipationsCount: 15,
      },
    ];

    // when
    const screen = await render(<template><CombinedCourseList @combinedCourses={{combinedCourses}} /></template>);

    const table = screen.getByRole('table');

    // then
    assert.ok(within(table).getByRole('link', { name: 'Parcours Débutant' }));
    assert.ok(within(table).getByRole('link', { name: 'Parcours Avancé' }));
    assert.ok(within(table).getByRole('cell', { name: 'ABC123' }));
    assert.ok(within(table).getByRole('cell', { name: 'DEF456' }));
    assert.ok(within(table).getByRole('cell', { name: '10' }));
    assert.ok(within(table).getByRole('cell', { name: '20' }));
    assert.ok(within(table).getByRole('cell', { name: '5' }));
    assert.ok(within(table).getByRole('cell', { name: '15' }));
  });

  test('it should display activity type icon', async function (assert) {
    // given
    const combinedCourses = [
      {
        id: '1',
        name: 'Parcours Débutant',
        code: 'ABC123',
        participationsCount: 10,
        completedParticipationsCount: 5,
      },
    ];

    // when
    const screen = await render(<template><CombinedCourseList @combinedCourses={{combinedCourses}} /></template>);

    // then
    assert.ok(screen.getByRole('img', { name: t('components.activity-type.explanation.COMBINED_COURSE') }));
  });

  test('it should display a link to combined course detail page', async function (assert) {
    // given
    this.owner.setupRouter();

    const combinedCourses = [
      {
        id: '1',
        name: 'Parcours Débutant',
        code: 'ABC123',
        participationsCount: 10,
        completedParticipationsCount: 5,
      },
    ];

    // when
    const screen = await render(<template><CombinedCourseList @combinedCourses={{combinedCourses}} /></template>);

    // then
    assert.ok(screen.getByRole('link', { name: 'Parcours Débutant' }));
  });

  test('it should navigate to combined course detail page when clicking on row', async function (assert) {
    // given
    const routerService = this.owner.lookup('service:router');
    sinon.stub(routerService, 'transitionTo');

    const combinedCourses = [
      {
        id: '1',
        name: 'Parcours Débutant',
        code: 'ABC123',
        participationsCount: 10,
        completedParticipationsCount: 5,
      },
    ];

    const screen = await render(<template><CombinedCourseList @combinedCourses={{combinedCourses}} /></template>);

    // when
    const row = screen.getByRole('row', { name: /Parcours Débutant/ });
    await click(row);

    // then
    assert.ok(routerService.transitionTo.calledWith('authenticated.combined-course', '1'));
  });
});
