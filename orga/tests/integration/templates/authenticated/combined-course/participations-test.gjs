import { render, within } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { COMBINED_COURSE_PARTICIPATION_STATUSES } from 'pix-orga/models/combined-course-participation';
import Participations from 'pix-orga/templates/authenticated/combined-course/participations';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Template | authenticated/combined-course/participations', function (hooks) {
  setupIntlRenderingTest(hooks);

  let currentUser, baseModel, baseController;

  hooks.beforeEach(function () {
    currentUser = this.owner.lookup('service:current-user');

    currentUser.organization = {
      isManagingStudents: true,
      isSco: true,
    };

    baseModel = {
      combinedCourse: {
        id: 123,
        code: 'COMBINIX123',
        name: 'Combinix',
        hasCampaigns: true,
        hasModules: true,
        campaignIds: [123],
        combinedCourseStatistics: {
          participationsCount: 2,
          completedParticipationsCount: 1,
        },
      },
      combinedCourseParticipations: [
        {
          firstName: 'Jean',
          lastName: 'Bon',
        },
      ],
      divisions: [{ name: '6eme' }, { name: '5eme' }, { name: '4eme' }],
    };

    baseController = {
      triggerFiltering: sinon.stub(),
      fullName: 'Je',
      statuses: [COMBINED_COURSE_PARTICIPATION_STATUSES.COMPLETED],
      divisionsFilter: ['6eme'],
      clearFilters: sinon.stub(),
    };
  });

  test('renders template', async function (assert) {
    // given
    const model = { ...baseModel };
    const controller = { ...baseController };

    // when
    const screen = await render(<template><Participations @model={{model}} @controller={{controller}} /></template>);

    // then
    assert.ok(screen.getByRole('link', { name: t('navigation.main.campaigns') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.main.combined-courses') }));
    assert.ok(screen.getByRole('heading', { name: /Combinix/, level: 1 }));
    assert.ok(screen.getByText('COMBINIX123'));
    const campaignLink = screen.getByRole('link', {
      name: t('pages.combined-course.campaigns', { count: 1, index: 1 }),
    });
    assert.ok(campaignLink.getAttribute('href').endsWith('campagnes/123'));

    const table = screen.getByRole('table', { name: t('pages.combined-course.table.description') });
    assert.strictEqual(within(table).getAllByRole('row').length, 2);
  });

  module('filters', function () {
    test('call clear filter', async function (assert) {
      // given
      const model = { ...baseModel };
      const controller = { ...baseController };

      // when
      const screen = await render(<template><Participations @model={{model}} @controller={{controller}} /></template>);

      await click(screen.getByRole('button', { name: t('common.filters.actions.clear') }));

      // then
      assert.true(controller.clearFilters.calledOnce);
    });

    test('prefill common input filters', async function (assert) {
      // given
      const model = { ...baseModel };
      const controller = { ...baseController };

      // when
      const screen = await render(<template><Participations @model={{model}} @controller={{controller}} /></template>);

      assert.ok(screen.getByDisplayValue(controller.fullName));
      const select = screen.getByLabelText(t('pages.combined-course.filters.by-status'));
      await click(select);
      await screen.findByRole('menu');

      // then
      assert.true(screen.getByLabelText(t('pages.combined-course.filters.status.COMPLETED')).checked);
    });

    test('prefill divisions filter', async function (assert) {
      // given
      const model = { ...baseModel };
      const controller = { ...baseController };

      // when
      const screen = await render(<template><Participations @model={{model}} @controller={{controller}} /></template>);

      const select = screen.getByLabelText(t('common.filters.divisions.label'));
      await click(select);
      await screen.findByRole('menu');

      // then
      assert.true(screen.getByLabelText(controller.divisionsFilter[0]).checked);
    });

    test('prefill groups filter', async function (assert) {
      // given
      currentUser.organization = {
        isManagingStudents: true,
        isSco: false,
        isSup: true,
      };

      const model = { ...baseModel };
      const controller = { ...baseController };

      // when
      const screen = await render(<template><Participations @model={{model}} @controller={{controller}} /></template>);

      const select = screen.getByLabelText(t('common.filters.groups.label'));
      await click(select);
      await screen.findByRole('menu');

      // then
      assert.true(screen.getByLabelText(controller.divisionsFilter[0]).checked);
    });

    test('should call triggerFiltering when update name filter', async function (assert) {
      // given
      const model = { ...baseModel };
      const controller = { ...baseController };

      // when
      const screen = await render(<template><Participations @model={{model}} @controller={{controller}} /></template>);
      const input = screen.getByLabelText(t('common.filters.fullname.label'));
      await fillIn(input, 'marcelle');

      // then
      assert.ok(controller.triggerFiltering.calledWithExactly('fullName', 'marcelle'));
    });

    test('should call triggerFiltering when select a status', async function (assert) {
      // given
      const model = { ...baseModel };
      const controller = { ...baseController };

      // when
      const screen = await render(<template><Participations @model={{model}} @controller={{controller}} /></template>);

      const select = screen.getByLabelText(t('pages.combined-course.filters.by-status'));
      await click(select);
      await screen.findByRole('menu');
      await click(screen.getByLabelText(t('pages.combined-course.filters.status.STARTED')));

      // then
      assert.ok(
        controller.triggerFiltering.calledWithExactly('statuses', [
          COMBINED_COURSE_PARTICIPATION_STATUSES.COMPLETED,
          COMBINED_COURSE_PARTICIPATION_STATUSES.STARTED,
        ]),
      );
    });

    test('should call triggerFiltering when select a division', async function (assert) {
      // given
      const model = { ...baseModel };
      const controller = { ...baseController };

      // when
      const screen = await render(<template><Participations @model={{model}} @controller={{controller}} /></template>);

      const select = screen.getByLabelText(t('common.filters.divisions.label'));
      await click(select);
      await screen.findByRole('menu');
      await click(screen.getByLabelText(model.divisions[1].name));

      // then
      assert.ok(controller.triggerFiltering.calledWithExactly('divisions', ['6eme', '5eme']));
    });

    test('should call triggerFiltering when select a group', async function (assert) {
      // given
      currentUser.organization = {
        isManagingStudents: true,
        isSco: false,
        isSup: true,
      };

      const model = { ...baseModel };
      const controller = { ...baseController };

      // when
      const screen = await render(<template><Participations @model={{model}} @controller={{controller}} /></template>);

      const select = screen.getByLabelText(t('common.filters.groups.label'));
      await click(select);
      await screen.findByRole('menu');
      await click(screen.getByLabelText(model.divisions[1].name));

      // then
      assert.ok(controller.triggerFiltering.calledWithExactly('groups', ['6eme', '5eme']));
    });
  });
});
