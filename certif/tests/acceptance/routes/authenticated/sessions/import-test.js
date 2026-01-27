import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, settled, triggerEvent } from '@ember/test-helpers';
import { setupMirage } from '../../../../test-support/setup-mirage';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { Response } from 'miragejs';
import { module, test } from 'qunit';

import {
  authenticateSession,
  createAllowedCertificationCenterAccess,
  createCertificationPointOfContactWithCustomCenters,
} from '../../../../helpers/test-init';

/* eslint-disable ember/no-settled-after-test-helper */
module('Acceptance | Routes | Authenticated | Sessions | import', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When certificationPointOfContact is not authenticated', function () {
    test('it should not be accessible', async function (assert) {
      // when
      await visit('/sessions/import');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When certificationPointOfContact is authenticated', function () {
    module('when the user belongs to a SCO isManagingStudent center', function () {
      test('it should redirect the user to the sessions list page', async function (assert) {
        // given
        const certificationCenter = createAllowedCertificationCenterAccess({
          certificationCenterName: 'Centre SCO isManagingStudent',
          certificationCenterType: 'SCO',
          isRelatedOrganizationManagingStudents: true,
        });
        const certificationPointOfContact = createCertificationPointOfContactWithCustomCenters({
          pixCertifTermsOfServiceAccepted: true,
          allowedCertificationCenterAccesses: [certificationCenter],
        });
        await authenticateSession(certificationPointOfContact.id);
        server.create('session-summary', { certificationCenterId: certificationCenter.id });

        // when
        const screen = await visit('/sessions/import');

        // then
        assert.strictEqual(currentURL(), '/sessions');
        assert.dom(screen.getByText(t('pages.sessions.list.title'))).exists();
      });
    });

    module('when the user belongs to a center that is not SCO isManagingStudent', function (hooks) {
      let certificationPointOfContact, certificationCenter;

      hooks.beforeEach(async function () {
        certificationCenter = createAllowedCertificationCenterAccess({
          certificationCenterName: 'Centre SUP',
          certificationCenterType: 'SUP',
        });
        certificationPointOfContact = createCertificationPointOfContactWithCustomCenters({
          pixCertifTermsOfServiceAccepted: true,
          allowedCertificationCenterAccesses: [certificationCenter],
        });

        this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
          return new Response(
            200,
            {},
            { sessionsCount: 2, sessionsWithoutCandidatesCount: 0, candidatesCount: 3, errorReports: [] },
          );
        });

        await authenticateSession(certificationPointOfContact.id);
        server.create('session-summary', { certificationCenterId: certificationCenter.id });
      });

      test('it should transition to sessions import page', async function (assert) {
        // given
        const screen = await visit('/sessions/');

        // when
        await click(
          screen.getByRole('link', { name: t('pages.sessions.list.actions.multiple-creation-edition.label') }),
        );

        // then
        assert.strictEqual(currentURL(), '/sessions/import');
        assert.dom(screen.getByRole('heading', { name: t('pages.sessions.import.title') })).exists();
      });

      module('Template download', function () {
        module('when download fails', function () {
          test('it should display an error', async function (assert) {
            // given
            const screen = await visit('/sessions/import');
            this.server.get('/certification-centers/:id/sessions/import', () => {
              return new Response(500, {}, { errors: [{ status: '500' }] });
            });
            const importButton = screen.getByRole('button', {
              name: t('pages.sessions.import.step-one.actions.session-import-template.extra-information'),
            });

            // when
            await click(importButton);
            await settled();

            // then
            assert.dom(screen.getByText(t('pages.sessions.import.step-one.errors.download'))).exists();
          });
        });
      });

      module('Sessions import', function () {
        module('when importing multiple sessions', function () {
          test('it should disable the import button before and after import', async function (assert) {
            // given
            const blob = new Blob(['foo']);
            const file = new File([blob], 'fichier.csv');

            // when
            const screen = await visit('/sessions/import');
            const importButton = screen.getByRole('button', { name: t('common.actions.continue') });
            assert.dom(importButton).hasAttribute('aria-disabled');
            const input = await screen.findByLabelText(
              t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
            );
            await triggerEvent(input, 'change', { files: [file] });
            assert.dom(importButton).doesNotHaveAttribute('disabled');
            await click(importButton);

            // then
            assert.dom(importButton).hasAttribute('aria-disabled');
          });

          test("it should display the file's name once pre-imported", async function (assert) {
            // given
            const blob = new Blob(['foo']);
            const file = new File([blob], 'fichier.csv');

            // when
            const screen = await visit('/sessions/import');
            const input = await screen.findByLabelText(
              t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
            );
            await triggerEvent(input, 'change', { files: [file] });

            // then
            assert.dom(await screen.getByLabelText('fichier.csv')).exists();
          });

          module('when leaving page and coming back', function (hooks) {
            hooks.beforeEach(async function () {
              await authenticateSession(certificationPointOfContact.id);
            });

            test('it should get back to step 1', async function (assert) {
              // given
              server.create('session-summary', { certificationCenterId: certificationCenter.id });
              const blob = new Blob(['foo']);
              const file = new File([blob], 'fichier.csv', { type: 'text/csv' });

              const { getByLabelText, getByRole, queryByLabelText } = await visit('/sessions/import');

              const importButton = getByLabelText(
                t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
              );
              await triggerEvent(importButton, 'change', { files: [file] });
              const importConfirmationButton = getByRole('button', { name: t('common.actions.continue') });
              await click(importConfirmationButton);

              // when
              const outLink = getByRole('link', { name: t('pages.sessions.actions.return') });
              await click(outLink);
              await click(
                getByRole('link', { name: t('pages.sessions.list.actions.multiple-creation-edition.label') }),
              );

              // then
              assert.dom(importButton).exists();
              assert.dom(queryByLabelText('fichier.csv')).doesNotExist();
            });
          });

          module('when cancelling the import', function () {
            test("it should remove the file's name", async function (assert) {
              // given
              const blob = new Blob(['foo']);
              const file = new File([blob], 'fichier.csv', { type: 'text/csv' });

              // when
              const screen = await visit('/sessions/import');
              const input = await screen.findByLabelText(
                t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
              );
              await triggerEvent(input, 'change', { files: [file] });
              await settled();
              const cancelButton = await screen.getByRole('button', {
                name: t('pages.sessions.import.step-one.actions.cancel.label'),
              });
              await click(cancelButton);
              await settled();

              // then
              assert.dom(await screen.queryByLabelText('fichier.csv')).doesNotExist();
            });
          });

          module('when the file is valid', function () {
            test('it should display the sessions and candidates count', async function (assert) {
              // given
              const blob = new Blob(['foo']);
              const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
              this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
                return new Response(
                  200,
                  {},
                  {
                    sessionsCount: 2,
                    sessionsWithoutCandidatesCount: 1,
                    candidatesCount: 3,
                    errorReports: [],
                  },
                );
              });

              // when
              const { getByLabelText, getByRole, getByText, queryByLabelText } = await visit('/sessions/import');
              const input = getByLabelText(
                t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
              );
              await triggerEvent(input, 'change', { files: [file] });
              const importButton = getByRole('button', { name: t('common.actions.continue') });
              await click(importButton);
              await settled();

              // then
              assert
                .dom(
                  getByText(
                    t('pages.sessions.import.step-two.sessions-and-empty-sessions-count', {
                      sessionsCount: 2,
                      sessionsWithoutCandidatesCount: 1,
                    }),
                  ),
                )
                .exists();
              assert
                .dom(getByText(t('pages.sessions.import.step-two.candidates-count', { candidatesCount: 3 })))
                .exists();
              assert.dom(queryByLabelText('fichier.csv')).doesNotExist();
            });

            module('when there is only non blocking errors', function () {
              test('it should allow session creation anyway', async function (assert) {
                // given
                const blob = new Blob(['foo']);
                const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
                this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
                  return new Response(
                    200,
                    {},
                    {
                      sessionsCount: 2,
                      sessionsWithoutCandidatesCount: 1,
                      candidatesCount: 3,
                      errorReports: [{ code: 'EMPTY_SESSION', line: 1, blocking: false }],
                    },
                  );
                });

                // when
                const screen = await visit('/sessions/import');
                const input = screen.getByLabelText(
                  t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
                );
                await triggerEvent(input, 'change', { files: [file] });
                const importButton = screen.getByRole('button', { name: t('common.actions.continue') });
                await click(importButton);
                await settled();

                // then
                assert
                  .dom(
                    screen.getByRole('button', {
                      name: t('pages.sessions.import.step-two.actions.confirm-with-warning.label'),
                    }),
                  )
                  .exists();
              });
            });

            module('when there is errors (non-blocking and/or blocking errors)', function () {
              test('it should possible to re-import sessions in step two', async function (assert) {
                // given
                const blob = new Blob(['foo']);
                const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
                this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
                  return new Response(
                    200,
                    {},
                    {
                      sessionsCount: 2,
                      sessionsWithoutCandidatesCount: 1,
                      candidatesCount: 3,
                      errorReports: [{ code: 'EMPTY_SESSION', line: 1, blocking: false }],
                    },
                  );
                });
                const screen = await visit('/sessions/import');
                const inputInStepOne = screen.getByLabelText(
                  t('pages.sessions.import.step-one.actions.session-import-upload.label'),
                );
                await triggerEvent(inputInStepOne, 'change', { files: [file] });
                const importInStepOne = screen.getByRole('button', { name: t('common.actions.continue') });

                // when
                await click(importInStepOne);
                await settled();

                // then
                assert
                  .dom(
                    screen.getByRole('button', {
                      name: `${t('pages.sessions.import.step-two.non-blocking-errors.title', { nonBlockingErrorReportsCount: 1 })} ${t('pages.sessions.import.step-two.non-blocking-errors.tag-information', { nonBlockingErrorReportsCount: 1 })}`,
                    }),
                  )
                  .exists();
                assert
                  .dom(
                    screen.getByRole('heading', {
                      name: t('pages.sessions.import.step-two.actions.import-again.title'),
                    }),
                  )
                  .exists();

                //given
                const importInStepTwo = screen.getByRole('button', { name: t('common.actions.continue') });
                const inputInStepTwo = screen.getByLabelText(
                  t('pages.sessions.import.step-two.actions.import-again.label'),
                );
                await triggerEvent(inputInStepTwo, 'change', { files: [file] });
                this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
                  return new Response(
                    200,
                    {},
                    {
                      sessionsCount: 2,
                      sessionsWithoutCandidatesCount: 1,
                      candidatesCount: 5,
                      errorReports: [
                        { code: 'EMPTY_SESSION', line: 1, blocking: false },
                        { code: 'CANDIDATE_FIRST_NAME_REQUIRED', line: 1, blocking: false },
                      ],
                    },
                  );
                });

                //when
                await click(importInStepTwo);
                await settled();

                // then
                await screen.findByRole('heading', { name: t('pages.sessions.import.step-two.title') });
                assert
                  .dom(
                    screen.getByRole('button', {
                      name: `${t('pages.sessions.import.step-two.non-blocking-errors.title', { nonBlockingErrorReportsCount: 2 })} ${t('pages.sessions.import.step-two.non-blocking-errors.tag-information', { nonBlockingErrorReportsCount: 2 })}`,
                    }),
                  )
                  .exists();
              });
            });

            module('when the user has confirmed the import', function () {
              test("it should redirect to the session's list", async function (assert) {
                // given
                const blob = new Blob(['foo']);
                const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
                this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
                  return new Response(
                    200,
                    {},
                    { sessionsCount: 2, sessionsWithoutCandidatesCount: 0, candidatesCount: 3, errorReports: [] },
                  );
                });

                this.server.post('/certification-centers/:id/sessions/confirm-for-mass-import', () => {
                  return new Response(
                    200,
                    {},
                    { sessionsCount: 2, sessionsWithoutCandidatesCount: 0, candidatesCount: 3 },
                  );
                });

                // when
                const screen = await visit('/sessions/import');
                const input = screen.getByLabelText(
                  t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
                );
                await triggerEvent(input, 'change', { files: [file] });
                const importButton = screen.getByRole('button', { name: t('common.actions.continue') });
                await click(importButton);
                await settled();
                const confirmButton = screen.getByRole('button', {
                  name: t('pages.sessions.import.step-two.actions.confirm.label'),
                });
                await click(confirmButton);
                await settled();

                // then
                assert.strictEqual(currentURL(), '/sessions');
              });

              module('when there is one session', function () {
                test('it should display a success notification', async function (assert) {
                  // given
                  const blob = new Blob(['foo']);
                  const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
                  this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
                    return new Response(
                      200,
                      {},
                      { sessionsCount: 1, sessionsWithoutCandidatesCount: 0, candidatesCount: 1, errorReports: [] },
                    );
                  });

                  this.server.post('/certification-centers/:id/sessions/confirm-for-mass-import', () => {
                    return new Response(
                      200,
                      {},
                      { sessionsCount: 1, sessionsWithoutCandidatesCount: 0, candidatesCount: 3, errorReports: [] },
                    );
                  });

                  // when
                  const screen = await visit('/sessions/import');
                  const input = screen.getByLabelText(
                    t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
                  );
                  await triggerEvent(input, 'change', { files: [file] });
                  const importButton = screen.getByRole('button', { name: t('common.actions.continue') });
                  await click(importButton);
                  await settled();
                  const confirmButton = screen.getByRole('button', {
                    name: t('pages.sessions.import.step-two.actions.confirm.label'),
                  });
                  await click(confirmButton);
                  await settled();

                  // then
                  assert
                    .dom(
                      screen.getByText(
                        t('pages.sessions.import.success', {
                          sessionsCount: 1,
                          sessionsWithoutCandidatesCount: 0,
                          candidatesCount: 1,
                        }),
                      ),
                    )
                    .exists();
                });
              });

              module('when there is more than one session', function () {
                test('it should display a pluralized success notification', async function (assert) {
                  // given
                  const blob = new Blob(['foo']);
                  const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
                  this.server.post('/certification-centers/:id/sessions/validate-for-mass-import', () => {
                    return new Response(
                      200,
                      {},
                      { sessionsCount: 2, sessionsWithoutCandidatesCount: 0, candidatesCount: 3, errorReports: [] },
                    );
                  });

                  this.server.post('/certification-centers/:id/sessions/confirm-for-mass-import', () => {
                    return new Response(
                      200,
                      {},
                      { sessionsCount: 2, sessionsWithoutCandidatesCount: 0, candidatesCount: 3, errorReports: [] },
                    );
                  });

                  // when
                  const screen = await visit('/sessions/import');
                  const input = screen.getByLabelText(
                    t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
                  );
                  await triggerEvent(input, 'change', { files: [file] });
                  const importButton = screen.getByRole('button', { name: t('common.actions.continue') });
                  await click(importButton);
                  await settled();
                  const confirmButton = screen.getByRole('button', {
                    name: t('pages.sessions.import.step-two.actions.confirm.label'),
                  });
                  await click(confirmButton);
                  await settled();

                  // then
                  assert
                    .dom(
                      screen.getByText(
                        t('pages.sessions.import.success', {
                          sessionsCount: 2,
                          sessionsWithoutCandidatesCount: 0,
                          candidatesCount: 3,
                        }),
                      ),
                    )
                    .exists();
                });
              });
            });
          });

          module('error cases', function () {
            module('when the file is not valid', function () {
              test('it should display an error message', async function (assert) {
                //given
                const file = new Blob(['foo']);
                this.server.post(
                  '/certification-centers/:id/sessions/validate-for-mass-import',
                  () =>
                    new Response(
                      422,
                      { some: 'header' },
                      {
                        errors: [
                          {
                            code: 'CSV_HEADERS_NOT_VALID',
                            status: '422',
                            title: 'Unprocessable Entity',
                          },
                        ],
                      },
                    ),
                );

                // when
                const screen = await visit('/sessions/import');
                const input = await screen.findByLabelText(
                  t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
                );
                await triggerEvent(input, 'change', { files: [file] });
                const importButton = screen.getByRole('button', { name: t('common.actions.continue') });
                await click(importButton);
                await settled();

                // then
                assert.dom(screen.getByText(t('pages.sessions.import.step-one.errors.CSV_HEADERS_NOT_VALID'))).exists();
              });

              test('it should not go to step two', async function (assert) {
                //given
                const file = new Blob(['foo']);
                this.server.post(
                  '/certification-centers/:id/sessions/validate-for-mass-import',
                  () =>
                    new Response(
                      422,
                      { some: 'header' },
                      {
                        errors: [
                          {
                            code: 'INVALID_DOCUMENT',
                            status: '422',
                            title: 'Unprocessable Entity',
                            detail: 'Fichier non valide',
                          },
                        ],
                      },
                    ),
                );

                // when
                const screen = await visit('/sessions/import');
                const input = await screen.findByLabelText(
                  t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
                );
                await triggerEvent(input, 'change', { files: [file] });
                const importButton = screen.getByRole('button', { name: t('common.actions.continue') });
                await click(importButton);

                // then
                assert
                  .dom(
                    screen.getByRole('button', {
                      name: t('pages.sessions.import.step-one.actions.session-import-template.extra-information'),
                    }),
                  )
                  .exists();
              });
            });

            module('when file headers have been modified', function () {
              test('it should display an error message', async function (assert) {
                //given
                const blob = new Blob(['foo']);
                const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
                this.server.post(
                  '/certification-centers/:id/sessions/validate-for-mass-import',
                  () =>
                    new Response(
                      422,
                      { some: 'header' },
                      {
                        errors: [
                          {
                            code: 'CSV_HEADERS_NOT_VALID',
                          },
                        ],
                      },
                    ),
                );

                // when
                const screen = await visit('/sessions/import');
                const input = await screen.findByLabelText(
                  t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
                );
                await triggerEvent(input, 'change', { files: [file] });
                const importButton = screen.getByRole('button', { name: t('common.actions.continue') });
                await click(importButton);
                await settled();

                // then
                assert.dom(screen.getByText(t('pages.sessions.import.step-one.errors.CSV_HEADERS_NOT_VALID'))).exists();
              });
            });

            module('when the file is empty', function () {
              test('it should display an error message', async function (assert) {
                //given
                const blob = new Blob(['foo']);
                const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
                this.server.post(
                  '/certification-centers/:id/sessions/validate-for-mass-import',
                  () =>
                    new Response(
                      422,
                      { some: 'header' },
                      {
                        errors: [
                          {
                            code: 'CSV_DATA_REQUIRED',
                          },
                        ],
                      },
                    ),
                );

                // when
                const screen = await visit('/sessions/import');
                const input = await screen.findByLabelText(
                  t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
                );
                await triggerEvent(input, 'change', { files: [file] });
                const importButton = screen.getByRole('button', { name: t('common.actions.continue') });
                await click(importButton);
                await settled();

                // then
                assert.dom(screen.getByText(t('pages.sessions.import.step-one.errors.CSV_DATA_REQUIRED'))).exists();
              });
            });

            module('when sessions validation fails', function () {
              module('when cancelling the import', function () {
                test('it should remove the error message', async function (assert) {
                  // given
                  const blob = new Blob(['foo']);
                  const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
                  this.server.post(
                    '/certification-centers/:id/sessions/validate-for-mass-import',
                    () =>
                      new Response(
                        422,
                        { some: 'header' },
                        {
                          errors: [
                            {
                              code: 'CSV_DATA_REQUIRED',
                            },
                          ],
                        },
                      ),
                  );

                  const screen = await visit('/sessions/import');
                  const input = screen.getByLabelText(
                    t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
                  );
                  await triggerEvent(input, 'change', { files: [file] });

                  // when
                  await click(screen.getByRole('button', { name: t('common.actions.continue') }));
                  await settled();

                  // then
                  assert.dom(screen.getByText(t('pages.sessions.import.step-one.errors.CSV_DATA_REQUIRED'))).exists();

                  // when
                  await click(
                    screen.getByRole('button', { name: t('pages.sessions.import.step-one.actions.cancel.label') }),
                  );
                  await settled();

                  // then
                  assert
                    .dom(screen.queryByText(t('pages.sessions.import.step-one.errors.CSV_DATA_REQUIRED')))
                    .doesNotExist();
                });
              });

              module('when the user re-import a file', function () {
                test('it should remove the error message', async function (assert) {
                  // given
                  const blob = new Blob(['foo']);
                  const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
                  this.server.post(
                    '/certification-centers/:id/sessions/validate-for-mass-import',
                    () =>
                      new Response(
                        422,
                        { some: 'header' },
                        {
                          errors: [
                            {
                              code: 'CSV_DATA_REQUIRED',
                            },
                          ],
                        },
                      ),
                  );

                  const screen = await visit('/sessions/import');
                  const input = screen.getByLabelText(
                    t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
                  );
                  await triggerEvent(input, 'change', { files: [file] });

                  // when
                  await click(screen.getByRole('button', { name: t('common.actions.continue') }));
                  await settled();

                  // then
                  assert.dom(screen.getByText(t('pages.sessions.import.step-one.errors.CSV_DATA_REQUIRED'))).exists();

                  // when
                  await triggerEvent(input, 'change', { files: [file] });

                  // then
                  assert
                    .dom(screen.queryByText(t('pages.sessions.import.step-one.errors.CSV_DATA_REQUIRED')))
                    .doesNotExist();
                });
              });

              module('when an internal server error occurs', function () {
                test('it should display the default error message', async function (assert) {
                  //given
                  const blob = new Blob(['foo']);
                  const file = new File([blob], 'fichier.csv', { type: 'text/csv' });
                  this.server.post(
                    '/certification-centers/:id/sessions/validate-for-mass-import',
                    () => new Response(500),
                  );

                  // when
                  const screen = await visit('/sessions/import');
                  const input = await screen.findByLabelText(
                    t('pages.sessions.import.step-one.actions.session-import-upload.extra-information'),
                  );
                  await triggerEvent(input, 'change', { files: [file] });
                  const importButton = screen.getByRole('button', { name: t('common.actions.continue') });
                  await click(importButton);
                  await settled();

                  // then
                  assert.dom(screen.getByText(t('common.api-error-messages.internal-server-error'))).exists();
                });
              });
            });
          });
        });
      });
    });
  });
});
/* eslint-enable ember/no-settled-after-test-helper */
