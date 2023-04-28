import { fillIn, click } from '@ember/test-helpers';

export async function fillCertificationJoiner({
  sessionId,
  firstName,
  lastName,
  dayOfBirth,
  monthOfBirth,
  yearOfBirth,
  intl,
  screen,
}) {
  await fillIn(
    screen.getByRole('textbox', {
      name: 'Numéro de session Communiqué uniquement par le surveillant en début de session',
    }),
    sessionId
  );
  await fillIn(screen.getByRole('textbox', { name: 'Prénom' }), firstName);
  await fillIn(screen.getByRole('textbox', { name: 'Nom de naissance' }), lastName);
  await fillIn(screen.getByRole('spinbutton', { name: 'jour de naissance (JJ)' }), dayOfBirth);
  await fillIn(screen.getByRole('spinbutton', { name: 'mois de naissance (MM)' }), monthOfBirth);
  await fillIn(screen.getByRole('spinbutton', { name: 'année de naissance (AAAA)' }), yearOfBirth);
  await click(screen.getByRole('button', { name: intl.t('pages.certification-joiner.form.actions.submit') }));
}

export async function fillCertificationStarter({ accessCode, intl, screen }) {
  await fillIn(screen.getByRole('textbox', { name: "Code d'accès communiqué par le surveillant" }), accessCode);
  await click(screen.getByRole('button', { name: intl.t('pages.certification-start.actions.submit') }));
}
