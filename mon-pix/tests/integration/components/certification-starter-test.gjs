/* eslint-disable ember/template-no-let-reference */
import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CertificationStarter from 'mon-pix/components/certification-starter';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { clickByLabel } from '../../helpers/click-by-label';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

const tWithoutTags = (key, options) => t(key, options).replace(/<[^>]+>/g, '');
let model;
const renderComponent = () => render(<template><CertificationStarter @model={{model}} /></template>);

const getSubmitButton = (screen) => screen.getByRole('button', { name: t('pages.certification-start.actions.submit') });

const fillAccessCode = (screen, accessCode) =>
  fillIn(screen.getByRole('textbox', { name: `${t('pages.certification-start.access-code')} *` }), accessCode);

const confirmLanguageSelection = (screen) =>
  click(
    screen.getByRole('checkbox', {
      name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
    }),
  );

const submitForm = () => clickByLabel(t('pages.certification-start.actions.submit'));

const stubFranceDomain = (owner, isFranceDomain) =>
  sinon.stub(owner.lookup('service:currentDomain'), 'isFranceDomain').get(() => isFranceDomain);

const setCertificationCandidate = (context, attributes) => {
  const store = context.owner.lookup('service:store');
  model = {
    certificationCandidate: store.createRecord('certification-candidate', attributes),
  };
};

module('Integration | Component | certification-starter', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    model = undefined;
  });

  module('certification language selection', function () {
    module('when on France domain (pix.fr)', function (hooks) {
      hooks.beforeEach(function () {
        stubFranceDomain(this.owner, true);
        setCertificationCandidate(this, { hasStartedTest: false });
      });

      module('when code input is not fully filled', function () {
        test('should not display the language inputs and disable submit button', async function (assert) {
          // when
          const screen = await renderComponent();

          // then
          assert.notOk(screen.queryByRole('button', { name: 'Langue de certification' }));
          assert.notOk(
            screen.queryByRole('checkbox', {
              name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
            }),
          );
          assert.dom(getSubmitButton(screen)).hasAttribute('aria-disabled', 'true');
        });
      });

      module('when code input is fully filled', function () {
        test('should not display the language inputs and enable submit button', async function (assert) {
          // when
          const screen = await renderComponent();
          await fillAccessCode(screen, '111111');

          // then
          assert.notOk(screen.queryByRole('button', { name: 'Langue de certification' }));
          assert.notOk(
            screen.queryByRole('checkbox', {
              name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
            }),
          );
          assert.dom(getSubmitButton(screen)).doesNotHaveAttribute('aria-disabled', 'true');
        });
      });
    });

    module('when on org domain (pix.org)', function () {
      module('when the candidate has not started the test', function (hooks) {
        hooks.beforeEach(function () {
          stubFranceDomain(this.owner, false);
          setCertificationCandidate(this, { hasStartedTest: false });
        });

        test('should display the language selector and confirmation checkbox', async function (assert) {
          // when
          const screen = await renderComponent();

          // then
          assert.ok(screen.getByRole('button', { name: 'Langue de certification' }));
          assert.ok(
            screen.getByRole('checkbox', {
              name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
            }),
          );
        });

        test('should be possible to update the selected language', async function (assert) {
          // given
          const screen = await renderComponent();

          // when
          await click(screen.getByRole('button', { name: 'Langue de certification' }));
          await click(screen.getByText('anglais - EN'));

          // then
          assert.ok(
            screen.getByRole('button', { name: 'Langue de certification' }).textContent.includes('anglais - EN'),
          );
        });

        module('when the language confirmation checkbox is not checked and code filled', function () {
          test('should have a disabled submit button ', async function (assert) {
            // when
            const screen = await renderComponent();
            await fillAccessCode(screen, '111111');

            // then
            assert.dom(getSubmitButton(screen)).hasAttribute('aria-disabled', 'true');
          });
        });

        module('when the language confirmation checkbox is checked and code not filled', function () {
          test('should have a disabled submit button ', async function (assert) {
            // when
            const screen = await renderComponent();
            await confirmLanguageSelection(screen);

            // then
            assert.dom(getSubmitButton(screen)).hasAttribute('aria-disabled', 'true');
          });
        });

        module('when the language confirmation checkbox is checked and code is filled', function () {
          test('should not have a disabled submit button ', async function (assert) {
            // when
            const screen = await renderComponent();
            await fillAccessCode(screen, '111111');
            await confirmLanguageSelection(screen);

            // then
            assert.dom(getSubmitButton(screen)).doesNotHaveAttribute('aria-disabled', 'true');
          });
        });
      });

      module('when the candidate has started the test', function (hooks) {
        hooks.beforeEach(function () {
          stubFranceDomain(this.owner, false);
          setCertificationCandidate(this, { hasStartedTest: true });
        });

        test('should not display the language selector', async function (assert) {
          // when
          const screen = await renderComponent();

          // then
          assert.notOk(screen.queryByRole('button', { name: 'Langue de certification' }));
        });

        test('should not display the language selection confirmation checkbox', async function (assert) {
          // when
          const screen = await renderComponent();

          // then
          assert.notOk(
            screen.queryByRole('checkbox', {
              name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
            }),
          );
        });

        module('when code is filled', function () {
          test('should not have a disabled submit button ', async function (assert) {
            // when
            const screen = await renderComponent();
            await fillAccessCode(screen, '111111');

            // then
            assert.dom(getSubmitButton(screen)).doesNotHaveAttribute('aria-disabled', 'true');
          });
        });

        module('when code is not fully filled', function () {
          test('should have a disabled submit button ', async function (assert) {
            // when
            const screen = await renderComponent();
            await fillAccessCode(screen, '111');

            // then
            assert.dom(getSubmitButton(screen)).hasAttribute('aria-disabled', 'true');
          });
        });
      });
    });
  });

  module('form submission', function () {
    module('when access code is not provided', function () {
      test('should display an error message', async function (assert) {
        // given
        stubFranceDomain(this.owner, false);
        setCertificationCandidate(this, { hasStarted: false });

        const screen = await renderComponent();
        await fillAccessCode(screen, '');

        // when
        await triggerEvent('.certification-start__form', 'submit');

        // then
        assert.dom(screen.getByText(t('pages.certification-start.error-messages.missing-code'))).exists();
      });
    });

    module('when access code is provided', function () {
      module('when the creation of certification course is successful', function () {
        test('should redirect to certifications.resume', async function (assert) {
          // given
          const certificationCourse = {
            id: '456',
            save: sinon.stub(),
            deleteRecord: sinon.stub(),
          };

          const createRecordStub = sinon.stub();

          class StoreServiceStub extends Service {
            createRecord = createRecordStub;
          }

          this.owner.register('service:store', StoreServiceStub);
          createRecordStub.returns(certificationCourse);

          const resetStub = sinon.stub();

          class FocusedCertificationChallengeWarningManagerStub extends Service {
            reset = resetStub;
          }

          this.owner.register(
            'service:focused-certification-challenge-warning-manager',
            FocusedCertificationChallengeWarningManagerStub,
          );
          const startCertificationStub = sinon.stub();

          class PixCompanionServiceStub extends Service {
            startCertification = startCertificationStub;
          }

          this.owner.register('service:pix-companion', PixCompanionServiceStub);

          const routerObserver = this.owner.lookup('service:router');
          routerObserver.replaceWith = sinon.stub();

          stubFranceDomain(this.owner, false);

          model = {
            certificationCandidate: { hasStartedTest: false, sessionId: 123 },
          };
          const screen = await renderComponent();
          await fillAccessCode(screen, 'ABC123');
          await click(screen.getByRole('button', { name: 'Langue de certification' }));
          await click(screen.getByText('anglais - EN'));
          await confirmLanguageSelection(screen);
          routerObserver.replaceWith.returns('ok');

          // when
          await submitForm();

          // then
          sinon.assert.calledWithExactly(createRecordStub, 'certification-course', {
            accessCode: 'ABC123',
            sessionId: 123,
            locale: 'en',
          });

          sinon.assert.calledOnce(certificationCourse.save);
          sinon.assert.calledOnce(resetStub);
          sinon.assert.calledOnce(startCertificationStub);
          sinon.assert.calledWithExactly(routerObserver.replaceWith, 'authenticated.certifications.resume', '456');

          assert.ok(true);
        });
      });

      test('should not submit the form again while the first submission is pending', async function (assert) {
        // given
        const certificationCourse = {
          id: '456',
          save: sinon.stub().returns(new Promise(() => {})),
          deleteRecord: sinon.stub(),
        };

        class StoreServiceStub extends Service {
          createRecord = sinon.stub().returns(certificationCourse);
        }

        this.owner.register('service:store', StoreServiceStub);

        stubFranceDomain(this.owner, false);

        model = {
          certificationCandidate: { hasStartedTest: false, sessionId: 123 },
        };

        // when
        const screen = await renderComponent();
        await fillAccessCode(screen, 'ABC123');
        await confirmLanguageSelection(screen);

        const submitButton = getSubmitButton(screen);
        await click(submitButton);
        await click(submitButton);

        // then
        assert.ok(certificationCourse.save.calledOnce);
      });

      module('when the creation of certification course is in error', function (hooks) {
        hooks.beforeEach(function () {
          class RouterServiceStub extends Service {
            replaceWith = sinon.stub();
          }

          this.owner.register('service:router', RouterServiceStub);

          const certificationCourse = {
            id: '123',
            save: sinon.stub(),
            deleteRecord: sinon.stub(),
          };
          this.certificationCourse = certificationCourse;

          class StoreServiceStub extends Service {
            createRecord = sinon.stub().returns(certificationCourse);
          }

          this.owner.register('service:store', StoreServiceStub);

          stubFranceDomain(this.owner, false);

          model = {
            certificationCandidate: { hasStartedTest: false, sessionId: 123 },
          };
        });

        test('should not notify pix companion', async function (assert) {
          // given
          const startCertificationStub = sinon.stub();

          class PixCompanionServiceStub extends Service {
            startCertification = startCertificationStub;
          }

          this.owner.register('service:pix-companion', PixCompanionServiceStub);
          this.certificationCourse.save.rejects({ errors: [{ status: '404' }] });

          const screen = await renderComponent();
          await fillAccessCode(screen, 'ABC123');
          await confirmLanguageSelection(screen);

          // when
          await submitForm();

          // then
          assert.ok(screen.getByText(t('pages.certification-start.error-messages.access-code-error')));
          sinon.assert.notCalled(startCertificationStub);
        });

        test('should display the appropriate error message when error status is 404', async function (assert) {
          // given
          this.certificationCourse.save.rejects({ errors: [{ status: '404' }] });
          const screen = await renderComponent();
          await fillAccessCode(screen, 'ABC123');
          await confirmLanguageSelection(screen);

          // when
          await submitForm();

          // then
          assert.ok(screen.getByText(t('pages.certification-start.error-messages.access-code-error')));
        });

        test('should clear the error only when the access code is edited', async function (assert) {
          // given
          this.certificationCourse.save.rejects({ errors: [{ status: '404' }] });
          const screen = await renderComponent();
          const accessCodeInput = screen.getByRole('textbox', {
            name: `${t('pages.certification-start.access-code')} *`,
          });
          await fillIn(accessCodeInput, 'ABC123');
          await confirmLanguageSelection(screen);
          await submitForm();
          assert.ok(screen.getByText(t('pages.certification-start.error-messages.access-code-error')));

          // when a key is released without editing the code
          await triggerEvent(accessCodeInput, 'keyup');

          // then the error message is still displayed
          assert.ok(screen.getByText(t('pages.certification-start.error-messages.access-code-error')));

          // when the access code is edited
          await fillIn(accessCodeInput, 'XYZ789');

          // then the error message is cleared
          assert.notOk(screen.queryByText(t('pages.certification-start.error-messages.access-code-error')));
        });

        test('should display the appropriate error message when error status is 412', async function (assert) {
          // given
          this.certificationCourse.save.rejects({ errors: [{ status: '412' }] });
          const screen = await renderComponent();
          await fillAccessCode(screen, 'ABC123');
          await confirmLanguageSelection(screen);

          // when
          await submitForm();

          // then
          assert.ok(screen.getByText(t('pages.certification-start.error-messages.session-not-accessible')));
        });

        test('should display the appropriate error message when the certification duration has been exceeded', async function (assert) {
          // given
          this.certificationCourse.save.rejects({
            errors: [{ status: '409', code: 'CERTIFICATION_DURATION_EXCEEDED' }],
          });
          const screen = await renderComponent();
          await fillAccessCode(screen, 'ABC123');
          await confirmLanguageSelection(screen);

          // when
          await submitForm();

          // then
          assert.ok(screen.getByText(t('pages.certification-start.error-messages.duration-exceeded')));
        });

        module('when error status is 403', function () {
          test('should display the appropriate error message when error candidate not authorized to join session', async function (assert) {
            // given
            this.certificationCourse.save.rejects({
              errors: [{ status: '403', code: 'CANDIDATE_NOT_AUTHORIZED_TO_JOIN_SESSION' }],
            });
            const screen = await renderComponent();
            await fillAccessCode(screen, 'ABC123');
            await confirmLanguageSelection(screen);

            // when
            await submitForm();

            // then
            assert.ok(
              screen.getByText(t('pages.certification-start.error-messages.candidate-not-authorized-to-start')),
            );
          });

          test('should display the appropriate error message when error candidate not authorized to resume session', async function (assert) {
            // given
            this.certificationCourse.save.rejects({
              errors: [{ status: '403', code: 'CANDIDATE_NOT_AUTHORIZED_TO_RESUME_SESSION' }],
            });
            const screen = await renderComponent();
            await fillAccessCode(screen, 'ABC123');
            await confirmLanguageSelection(screen);

            // when
            await submitForm();

            // then
            assert.ok(
              screen.getByText(t('pages.certification-start.error-messages.candidate-not-authorized-to-resume')),
            );
          });

          module('when the certification centre has no habilitation to hold the session', function () {
            test('should display the appropriate error message', async function (assert) {
              // given
              model = {
                certificationCandidate: { hasStartedTest: false, sessionId: 123, subscription: 'DROIT' },
              };
              this.certificationCourse.save.rejects({
                errors: [{ status: '403', code: 'CENTER_HABILITATION_ERROR' }],
              });
              const screen = await renderComponent();
              await fillAccessCode(screen, 'ABC123');
              await confirmLanguageSelection(screen);

              // when
              await submitForm();

              // then
              assert.ok(screen.getByText('Vous êtes inscrit à la certification Pix+ Droit.', { exact: false }));
            });
          });
        });

        module('when error status unknown', function () {
          test('should display a generic error message', async function (assert) {
            // given
            const errorDetails = "Détails de l'erreur à envoyer à Pix";
            this.certificationCourse.save.throws(new Error(errorDetails));
            const screen = await renderComponent();
            await fillAccessCode(screen, 'ABC123');
            await confirmLanguageSelection(screen);

            // when
            await submitForm();

            // then
            assert.ok(screen.getByText(t('pages.certification-start.error-messages.generic')));
            await click(screen.getByText(t('pages.certification-start.error-messages.unknown.summary-label')));
            const group = screen.getByRole('group');

            assert.ok(group.textContent.includes(errorDetails));
          });
        });
      });
    });
  });

  module('Clea eligible panel display', function () {
    module('when the candidate has only core or complementary subscription', function () {
      test('should not display subscription eligible panel', async function (assert) {
        // given
        setCertificationCandidate(this, { subscription: 'CORE', doubleCertificationEligibility: false });

        // when
        const screen = await renderComponent();

        // then
        assert.notOk(screen.queryByText('Vous n’êtes pas éligible à'));
        assert.notOk(screen.queryByText(t('pages.certification-start.core-and-complementary-subscriptions')));
      });
    });

    module('when the candidate has double subscriptions', function () {
      module('when the candidate is eligible', function () {
        test('should display subscription eligible panel', async function (assert) {
          // given
          setCertificationCandidate(this, { subscription: 'CLEA', doubleCertificationEligibility: true });

          // when
          const screen = await renderComponent();

          // then
          assert.ok(screen.getByText(t('pages.certification-start.core-and-complementary-subscriptions')));
          assert.ok(screen.getByText(t('pages.certification-frameworks.CLEA')));
          assert.notOk(screen.queryByText('Vous n’êtes pas éligible à'));
        });
      });

      module('when the candidate is not eligible', function () {
        test('should display subscription non eligible panel', async function (assert) {
          // given
          setCertificationCandidate(this, { subscription: 'CLEA', doubleCertificationEligibility: false });

          // when
          const screen = await renderComponent();

          // then
          assert.ok(
            screen.getByText(
              t('pages.certification-start.non-eligible-subscription', {
                subscriptionLabel: t('pages.certification-frameworks.CLEA'),
              }),
            ),
          );
          assert.ok(screen.queryByText(t('pages.certification-start.core-and-complementary-subscriptions')));
        });
      });
    });
  });
});
/* eslint-enable ember/template-no-let-reference */
