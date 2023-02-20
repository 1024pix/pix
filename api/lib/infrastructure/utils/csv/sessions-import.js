const headers = {
  sessionId: 'N° de session',
  address: '* Nom du site',
  room: '* Nom de la salle',
  date: '* Date de début',
  time: '* Heure de début (heure locale)',
  examiner: '* Surveillant(s)',
  description: 'Observations (optionnel)',
  lastName: '* Nom de naissance',
  firstName: '* Prénom',
  birthdate: '* Date de naissance (format: jj/mm/aaaa)',
  sex: '* Sexe (M ou F)',
  birthINSEECode: 'Code Insee',
  birthPostalCode: 'Code postal',
  birthCity: 'Nom de la commune',
  birthCountry: '* Pays',
  resultRecipientEmail: 'E-mail du destinataire des résultats (formateur, enseignant…)',
  email: 'E-mail de convocation',
  externalId: 'Identifiant local',
  extraTimePercentage: 'Temps majoré ?',
  billingMode: 'Tarification part Pix',
  prepaymentCode: 'Code de prépaiement',
};

const COMPLEMENTARY_CERTIFICATION_SUFFIX = "('oui' ou laisser vide)";

export default {
  headers,
  COMPLEMENTARY_CERTIFICATION_SUFFIX,
};
