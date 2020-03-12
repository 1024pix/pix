import { click, fillIn } from '@ember/test-helpers';

export async function fillCertificationJoiner({ sessionId, firstName, lastName, dayOfBirth, monthOfBirth, yearOfBirth }) {
  await fillIn('#certificationJoinerSessionId', sessionId);
  await fillIn('#certificationJoinerFirstName', firstName);
  await fillIn('#certificationJoinerLastName', lastName);
  await fillIn('#certificationJoinerDayOfBirth', dayOfBirth);
  await fillIn('#certificationJoinerMonthOfBirth', monthOfBirth);
  await fillIn('#certificationJoinerYearOfBirth', yearOfBirth);
  await click('.certification-joiner__attempt-next-btn');
}

export async function fillCertificationStarter({ accessCode }) {
  await fillIn('#certificationStarterSessionCode', accessCode);
  await click('.certification-course-page__submit_button');
}
