const _ = require('lodash');
const {
  expect,
  databaseBuilder,
  domainBuilder,
  generateValidRequestAuthorizationHeader,
  knex,
  sinon,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const { featureToggles } = require('../../../../lib/config');

describe('Acceptance | Controller | session-controller-post-certification-candidates', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  context('version 1.4', () => {

    describe('#save', () => {
      let options;
      let payload;
      let sessionId;
      let userId;
      let certificationCandidate;

      beforeEach(() => {
        sinon.stub(featureToggles, 'isNewCPFDataEnabled').value(false);
        certificationCandidate = domainBuilder.buildCertificationCandidate();
        userId = databaseBuilder.factory.buildUser().id;
        const {
          id: certificationCenterId,
          name: certificationCenter,
        } = databaseBuilder.factory.buildCertificationCenter();
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
              'result-recipient-email': certificationCandidate.resultRecipientEmail,
              'external-id': certificationCandidate.externalId,
              birthdate: certificationCandidate.birthdate,
              'extra-time-percentage': certificationCandidate.extraTimePercentage,
              'has-seen-end-test-screen': certificationCandidate.hasSeenEndTestScreen,
              'birth-insee-code': null,
              'birth-postal-code': null,
              'sex': null,
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

      it('should return the saved certification candidate', async () => {
        // when
        const response = await server.inject(options);

        // then
        const expectedData = {
          type: 'certification-candidates',
          attributes: {
            'first-name': certificationCandidate.firstName,
            'last-name': certificationCandidate.lastName,
            birthdate: certificationCandidate.birthdate,
            'birth-province-code': certificationCandidate.birthProvinceCode,
            'birth-city': certificationCandidate.birthCity,
            'birth-country': certificationCandidate.birthCountry,
            'result-recipient-email': certificationCandidate.resultRecipientEmail,
            email: certificationCandidate.email,
            'external-id': certificationCandidate.externalId,
            'extra-time-percentage': certificationCandidate.extraTimePercentage,
            'is-linked': false,
            'schooling-registration-id': null,
            'birth-insee-code': null,
            'birth-postal-code': null,
            'sex': null,
          },
        };

        expect(_.omit(response.result.data, 'id')).to.deep.equal(expectedData);
        expect(response.result.data.id).to.exist;
      });
    });
  });

  context('version 1.5', () => {

    describe('#save', () => {
      let options;
      let payload;
      let sessionId;
      let userId;
      let certificationCandidate;
      let certificationCpfCountry;
      let certificationCpfCity;

      beforeEach(() => {
        sinon.stub(featureToggles, 'isNewCPFDataEnabled').value(true);
        certificationCandidate = domainBuilder.buildCertificationCandidate({
          birthCountry: 'FRANCE',
          birthINSEECode: '75115',
          birthPostalCode: null,
          birthCity: null,
        });
        userId = databaseBuilder.factory.buildUser().id;
        const {
          id: certificationCenterId,
          name: certificationCenter,
        } = databaseBuilder.factory.buildCertificationCenter();
        sessionId = databaseBuilder.factory.buildSession({ certificationCenterId, certificationCenter }).id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        certificationCpfCountry = databaseBuilder.factory.buildCertificationCpfCountry({
          name: 'FRANCE',
          code: '99100',
          matcher: 'ACEFNR',
        });
        certificationCpfCity = databaseBuilder.factory.buildCertificationCpfCity({
          name: 'PARIS 15',
          INSEECode: '75115',
        });

        payload = {
          data: {
            type: 'certification-candidates',
            attributes: {
              'first-name': certificationCandidate.firstName,
              'last-name': certificationCandidate.lastName,
              'birth-city': null,
              'birth-country': certificationCandidate.birthCountry,
              email: certificationCandidate.email,
              'result-recipient-email': certificationCandidate.resultRecipientEmail,
              'external-id': certificationCandidate.externalId,
              birthdate: certificationCandidate.birthdate,
              'extra-time-percentage': certificationCandidate.extraTimePercentage,
              'has-seen-end-test-screen': certificationCandidate.hasSeenEndTestScreen,
              'birth-insee-code': certificationCandidate.birthINSEECode,
              'birth-postal-code': null,
              'sex': certificationCandidate.sex,
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

      it('should return the saved certification candidate', async () => {
        // when
        const response = await server.inject(options);

        // then
        const expectedData = {
          type: 'certification-candidates',
          attributes: {
            'first-name': certificationCandidate.firstName,
            'last-name': certificationCandidate.lastName,
            birthdate: certificationCandidate.birthdate,
            'birth-city': certificationCpfCity.name,
            'birth-country': certificationCpfCountry.commonName,
            'birth-province-code': null,
            'result-recipient-email': certificationCandidate.resultRecipientEmail,
            email: certificationCandidate.email,
            'external-id': certificationCandidate.externalId,
            'extra-time-percentage': certificationCandidate.extraTimePercentage,
            'is-linked': false,
            'schooling-registration-id': null,
            'birth-insee-code': certificationCpfCity.INSEECode,
            'birth-postal-code': null,
            'sex': certificationCandidate.sex,
          },
        };

        expect(_.omit(response.result.data, 'id')).to.deep.equal(expectedData);
        expect(response.result.data.id).to.exist;
      });
    });
  });
});
