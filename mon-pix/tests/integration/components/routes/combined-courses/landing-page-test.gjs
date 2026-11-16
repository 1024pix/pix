import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CombinedCourseLandingPage from 'mon-pix/components/routes/combined-courses/landing-page';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService, stubSessionService } from '../../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering.js';

module('Integration | Component | Combined Courses | Landing page', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('display data when exists', function () {
    module('when organization is Pix', function () {
      test('should not display logo', async function (assert) {
        //given
        const store = this.owner.lookup('service:store');

        const combinedCourse = store.createRecord('combined-course', {
          organizationId: ENV.APP.AUTONOMOUS_COURSES_ORGANIZATION_ID,
          organizationName: 'Pix',
        });

        //when
        const screen = await render(
          <template><CombinedCourseLandingPage @combinedCourse={{combinedCourse}} /></template>,
        );

        //then
        const result = await screen.getAllByAltText(combinedCourse.organizationName);
        assert.strictEqual(result.length, 1);
      });
    });
    module('durationSpan', function () {
      test('should not display duration when it does not exists', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const combinedCourse = store.createRecord('combined-course');
        // when
        const screen = await render(
          <template><CombinedCourseLandingPage @combinedCourse={{combinedCourse}} /></template>,
        );
        // then
        assert.notOk(screen.queryByLabelText(/Durée estimée/));
      });
      test('should display duration when it exists', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const combinedCourse = store.createRecord('combined-course', {
          durationSpan: 'short',
        });
        // when
        const screen = await render(
          <template><CombinedCourseLandingPage @combinedCourse={{combinedCourse}} /></template>,
        );

        // then
        assert.ok(screen.getByLabelText(/Durée estimée/));
      });
    });
    module('reward', function () {
      test('should display attestation text when the combined course has a reward', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const reward = store.createRecord('combined-course-reward');
        const combinedCourse = store.createRecord('combined-course');
        combinedCourse.reward = reward;

        // when
        const screen = await render(
          <template><CombinedCourseLandingPage @combinedCourse={{combinedCourse}} /></template>,
        );

        // then
        assert.ok(screen.getByText(t('pages.campaign-landing.has-reward')));
      });
      test('should not display attestation text when the combined course does not have a reward', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const combinedCourse = store.createRecord('combined-course');

        // when
        const screen = await render(
          <template><CombinedCourseLandingPage @combinedCourse={{combinedCourse}} /></template>,
        );

        // then
        assert.notOk(screen.queryByText(t('pages.campaign-landing.has-reward')));
      });
    });
    module('in every case', function () {
      test('should display combined course name and organization name', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const combinedCourse = store.createRecord('combined-course', {
          name: 'parcours combiné',
          organizationName: 'organisation',
        });

        // when
        const screen = await render(
          <template><CombinedCourseLandingPage @combinedCourse={{combinedCourse}} /></template>,
        );

        // then
        assert.ok(screen.getByText(combinedCourse.name));
        assert.ok(screen.getByText(combinedCourse.organizationName, { exact: false }));
      });
    });
  });
  module('connection and access', function () {
    module('When the user is authenticated', function (hooks) {
      let session;

      hooks.beforeEach(function () {
        stubCurrentUserService(this.owner, { firstName: 'Izuku', lastName: 'Midorya' });
        session = stubSessionService(this.owner, { isAuthenticated: true });
      });

      test('should display the link to disconnect and the username', async function (assert) {
        // when
        const screen = await render(<template><CombinedCourseLandingPage /></template>);

        // then
        assert.ok(
          screen.getByText(t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' })),
        );
        assert.ok(screen.getByRole('link', { name: t('pages.campaign-landing.warning-message-logout') }));
      });

      test('should call session.invalidate to shut down the session when user click on disconnect', async function (assert) {
        // when
        const screen = await render(<template><CombinedCourseLandingPage /></template>);

        await click(screen.getByRole('link', { name: t('pages.campaign-landing.warning-message-logout') }));

        // then
        sinon.assert.calledOnce(session.invalidate);
        assert.ok(true);
      });
    });
    module('When the user is not authenticated', function (hooks) {
      hooks.beforeEach(function () {
        stubCurrentUserService(this.owner, { firstName: 'Izuku', lastName: 'Midorya' });
        stubSessionService(this.owner, { isAuthenticated: false });
      });

      test('should display double connection - inscription cta, no username and no link to disconnect', async function (assert) {
        // when
        const store = this.owner.lookup('service:store');
        const combinedCourse = store.createRecord('combined-course', {
          code: 'CODE123',
          organizationId: 123,
        });
        const screen = await render(
          <template><CombinedCourseLandingPage @combinedCourse={{combinedCourse}} /></template>,
        );
        const loginCta = screen.getByRole('button', { name: t('pages.campaign-landing.login.login-cta') });
        const signupCta = screen.getByRole('button', { name: t('pages.campaign-landing.login.signup-cta') });
        // then
        assert.notOk(await screen.queryByRole('link', { name: t('pages.campaign-landing.warning-message-logout') }));
        assert.notOk(
          await screen.queryByText(
            t('pages.campaign-landing.warning-message', { firstName: 'Izuku', lastName: 'Midorya' }),
          ),
        );
        assert.ok(loginCta);
        assert.ok(signupCta);
      });
    });
  });
});
