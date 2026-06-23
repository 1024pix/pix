import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { clickByLabel } from '../../helpers/click-by-label';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

const tWithoutTags = (key, options) => t(key, options).replace(/<[^>]+>/g, '');

module('Integration | Component | certification-starter', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('certification language selection', function () {
    module('when on France domain (pix.fr)', function () {
      module('when code input is not fully filled', function () {
        test('should not display the language inputs and disable submit button', async function (assert) {
          // given
          const currentDomainService = this.owner.lookup('service:currentDomain');
          sinon.stub(currentDomainService, 'isFranceDomain').get(() => true);
          const store = this.owner.lookup('service:store');
          this.set('model', {
            certificationCandidate: store.createRecord('certification-candidate', {
              hasStartedTest: false,
            }),
          });

          // when
          const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

          // then
          assert.notOk(screen.queryByRole('button', { name: 'Langue de certification' }));
          assert.notOk(
            screen.queryByRole('checkbox', {
              name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
            }),
          );
          assert
            .dom(
              screen.getByRole('button', {
                name: t('pages.certification-start.actions.submit'),
              }),
            )
            .hasAttribute('aria-disabled', 'true');
        });
      });

      module('when code input is fully filled', function () {
        test('should not display the language inputs and enable submit button', async function (assert) {
          // given
          const currentDomainService = this.owner.lookup('service:currentDomain');
          sinon.stub(currentDomainService, 'isFranceDomain').get(() => true);
          const store = this.owner.lookup('service:store');
          this.set('model', {
            certificationCandidate: store.createRecord('certification-candidate', {
              hasStartedTest: false,
            }),
          });

          // when
          const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

          await fillIn(
            screen.getByRole('textbox', {
              name: `${t('pages.certification-start.access-code')} *`,
            }),
            '111111',
          );

          // then
          assert.notOk(screen.queryByRole('button', { name: 'Langue de certification' }));
          assert.notOk(
            screen.queryByRole('checkbox', {
              name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
            }),
          );
          assert
            .dom(
              screen.getByRole('button', {
                name: t('pages.certification-start.actions.submit'),
              }),
            )
            .doesNotHaveAttribute('aria-disabled', 'true');
        });
      });
    });

    module('when on org domain (pix.org)', function () {
      module('when the candidate has not started the test', function () {
        test('should display the language selector and confirmation checkbox', async function (assert) {
          // given
          const currentDomainService = this.owner.lookup('service:currentDomain');
          sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);
          const store = this.owner.lookup('service:store');
          this.set('model', {
            certificationCandidate: store.createRecord('certification-candidate', {
              hasStarted: false,
            }),
          });

          // when
          const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

          // then
          assert.ok(screen.getByRole('button', { name: 'Langue de certification' }));

          assert.ok(
            screen.getByRole('checkbox', {
              name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
            }),
          );
        });

        test('should display the language selector as disabled', async function (assert) {
          // given
          const currentDomainService = this.owner.lookup('service:currentDomain');
          sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);
          const store = this.owner.lookup('service:store');
          this.set('model', {
            certificationCandidate: store.createRecord('certification-candidate', {
              hasStartedTest: false,
            }),
          });

          // when
          const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

          // then
          assert.dom(screen.getByRole('button', { name: 'Langue de certification' })).hasAttribute('aria-disabled');
        });

        test('should display a warning message about English being unavailable', async function (assert) {
          // given
          const currentDomainService = this.owner.lookup('service:currentDomain');
          sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);
          const store = this.owner.lookup('service:store');
          this.set('model', {
            certificationCandidate: store.createRecord('certification-candidate', {
              hasStartedTest: false,
            }),
          });

          // when
          const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

          // then
          assert.ok(screen.getByText(t('pages.certification-start.language-selector.warning-message')));
        });

        module('when the language confirmation checkbox is not checked and code filled', function () {
          test('should have a disabled submit button ', async function (assert) {
            // given
            const currentDomainService = this.owner.lookup('service:currentDomain');
            sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);
            const store = this.owner.lookup('service:store');
            this.set('model', {
              certificationCandidate: store.createRecord('certification-candidate', {
                hasStartedTest: false,
              }),
            });

            // when
            const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

            await fillIn(
              screen.getByRole('textbox', {
                name: `${t('pages.certification-start.access-code')} *`,
              }),
              '111111',
            );

            // then
            assert
              .dom(
                screen.getByRole('button', {
                  name: t('pages.certification-start.actions.submit'),
                }),
              )
              .hasAttribute('aria-disabled', 'true');
          });
        });

        module('when the language confirmation checkbox is checked and code not filled', function () {
          test('should have a disabled submit button ', async function (assert) {
            // given
            const currentDomainService = this.owner.lookup('service:currentDomain');
            sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);
            const store = this.owner.lookup('service:store');
            this.set('model', {
              certificationCandidate: store.createRecord('certification-candidate', {
                hasStartedTest: false,
              }),
            });

            // when
            const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

            await clickByLabel(tWithoutTags('pages.certification-start.language-selector.confirmation-label'));

            // then
            assert
              .dom(
                screen.getByRole('button', {
                  name: t('pages.certification-start.actions.submit'),
                }),
              )
              .hasAttribute('aria-disabled', 'true');
          });
        });

        module('when the language confirmation checkbox is checked and code is filled', function () {
          test('should not have a disabled submit button ', async function (assert) {
            // given
            const currentDomainService = this.owner.lookup('service:currentDomain');
            sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);
            const store = this.owner.lookup('service:store');
            this.set('model', {
              certificationCandidate: store.createRecord('certification-candidate', {
                hasStartedTest: false,
              }),
            });

            // when
            const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

            await fillIn(
              screen.getByRole('textbox', {
                name: `${t('pages.certification-start.access-code')} *`,
              }),
              '111111',
            );

            await clickByLabel(tWithoutTags('pages.certification-start.language-selector.confirmation-label'));

            // then
            assert
              .dom(
                screen.getByRole('button', {
                  name: t('pages.certification-start.actions.submit'),
                }),
              )
              .doesNotHaveAttribute('aria-disabled', 'true');
          });
        });
      });

      module('when the candidate has started the test', function () {
        test('should not display the language selector', async function (assert) {
          // given
          const currentDomainService = this.owner.lookup('service:currentDomain');
          sinon.stub(currentDomainService, 'isFranceDomain').get(() => true);
          const store = this.owner.lookup('service:store');
          this.set('model', {
            certificationCandidate: store.createRecord('certification-candidate', {
              hasStartedTest: true,
            }),
          });

          // when
          const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

          // then
          assert.notOk(screen.queryByRole('button', { name: 'Langue de certification' }));
        });

        test('should not display the language selection confirmation checkbox', async function (assert) {
          // given
          const currentDomainService = this.owner.lookup('service:currentDomain');
          sinon.stub(currentDomainService, 'isFranceDomain').get(() => true);
          const store = this.owner.lookup('service:store');
          this.set('model', {
            certificationCandidate: store.createRecord('certification-candidate', {
              hasStartedTest: true,
            }),
          });

          // when
          const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

          // then
          assert.notOk(
            screen.queryByRole('checkbox', {
              name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
            }),
          );
        });

        module('when code is filled', function () {
          test('should not have a disabled submit button ', async function (assert) {
            // given
            const currentDomainService = this.owner.lookup('service:currentDomain');
            sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);
            const store = this.owner.lookup('service:store');
            this.set('model', {
              certificationCandidate: store.createRecord('certification-candidate', {
                hasStartedTest: true,
              }),
            });

            // when
            const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

            await fillIn(
              screen.getByRole('textbox', {
                name: `${t('pages.certification-start.access-code')} *`,
              }),
              '111111',
            );

            // then
            assert
              .dom(
                screen.getByRole('button', {
                  name: t('pages.certification-start.actions.submit'),
                }),
              )
              .doesNotHaveAttribute('aria-disabled', 'true');
          });
        });

        module('when code is not fully filled', function () {
          test('should have a disabled submit button ', async function (assert) {
            // given
            const currentDomainService = this.owner.lookup('service:currentDomain');
            sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);
            const store = this.owner.lookup('service:store');
            this.set('model', {
              certificationCandidate: store.createRecord('certification-candidate', {
                hasStartedTest: true,
              }),
            });

            // when
            const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

            await fillIn(
              screen.getByRole('textbox', {
                name: `${t('pages.certification-start.access-code')} *`,
              }),
              '111',
            );

            // then
            assert
              .dom(
                screen.getByRole('button', {
                  name: t('pages.certification-start.actions.submit'),
                }),
              )
              .hasAttribute('aria-disabled', 'true');
          });
        });
      });
    });
  });

  module('form submission', function () {
    module('when access code is not provided', function () {
      test('should display an error message', async function (assert) {
        // given
        const currentDomainService = this.owner.lookup('service:currentDomain');
        sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);
        const store = this.owner.lookup('service:store');
        this.set('model', {
          certificationCandidate: store.createRecord('certification-candidate', {
            hasStarted: false,
          }),
        });

        const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);
        await fillIn(
          screen.getByRole('textbox', {
            name: `${t('pages.certification-start.access-code')} *`,
          }),
          '',
        );

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

          const currentDomainService = this.owner.lookup('service:currentDomain');
          sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);

          this.set('model', {
            certificationCandidate: { hasStartedTest: false, sessionId: 123 },
          });
          const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);
          await fillIn(
            screen.getByRole('textbox', {
              name: `${t('pages.certification-start.access-code')} *`,
            }),
            'ABC123',
          );
          await click(
            screen.getByRole('checkbox', {
              name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
            }),
          );
          routerObserver.replaceWith.returns('ok');

          // when
          await clickByLabel(t('pages.certification-start.actions.submit'));

          // then
          sinon.assert.calledWithExactly(createRecordStub, 'certification-course', {
            accessCode: 'ABC123',
            sessionId: 123,
            locale: 'fr',
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

        const currentDomainService = this.owner.lookup('service:currentDomain');
        sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);

        this.set('model', {
          certificationCandidate: { hasStartedTest: false, sessionId: 123 },
        });

        // when
        const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);
        await fillIn(
          screen.getByRole('textbox', { name: `${t('pages.certification-start.access-code')} *` }),
          'ABC123',
        );
        await click(
          screen.getByRole('checkbox', {
            name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
          }),
        );

        const submitButton = screen.getByRole('button', { name: t('pages.certification-start.actions.submit') });
        await click(submitButton);
        await click(submitButton);

        // then
        assert.ok(certificationCourse.save.calledOnce);
      });

      module('when the creation of certification course is in error', function () {
        test('should not notify pix companion', async function (assert) {
          // given
          const replaceWithStub = sinon.stub();
          const startCertificationStub = sinon.stub();

          class PixCompanionServiceStub extends Service {
            startCertification = startCertificationStub;
          }

          this.owner.register('service:pix-companion', PixCompanionServiceStub);

          class RouterServiceStub extends Service {
            replaceWith = replaceWithStub;
          }

          this.owner.register('service:router', RouterServiceStub);
          const createRecordStub = sinon.stub();

          class StoreStubService extends Service {
            createRecord = createRecordStub;
          }

          this.owner.register('service:store', StoreStubService);

          const certificationCourse = {
            id: '123',
            save: sinon.stub(),
            deleteRecord: sinon.stub(),
          };
          createRecordStub.returns(certificationCourse);

          const currentDomainService = this.owner.lookup('service:currentDomain');
          sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);

          this.set('model', {
            certificationCandidate: { hasStartedTest: false, sessionId: 123 },
          });
          const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);
          await fillIn(
            screen.getByRole('textbox', {
              name: `${t('pages.certification-start.access-code')} *`,
            }),
            'ABC123',
          );
          await click(
            screen.getByRole('checkbox', {
              name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
            }),
          );
          certificationCourse.save.rejects({ errors: [{ status: '404' }] });

          // when
          await clickByLabel(t('pages.certification-start.actions.submit'));

          // then
          assert.ok(screen.getByText('Ce code n’existe pas ou n’est plus valide.'));
          sinon.assert.notCalled(startCertificationStub);
        });

        test('should display the appropriate error message when error status is 404', async function (assert) {
          // given
          const replaceWithStub = sinon.stub();

          class RouterServiceStub extends Service {
            replaceWith = replaceWithStub;
          }

          this.owner.register('service:router', RouterServiceStub);
          const createRecordStub = sinon.stub();

          class StoreStubService extends Service {
            createRecord = createRecordStub;
          }

          this.owner.register('service:store', StoreStubService);
          const certificationCourse = {
            id: '123',
            save: sinon.stub(),
            deleteRecord: sinon.stub(),
          };
          createRecordStub.returns(certificationCourse);

          const currentDomainService = this.owner.lookup('service:currentDomain');
          sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);

          this.set('model', {
            certificationCandidate: { hasStartedTest: false, sessionId: 123 },
          });
          const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);
          await fillIn(
            screen.getByRole('textbox', {
              name: `${t('pages.certification-start.access-code')} *`,
            }),
            'ABC123',
          );
          await click(
            screen.getByRole('checkbox', {
              name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
            }),
          );
          certificationCourse.save.rejects({ errors: [{ status: '404' }] });

          // when
          await clickByLabel(t('pages.certification-start.actions.submit'));

          // then
          assert.ok(screen.getByText('Ce code n’existe pas ou n’est plus valide.'));
        });

        test('should display the appropriate error message when error status is 412', async function (assert) {
          // given
          const replaceWithStub = sinon.stub();

          class RouterServiceStub extends Service {
            replaceWith = replaceWithStub;
          }

          this.owner.register('service:router', RouterServiceStub);
          const createRecordStub = sinon.stub();

          class StoreStubService extends Service {
            createRecord = createRecordStub;
          }

          this.owner.register('service:store', StoreStubService);
          const certificationCourse = {
            id: '123',
            save: sinon.stub(),
            deleteRecord: sinon.stub(),
          };
          createRecordStub.returns(certificationCourse);

          const currentDomainService = this.owner.lookup('service:currentDomain');
          sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);

          this.set('model', {
            certificationCandidate: { hasStartedTest: false, sessionId: 123 },
          });
          const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);
          await fillIn(
            screen.getByRole('textbox', {
              name: `${t('pages.certification-start.access-code')} *`,
            }),
            'ABC123',
          );
          await click(
            screen.getByRole('checkbox', {
              name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
            }),
          );
          certificationCourse.save.rejects({ errors: [{ status: '412' }] });

          // when
          await clickByLabel(t('pages.certification-start.actions.submit'));

          // then
          assert.ok(screen.getByText("La session de certification n'est plus accessible."));
        });

        module('when error status is 403', function () {
          test('should display the appropriate error message when error candidate not authorized to join session', async function (assert) {
            // given
            const replaceWithStub = sinon.stub();

            class RouterServiceStub extends Service {
              replaceWith = replaceWithStub;
            }

            this.owner.register('service:router', RouterServiceStub);
            const createRecordStub = sinon.stub();

            class StoreStubService extends Service {
              createRecord = createRecordStub;
            }

            this.owner.register('service:store', StoreStubService);
            const certificationCourse = {
              id: '123',
              save: sinon.stub(),
              deleteRecord: sinon.stub(),
            };
            createRecordStub.returns(certificationCourse);

            const currentDomainService = this.owner.lookup('service:currentDomain');
            sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);

            this.set('model', {
              certificationCandidate: { hasStartedTest: false, sessionId: 123 },
            });
            const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);
            await fillIn(
              screen.getByRole('textbox', {
                name: `${t('pages.certification-start.access-code')} *`,
              }),
              'ABC123',
            );
            await click(
              screen.getByRole('checkbox', {
                name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
              }),
            );
            certificationCourse.save.rejects({
              errors: [{ status: '403', code: 'CANDIDATE_NOT_AUTHORIZED_TO_JOIN_SESSION' }],
            });

            // when
            await clickByLabel(t('pages.certification-start.actions.submit'));

            // then
            assert.ok(
              screen.getByText(t('pages.certification-start.error-messages.candidate-not-authorized-to-start')),
            );
          });

          test('should display the appropriate error message when error candidate not authorized to resume session', async function (assert) {
            // given
            const replaceWithStub = sinon.stub();

            class RouterServiceStub extends Service {
              replaceWith = replaceWithStub;
            }

            this.owner.register('service:router', RouterServiceStub);
            const createRecordStub = sinon.stub();

            class StoreStubService extends Service {
              createRecord = createRecordStub;
            }

            this.owner.register('service:store', StoreStubService);
            const certificationCourse = {
              id: '123',
              save: sinon.stub(),
              deleteRecord: sinon.stub(),
            };
            createRecordStub.returns(certificationCourse);

            const currentDomainService = this.owner.lookup('service:currentDomain');
            sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);

            this.set('model', {
              certificationCandidate: { hasStartedTest: false, sessionId: 123 },
            });
            const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);
            await fillIn(
              screen.getByRole('textbox', {
                name: `${t('pages.certification-start.access-code')} *`,
              }),
              'ABC123',
            );
            await click(
              screen.getByRole('checkbox', {
                name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
              }),
            );
            certificationCourse.save.rejects({
              errors: [{ status: '403', code: 'CANDIDATE_NOT_AUTHORIZED_TO_RESUME_SESSION' }],
            });

            // when
            await clickByLabel(t('pages.certification-start.actions.submit'));

            // then
            assert.ok(
              screen.getByText(t('pages.certification-start.error-messages.candidate-not-authorized-to-resume')),
            );
          });

          module('when the certification centre has no habilitation to hold the session', function () {
            test('should display the appropriate error message', async function (assert) {
              // given
              const replaceWithStub = sinon.stub();

              class RouterServiceStub extends Service {
                replaceWith = replaceWithStub;
              }

              this.owner.register('service:router', RouterServiceStub);
              const createRecordStub = sinon.stub();

              class StoreStubService extends Service {
                createRecord = createRecordStub;
              }

              this.owner.register('service:store', StoreStubService);
              const certificationCourse = {
                id: '123',
                save: sinon.stub(),
                deleteRecord: sinon.stub(),
              };
              createRecordStub.returns(certificationCourse);

              const currentDomainService = this.owner.lookup('service:currentDomain');
              sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);

              this.set('model', {
                certificationCandidate: { hasStartedTest: false, sessionId: 123 },
              });
              const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);
              await fillIn(
                screen.getByRole('textbox', {
                  name: `${t('pages.certification-start.access-code')} *`,
                }),
                'ABC123',
              );
              await click(
                screen.getByRole('checkbox', {
                  name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
                }),
              );
              certificationCourse.save.rejects({
                errors: [{ status: '403', code: 'CENTER_HABILITATION_ERROR' }],
              });

              // when
              await clickByLabel(t('pages.certification-start.actions.submit'));

              // then
              assert.ok(screen.getByText(t('pages.certification-joiner.error-messages.missing-center-habilitation')));
            });
          });
        });

        module('when error status unknown', function () {
          test('should display a generic error message', async function (assert) {
            // given
            const replaceWithStub = sinon.stub();

            class RouterServiceStub extends Service {
              replaceWith = replaceWithStub;
            }

            this.owner.register('service:router', RouterServiceStub);
            const createRecordStub = sinon.stub();

            class StoreStubService extends Service {
              createRecord = createRecordStub;
            }

            this.owner.register('service:store', StoreStubService);
            const certificationCourse = {
              id: '123',
              save: sinon.stub(),
              deleteRecord: sinon.stub(),
            };
            createRecordStub.returns(certificationCourse);

            const currentDomainService = this.owner.lookup('service:currentDomain');
            sinon.stub(currentDomainService, 'isFranceDomain').get(() => false);

            this.set('model', {
              certificationCandidate: { hasStartedTest: false, sessionId: 123 },
            });
            const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);
            await fillIn(
              screen.getByRole('textbox', {
                name: `${t('pages.certification-start.access-code')} *`,
              }),
              'ABC123',
            );
            await click(
              screen.getByRole('checkbox', {
                name: tWithoutTags('pages.certification-start.language-selector.confirmation-label'),
              }),
            );
            certificationCourse.save.throws(new Error("Détails de l'erreur à envoyer à Pix"));

            // when
            await clickByLabel(t('pages.certification-start.actions.submit'));

            // then
            assert.ok(screen.getByText('Une erreur serveur inattendue vient de se produire.'));
            await click(screen.getByText('Afficher plus de détails :'));
            const group = screen.getByRole('group');

            assert.ok(group.textContent.includes("Détails de l'erreur à envoyer à Pix"));
          });
        });
      });
    });
  });

  module('Clea eligible panel display', function () {
    module('when the candidate has only core or complementary subscription', function () {
      test('should not display subscription eligible panel', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.set('model', {
          certificationCandidate: store.createRecord('certification-candidate', {
            subscription: 'CORE',
            doubleCertificationEligibility: false,
          }),
        });

        // when
        const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

        // then
        assert.notOk(screen.queryByText('Vous n’êtes pas éligible à'));
        assert.notOk(screen.queryByText(t('pages.certification-start.core-and-complementary-subscriptions')));
      });
    });

    module('when the candidate has double subscriptions', function () {
      module('when the candidate is eligible', function () {
        test('should display subscription eligible panel', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          this.set('model', {
            certificationCandidate: store.createRecord('certification-candidate', {
              subscription: 'CLEA',
              doubleCertificationEligibility: true,
            }),
          });

          // when
          const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

          // then
          assert.ok(screen.getByText(t('pages.certification-start.core-and-complementary-subscriptions')));
          assert.ok(screen.getByText('CLéA Numérique'));
          assert.notOk(screen.queryByText('Vous n’êtes pas éligible à'));
        });
      });

      module('when the candidate is not eligible', function () {
        test('should display subscription non eligible panel', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          this.set('model', {
            certificationCandidate: store.createRecord('certification-candidate', {
              subscription: 'CLEA',
              doubleCertificationEligibility: false,
            }),
          });

          // when
          const screen = await render(hbs`<CertificationStarter @model={{this.model}} />`);

          // then
          assert.ok(
            screen.getByText(
              "Vous n'êtes pas éligible à CLéA Numérique. Vous pouvez néanmoins passer votre certification Pix.",
            ),
          );
          assert.ok(screen.queryByText(t('pages.certification-start.core-and-complementary-subscriptions')));
        });
      });
    });
  });
});
