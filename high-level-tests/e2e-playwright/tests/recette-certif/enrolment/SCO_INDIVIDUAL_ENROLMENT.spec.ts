import { expect, test } from '../../../fixtures/certification/index.ts';
import { checkSessionInformationAndExpectSuccess } from '../../../helpers/certification/utils.ts';
import { HomePage as AdminHomePage } from '../../../pages/pix-admin/index.ts';
import { SessionListPage, SessionManagementPage } from '../../../pages/pix-certif/index.ts';

const testRef = 'SCO_INDIVIDUAL_ENROLMENT';

test(
  `${testRef} - Enroll candidate through individual enrolment modal`,
  { tag: ['@enrolment'] },
  async ({
    pixCertifScoPage,
    pixAdminRoleCertifPage,
    getCertifiableUserData,
    pixAppCertifiableUserPage,
    passManyCertificationExams,
  }) => {
    test.slow();
    const userDataCoreSubscription = await getCertifiableUserData('buffy.summers@example.net');
    await pixCertifScoPage.goto(process.env.PIX_CERTIF_URL!);

    let sessionNumber = '',
      accessCode = '',
      invigilatorCode = '';
    const sessionManagementPage = await test.step('Create session', async () => {
      const sessionListPage = new SessionListPage(pixCertifScoPage);
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

    await test.step('Enroll candidate to CORE exam', async () => {
      await sessionManagementPage.goToEnrollScoCandidateForm();
      await sessionManagementPage.addScoCandidate({
        firstName: userDataCoreSubscription.firstName,
        lastName: userDataCoreSubscription.lastName,
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

    await test.step('Check enrolled candidate', async () => {
      const enrolledCandidates = await sessionManagementPage.getEnrolledCandidatesData();
      expect(enrolledCandidates).toHaveLength(1);
      const coreEnrolled = enrolledCandidates.find(
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
    });

    const pixAppCorePage = await pixAppCertifiableUserPage(userDataCoreSubscription);
    await test.step('Candidates passes the exam', async () => {
      await passManyCertificationExams({
        examsData: [
          {
            certifiableUserData: userDataCoreSubscription,
            rightWrongAnswersSequence: [true],
            pixAppPage: pixAppCorePage,
          },
        ],
        sessionNumber,
        accessCode,
        invigilatorCode,
      });
    });

    await test.step('Finalization by marking technical issues on all candidates', async () => {
      const sessionManagementPage = new SessionManagementPage(pixCertifScoPage);
      const sessionFinalizationPage = await sessionManagementPage.goToFinalizeSession();
      await expect(pixCertifScoPage.getByText(userDataCoreSubscription.firstName)).toBeVisible();
      await sessionFinalizationPage.markTechnicalIssueFor(userDataCoreSubscription.lastName);

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
        expect(certificationData.length).toBe(1);
        const coreData = certificationData.find((data) => data['Prénom'] === userDataCoreSubscription.firstName);
        expect(coreData).toMatchObject({
          Prénom: userDataCoreSubscription.firstName,
          Nom: userDataCoreSubscription.lastName,
          Statut: 'Annulée',
          Résultats: 'Pix',
          'Signalements impactants non résolus': '',
          'Certification passée': 'Pix Cœur',
        });
      });
    });
  },
);
