import { expect, test } from '../../../fixtures/certification/index.ts';
import { checkSessionInformationAndExpectSuccess, getTestRef } from '../../../helpers/certification/utils.ts';
import { CERTIFICATIONS_DATA } from '../../../helpers/db-data.ts';
import { HomePage as AdminHomePage } from '../../../pages/pix-admin/index.ts';
import { SessionListPage, SessionManagementPage } from '../../../pages/pix-certif/index.ts';

test(
  `${getTestRef(import.meta.url)}`,
  {
    tag: ['@enrolment'],
    annotation: [
      {
        type: 'scenario',
        description: `Enrolling 5 candidates through individual enrolment.
         - Checking that it is not possible to enroll the same candidate twice
         - Enrolled frameworks : CORE, CLEA, EDU 1ER DEGRE, DROIT and PRO SANTE
         - All candidates enter the test
         - All candidates are allowed to start the test
         - All answer one challenge only
         - All are ended by invigilator
         - Session finalized
         - Checking PixAdmin screens`,
      },
    ],
  },
  async ({
    pixCertifProPage,
    pixAdminRoleCertifPage,
    getCertifiableUserData,
    pixAppCertifiableUserPage,
    passManyCertificationExams,
    testRef,
  }) => {
    test.slow();
    const userDataCoreSubscription = await getCertifiableUserData('buffy.summers@example.net');
    const userDataCleaSubscription = await getCertifiableUserData('rupert.giles@example.net');
    const userDataEduSubscription = await getCertifiableUserData('cordelia.chase@example.net');
    const userDataDroitSubscription = await getCertifiableUserData('willow.rosenberg@example.net');
    const userDataProSanteSubscription = await getCertifiableUserData('riley.finn@example.net');
    await pixCertifProPage.goto(process.env.PIX_CERTIF_URL!);

    let sessionNumber = '',
      accessCode = '',
      invigilatorCode = '';
    const sessionManagementPage = await test.step('Create session', async () => {
      const sessionListPage = new SessionListPage(pixCertifProPage);
      const sessionCreationPage = await sessionListPage.goToCreateSession();
      const sessionManagementPage = await sessionCreationPage.createSession({
        address: `address ${testRef}`,
        room: `room ${testRef}`,
        examiner: `examiner ${testRef}`,
        hour: '09',
        minute: '05',
      });

      const sessionData = await sessionManagementPage.getSessionData();
      sessionNumber = sessionData.sessionNumber;
      accessCode = sessionData.accessCode;
      invigilatorCode = sessionData.invigilatorCode;
      return sessionManagementPage;
    });

    await test.step('Enroll first candidate to CORE exam', async () => {
      await sessionManagementPage.goToEnrollCandidateForm();
      await sessionManagementPage.addCandidate({
        ...userDataCoreSubscription,
        enrollFor: 'CORE',
      });
      const enrolledCandidatesSoFar = await sessionManagementPage.getEnrolledCandidatesData();
      expect(enrolledCandidatesSoFar).toMatchObject([
        {
          'Nom de naissance': userDataCoreSubscription.lastName,
          Prénom: userDataCoreSubscription.firstName,
          'Date de naissance':
            userDataCoreSubscription.birthDay +
            '/' +
            userDataCoreSubscription.birthMonth +
            '/' +
            userDataCoreSubscription.birthYear,
          'Certification sélectionnée': 'Certification Pix',
        },
      ]);
    });

    await test.step('Get an error when trying to enroll another candidate with same identity', async () => {
      await sessionManagementPage.goToEnrollCandidateForm();
      await sessionManagementPage.addCandidate({
        ...userDataCoreSubscription,
        enrollFor: 'CORE',
        checkForSuccess: false,
      });
      await expect(
        pixCertifProPage.getByText("Ce candidat est déjà dans la liste, vous ne pouvez pas l'ajouter à nouveau."),
      ).toBeVisible();
      await pixCertifProPage.getByRole('button', { name: 'Fermer la notification' }).click();
      await pixCertifProPage.getByRole('button', { name: "Fermer la modale d'ajout de candidat" }).click();
      const enrolledCandidatesSoFar = await sessionManagementPage.getEnrolledCandidatesData();
      expect(enrolledCandidatesSoFar).toMatchObject([
        {
          'Nom de naissance': userDataCoreSubscription.lastName,
          Prénom: userDataCoreSubscription.firstName,
          'Date de naissance':
            userDataCoreSubscription.birthDay +
            '/' +
            userDataCoreSubscription.birthMonth +
            '/' +
            userDataCoreSubscription.birthYear,
          'Certification sélectionnée': 'Certification Pix',
        },
      ]);
    });

    await test.step('Enroll second candidate to CLEA exam', async () => {
      await sessionManagementPage.goToEnrollCandidateForm();
      await sessionManagementPage.addCandidate({
        ...userDataCleaSubscription,
        enrollFor: CERTIFICATIONS_DATA.CLEA,
      });
    });

    await test.step('Enroll third candidate to Pix+ Édu 1er degré exam', async () => {
      await sessionManagementPage.goToEnrollCandidateForm();
      await sessionManagementPage.addCandidate({
        ...userDataEduSubscription,
        enrollFor: CERTIFICATIONS_DATA.EDU_1ER_DEGRE,
      });
    });

    await test.step('Enroll fourth candidate to Pix+ Droit exam', async () => {
      await sessionManagementPage.goToEnrollCandidateForm();
      await sessionManagementPage.addCandidate({
        ...userDataDroitSubscription,
        enrollFor: CERTIFICATIONS_DATA.DROIT,
      });
    });

    await test.step('Enroll fifth candidate to Pix+ Pro santé exam', async () => {
      await sessionManagementPage.goToEnrollCandidateForm();
      await sessionManagementPage.addCandidate({
        ...userDataProSanteSubscription,
        enrollFor: CERTIFICATIONS_DATA.PRO_SANTE,
      });
    });

    await test.step('Check all enrolled candidates', async () => {
      const enrolledCandidatesSoFar = await sessionManagementPage.getEnrolledCandidatesData();
      expect(enrolledCandidatesSoFar).toHaveLength(5);
      const coreEnrolled = enrolledCandidatesSoFar.find(
        (enrolled) => enrolled['Prénom'] === userDataCoreSubscription.firstName,
      );
      expect(coreEnrolled).toMatchObject({
        'Nom de naissance': userDataCoreSubscription.lastName,
        Prénom: userDataCoreSubscription.firstName,
        'Date de naissance':
          userDataCoreSubscription.birthDay +
          '/' +
          userDataCoreSubscription.birthMonth +
          '/' +
          userDataCoreSubscription.birthYear,
        'Certification sélectionnée': 'Certification Pix',
      });
      const cleaEnrolled = enrolledCandidatesSoFar.find(
        (enrolled) => enrolled['Prénom'] === userDataCleaSubscription.firstName,
      );
      expect(cleaEnrolled).toMatchObject({
        'Nom de naissance': userDataCleaSubscription.lastName,
        Prénom: userDataCleaSubscription.firstName,
        'Date de naissance':
          userDataCleaSubscription.birthDay +
          '/' +
          userDataCleaSubscription.birthMonth +
          '/' +
          userDataCleaSubscription.birthYear,
        'Certification sélectionnée': 'Double Certification Pix-CléA Numérique',
      });
      const eduEnrolled = enrolledCandidatesSoFar.find(
        (enrolled) => enrolled['Prénom'] === userDataEduSubscription.firstName,
      );
      expect(eduEnrolled).toMatchObject({
        'Nom de naissance': userDataEduSubscription.lastName,
        Prénom: userDataEduSubscription.firstName,
        'Date de naissance':
          userDataEduSubscription.birthDay +
          '/' +
          userDataEduSubscription.birthMonth +
          '/' +
          userDataEduSubscription.birthYear,
        'Certification sélectionnée': 'Pix+ Édu 1er degré',
      });
      const droitEnrolled = enrolledCandidatesSoFar.find(
        (enrolled) => enrolled['Prénom'] === userDataDroitSubscription.firstName,
      );
      expect(droitEnrolled).toMatchObject({
        'Nom de naissance': userDataDroitSubscription.lastName,
        Prénom: userDataDroitSubscription.firstName,
        'Date de naissance':
          userDataDroitSubscription.birthDay +
          '/' +
          userDataDroitSubscription.birthMonth +
          '/' +
          userDataDroitSubscription.birthYear,
        'Certification sélectionnée': 'Pix+ Droit',
      });
      const proSanteEnrolled = enrolledCandidatesSoFar.find(
        (enrolled) => enrolled['Prénom'] === userDataProSanteSubscription.firstName,
      );
      expect(proSanteEnrolled).toMatchObject({
        'Nom de naissance': userDataProSanteSubscription.lastName,
        Prénom: userDataProSanteSubscription.firstName,
        'Date de naissance':
          userDataProSanteSubscription.birthDay +
          '/' +
          userDataProSanteSubscription.birthMonth +
          '/' +
          userDataProSanteSubscription.birthYear,
        'Certification sélectionnée': 'Pix+ Professionnels de Santé',
      });
    });

    const pixAppCorePage = await pixAppCertifiableUserPage(userDataCoreSubscription);
    const pixAppCleaPage = await pixAppCertifiableUserPage(userDataCleaSubscription);
    const pixAppEduPage = await pixAppCertifiableUserPage(userDataEduSubscription);
    const pixAppDroitPage = await pixAppCertifiableUserPage(userDataDroitSubscription);
    const pixAppProSantePage = await pixAppCertifiableUserPage(userDataProSanteSubscription);
    await test.step('All candidates pass the exam', async () => {
      await passManyCertificationExams({
        examsData: [
          {
            certifiableUserData: userDataCoreSubscription,
            rightWrongAnswersSequence: [true],
            pixAppPage: pixAppCorePage,
          },
          {
            certifiableUserData: userDataCleaSubscription,
            rightWrongAnswersSequence: [true],
            pixAppPage: pixAppCleaPage,
          },
          {
            certifiableUserData: userDataEduSubscription,
            rightWrongAnswersSequence: [true],
            pixAppPage: pixAppEduPage,
          },
          {
            certifiableUserData: userDataDroitSubscription,
            rightWrongAnswersSequence: [true],
            pixAppPage: pixAppDroitPage,
          },
          {
            certifiableUserData: userDataProSanteSubscription,
            rightWrongAnswersSequence: [true],
            pixAppPage: pixAppProSantePage,
          },
        ],
        sessionNumber,
        accessCode,
        invigilatorCode,
      });
    });

    await test.step('Finalization by marking technical issues on all candidates', async () => {
      const sessionManagementPage = new SessionManagementPage(pixCertifProPage);
      const sessionFinalizationPage = await sessionManagementPage.goToFinalizeSession();
      await expect(pixCertifProPage.getByText(userDataCoreSubscription.firstName)).toBeVisible();
      await sessionFinalizationPage.markTechnicalIssueFor(userDataCoreSubscription.lastName);
      await expect(pixCertifProPage.getByText(userDataCleaSubscription.firstName)).toBeVisible();
      await sessionFinalizationPage.markTechnicalIssueFor(userDataCleaSubscription.lastName);
      await expect(pixCertifProPage.getByText(userDataEduSubscription.firstName)).toBeVisible();
      await sessionFinalizationPage.markTechnicalIssueFor(userDataEduSubscription.lastName);
      await expect(pixCertifProPage.getByText(userDataDroitSubscription.firstName)).toBeVisible();
      await sessionFinalizationPage.markTechnicalIssueFor(userDataDroitSubscription.lastName);
      await expect(pixCertifProPage.getByText(userDataProSanteSubscription.firstName)).toBeVisible();
      await sessionFinalizationPage.markTechnicalIssueFor(userDataProSanteSubscription.lastName);

      await sessionFinalizationPage.finalizeSession();
    });

    const adminHomepage = new AdminHomePage(pixAdminRoleCertifPage);
    await test.step('Check candidates did pass what they enrolled for', async () => {
      const sessionsMainPage = await adminHomepage.goToCertificationSessionsTab();
      const sessionPage = await sessionsMainPage.goToSessionToPublishInfo(sessionNumber);

      await test.step('Check session information', async () => {
        await checkSessionInformationAndExpectSuccess(sessionPage, {
          address: `address ${testRef}`,
          room: `room ${testRef}`,
          invigilatorName: `examiner ${testRef}`,
          status: 'Finalisée',
          nbStartedCertifications: 0,
          nbIssueReportsUnsolved: 0,
          nbIssueReports: 0,
          nbCertificationsInError: 0,
        });
      });

      await pixAdminRoleCertifPage
        .getByRole('link', { name: 'Liste des certifications de la session', exact: true })
        .click();
      await test.step('Check certification information', async () => {
        const certificationListPage = await sessionPage.goToCertificationListPage();
        const certificationData = await certificationListPage.getCertificationData();
        expect(certificationData.length).toBe(5);
        const coreData = certificationData.find((data) => data['Prénom'] === userDataCoreSubscription.firstName);
        expect(coreData).toMatchObject({
          Prénom: userDataCoreSubscription.firstName,
          Nom: userDataCoreSubscription.lastName,
          Statut: 'Annulée',
          Résultats: 'Pix',
          'Signalements impactants non résolus': '',
          'Certification passée': 'Pix Cœur',
        });
        const cleaData = certificationData.find((data) => data['Prénom'] === userDataCleaSubscription.firstName);
        expect(cleaData).toMatchObject({
          Prénom: userDataCleaSubscription.firstName,
          Nom: userDataCleaSubscription.lastName,
          Statut: 'Annulée',
          Résultats: 'Pix',
          'Signalements impactants non résolus': '',
          'Certification passée': 'PIX / CléA Numérique',
        });
        const eduData = certificationData.find((data) => data['Prénom'] === userDataEduSubscription.firstName);
        expect(eduData).toMatchObject({
          Prénom: userDataEduSubscription.firstName,
          Nom: userDataEduSubscription.lastName,
          Statut: 'Annulée',
          Résultats: 'Non admissible',
          'Signalements impactants non résolus': '',
          'Certification passée': 'Pix+ Édu 1er degré',
        });
        const droitData = certificationData.find((data) => data['Prénom'] === userDataDroitSubscription.firstName);
        expect(droitData).toMatchObject({
          Prénom: userDataDroitSubscription.firstName,
          Nom: userDataDroitSubscription.lastName,
          Statut: 'Annulée',
          Résultats: 'Non obtenue',
          'Signalements impactants non résolus': '',
          'Certification passée': 'Pix+ Droit',
        });
        const proSanteData = certificationData.find(
          (data) => data['Prénom'] === userDataProSanteSubscription.firstName,
        );
        expect(proSanteData).toMatchObject({
          Prénom: userDataProSanteSubscription.firstName,
          Nom: userDataProSanteSubscription.lastName,
          Statut: 'Annulée',
          Résultats: 'Non obtenue',
          'Signalements impactants non résolus': '',
          'Certification passée': 'Pix+ Pro Santé',
        });
      });
    });
  },
);
