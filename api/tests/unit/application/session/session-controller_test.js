const Boom = require('boom');
const { describe, it, expect, sinon, beforeEach, afterEach } = require('../../../test-helper');
const logger = require('../../../../lib/infrastructure/logger');

const sessionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/session-serializer');
const sessionController = require('../../../../lib/application/sessions/session-controller');
const Session = require('../../../../lib/domain/models/Session');

const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');

describe('Unit | Controller | sessionController', () => {

  let sandbox;
  let codeStub;
  let request;
  let replyStub;

  describe('#create', () => {

    beforeEach(() => {
      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({ code: codeStub });

      sandbox = sinon.sandbox.create();
      sandbox.stub(sessionRepository, 'save').resolves();
      sandbox.stub(Boom, 'badImplementation');
      sandbox.stub(logger, 'error');
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
              description: ''
            }
          }
        }
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should save the session', () => {
      // Given
      const expectedSession = new Session({
        certificationCenter: 'Université de dressage de loutres',
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '08/12/2017',
        time: '14:30',
        description: ''
      });

      // When
      const promise = sessionController.save(request, replyStub);

      // Then
      return promise.then(() => {
        expect(sessionRepository.save).to.have.been.calledWith(expectedSession);
      });
    });

    it('return the saved session in JSON API', () => {
      // Given
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

      sessionRepository.save.resolves(savedSession);
      sessionSerializer.serialize.returns(jsonApiSession);

      // When
      const promise = sessionController.save(request, replyStub);

      // Then
      return promise.then(() => {
        expect(replyStub).to.have.been.calledWith(jsonApiSession);
        expect(sessionSerializer.serialize).to.have.been.calledWith(savedSession);
      });
    });

    context('when an error is raised', () => {

      const error = new Error();
      const wellFormedError = { message: 'Internal Error' };

      beforeEach(() => {
        sessionRepository.save.rejects(error);
        Boom.badImplementation.returns(wellFormedError);
      });

      it('should format an internal error from the error', () => {
        // When
        const promise = sessionController.save(request, replyStub);

        // Then
        return promise.then(() => {
          expect(Boom.badImplementation).to.have.been.calledWith(error);
        });
      });

      it('should return a 500 internal error', () => {
        // When
        const promise = sessionController.save(request, replyStub);

        // Then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledWith(wellFormedError);
        });
      });

      it('should log the error', () => {
        // When
        const promise = sessionController.save(request, replyStub);

        // Then
        return promise.then(() => {
          expect(logger.error).to.have.been.calledWith(error);
        });
      });

    });

  });
});
