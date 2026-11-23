import { render, within } from '@1024pix/ember-testing-library';
import UserCertificationCourses from 'pix-admin/components/users/user-certification-courses';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Users | User certification courses', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  let intl;
  const userId = 1;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    intl = this.owner.lookup('service:intl');

    const serviceRouter = this.owner.lookup('service:router');
    sinon.stub(serviceRouter, 'currentRoute').value({ parent: { params: { user_id: userId } } });
  });

  module('when user has no certification course', function () {
    test('displays a title and an info', async function (assert) {
      // given
      const certificationCourses = [];

      // when
      const screen = await render(
        <template><UserCertificationCourses @certificationCourses={{certificationCourses}} /></template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            name: t('components.users.certification-centers.certification-courses.section-title'),
          }),
        )
        .exists();

      assert
        .dom(screen.getByText(t('components.users.certification-centers.certification-courses.empty-table')))
        .exists();
    });
  });

  module('when user has certification courses', function () {
    module('when user has a SuperAdmin, Certif or Support role', function () {
      test('displays a table with a table of certification courses', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: true };

        const certificationCourse = store.createRecord('user-certification-course', {
          id: '1',
          sessionId: 23,
          createdAt: new Date('2025-04-01'),
          isPublished: true,
        });
        const certificationCourse2 = store.createRecord('user-certification-course', {
          id: '2',
          sessionId: 24,
          createdAt: new Date('2025-04-02'),
          isPublished: false,
        });
        const certificationCourseCreatedAt = intl.formatDate(certificationCourse.createdAt);

        const certificationCourses = [certificationCourse, certificationCourse2];

        // when
        const screen = await render(
          <template><UserCertificationCourses @certificationCourses={{certificationCourses}} /></template>,
        );

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: t('components.users.certification-centers.certification-courses.section-title'),
            }),
          )
          .exists();

        const idCell = screen.getByRole('cell', { name: certificationCourse.id });
        assert.dom(within(idCell).getByRole('link', { name: certificationCourse.id })).exists();

        assert.dom(screen.getByRole('cell', { name: certificationCourseCreatedAt })).exists();

        const sessionIdCell = screen.getByRole('cell', { name: certificationCourse.sessionId });
        assert.dom(within(sessionIdCell).getByRole('link', { name: certificationCourse.sessionId })).exists();

        assert.dom(screen.getByRole('cell', { name: t('pages.certifications.session-state.published') })).exists();
        assert.dom(screen.getByRole('cell', { name: t('pages.certifications.session-state.not-published') })).exists();
      });
    });

    module('when user has a metier role', function () {
      test('it displays certification IDs as plain text and session IDs as links', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isMetier: true };

        const certificationCourse = store.createRecord('user-certification-course', {
          id: '1234',
          sessionId: 5678,
          createdAt: new Date('2025-04-01'),
          isPublished: true,
        });
        const certificationCourseCreatedAt = intl.formatDate(certificationCourse.createdAt);

        const certificationCourses = [certificationCourse];

        // when
        const screen = await render(
          <template><UserCertificationCourses @certificationCourses={{certificationCourses}} /></template>,
        );

        // then
        const idCell = screen.getByRole('cell', { name: '1234' });
        assert.dom(within(idCell).queryByRole('link')).doesNotExist();
        assert.dom(idCell).hasText('1234');

        assert.dom(screen.getByRole('cell', { name: certificationCourseCreatedAt })).exists();

        const sessionIdCell = screen.getByRole('cell', { name: '5678' });
        assert.dom(within(sessionIdCell).getByRole('link', { name: '5678' })).exists();

        assert.dom(screen.getByRole('cell', { name: t('pages.certifications.session-state.published') })).exists();
      });
    });
  });
});
