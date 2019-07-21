const { expect, sinon } = require('../../../test-helper');
const parseCertificationCandidatesFromAttendanceSheet = require('../../../../lib/domain/usecases/parse-certification-candidates-from-attendance-sheet');
const odsService = require('../../../../lib/domain/services/ods-service');
const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity, InvalidCertificationCandidateData } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | parse-certification-candidates-from-attendance-sheet', () => {

  let result;
  const userId = 'dummyUserId';
  const sessionId = 'dummySessionId';
  const sessionRepository = { ensureUserHasAccessToSession: _.noop };

  const TABLEHEADER_CANDIDATEPROPERTY_MAP = [
    {
      header: 'NOM',
      property: 'lastName',
    },
    {
      header: 'Prénom',
      property: 'firstName',
    },
    {
      header: 'Date de naissance (format : jj/mm/aaaa)',
      property: 'birthdate',
    },
    {
      header: 'Lieu de naissance',
      property: 'birthCity',
    },
    {
      header: 'Identifiant local',
      property: 'externalId',
    },
    {
      header: 'Temps majoré ?',
      property: 'extraTimePercentage',
    },
  ];

  const certificationCandidates = [
    {
      lastName: 'Gouffre des Beignets',
      firstName: 'Jean',
      birthdate: new Date('1985-05-20').getTime(),
      birthCity: 'Loukoum City',
      birthCountry: 'Loukoum Country',
      birthProvince: 'Loukoum Province',
      externalId: 'ENT1234',
      extraTimePercentage: 20,
      createdAt: undefined,
      sessionId: undefined,
      id: undefined,
    },
    {
      lastName: 'Laifrui',
      firstName: 'Jaime',
      birthdate: new Date('1975-11-04').getTime(),
      birthCity: 'Minneapolis',
      birthCountry: 'Minneapolis Country',
      birthProvince: 'Minneapolis Province',
      externalId: 'ENT4567',
      extraTimePercentage: 0,
      createdAt: undefined,
      sessionId: undefined,
      id: undefined,
    },
  ];

  const certificationCandidatesData = [
    {
      lastName: 'Gouffre des Beignets',
      firstName: 'Jean',
      birthdate: '1985-05-20',
      birthCity: 'Loukoum City',
      birthCountry: 'Loukoum Country',
      birthProvince: 'Loukoum Province',
      externalId: 'ENT1234',
      extraTimePercentage: 20,
    },
    {
      lastName: 'Laifrui',
      firstName: 'Jaime',
      birthdate: '1975-11-04',
      birthCity: 'Minneapolis',
      birthCountry: 'Minneapolis Country',
      birthProvince: 'Minneapolis Province',
      externalId: 'ENT4567',
      extraTimePercentage: 0,
    },
  ];

  const invalidCertificationCandidatesData = [
    {
      lastName: 'Gouffre des Beignets',
      firstName: 'Jean',
      birthdate: 'chahahahahah',
      birthCity: 'Loukoum City',
      birthProvince: 'Loukoum Province',
      externalId: 'ENT1234',
      extraTimePercentage: 20,
    },
    {
      lastName: 'Laifrui',
      firstName: 'Jaime',
      birthdate: '1975-11-04',
      birthCity: 'Minneapolis',
      birthCountry: 'Minneapolis Country',
      birthProvince: 'Minneapolis Province',
      externalId: 'ENT4567',
      extraTimePercentage: 0,
    },
  ];

  const odsBuffer = Buffer.from('some ods file');
  const odsInvalidDateBuffer = Buffer.from('some other ods file');

  describe('parseCertificationCandidateFromAttendanceSheet', () => {

    context('user has access to the session', () => {

      context('certification candidates data is valid', () => {

        beforeEach(async () => {
          sinon.stub(odsService, 'extractTableDataFromOdsFile').withArgs(
            {
              odsBuffer,
              tableHeaderPropertyMap: TABLEHEADER_CANDIDATEPROPERTY_MAP
            }).resolves(certificationCandidatesData);
          sinon.stub(sessionRepository, 'ensureUserHasAccessToSession').resolves();
          result = await parseCertificationCandidatesFromAttendanceSheet({ userId, sessionId, sessionRepository, odsBuffer });
        });

        // then
        it('should return the certification candidates', () => {
          expect(result).to.deep.equal(certificationCandidates);
        });

        it('should have parsed ods content', () => {
          expect(odsService.extractTableDataFromOdsFile).to.have.been.calledWithExactly(
            {
              odsBuffer,
              tableHeaderPropertyMap: TABLEHEADER_CANDIDATEPROPERTY_MAP
            });
        });

      });

      context('certification candidates data is invalid', () => {

        beforeEach(() => {
          // given
          sinon.stub(odsService, 'extractTableDataFromOdsFile').withArgs(
            {
              odsBuffer: odsInvalidDateBuffer,
              tableHeaderPropertyMap: TABLEHEADER_CANDIDATEPROPERTY_MAP
            }).resolves(invalidCertificationCandidatesData);
          sinon.stub(sessionRepository, 'ensureUserHasAccessToSession').resolves();
        });

        it('should return the certification candidates', async () => {
          // when
          try {
            await parseCertificationCandidatesFromAttendanceSheet({ userId, sessionId, sessionRepository, odsBuffer: odsInvalidDateBuffer });
          } catch (error) {
            // then
            expect(error).to.be.instanceOf(InvalidCertificationCandidateData);
            expect(odsService.extractTableDataFromOdsFile).to.have.been.calledWithExactly(
              {
                odsBuffer: odsInvalidDateBuffer,
                tableHeaderPropertyMap: TABLEHEADER_CANDIDATEPROPERTY_MAP
              });
          }
        });

      });

    });

    context('user does not have access to the session', () => {
      beforeEach(async () => {
        sinon.stub(sessionRepository, 'ensureUserHasAccessToSession').rejects();
        try {
          result = await parseCertificationCandidatesFromAttendanceSheet({ userId, sessionId, sessionRepository, odsBuffer });
        } catch (err) {
          result = err;
        }
      });

      it('should return an error when user does not have access', () => {
        expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
      });

    });

  });

});
