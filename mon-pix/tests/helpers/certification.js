import { click, fillIn } from '@ember/test-helpers';
import { clickByLabel } from './click-by-label';

export async function fillCertificationJoiner({ sessionId, firstName, lastName, dayOfBirth, monthOfBirth, yearOfBirth, intl }) {
  await fillIn('#certificationJoinerSessionId', sessionId);
  await fillIn('#certificationJoinerFirstName', firstName);
  await fillIn('#certificationJoinerLastName', lastName);
  await fillIn('#certificationJoinerDayOfBirth', dayOfBirth);
  await fillIn('#certificationJoinerMonthOfBirth', monthOfBirth);
  await fillIn('#certificationJoinerYearOfBirth', yearOfBirth);
  await clickByLabel(intl.t('pages.certification-joiner.form.actions.submit'));
}

export async function fillCertificationStarter({ accessCode }) {
  await fillIn('#certificationStarterSessionCode', accessCode);
  await click('.certification-course-page__submit_button');
}
