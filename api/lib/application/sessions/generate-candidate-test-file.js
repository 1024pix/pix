require('dotenv').config();
const fs = require('fs');
const fillCandidatesImportSheet = require('../../infrastructure/files/candidates-import/fill-candidates-import-sheet');
const CANDIDATE_COUNT = 1000;

const generateCandidatesImportSheet = async () => {
  const certificationCenterHabilitations = [
    {
      id: 100744,
      name: 'CléA Numérique',
    },
    {
      id: 100746,
      name: 'Pix+ Droit',
    },
  ];

  const isScoCertificationCenter = false;

  const certificationCandidates = [];
  for (let i = 0; i <= CANDIDATE_COUNT; i++) {
    certificationCandidates.push({
      id: 106847,
      firstName: 'firstName' + i,
      lastName: 'lastName' + i,
      birthCity: 'Paris',
      birthProvinceCode: '66',
      birthCountry: 'France',
      birthPostalCode: '75101',
      birthINSEECode: '75101',
      sex: 'M',
      email: 'somemail@example.net',
      resultRecipientEmail: 'somerecipientmail@example.net',
      externalId: 'externalId',
      birthdate: '2000-01-04',
      extraTimePercentage: 0.3,
      createdAt: '2020-01-01T00:00:00.000Z',
      authorizedToStart: false,
      sessionId: 11,
      userId: null,
      schoolingRegistrationId: null,
      complementaryCertifications: [
        {
          id: 106845,
          name: 'Pix+ Droit',
        },
      ],
      billingMode: 'PAID',
      prepaymentCode: null,
    });
  }

  const session = {
    id: 11,
    accessCode: 'ACC123',
    address: '3 rue des églantines',
    certificationCenter: 'Centre de certif Pix',
    date: '2020-03-04',
    description: 'Candidats avec des certifications complémentaires',
    examiner: 'Ginette',
    room: 'B315',
    time: '15:00:00',
    examinerGlobalComment: '',
    finalizedAt: null,
    resultsSentToPrescriberAt: null,
    publishedAt: null,
    certificationCandidates,
    certificationCenterId: 3,
    assignedCertificationOfficerId: null,
    supervisorPassword: 'PIX12',
  };

  const candidateImportSheet = await fillCandidatesImportSheet({
    session,
    certificationCenterHabilitations,
    isScoCertificationCenter,
  });

  await fs.writeFile(`/tmp/liste-candidats-session-${session.id}.ods`, candidateImportSheet, function (error) {
    // eslint-disable-next-line no-console
    if (error) return console.error(error);
  });
};

(async () => {
  await generateCandidatesImportSheet();
})();
