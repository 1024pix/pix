const { expect, databaseBuilder, domainBuilder, generateValidRequestAuthorizationHeader, knex } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | session-controller-post-certification-candidates', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('#save', () => {
    let options;
    let payload;
    let sessionId;
    let userId;
    let certificationCandidate;

    beforeEach(() => {
      certificationCandidate = domainBuilder.buildCertificationCandidate();
      userId = databaseBuilder.factory.buildUser().id;
      const { id: certificationCenterId, name: certificationCenter } = databaseBuilder.factory.buildCertificationCenter();
      sessionId = databaseBuilder.factory.buildSession({ certificationCenterId, certificationCenter }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      payload = {
        data: {
          type: 'certification-candidates',
          attributes: {
            'first-name': certificationCandidate.firstName,
            'last-name': certificationCandidate.lastName,
            'birth-city': certificationCandidate.birthCity,
            'birth-province-code': certificationCandidate.birthProvinceCode,
            'birth-country': certificationCandidate.birthCountry,
            email: certificationCandidate.email,
            'external-id': certificationCandidate.externalId,
            birthdate: certificationCandidate.birthdate,
            'extra-time-percentage': certificationCandidate.extraTimePercentage,
            'examiner-comment': certificationCandidate.examinerComment,
            'has-seen-end-test-screen': certificationCandidate.hasSeenEndTestScreen,
          },
        },
      };
      options = {
        method: 'POST',
        url: `/api/sessions/${sessionId}/certification-candidates`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
        payload,
      };

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('certification-candidates').delete();
    });

    it('should respond with a 201 created', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should return the certification candidate with registering attributes set only', async () => {
      // when
      const response = await server.inject(options);

      // then
      const candidateAttrs = response.result.data.attributes;
      expect(candidateAttrs['first-name']).to.equal(certificationCandidate.firstName);
      expect(candidateAttrs['last-name']).to.equal(certificationCandidate.lastName);
      expect(candidateAttrs['birth-city']).to.equal(certificationCandidate.birthCity);
      expect(candidateAttrs['birth-province-code']).to.equal(certificationCandidate.birthProvinceCode);
      expect(candidateAttrs['birth-country']).to.equal(certificationCandidate.birthCountry);
      expect(candidateAttrs['birthdate']).to.equal(certificationCandidate.birthdate);
      expect(candidateAttrs['email']).to.equal(certificationCandidate.email);
      expect(candidateAttrs['external-id']).to.equal(certificationCandidate.externalId);
      expect(candidateAttrs['extra-time-percentage']).to.equal(certificationCandidate.extraTimePercentage);
      expect(candidateAttrs['examinerComment']).to.be.undefined;
    });

  });

});
