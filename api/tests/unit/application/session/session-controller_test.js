const Boom = require('boom');
const { expect, sinon } = require('../../../test-helper');
const logger = require('../../../../lib/infrastructure/logger');

const sessionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/session-serializer');
const sessionController = require('../../../../lib/application/sessions/session-controller');
const sessionService = require('../../../../lib/domain/services/session-service');
const Session = require('../../../../lib/domain/models/Session');
const { NotFoundError } = require('../../../../lib/domain/errors');

const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');

describe('Unit | Controller | sessionController', () => {

  let sandbox;
  let codeStub;
  let request;
  let replyStub;
  let expectedSession;

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

      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({ code: codeStub });

      sandbox = sinon.createSandbox();
      sandbox.stub(sessionService, 'save').resolves();
      sandbox.stub(Boom, 'badImplementation');
      sandbox.stub(logger, 'error');
      sandbox.stub(sessionSerializer, 'deserialize').resolves(expectedSession);
      sandbox.stub(sessionSerializer, 'serialize');

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
        }
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should save the session', () => {
      // when
      const promise = sessionController.save(request, replyStub);

      // then
      return promise.then(() => {
        expect(sessionService.save).to.have.been.calledWith(expectedSession);
      });
    });

    it('return the saved session in JSON API', () => {

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
      const promise = sessionController.save(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.calledWith(jsonApiSession);
        expect(sessionSerializer.serialize).to.have.been.calledWith(savedSession);
      });
    });

    context('when an error is raised', () => {

      const error = new Error();
      const wellFormedError = { message: 'Internal Error' };

      beforeEach(() => {

        sessionService.save.rejects(error);
        Boom.badImplementation.returns(wellFormedError);
      });

      it('should format an internal error from the error', () => {
        // when
        const promise = sessionController.save(request, replyStub);

        // then
        return promise.then(() => {
          expect(Boom.badImplementation).to.have.been.calledWith(error);
        });
      });

      it('should return a 500 internal error', () => {
        // when
        const promise = sessionController.save(request, replyStub);

        // then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledWith(wellFormedError);
        });
      });

      it('should log the error', () => {
        // when
        const promise = sessionController.save(request, replyStub);

        // then
        return promise.then(() => {
          expect(logger.error).to.have.been.calledWith(error);
        });
      });

    });

  });

  describe('#get', function() {

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(sessionService, 'get');
      sandbox.stub(sessionSerializer, 'serialize');
      request = {
        params: {
          id: 'sessionId'
        }
      };
      replyStub = sinon.stub().returns({ code: codeStub });
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('when session exists', () => {

      it('should get session informations with certifications associated', function() {
        // given
        sessionService.get.resolves();

        // when
        const promise = sessionController.get(request, replyStub);

        // then
        return promise.then(() => {
          expect(sessionService.get).to.have.been.calledWith('sessionId');
        });
      });

      it('should serialize session informations', function() {
        // given
        const certification = CertificationCourse.fromAttributes({ id: 'certifId', sessionId: 'sessionId' });
        const session = new Session({
          id: 'sessionId',
          certifications: [certification]
        });
        sessionService.get.resolves(session);

        // when
        const promise = sessionController.get(request, replyStub);

        // then
        return promise.then(() => {
          expect(sessionSerializer.serialize).to.have.been.calledWith(session);
        });
      });

      it('should reply serialized session informations', function() {
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
        const promise = sessionController.get(request, replyStub);

        // then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledWith(serializedSession);
        });
      });

    });

    context('when session does not exist', () => {

      it('should reply with Not Found Error', function() {
        // given
        const notFoundError = new NotFoundError();
        const wellFormedError = { message: 'Not Found Error' };
        sessionService.get.rejects(notFoundError);
        sandbox.stub(Boom, 'notFound').returns(wellFormedError);
        sandbox.stub(logger, 'error').returns();

        // when
        const promise = sessionController.get(request, replyStub);

        // then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledWith(wellFormedError);
          expect(Boom.notFound).to.have.been.calledWith(notFoundError);
        });

      });

    });
  });
});
