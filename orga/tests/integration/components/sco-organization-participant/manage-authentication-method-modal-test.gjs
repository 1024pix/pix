import { clickByName, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { faker } from '@faker-js/faker';
import ScoOrganizationParticipantManageAuthenticationMethodModal from 'pix-orga/components/sco-organization-participant/manage-authentication-method-modal';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ScoOrganizationParticipant::ManageAuthenticationMethodModal', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText: async () => {} },
      writable: true,
      configurable: true,
    });
  });

  module('When Student is not connected with GAR method', function () {
    const username = 'john.doe0112';
    const email = 'john.doe0112@example.net';
    const studentWithUsernameAndEmail = EmberObject.create({
      id: '1',
      username,
      email,
      firstName: 'John',
      lastName: 'Doe',
      birthdate: '2010-12-01',
      isAuthenticatedFromGar: false,
      hasUsername: true,
      hasEmail: true,
    });
    const studentWithEmailOnly = EmberObject.create({
      id: '1',
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
    const display = true;

    module('When Student is connected with username method', function () {
      test('should render component with username field', async function (assert) {
        // when
        const screen = await render(
          <template>
            <ScoOrganizationParticipantManageAuthenticationMethodModal
              @student={{studentWithUsernameAndEmail}}
              @display={{display}}
            />
          </template>,
        );

        // then
        assert.ok(
          screen.getByRole('heading', {
            level: 3,
            name: t('pages.sco-organization-participants.manage-authentication-method-modal.section.username.label'),
          }),
        );
        assert.ok(screen.getAllByRole('textbox', { value: username, required: false })[1]);
      });

      test('should render clipboard to copy username', async function (assert) {
        // given
        let copiedText;
        window.navigator.clipboard.writeText = async (text) => {
          copiedText = text;
        };

        const screen = await render(
          <template>
            <ScoOrganizationParticipantManageAuthenticationMethodModal
              @student={{studentWithUsernameAndEmail}}
              @display={{display}}
            />
          </template>,
        );

        // when
        await clickByName(
          t('pages.sco-organization-participants.manage-authentication-method-modal.section.username.copy'),
        );

        // then
        assert.ok(
          screen.getByRole('button', {
            name: t('pages.sco-organization-participants.manage-authentication-method-modal.section.username.copy'),
          }),
        );
        assert.strictEqual(copiedText, username);
      });

      test('should display tooltip when username copy button is clicked', async function (assert) {
        // given
        const screen = await render(
          <template>
            <ScoOrganizationParticipantManageAuthenticationMethodModal
              @student={{studentWithUsernameAndEmail}}
              @display={{display}}
            />
          </template>,
        );

        // when
        await clickByName(
          t('pages.sco-organization-participants.manage-authentication-method-modal.section.username.copy'),
        );

        // then
        assert.ok(screen.getByText(t('pages.sco-organization-participants.manage-authentication-method-modal.copied')));
      });
    });

    module('When Student is connected with email and username method', function () {
      test('should render component with email field', async function (assert) {
        // when
        const screen = await render(
          <template>
            <ScoOrganizationParticipantManageAuthenticationMethodModal
              @student={{studentWithUsernameAndEmail}}
              @display={{display}}
            />
          </template>,
        );

        // then
        assert.ok(
          screen.getByRole('textbox', {
            name: t('pages.sco-organization-participants.manage-authentication-method-modal.section.email.label'),
            value: email,
          }),
        );
      });

      test('should render clipboard to copy email', async function (assert) {
        // given
        let copiedText;
        window.navigator.clipboard.writeText = async (text) => {
          copiedText = text;
        };

        const screen = await render(
          <template>
            <ScoOrganizationParticipantManageAuthenticationMethodModal
              @student={{studentWithUsernameAndEmail}}
              @display={{display}}
            />
          </template>,
        );

        // when
        await clickByName(
          t('pages.sco-organization-participants.manage-authentication-method-modal.section.email.copy'),
        );

        // then
        assert.ok(
          screen.getByRole('button', {
            name: t('pages.sco-organization-participants.manage-authentication-method-modal.section.email.copy'),
          }),
        );
        assert.strictEqual(copiedText, email);
      });

      test('should display tooltip when email copy button is clicked', async function (assert) {
        // given
        const screen = await render(
          <template>
            <ScoOrganizationParticipantManageAuthenticationMethodModal
              @student={{studentWithUsernameAndEmail}}
              @display={{display}}
            />
          </template>,
        );

        // when
        await clickByName(
          t('pages.sco-organization-participants.manage-authentication-method-modal.section.email.copy'),
        );

        // then
        assert.ok(screen.getByText(t('pages.sco-organization-participants.manage-authentication-method-modal.copied')));
      });
    });

    module('When Student is connected with email only', function () {
      test('should render add username authentication method', async function (assert) {
        // when
        const screen = await render(
          <template>
            <ScoOrganizationParticipantManageAuthenticationMethodModal
              @student={{studentWithEmailOnly}}
              @display={{display}}
            />
          </template>,
        );

        // then
        assert.ok(
          screen.getByRole('textbox', {
            name: t('pages.sco-organization-participants.manage-authentication-method-modal.section.email.label'),
            value: email,
          }),
        );

        assert.ok(
          screen.getByRole('heading', {
            level: 3,
            name: t(
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
              save: sinon.stub().resolves(),
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
          <template>
            <ScoOrganizationParticipantManageAuthenticationMethodModal
              @student={{studentWithUsernameAndEmail}}
              @display={{display}}
            />
          </template>,
        );

        // when
        await clickByName(
          t('pages.sco-organization-participants.manage-authentication-method-modal.section.reset-password.button'),
        );

        // then
        assert.ok(
          screen.getByLabelText(
            t('pages.sco-organization-participants.manage-authentication-method-modal.section.password.label'),
          ),
        );
      });

      test('should render clipboard to copy unique password', async function (assert) {
        // given
        let copiedText;
        window.navigator.clipboard.writeText = async (text) => {
          copiedText = text;
        };

        const screen = await render(
          <template>
            <ScoOrganizationParticipantManageAuthenticationMethodModal
              @student={{studentWithUsernameAndEmail}}
              @display={{display}}
            />
          </template>,
        );

        // when
        await clickByName(
          t('pages.sco-organization-participants.manage-authentication-method-modal.section.reset-password.button'),
        );
        await clickByName(
          t('pages.sco-organization-participants.manage-authentication-method-modal.section.password.copy'),
        );

        // then
        assert.ok(
          screen.getByRole('button', {
            name: t('pages.sco-organization-participants.manage-authentication-method-modal.section.password.copy'),
          }),
        );
        assert.strictEqual(copiedText, generatedPassword);
      });

      test('should display tooltip when generated password copy button is clicked', async function (assert) {
        // given
        const screen = await render(
          <template>
            <ScoOrganizationParticipantManageAuthenticationMethodModal
              @student={{studentWithUsernameAndEmail}}
              @display={{display}}
            />
          </template>,
        );

        // when
        await clickByName(
          t('pages.sco-organization-participants.manage-authentication-method-modal.section.reset-password.button'),
        );
        await clickByName(
          t('pages.sco-organization-participants.manage-authentication-method-modal.section.password.copy'),
        );

        // then
        assert.ok(screen.getByText(t('pages.sco-organization-participants.manage-authentication-method-modal.copied')));
      });

      test('should generate unique password each time the modal is used', async function (assert) {
        // given
        await render(
          <template>
            <ScoOrganizationParticipantManageAuthenticationMethodModal
              @student={{studentWithUsernameAndEmail}}
              @display={{display}}
            />
          </template>,
        );
        await clickByName(
          t('pages.sco-organization-participants.manage-authentication-method-modal.section.reset-password.button'),
        );
        const firstGeneratedPassword = this.element.querySelector('#generated-password').value;

        // when
        await render(
          <template>
            <ScoOrganizationParticipantManageAuthenticationMethodModal
              @student={{studentWithUsernameAndEmail}}
              @display={{display}}
            />
          </template>,
        );
        await clickByName(
          t('pages.sco-organization-participants.manage-authentication-method-modal.section.reset-password.button'),
        );
        const secondGeneratedPassword = this.element.querySelector('#generated-password').value;

        // then
        assert.notEqual(firstGeneratedPassword, secondGeneratedPassword);
      });
    });

    module('When Student is blocked or temporarily blocked', function () {
      test('displays blocked student message and unblock button', async function (assert) {
        // given
        const blockedStudent = EmberObject.create({
          id: '1',
          username,
          email,
          firstName: 'John',
          lastName: 'Doe',
          birthdate: '2010-12-01',
          isAuthenticatedFromGar: false,
          hasUsername: true,
          isBlockedOrTemporarilyBlocked: true,
        });
        const display = true;

        // when
        const screen = await render(
          <template>
            <ScoOrganizationParticipantManageAuthenticationMethodModal
              @student={{blockedStudent}}
              @display={{display}}
            />
          </template>,
        );

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: t(
                'pages.sco-organization-participants.manage-authentication-method-modal.section.unblock.subtitle',
              ),
            }),
          )
          .exists();
        assert
          .dom(
            screen.getByRole('button', {
              name: t('pages.sco-organization-participants.manage-authentication-method-modal.section.unblock.button'),
            }),
          )
          .exists();
      });
    });
  });

  module('When Student is connected with GAR method', function () {
    const studentGAR = EmberObject.create({
      id: '2',
      isAuthenticatedFromGar: true,
      displayAddUsernameAuthentication: true,
    });

    test('should render component with GAR connection method', async function (assert) {
      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantManageAuthenticationMethodModal @student={{studentGAR}} @display={{true}} />
        </template>,
      );

      // then
      assert.ok(
        screen.getByText(
          t('pages.sco-organization-participants.manage-authentication-method-modal.section.mediacentre.label'),
        ),
      );
      assert.ok(
        screen.getByRole('heading', {
          level: 3,
          name: t('pages.sco-organization-participants.manage-authentication-method-modal.section.add-username.label'),
        }),
      );
    });
  });
});
