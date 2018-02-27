const { expect, sinon } = require('../../../test-helper');

const User = require('../../../../lib/domain/models/User');
const BookshelfOrganisation = require('../../../../lib/infrastructure/data/organization');
const BookshelfSnapshot = require('../../../../lib/infrastructure/data/snapshot');

const organizationController = require('../../../../lib/application/organizations/organization-controller');

const organisationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const snapshotRepository = require('../../../../lib/infrastructure/repositories/snapshot-repository');

const organizationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-serializer');
const organizationService = require('../../../../lib/domain/services/organization-service');
const snapshotSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/snapshot-serializer');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');

const bookshelfUtils = require('../../../../lib/infrastructure/utils/bookshelf-utils');
const { NotFoundError } = require('../../../../lib/domain/errors');

const logger = require('../../../../lib/infrastructure/logger');
const { AlreadyRegisteredEmailError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | organizationController', () => {

  let sandbox;
  let codeStub;
  let request;
  let replyStub;

  describe('#create', () => {

    const organization = new BookshelfOrganisation({ email: 'existing-email@example.net', type: 'PRO' });
    const userSaved = new User({ email: 'existing-email@example.net', id: 12 });

    beforeEach(() => {
      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({ code: codeStub });

      sandbox = sinon.sandbox.create();

      sandbox.stub(logger, 'error');
      sandbox.stub(userRepository, 'save').resolves(userSaved);
      sandbox.stub(userRepository, 'isEmailAvailable');
      sandbox.stub(organizationService, 'generateOrganizationCode').returns('ABCD12');
      sandbox.stub(organisationRepository, 'saveFromModel').resolves(organization);
      sandbox.stub(organisationRepository, 'isCodeAvailable').resolves();
      sandbox.spy(organizationSerializer, 'deserialize');
      sandbox.stub(organizationSerializer, 'serialize');

      request = {
        payload: {
          data: {
            attributes: {
              type: 'PRO',
              email: 'existing-email@example.net',
              'first-name': 'Tom',
              'last-name': 'Hanks',
              password: 'Pix2048#-DamnItEvolved'
            }
          }
        }
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should provide get method', () => {
      expect(organizationController.create).to.exist;
    });

    context('when the email is available', () => {

      beforeEach(() => {
        userRepository.isEmailAvailable.resolves();
        userRepository.save.resolves(userSaved);
      });

      it('should try to register a new user', () => {
        // When
        const promise = organizationController.create(request, replyStub);

        // Then
        return promise.then(() => {
          expect(userRepository.save).to.have.been.calledWithMatch({
            email: 'existing-email@example.net',
            firstName: 'Tom',
            lastName: 'Hanks',
            cgu: true,
            password: 'Pix2048#-DamnItEvolved'
          });
        });
      });

      it('should register the new user using a normalized email', () => {
        // given
        request.payload.data.attributes.email = 'MY-EMAIL-WITH-CAPSLOCK@EXAMPLE.NET';

        // When
        const promise = organizationController.create(request, replyStub);

        // Then
        return promise.then(() => {
          expect(userRepository.save).to.have.been.calledWithMatch({
            email: 'my-email-with-capslock@example.net'
          });
        });
      });

      context('when the user account has been created', () => {
        it('should deserialize an organization', () => {
          // When
          const promise = organizationController.create(request, replyStub);

          // Then
          return promise.then(() => {
            sinon.assert.calledOnce(organizationSerializer.deserialize);
          });
        });

        it('should persist the organisation with the userID', () => {
          // When
          const promise = organizationController.create(request, replyStub);

          // Then
          return promise.then(() => {
            sinon.assert.calledOnce(organisationRepository.saveFromModel);

            const callArguments = organisationRepository.saveFromModel.firstCall.args[0];
            expect(callArguments.get('userId')).to.equal(12);
          });
        });

        it('should serialize the response', () => {
          // Given
          const serializedOrganization = { message: 'serialized organization' };
          organizationSerializer.serialize.returns(serializedOrganization);

          // When
          const promise = organizationController.create(request, replyStub);

          // Then
          return promise.then(() => {
            expect(organizationSerializer.serialize).to.have.been.calledWith(organization);
            expect(replyStub).to.have.been.calledWith(serializedOrganization);
          });
        });

        context('generating a code for the organization', () => {
          it('should generate a code', () => {
            // When
            const promise = organizationController.create(request, replyStub);

            // Then
            return promise.then(() => {
              sinon.assert.calledOnce(organizationService.generateOrganizationCode);
            });
          });

          it('should verify if the code is unique', () => {
            // Then
            const promise = organizationController.create(request, replyStub);

            // When
            return promise.then(() => {
              sinon.assert.calledWith(organisationRepository.isCodeAvailable, 'ABCD12');
            });
          });

          it('should generate a code as many times as necessary to find a unique one', () => {
            // Given
            organizationService.generateOrganizationCode.onFirstCall().returns('CODE01');
            organizationService.generateOrganizationCode.onSecondCall().returns('CODE02');
            organizationService.generateOrganizationCode.onThirdCall().returns('CODE03');

            organisationRepository.isCodeAvailable.withArgs('CODE01').rejects();
            organisationRepository.isCodeAvailable.withArgs('CODE02').rejects();
            organisationRepository.isCodeAvailable.withArgs('CODE03').resolves('CODE03');

            // Then
            const promise = organizationController.create(request, replyStub);

            // When
            return promise.then(() => {
              sinon.assert.calledThrice(organisationRepository.isCodeAvailable);
            });
          });

          it('should persist the organization with its code', () => {
            // Given
            const code = 'CODE01';
            organizationService.generateOrganizationCode.resolves(code);
            organisationRepository.isCodeAvailable.resolves(code);

            // Then
            const promise = organizationController.create(request, replyStub);

            // When
            return promise.then(() => {
              const callArguments = organisationRepository.saveFromModel.firstCall.args[0];
              expect(callArguments.get('code')).to.equal(code);
            });
          });

        });

        context('when the organization payload is invalid', () => {
          it('should reply 400', () => {
            // When
            const promise = organizationController.create(request, replyStub);

            // Then
            return promise.catch(() => {
              sinon.assert.calledWith(replyStub, {
                'errors': [
                  {
                    'detail': 'L\'adresse existing-email@example.net est déjà associée à un utilisateur.',
                    'meta': {
                      'field': 'email'
                    },
                    'source': {
                      'pointer': '/data/attributes/email'
                    },
                    'status': '400',
                    'title': 'Invalid Attribute'
                  }
                ]
              });
            });
          });
        });
      });
    });

    describe('when unable to create an account', () => {
      beforeEach(() => {
        userRepository.isEmailAvailable.rejects(new AlreadyRegisteredEmailError());
      });

      it('should reply 400', () => {
        // When
        const promise = organizationController.create(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(codeStub, 400);
          sinon.assert.calledWith(replyStub, {
            'errors': [
              {
                'detail': 'L\'adresse existing-email@example.net est déjà associée à un utilisateur.',
                'meta': {
                  'field': 'email'
                },
                'source': {
                  'pointer': '/data/attributes/email'
                },
                'status': '400',
                'title': 'Invalid Attribute'
              }
            ]
          });
        });
      });
    });

    describe('when unable to save something in the database', () => {
      it('should return 500', () => {
        // Given
        const error = new Error();
        userRepository.isEmailAvailable.rejects(error);

        // When
        const promise = organizationController.create(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(codeStub, 500);
          sinon.assert.calledOnce(replyStub);
        });
      });

      it('should log any error', () => {
        // Given
        const error = new Error();
        userRepository.isEmailAvailable.rejects(error);

        // When
        const promise = organizationController.create(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(logger.error, error);
        });
      });

    });
  });

  describe('#search', () => {

    let sandbox;
    let replyStub;
    let codeStub;
    const arrayOfSerializedOrganization = [{}, {}];
    const arrayOfOrganizations = [new BookshelfOrganisation(), new BookshelfOrganisation()];

    beforeEach(() => {
      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({ code: codeStub });
      sandbox = sinon.sandbox.create();

      sandbox.stub(logger, 'error');
      sandbox.stub(organisationRepository, 'findBy').resolves(arrayOfOrganizations);
      sandbox.stub(organizationSerializer, 'serialize').returns(arrayOfSerializedOrganization);
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('when no filters are given', () => {
      it('should return an array', () => {
        // when
        const promise = organizationController.search({}, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(replyStub, arrayOfSerializedOrganization);
        });
      });
    });

    describe('when filters are given', () => {
      it('should retrieve organizations with one filter', () => {
        // when
        const promise = organizationController.search({ query: { 'filter[query]': 'my search' } }, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(organisationRepository.findBy, { query: 'my search' });
        });
      });

      it('should retrieve organizations with two different filters', () => {
        // when
        const promise = organizationController.search({
          query: {
            'filter[first]': 'my search',
            'filter[second]': 'with params'
          }
        }, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(organisationRepository.findBy, { first: 'my search', second: 'with params' });
        });
      });

      it('should log when there is an error', () => {
        // given
        const error = new Error('');
        organisationRepository.findBy.rejects(error);

        // when
        const promise = organizationController.search({ query: { 'filter[first]': 'with params' } }, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(logger.error, error);
        });
      });

      it('should reply 500 while getting data is on error', () => {
        // given
        const error = new Error('');
        organisationRepository.findBy.rejects(error);

        // when
        const promise = organizationController.search({ query: { 'filter[first]': 'with params' } }, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.callOrder(organisationRepository.findBy, replyStub);
          sinon.assert.calledWith(codeStub, 500);
        });
      });

      it('should serialize results', () => {
        // when
        const promise = organizationController.search({ query: { 'filter[first]': 'with params' } }, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(organizationSerializer.serialize, arrayOfOrganizations);
          sinon.assert.calledWith(replyStub, arrayOfSerializedOrganization);
        });
      });

    });

  });

  describe('#getSharedProfiles', () => {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(logger, 'error');
      sandbox.stub(snapshotRepository, 'getSnapshotsByOrganizationId');
      sandbox.stub(snapshotSerializer, 'serialize');
      sandbox.stub(validationErrorSerializer, 'serialize');
      sandbox.stub(bookshelfUtils, 'mergeModelWithRelationship');
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('Collaborations', () => {
      it('should be an existing function', () => {
        // then
        expect(organizationController.getSharedProfiles).to.be.a('function');
      });

      it('should call snapshot repository', () => {
        // given
        snapshotRepository.getSnapshotsByOrganizationId.resolves();
        const request = {
          params: {
            id: 7
          }
        };
        const reply = sinon.stub().returns({
          code: () => {
          }
        });
        // when
        const promise = organizationController.getSharedProfiles(request, reply);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(snapshotRepository.getSnapshotsByOrganizationId);
          sinon.assert.calledWith(snapshotRepository.getSnapshotsByOrganizationId, 7);
        });
      });

      it('should call snapshot serializer', () => {
        // given
        const snapshots = [{
          toJSON: () => {
            return {};
          }
        }];
        snapshotRepository.getSnapshotsByOrganizationId.resolves({});
        bookshelfUtils.mergeModelWithRelationship.resolves(snapshots);
        const request = {
          params: {
            id: 7
          }
        };
        const reply = sinon.stub().returns({
          code: () => {
          }
        });

        // when
        const promise = organizationController.getSharedProfiles(request, reply);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(snapshotSerializer.serialize);
          sinon.assert.calledWith(snapshotSerializer.serialize, [{}]);
        });
      });

      it('should call a reply function', () => {
        // then
        const snapshots = [];
        const serializedSnapshots = { data: [] };
        snapshotRepository.getSnapshotsByOrganizationId.resolves(snapshots);
        snapshotSerializer.serialize.resolves(serializedSnapshots);
        const request = {
          params: {
            id: 7
          }
        };

        const reply = sinon.stub().returns({
          code: () => {
          }
        });

        // when
        const promise = organizationController.getSharedProfiles(request, reply);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(reply);
        });
      });

    });

    describe('Error cases', () => {

      it('should return an serialized NotFoundError, when no snapshot was found', () => {
        // given
        const error = BookshelfSnapshot.NotFoundError;
        snapshotRepository.getSnapshotsByOrganizationId.rejects(error);
        const serializedError = { errors: [] };
        validationErrorSerializer.serialize.returns(serializedError);
        const request = {
          params: {
            id: 156778
          }
        };
        const replyStub = sinon.stub().returns({
          code: () => {
          }
        });

        // when
        const promise = organizationController.getSharedProfiles(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(replyStub, serializedError);
        });
      });

      it('should log an error, when unknown error has occured', () => {
        // given
        const error = new Error();
        snapshotRepository.getSnapshotsByOrganizationId.rejects(error);
        const serializedError = { errors: [] };
        validationErrorSerializer.serialize.returns(serializedError);
        const request = {
          params: {
            id: 156778
          }
        };
        const codeStub = sinon.stub().callsFake(() => {
        });
        const replyStub = sinon.stub().returns({
          code: codeStub
        });

        // when
        const promise = organizationController.getSharedProfiles(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(replyStub, serializedError);
          sinon.assert.calledOnce(logger.error);
          sinon.assert.calledWith(codeStub, 500);
        });
      });

    });

  });

  describe('#exportSharedSnapshotsAsCsv', () => {

    beforeEach(() => {
      sinon.stub(organizationService, 'getOrganizationSharedProfilesAsCsv').resolves();
      sinon.stub(validationErrorSerializer, 'serialize');
    });

    afterEach(() => {
      organizationService.getOrganizationSharedProfilesAsCsv.restore();
      validationErrorSerializer.serialize.restore();
    });

    it('should call the use case service that exports shared profile of an organization as CSV (and reply an HTTP response)', () => {
      // given
      const request = {
        params: {
          id: 7
        }
      };
      const header = sinon.stub();
      header.returns({ header }); // <--- "inception"... I'm sure you appreciate it ;-)
      const response = { header };
      const reply = () => response;

      // when
      const promise = organizationController.exportSharedSnapshotsAsCsv(request, reply);

      // then
      return promise.then(() => {
        expect(response.header).to.have.been.calledTwice;
      });
    });

    describe('Error cases', () => {

      it('should return a JSONAPI serialized NotFoundError, when expected organization does not exist', () => {
        // given

        organizationService.getOrganizationSharedProfilesAsCsv.rejects(NotFoundError);
        const serializedError = { errors: [] };
        validationErrorSerializer.serialize.returns(serializedError);
        const request = {
          params: {
            id: 'unexisting id'
          }
        };
        const codeStub = sinon.stub().callsFake(() => {
        });
        const replyStub = sinon.stub().returns({
          code: codeStub
        });

        // when
        const promise = organizationController.exportSharedSnapshotsAsCsv(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(replyStub, serializedError);
          sinon.assert.calledWith(codeStub, 500);
        });
      });

      it('should log an error, when unknown error has occured', () => {
        // given
        const error = new NotFoundError();
        organizationService.getOrganizationSharedProfilesAsCsv.rejects(error);
        const serializedError = { errors: [] };
        validationErrorSerializer.serialize.returns(serializedError);
        const request = {
          params: {
            id: 'unexisting id'
          }
        };
        const codeStub = sinon.stub().callsFake(() => {
        });
        const replyStub = sinon.stub().returns({
          code: codeStub
        });

        // when
        const promise = organizationController.exportSharedSnapshotsAsCsv(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(replyStub, serializedError);
          sinon.assert.calledWith(codeStub, 500);
        });
      });

    });

  });
});
