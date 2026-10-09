import { getScreen } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';

import { clickByLabel } from './click-by-label';

export async function fillCertificationJoiner({
  sessionId,
  firstName,
  lastName,
  dayOfBirth,
  monthOfBirth,
  yearOfBirth,
  t,
}) {
  const screen = await getScreen();
  await click(screen.getByRole('button', { name: t('pages.certifications-dashboard.enrolment-banner.action') }));

  await fillIn(
    screen.getByRole('spinbutton', {
      name: `${t('pages.certification-joiner.form.fields.session-number')} ${t('pages.certification-joiner.form.fields.session-number-information')}`,
    }),
    sessionId,
  );
  await fillIn(
    screen.getByRole('textbox', {
      name: t('pages.certification-joiner.form.fields.first-name'),
    }),
    firstName,
  );
  await fillIn(
    screen.getByRole('textbox', {
      name: t('pages.certification-joiner.form.fields.birth-name'),
    }),
    lastName,
  );
  await fillIn(
    screen.getByRole('spinbutton', {
      name: `${t('pages.certification-joiner.form.fields.birth-date')} ${t('pages.certification-joiner.form.fields.birth-day')}`,
    }),
    dayOfBirth,
  );
  await fillIn(
    screen.getByRole('spinbutton', {
      name: t('pages.certification-joiner.form.fields.birth-month'),
    }),
    monthOfBirth,
  );
  await fillIn(
    screen.getByRole('spinbutton', {
      name: t('pages.certification-joiner.form.fields.birth-year'),
    }),
    yearOfBirth,
  );
  await clickByLabel(t('pages.certification-joiner.form.actions.submit'));
}

export async function fillCertificationStarter({ accessCode, t }) {
  await fillIn('#certificationStarterSessionCode', accessCode);
  await clickByLabel(t('pages.certification-start.actions.submit'));
}

export async function validateCertificationInstructions({ t }) {
  const screen = await getScreen();

  for (let i = 0; i < 4; i++) {
    await click(
      screen.getByRole('button', { name: t('pages.certification-instructions.buttons.continuous.aria-label') }),
    );
  }
  await click(
    screen.getByRole('checkbox', {
      name: t('pages.certification-instructions.steps.5.checkbox-label'),
    }),
  );
  await click(
    screen.getByRole('button', {
      name: t('pages.certification-instructions.buttons.continuous.last-page.aria-label'),
    }),
  );
}
