import { clickByName, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { faker } from '@faker-js/faker';
import { triggerCopySuccess } from 'ember-cli-clipboard/test-support';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { resolve } from 'rsvp';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ScoOrganizationParticipant::ManageAuthenticationMethodModal', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When Student is not connected with GAR method', function (hooks) {
    const username = 'john.doe0112';
    const email = 'john.doe0112@example.net';

    hooks.beforeEach(function () {
      this.studentWithUsernameAndEmail = EmberObject.create({
        id: 1,
        username,
        email,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2010-12-01',
        isAuthenticatedFromGar: false,
        hasUsername: true,
        hasEmail: true,
      });
      this.studentWithEmailOnly = EmberObject.create({
        id: 1,
        username,
        email,
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2010-12-01',
        isAuthenticatedFromGar: false,
        hasUsername: false,
        hasEmail: true,
        displayAddUsernameAuthentication: true,
      });

      this.display = true;
    });

    module('When Student is connected with username method', function () {
      test('should render component with username field', async function (assert) {
        // when
        const screen = await render(
          hbs`<ScoOrganizationParticipant::ManageAuthenticationMethodModal
  @student={{this.studentWithUsernameAndEmail}}
  @display={{this.display}}
/>`,
        );

        // then
        assert.ok(
          screen.getByRole('heading', {
            level: 3,
            name: this.intl.t(
              'pages.sco-organization-participants.manage-authentication-method-modal.section.username.label',
            ),
          }),
        );
        assert.ok(screen.getAllByRole('textbox', { value: username, required: false })[1]);
      });

      test('should render clipboard to copy username', async function (assert) {
        // when
        const screen = await render(
          hbs`<ScoOrganizationParticipant::ManageAuthenticationMethodModal
  @student={{this.studentWithUsernameAndEmail}}
  @display={{this.display}}
/>`,
        );

        // then
        assert.ok(
          screen
            .getByRole('button', {
              name: this.intl.t(
                'pages.sco-organization-participants.manage-authentication-method-modal.section.username.copy',
              ),
            })
            .hasAttribute('data-clipboard-text', username),
        );
      });

      test('should display tooltip when username copy button is clicked', async function (assert) {
        // given
        const screen = await render(
          hbs`<ScoOrganizationParticipant::ManageAuthenticationMethodModal
  @student={{this.studentWithUsernameAndEmail}}
  @display={{this.display}}
/>`,
        );

        // when
        await triggerCopySuccess(
          `button[aria-label="${this.intl.t(
            'pages.sco-organization-participants.manage-authentication-method-modal.section.username.copy',
          )}"]`,
        );

        // then
        assert.ok(
          screen.getByText(
            this.intl.t('pages.sco-organization-participants.manage-authentication-method-modal.copied'),
          ),
        );
      });
    });

    module('When Student is connected with email and username method', function () {
      test('should render component with email field', async function (assert) {
        // when
        const screen = await render(
          hbs`<ScoOrganizationParticipant::ManageAuthenticationMethodModal
  @student={{this.studentWithUsernameAndEmail}}
  @display={{this.display}}
/>`,
        );

        // then
        assert.ok(
          screen.getByRole('textbox', {
            name: this.intl.t(
              'pages.sco-organization-participants.manage-authentication-method-modal.section.email.label',
            ),
            value: email,
          }),
        );
      });

      test('should render clipboard to copy email', async function (assert) {
        // when
        const screen = await render(
          hbs`<ScoOrganizationParticipant::ManageAuthenticationMethodModal
  @student={{this.studentWithUsernameAndEmail}}
  @display={{this.display}}
/>`,
        );

        // then
        assert.ok(
          screen
            .getByRole('button', {
              name: this.intl.t(
                'pages.sco-organization-participants.manage-authentication-method-modal.section.email.copy',
              ),
            })
            .hasAttribute('data-clipboard-text', email),
        );
      });

      test('should display tooltip when email copy button is clicked', async function (assert) {
        // given
        const screen = await render(
          hbs`<ScoOrganizationParticipant::ManageAuthenticationMethodModal
  @student={{this.studentWithUsernameAndEmail}}
  @display={{this.display}}
/>`,
        );

        // when
        await triggerCopySuccess(
          `button[aria-label="${this.intl.t(
            'pages.sco-organization-participants.manage-authentication-method-modal.section.email.copy',
          )}"]`,
        );

        // then
        assert.ok(
          screen.getByText(
            this.intl.t('pages.sco-organization-participants.manage-authentication-method-modal.copied'),
          ),
        );
      });
    });

    module('When Student is connected with email only', function () {
      test('should render add username authentication method', async function (assert) {
        // when
        const screen = await render(
          hbs`<ScoOrganizationParticipant::ManageAuthenticationMethodModal
  @student={{this.studentWithEmailOnly}}
  @display={{this.display}}
/>`,
        );

        // then
        assert.ok(
          screen.getByRole('textbox', {
            name: this.intl.t(
              'pages.sco-organization-participants.manage-authentication-method-modal.section.email.label',
            ),
            value: email,
          }),
        );

        assert.ok(
          screen.getByRole('heading', {
            level: 3,
            name: this.intl.t(
              'pages.sco-organization-participants.manage-authentication-method-modal.section.add-username.label',
            ),
          }),
        );
      });
    });

    module('When password is generated', function (hooks) {
      let generatedPassword;

      hooks.beforeEach(function () {
        class StoreStub extends Service {
          createRecord() {
            generatedPassword = faker.internet.password();
            return EmberObject.create({
              save() {
                return resolve();
              },
              generatedPassword,
            });
          }
        }
        this.owner.unregister('service:store');
        this.owner.register('service:store', StoreStub);
      });

      test('should display unique password input when reset password button is clicked', async function (assert) {
        // given
        const screen = await render(
          hbs`<ScoOrganizationParticipant::ManageAuthenticationMethodModal
  @student={{this.studentWithUsernameAndEmail}}
  @display={{this.display}}
/>`,
        );

        // when
        await clickByName(
          this.intl.t(
            'pages.sco-organization-participants.manage-authentication-method-modal.section.reset-password.button',
          ),
        );

        // then
        assert.ok(
          screen.getByLabelText(
            this.intl.t(
              'pages.sco-organization-participants.manage-authentication-method-modal.section.password.label',
            ),
          ),
        );
      });

      test('should render clipboard to copy unique password', async function (assert) {
        // given
        const screen = await render(
          hbs`<ScoOrganizationParticipant::ManageAuthenticationMethodModal
  @student={{this.studentWithUsernameAndEmail}}
  @display={{this.display}}
/>`,
        );

        // when
        await clickByName(
          this.intl.t(
            'pages.sco-organization-participants.manage-authentication-method-modal.section.reset-password.button',
          ),
        );

        // then
        assert.ok(
          screen
            .getByRole('button', {
              name: this.intl.t(
                'pages.sco-organization-participants.manage-authentication-method-modal.section.password.copy',
              ),
            })
            .hasAttribute('data-clipboard-text', generatedPassword),
        );
      });

      test('should display tooltip when generated password copy button is clicked', async function (assert) {
        // given
        const screen = await render(
          hbs`<ScoOrganizationParticipant::ManageAuthenticationMethodModal
  @student={{this.studentWithUsernameAndEmail}}
  @display={{this.display}}
/>`,
        );

        // when
        await clickByName(
          this.intl.t(
            'pages.sco-organization-participants.manage-authentication-method-modal.section.reset-password.button',
          ),
        );
        await triggerCopySuccess(
          `button[aria-label="${this.intl.t(
            'pages.sco-organization-participants.manage-authentication-method-modal.section.password.copy',
          )}"]`,
        );

        // then
        assert.ok(
          screen.getByText(
            this.intl.t('pages.sco-organization-participants.manage-authentication-method-modal.copied'),
          ),
        );
      });

      test('should generate unique password each time the modal is used', async function (assert) {
        // given
        await render(
          hbs`<ScoOrganizationParticipant::ManageAuthenticationMethodModal
  @student={{this.studentWithUsernameAndEmail}}
  @display={{this.display}}
/>`,
        );
        await clickByName(
          this.intl.t(
            'pages.sco-organization-participants.manage-authentication-method-modal.section.reset-password.button',
          ),
        );
        const firstGeneratedPassword = this.element.querySelector('#generated-password').value;

        // when
        await render(
          hbs`<ScoOrganizationParticipant::ManageAuthenticationMethodModal
  @student={{this.studentWithUsernameAndEmail}}
  @display={{this.display}}
/>`,
        );
        await clickByName(
          this.intl.t(
            'pages.sco-organization-participants.manage-authentication-method-modal.section.reset-password.button',
          ),
        );
        const secondGeneratedPassword = this.element.querySelector('#generated-password').value;

        // then
        assert.notEqual(firstGeneratedPassword, secondGeneratedPassword);
      });
    });
  });

  module('When Student is connected with GAR method', function (hooks) {
    hooks.beforeEach(function () {
      this.studentGAR = EmberObject.create({
        id: 2,
        isAuthenticatedFromGar: true,
        displayAddUsernameAuthentication: true,
      });
      this.display = true;
    });

    test('should render component with GAR connection method', async function (assert) {
      // when
      const screen = await render(
        hbs`<ScoOrganizationParticipant::ManageAuthenticationMethodModal @student={{this.studentGAR}} @display={{this.display}} />`,
      );

      // then
      assert.ok(
        screen.getByText(
          this.intl.t(
            'pages.sco-organization-participants.manage-authentication-method-modal.section.mediacentre.label',
          ),
        ),
      );
      assert.ok(
        screen.getByRole('heading', {
          level: 3,
          name: this.intl.t(
            'pages.sco-organization-participants.manage-authentication-method-modal.section.add-username.label',
          ),
        }),
      );
    });
  });
});
