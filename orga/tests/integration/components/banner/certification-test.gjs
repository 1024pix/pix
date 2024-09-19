import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import Certification from 'pix-orga/components/banner/certification';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Banner::Certification', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When it is certification period', function (hooks) {
    let dayjs;

    hooks.beforeEach(function () {
      dayjs = this.owner.lookup('service:dayjs');
      sinon.stub(dayjs.self.prototype, 'format').withArgs('MM').returns('04').withArgs('YYYY').returns('2001');
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    module('when prescriber’s organization is of type SCO that manages students', function () {
      class CurrentUserStub extends Service {
        organization = { isSco: true };
        isSCOManagingStudents = true;
      }
      test('should render the current year', async function (assert) {
        // given
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        const screen = await render(<template><Certification /></template>);

        // then
        assert.ok(screen.getByText(/2001/));
      });
      test('should render the info link for finalize certification session', async function (assert) {
        // given
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        const screen = await render(<template><Certification /></template>);

        const link = screen.getByRole('link', { name: 'finaliser les sessions dans Pix Certif' });

        // then
        assert.strictEqual(link.href, 'https://cloud.pix.fr/s/DEarDXyxFxM78ps');
      });
    });

    module('when prescriber’s organization is not of type SCO that manages students', function () {
      test('should not render the banner regardless of the period', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          organization = { isSco: false };
          isSCOManagingStudents = false;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        await render(<template><Certification /></template>);

        // then
        assert.dom('.pix-banner').doesNotExist();
      });
    });
  });
});
