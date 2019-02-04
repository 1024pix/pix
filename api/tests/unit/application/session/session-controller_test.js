const { expect, sinon, hFake } = require('../../../test-helper');

const sessionController = require('../../../../lib/application/sessions/session-controller');

const usecases = require('../../../../lib/domain/usecases');
const Session = require('../../../../lib/domain/models/Session');
const sessionService = require('../../../../lib/domain/services/session-service');
const { NotFoundError, EntityValidationError, UserNotAuthorizedToUpdateRessourceError } = require('../../../../lib/domain/errors');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');

const sessionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/session-serializer');
const logger = require('../../../../lib/infrastructure/logger');

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

      sinon.stub(usecases, 'createSession').resolves();
      sinon.stub(logger, 'error');
      sinon.stub(sessionSerializer, 'deserialize').returns(expectedSession);
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
      expect(usecases.createSession).to.have.been.calledWith({ userId, session: expectedSession });
    });

    it('should return the saved session in JSON API', async () => {
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

      usecases.createSession.resolves(savedSession);
      sessionSerializer.serialize.returns(jsonApiSession);

      // when
      const response = await sessionController.save(request, hFake);

      // then
      expect(response).to.deep.equal(jsonApiSession);
      expect(sessionSerializer.serialize).to.have.been.calledWith(savedSession);
    });

    it('should return a 422 error if the session is not valid', async () => {
      // given
      const sessionValidationError = new EntityValidationError({
        invalidAttributes: [
          {
            attribute: 'address',
            message: 'L’adresse n’est pas renseigné.',
          }
        ]
      });
      usecases.createSession.rejects(sessionValidationError);

      const jsonApiValidationErrors = {
        errors: [
          {
            status: '422',
            source: { 'pointer': '/data/attributes/address' },
            title: 'Invalid data attribute "address"',
            detail: 'L’adresse n’est pas renseigné.'
          }
        ]
      };

      // when
      const response = await sessionController.save(request, hFake);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.source).to.deep.equal(jsonApiValidationErrors);
    });

    context('when an error is raised', () => {

      const error = new Error('Failure');

      beforeEach(() => {
        usecases.createSession.rejects(error);
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

  describe('#update ', () => {
    let request, updatedSession, updateSessionArgs;

    beforeEach(() => {
      request = {
        auth: { credentials: { userId: 1 } },
        params: { id : 1 },
        payload: {}
      };

      updatedSession = {
        id: request.params.id,
      };

      updateSessionArgs = {
        userId: request.auth.credentials.userId,
        session: updatedSession,
      };

      sinon.stub(usecases, 'updateSession');
      sinon.stub(sessionSerializer, 'deserialize');
      sinon.stub(sessionSerializer, 'serialize');
      sessionSerializer.deserialize.withArgs(request.payload).returns({});
    });

    it('should returns the updated session', async () => {
      // given
      usecases.updateSession.withArgs(updateSessionArgs).resolves(updatedSession);
      sessionSerializer.serialize.withArgs(updatedSession).returns(updatedSession);

      // when
      const response = await sessionController.update(request, hFake);

      // then
      expect(response.source).to.deep.equal(updatedSession);
      expect(response.statusCode).to.equal(200);
    });

    it('should throw an error when the session could not be updated', async () => {
      // given
      usecases.updateSession.withArgs(updateSessionArgs).rejects();

      // when
      const response = await sessionController.update(request, hFake);

      // then
      expect(response.statusCode).to.equal(500);
    });

    it('should throw an infra NotFoundError when a NotFoundError is catched', async () => {
      // given
      usecases.updateSession.withArgs(updateSessionArgs).rejects(new NotFoundError());

      // when
      const response = await sessionController.update(request, hFake);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should throw a forbiddenError when user is not authorized to update the session', async () => {
      // given
      usecases.updateSession.withArgs(updateSessionArgs).rejects(new UserNotAuthorizedToUpdateRessourceError());

      // when
      const response = await sessionController.update(request, hFake);

      // then
      expect(response.statusCode).to.equal(403);
    });

  });
});
