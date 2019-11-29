module.exports = function usersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 1,
    firstName: 'Pix',
    lastName: 'Master',
    email: 'pixmaster@example.net',
    rawPassword: 'pix123',
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
    pixCertifTermsOfServiceAccepted: true,
    hasSeenAssessmentInstructions: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 2,
    firstName: 'Référent',
    lastName: 'Centre Osiris',
    email: 'certif@example.net',
    rawPassword: 'pix123',
    cgu: true,
    pixOrgaTermsOfServiceAccepted: true,
    pixCertifTermsOfServiceAccepted: true,
    hasSeenAssessmentInstructions: true,
  });
};
