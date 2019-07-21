const { expect, sinon, hFake, domainBuilder } = require('../../../test-helper');

const certificationCandidateController = require('../../../../lib/application/certification-candidates/certification-candidates-controller');

const usecases = require('../../../../lib/domain/usecases');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');

const certificationCandidateSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-candidate-serializer');

describe('Unit | Controller | certificationCandidateController', () => {

  let request;
  const userId = 274939274;
  const certificationCandidateId = 123;

  describe('#get', () => {

    context('when certification candidate exists', () => {

      beforeEach(() => {
        sinon.stub(usecases, 'getCertificationCandidate');
        sinon.stub(certificationCandidateSerializer, 'serialize');
        request = {
          params: {
            id: certificationCandidateId,
          },
          auth: {
            credentials: {
              userId,
            }
          }
        };
      });

      it('should get certification candidate informations', async () => {
        // given

        // when
        await certificationCandidateController.get(request, hFake);

        // then
        expect(usecases.getCertificationCandidate).to.have.been.calledWith({ userId, certificationCandidateId });
      });

      it('should serialize certification candidate informations', async () => {
        // given
        const certificationCandidate = new CertificationCandidate({
          id: certificationCandidateId,
        });
        usecases.getCertificationCandidate.resolves(certificationCandidate);

        // when
        await certificationCandidateController.get(request, hFake);

        // then
        expect(certificationCandidateSerializer.serialize).to.have.been.calledWith(certificationCandidate);
      });

      it('should reply serialized certification candidate informations', async () => {
        // given
        const serializedCertificationCandidate = {
          data: {
            type: 'certificationCandidates',
            id: certificationCandidateId,
          }
        };
        certificationCandidateSerializer.serialize.resolves(serializedCertificationCandidate);
        usecases.getCertificationCandidate.resolves();

        // when
        const response = await certificationCandidateController.get(request, hFake);

        // then
        expect(response).to.deep.equal(serializedCertificationCandidate);
      });

    });
  });

  describe('#save', () => {

    let expectedCertificationCandidate;
    const sessionId = 1;
    beforeEach(() => {
      expectedCertificationCandidate = domainBuilder.buildCertificationCandidate();
      expectedCertificationCandidate.id = undefined;
      expectedCertificationCandidate.sessionId = undefined;
      expectedCertificationCandidate.createdAt = undefined;

      sinon.stub(usecases, 'createCertificationCandidate').resolves();
      sinon.stub(certificationCandidateSerializer, 'deserialize').returns(expectedCertificationCandidate);
      sinon.stub(certificationCandidateSerializer, 'serialize');
      request = {
        payload: {
          data: {
            type: 'certification-candidates',
            attributes: {
              'first-name': expectedCertificationCandidate.firstName,
              'last-name': expectedCertificationCandidate.lastName,
              'birth-country': expectedCertificationCandidate.birthCountry,
              'birth-city': expectedCertificationCandidate.birthCity,
              'birth-province': expectedCertificationCandidate.birthProvince,
              'birthdate': expectedCertificationCandidate.birthdate,
              'extra-time-percentage': expectedCertificationCandidate.extraTimePercentage,
              'external-id': expectedCertificationCandidate.externalId,
            },
            relationships: {
              data: {
                id: sessionId,
                type: 'sessions',
              }
            }
          }
        },
        auth: {
          credentials: {
            userId,
          }
        }
      };
    });

    it('should save the certification candidate', async () => {
      // when
      await certificationCandidateController.save(request, hFake);

      // then
      expect(usecases.createCertificationCandidate).to.have.been.calledWith({ userId, certificationCandidate: expectedCertificationCandidate });
    });

    it('should return the saved certification candidate in JSON API', async () => {
      // given
      const jsonApiCertificationCandidate = {
        data: {
          type: 'certificationCandidates',
          id: 12,
          attributes: {}
        }
      };
      const savedCertificationCandidate = new CertificationCandidate({
        id: '12',
      });

      usecases.createCertificationCandidate.resolves(savedCertificationCandidate);
      certificationCandidateSerializer.serialize.returns(jsonApiCertificationCandidate);

      // when
      const response = await certificationCandidateController.save(request, hFake);

      // then
      expect(response).to.deep.equal(jsonApiCertificationCandidate);
      expect(certificationCandidateSerializer.serialize).to.have.been.calledWith(savedCertificationCandidate);
    });

  });

  describe('#delete', () => {

    context('when certification candidate exists', () => {

      beforeEach(() => {
        sinon.stub(usecases, 'deleteCertificationCandidate');
        sinon.stub(certificationCandidateSerializer, 'serialize');
        request = {
          params: {
            id: certificationCandidateId,
          },
          auth: {
            credentials: {
              userId,
            }
          }
        };
      });

      it('should delete the certification candidate', async () => {
        // given

        // when
        await certificationCandidateController.delete(request, hFake);

        // then
        expect(usecases.deleteCertificationCandidate).to.have.been.calledWith({ userId, certificationCandidateId });
      });

      it('should serialize deleted certification candidate informations', async () => {
        // given
        const deletedCertificationCandidate = new CertificationCandidate({
          id: certificationCandidateId,
        });
        usecases.deleteCertificationCandidate.resolves(deletedCertificationCandidate);

        // when
        await certificationCandidateController.delete(request, hFake);

        // then
        expect(certificationCandidateSerializer.serialize).to.have.been.calledWith(deletedCertificationCandidate);
      });

      it('should reply serialized deleted certification candidate informations', async () => {
        // given
        const serializedDeletedCertificationCandidate = {
          data: {
            type: 'certificationCandidates',
            id: certificationCandidateId,
          }
        };
        certificationCandidateSerializer.serialize.resolves(serializedDeletedCertificationCandidate);
        usecases.deleteCertificationCandidate.resolves();

        // when
        const response = await certificationCandidateController.delete(request, hFake);

        // then
        expect(response).to.deep.equal(serializedDeletedCertificationCandidate);
      });

    });

  });

});
