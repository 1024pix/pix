import _ from 'lodash';

import {
  expect,
  databaseBuilder,
  domainBuilder,
  generateValidRequestAuthorizationHeader,
  knex,
} from '../../../test-helper';

import createServer from '../../../../server';

describe('Acceptance | Controller | session-controller-post-certification-candidates', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('#save', function () {
    let options;
    let payload;
    let sessionId;
    let userId;
    let certificationCandidate;
    let certificationCpfCountry;
    let certificationCpfCity;

    beforeEach(function () {
      certificationCandidate = domainBuilder.buildCertificationCandidate.pro({
        birthCountry: 'FRANCE',
        birthINSEECode: '75115',
        birthPostalCode: null,
        birthCity: null,
      });
      userId = databaseBuilder.factory.buildUser().id;

      databaseBuilder.factory.buildOrganization({
        type: 'PRO',
        name: 'PRO_ORGANIZATION',
        externalId: 'EXTERNAL_ID',
      });

      const { id: certificationCenterId, name: certificationCenter } = databaseBuilder.factory.buildCertificationCenter(
        {
          name: 'PRO_CERTIFICATION_CENTER',
          type: 'PRO',
          externalId: 'EXTERNAL_ID',
        }
      );

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
      const complementaryCertification1Id = databaseBuilder.factory.buildComplementaryCertification({
        name: 'Certif complémentaire 1',
      }).id;

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
            'billing-mode': 'FREE',
            sex: certificationCandidate.sex,
            'complementary-certifications': [{ id: complementaryCertification1Id, name: 'Certif complémentaire 1' }],
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

    afterEach(async function () {
      await knex('complementary-certification-subscriptions').delete();
      return knex('certification-candidates').delete();
    });

    it('should respond with a 201 created', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should return the saved certification candidate', async function () {
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
          'billing-mode': 'Gratuite',
          'prepayment-code': null,
          'result-recipient-email': certificationCandidate.resultRecipientEmail,
          email: certificationCandidate.email,
          'external-id': certificationCandidate.externalId,
          'extra-time-percentage': certificationCandidate.extraTimePercentage,
          'is-linked': false,
          'organization-learner-id': null,
          'birth-insee-code': certificationCpfCity.INSEECode,
          'birth-postal-code': null,
          sex: certificationCandidate.sex,
          'complementary-certifications': [],
        },
      };

      expect(_.omit(response.result.data, 'id')).to.deep.equal(expectedData);
      expect(response.result.data.id).to.exist;
    });

    it('should save the complementary certification subscription', async function () {
      // when
      await server.inject(options);

      // then
      const complementaryCertificationRegistrationsInDB = await knex('complementary-certification-subscriptions');
      expect(complementaryCertificationRegistrationsInDB.length).to.equal(1);
    });
  });
});
