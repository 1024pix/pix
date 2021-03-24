const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');
const moment = require('moment');

describe('Acceptance | Controller | session-controller-get-session-results', function() {

  let server;

  beforeEach(async function() {
    server = await createServer();
  });

  describe('GET /api/admin/sessions/{id}/results', function() {
    let session;
    let sessionId;

    beforeEach(function() {
      session = databaseBuilder.factory.buildSession({ date: '2020/01/01', time: '12:00' });
      sessionId = session.id;

      return databaseBuilder.commit();
    });

    context('when user has not the role PixMaster', function() {

      it('should return 403 HTTP status code', async function() {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/sessions/${sessionId}/results`,
          payload: {},
        });

        // then
        expect(response.statusCode).to.equal(401);
      });

    });

    context('when user has role PixMaster', function() {
      let pixMasterId;
      let certif1;
      let certif2;
      let asr1;
      let request;
      const birthdate = moment(new Date('1996-01-01')).format('DD/MM/YYYY');
      const createdAt = moment(new Date('2020-01-01')).format('DD/MM/YYYY');

      beforeEach(function() {
        const dbf = databaseBuilder.factory;
        pixMasterId = dbf.buildUser.withPixRolePixMaster().id;

        certif1 = dbf.buildCertificationCourse({ sessionId, lastName: 'Dupont', birthdate, createdAt });
        certif2 = dbf.buildCertificationCourse({ sessionId, lastName: 'Ducont', birthdate, createdAt });

        const badge = dbf.buildBadge();

        const assessmentId1 = dbf.buildAssessment({ certificationCourseId: certif1.id }).id;
        dbf.buildAssessment({ certificationCourseId: certif2.id });
        dbf.buildPartnerCertification({ certificationCourseId: certif1.id, partnerKey: badge.key });

        asr1 = dbf.buildAssessmentResult({ assessmentId: assessmentId1, createdAt: new Date('2018-04-15T00:00:00Z') });

        request = {
          method: 'GET',
          url: `/api/admin/sessions/${sessionId}/results`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(pixMasterId) },
        };

        return databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', async function() {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return the expected data', async function() {
        // when
        const response = await server.inject(request);

        // then
        const expectedResult = '\uFEFF' +
        '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Session";"Centre de certification";"Date de passage de la certification"\n' +
        `${certif1.id};"${certif1.firstName}";"${certif1.lastName}";"${birthdate}";"${certif1.birthplace}";"${certif1.externalId}";${asr1.pixScore};"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";${sessionId};"${session.certificationCenter}";"${createdAt}"\n` +
        `${certif2.id};"${certif2.firstName}";"${certif2.lastName}";"${birthdate}";"${certif2.birthplace}";"${certif2.externalId}";;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";${sessionId};"${session.certificationCenter}";"${createdAt}"`;
        expect(response.payload).to.deep.equal(expectedResult);
      });

      it('should return the correct fileName', async function() {
        // when
        const response = await server.inject(request);

        // then
        const expectedFileName = `20200101_1200_resultats_session_${sessionId}.csv`;
        const expectedHeader = `attachment; filename=${expectedFileName}`;
        expect(response.headers['content-disposition']).to.deep.equal(expectedHeader);
      });

    });
  });
});
