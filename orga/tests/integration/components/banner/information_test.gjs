import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import Information from 'pix-orga/components/banner/information';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Banner::Information', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Import Banner', function () {
    module('when prescriber’s organization is of type SCO that manages students', function () {
      module('when prescriber has not imported student yet', function () {
        class CurrentUserStub extends Service {
          prescriber = { areNewYearOrganizationLearnersImported: false };
          organization = { isSco: true };
          isSCOManagingStudents = true;
        }

        test('should render the more info link', async function (assert) {
          // given
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          const screen = await render(<template><Information /></template>);

          // then
          const link = screen.getByRole('link', { name: 'Plus d’info' });

          assert.strictEqual(
            link.href,
            'https://view.genial.ly/62cd67b161c1e3001759e818?idSlide=e11f61b2-3047-4be3-9a4d-dd9e7cc698ba',
          );
        });

        test('should render the import link banner', async function (assert) {
          // given
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          const screen = await render(<template><Information /></template>);

          // then
          const link = screen.getByRole('link', { name: 'importer' });

          assert.dom(link).exists();
        });
      });
    });

    module('when prescriber has already imported students', function () {
      test('should not display import informations', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { areNewYearOrganizationLearnersImported: true };
          organization = { isSco: true };
          isSCOManagingStudents = true;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        const screen = await render(<template><Information /></template>);

        const link = screen.queryByRole('link', { name: 'importer' });
        // then
        assert.notOk(link);
      });
    });

    module('when prescriber’s organization is not of type SCO that manages students', function () {
      test('should not render the banner regardless of whether students have been imported or not', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { areNewYearOrganizationLearnersImported: false };
          organization = { isSco: false };
          isSCOManagingStudents = false;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        await render(<template><Information /></template>);

        // then
        assert.dom('.pix-banner').doesNotExist();
      });
    });
  });

  module('Certification Banner', function () {
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
          prescriber = { areNewYearOrganizationLearnersImported: true };
          organization = { isSco: true };
          isSCOManagingStudents = true;
        }
        test('should render the current year', async function (assert) {
          // given
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          const screen = await render(<template><Information /></template>);

          // then
          assert.ok(screen.getByText(/2001/));
        });
        test('should render the info link for finalize certification session', async function (assert) {
          // given
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          const screen = await render(<template><Information /></template>);

          const link = screen.getByRole('link', { name: 'finaliser les sessions dans Pix Certif' });

          // then
          assert.strictEqual(
            link.href,
            'https://view.genial.ly/62cd67b161c1e3001759e818?idSlide=0f1b3413-7fef-4c97-b890-675c5bafbe93',
          );
        });
      });

      module('when prescriber’s organization is not of type SCO that manages students', function () {
        test('should not render the banner regardless of the period', async function (assert) {
          // given
          class CurrentUserStub extends Service {
            prescriber = { areNewYearOrganizationLearnersImported: false };
            organization = { isSco: false };
            isSCOManagingStudents = false;
          }
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          await render(<template><Information /></template>);

          // then
          assert.dom('.pix-banner').doesNotExist();
        });
      });
    });
  });
});
