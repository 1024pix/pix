import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { triggerEvent } from '@ember/test-helpers';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | ScoOrganizationParticipant::Import', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display title and the loading state', async function (assert) {
    // given
    this.set('onImportStudents', sinon.stub());
    this.set('isLoading', false);

    // when
    const screen = await render(
      hbs`<ScoOrganizationParticipant::Import @onImportStudents={{this.onImportStudents}} @isLoading={{this.isLoading}}/>`,
    );

    // then
    assert
      .dom(
        screen.getByRole('heading', {
          name: this.intl.t('pages.sco-organization-participants-import.title'),
          level: 1,
        }),
      )
      .exists();

    assert.dom(screen.queryByText(this.intl.t('common.loading'))).doesNotExist();
  });

  test('it should display loading message', async function (assert) {
    // given
    this.set('onImportStudents', sinon.stub());
    this.set('onReplaceStudents', sinon.stub());
    this.set('isLoading', true);

    // when
    const screen = await render(
      hbs`<ScoOrganizationParticipant::Import @onImportStudents={{this.onImportStudents}} @isLoading={{this.isLoading}}/>`,
    );

    // then
    assert.dom(screen.getByText(this.intl.t('common.loading'))).exists();
  });

  module('when organization is SCO', (hooks) => {
    let screen;
    let importStudentsSpyStub;

    hooks.beforeEach(async function () {
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        organization = {};
        prescriber = {
          lang: 'fr',
        };
      }

      importStudentsSpyStub = sinon.stub();

      this.owner.register('service:current-user', CurrentUserStub);
      this.set('importStudentsSpy', importStudentsSpyStub);
    });

    test('it trigger importStudentsSpy when clicking on the import button', async function (assert) {
      screen = await render(
        hbs`<ScoOrganizationParticipant::Import @onImportStudents={{this.importStudentsSpy}} @isLoading={{false}} />`,
      );

      const file = new Blob(['foo'], { type: 'valid-file' });

      const input = screen.getByLabelText(
        this.intl.t('pages.sco-organization-participants-import.actions.add.title', { types: '.xml ou .zip' }),
      );

      await triggerEvent(input, 'change', { files: [file] });

      assert.ok(importStudentsSpyStub.called);
    });

    test('a message should be display when importing ', async function (assert) {
      screen = await render(
        hbs`<ScoOrganizationParticipant::Import @onImportStudents={{this.importStudentsSpy}} @isLoading={{true}} />`,
      );

      assert
        .dom(await screen.findByText(this.intl.t('pages.sco-organization-participants-import.actions.add.information')))
        .exists();
    });
  });

  module('when organization is SCO and tagged as Agriculture and CFA', (hooks) => {
    let screen;
    hooks.beforeEach(async function () {
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        isAgriculture = true;
        organization = {};
        prescriber = {
          lang: 'fr',
        };
      }

      this.set('importStudentsSpy', () => {});
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('a message should be display when importing ', async function (assert) {
      screen = await render(
        hbs`<ScoOrganizationParticipant::Import @onImportStudents={{this.importStudentsSpy}} @isLoading={{true}} />`,
      );
      assert
        .dom(await screen.findByText(this.intl.t('pages.sco-organization-participants-import.actions.add.information')))
        .exists();
    });
  });
});
