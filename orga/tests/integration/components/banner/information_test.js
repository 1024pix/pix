import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import sinon from 'sinon';

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
          const screen = await render(hbs`<Banner::Information />`);

          // then
          const link = screen.getByRole('link', { name: 'Plus d’info' });

          assert.strictEqual(
            link.href,
            'https://view.genial.ly/62cd67b161c1e3001759e818?idSlide=cd748a12-ef8e-4683-8139-eb851bd0eb23'
          );
        });

        test('should render the import link banner', async function (assert) {
          // given
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          const screen = await render(hbs`<Banner::Information />`);

          // then
          const link = screen.getByRole('link', { name: 'importer la base élèves' });

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
        const screen = await render(hbs`<Banner::Information />`);

        const link = screen.queryByRole('link', { name: 'importer la base élèves' });
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
        await render(hbs`<Banner::Information />`);

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
        sinon.stub(dayjs.self.prototype, 'format').returns('04');
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

        test('should render the info link for finalize certification session', async function (assert) {
          // given
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          const screen = await render(hbs`<Banner::Information />`);

          const link = screen.getByRole('link', { name: 'finaliser les sessions dans Pix Certif' });

          // then
          assert.strictEqual(
            link.href,
            'https://view.genial.ly/62cd67b161c1e3001759e818?idSlide=0f1b3413-7fef-4c97-b890-675c5bafbe93'
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
          await render(hbs`<Banner::Information />`);

          // then
          assert.dom('.pix-banner').doesNotExist();
        });
      });
    });

    module(
      'when prescriber’s organization is of type SCO that manages students and it is not certification period',
      function () {
        class CurrentUserStub extends Service {
          prescriber = { areNewYearOrganizationLearnersImported: false };
          organization = { isSco: true };
          isSCOManagingStudents = true;
        }

        test('should render the more info link', async function (assert) {
          // given
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          const screen = await render(hbs`<Banner::Information />`);

          // then
          const link = screen.getByRole('link', { name: 'Plus d’info' });

          assert.strictEqual(
            link.href,
            'https://view.genial.ly/62cd67b161c1e3001759e818?idSlide=cd748a12-ef8e-4683-8139-eb851bd0eb23'
          );
        });

        test('should render the import link banner', async function (assert) {
          // given
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          const screen = await render(hbs`<Banner::Information />`);

          // then
          const link = screen.getByRole('link', { name: 'importer la base élèves' });

          assert.dom(link).exists();
        });
      }
    );
  });

  module('Campaign Banner', function (hooks) {
    let dayjs;

    hooks.beforeEach(function () {
      dayjs = this.owner.lookup('service:dayjs');
      sinon.stub(dayjs.self.prototype, 'format').returns('08');
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    module('when prescriber’s organization is of type SCO', function () {
      test('should render the campaign banner', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { areNewYearOrganizationLearnersImported: true };
          organization = { isSco: true };
        }
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        await render(hbs`<Banner::Information />`);

        // then
        assert
          .dom('.pix-banner')
          .includesText(
            'Parcours de rentrée 2022 : N’oubliez pas de créer les campagnes de rentrée et de diffuser les codes aux élèves avant la Toussaint. Plus d’info'
          );
      });

      module('when prescriber’s organization is managing students', function () {
        test('should display links', async function (assert) {
          // given
          class CurrentUserStub extends Service {
            prescriber = { areNewYearOrganizationLearnersImported: true };
            organization = { isSco: true };
            isSCOManagingStudents = true;
            isAgriculture = false;
          }
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          const screen = await render(hbs`<Banner::Information />`);

          // then
          const link = screen.getByRole('link', { name: 'Plus d’info' });

          assert.strictEqual(
            link.href,
            'https://view.genial.ly/62cd67b161c1e3001759e818?idSlide=e11f61b2-3047-4be3-9a4d-dd9e7cc698ba'
          );
        });
      });

      module('when prescriber’s organization is not managing students', function () {
        test('should display default links', async function (assert) {
          // given
          class CurrentUserStub extends Service {
            prescriber = { areNewYearOrganizationLearnersImported: true };
            organization = { isSco: true };
            isSCOManagingStudents = false;
            isAgriculture = false;
          }
          this.owner.register('service:current-user', CurrentUserStub);

          // when
          const screen = await render(hbs`<Banner::Information />`);

          const link = screen.getByRole('link', { name: 'Plus d’info' });

          assert.strictEqual(
            link.href,
            'https://view.genial.ly/5fea2c3d6157fe0d69196ed9?idSlide=16cedb0c-3c1c-4cd3-a00b-49c01b0afcc2'
          );
        });
      });
    });

    module('when prescriber’s organization is not of type SCO', function () {
      test('should not display the campaign banner', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { areNewYearOrganizationLearnersImported: true };
          organization = { isSco: false };
        }
        this.owner.register('service:current-user', CurrentUserStub);

        // when
        await render(hbs`<Banner::Information />`);

        // then
        assert.dom('.pix-banner').doesNotExist();
      });
    });
  });
});
