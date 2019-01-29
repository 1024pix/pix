const { expect, sinon, hFake } = require('../../../test-helper');
const logger = require('../../../../lib/infrastructure/logger');

const sessionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/session-serializer');
const sessionController = require('../../../../lib/application/sessions/session-controller');
const sessionService = require('../../../../lib/domain/services/session-service');
const Session = require('../../../../lib/domain/models/Session');
const { NotFoundError } = require('../../../../lib/domain/errors');

const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');

describe('Unit | Controller | sessionController', () => {

  let request;
  let expectedSession;
  const userId = 274939274;

  describe('#create', () => {

    beforeEach(() => {
      expectedSession = new Session({
        certificationCenter: 'Université de dressage de loutres',
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-12-08',
        time: '14:30',
        description: 'ahah',
        accessCode: 'ABCD12'
      });

      sinon.stub(sessionService, 'save').resolves();
      sinon.stub(logger, 'error');
      sinon.stub(sessionSerializer, 'deserialize').resolves(expectedSession);
      sinon.stub(sessionSerializer, 'serialize');

      request = {
        payload: {
          data: {
            type: 'sessions',
            attributes: {
              'certification-center': 'Université de dressage de loutres',
              address: 'Nice',
              room: '28D',
              examiner: 'Antoine Toutvenant',
              date: '08/12/2017',
              time: '14:30',
              description: 'ahah'
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

    it('should save the session', async () => {
      // when
      await sessionController.save(request, hFake);

      // then
      expect(sessionService.save).to.have.been.calledWith({ userId, session: expectedSession });
    });

    it('return the saved session in JSON API', async () => {
      // given
      const jsonApiSession = {
        data: {
          type: 'sessions',
          id: 12,
          attributes: {}
        }
      };
      const savedSession = new Session({
        id: '12',
        certificationCenter: 'Université de dressage de loutres'
      });

      sessionService.save.resolves(savedSession);
      sessionSerializer.serialize.returns(jsonApiSession);

      // when
      const response = await sessionController.save(request, hFake);

      // then
      expect(response).to.deep.equal(jsonApiSession);
      expect(sessionSerializer.serialize).to.have.been.calledWith(savedSession);
    });

    context('when an error is raised', () => {

      const error = new Error('Failure');

      beforeEach(() => {
        sessionService.save.rejects(error);
      });

      it('should return a 500 internal error and log the error', async () => {
        // when
        const promise = sessionController.save(request, hFake);

        // then
        await expect(promise).to.be.rejected
          .and.eventually.to.include.nested({
            message: 'Failure',
            'output.statusCode': 500
          });
        expect(logger.error).to.have.been.calledWith(error);
      });

    });

  });

  describe('#get', function() {

    beforeEach(() => {
      sinon.stub(sessionService, 'get');
      sinon.stub(sessionSerializer, 'serialize');
      request = {
        params: {
          id: 'sessionId'
        }
      };
    });

    context('when session exists', () => {

      it('should get session informations with certifications associated', async function() {
        // given
        sessionService.get.resolves();

        // when
        await sessionController.get(request, hFake);

        // then
        expect(sessionService.get).to.have.been.calledWith('sessionId');
      });

      it('should serialize session informations', async function() {
        // given
        const certification = CertificationCourse.fromAttributes({ id: 'certifId', sessionId: 'sessionId' });
        const session = new Session({
          id: 'sessionId',
          certifications: [certification]
        });
        sessionService.get.resolves(session);

        // when
        await sessionController.get(request, hFake);

        // then
        expect(sessionSerializer.serialize).to.have.been.calledWith(session);
      });

      it('should reply serialized session informations', async function() {
        // given
        const serializedSession = {
          data: {
            type: 'sessions',
            id: 'id',
          }
        };
        sessionSerializer.serialize.resolves(serializedSession);
        sessionService.get.resolves();

        // when
        const response = await sessionController.get(request, hFake);

        // then
        expect(response).to.deep.equal(serializedSession);
      });

    });

    context('when session does not exist', () => {

      it('should reply with Not Found Error', async function() {
        // given
        const notFoundError = new NotFoundError();
        sessionService.get.rejects(notFoundError);

        // when
        const promise = sessionController.get(request, hFake);

        // then
        await expect(promise).to.be.rejected
          .and.eventually.to.include.nested({
            'output.statusCode': 404,
          });
      });

    });
  });
});
