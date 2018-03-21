const { expect, sinon } = require('../../../test-helper');
const Organization = require('../../../../lib/domain/models/Organization');
const Competence = require('../../../../lib/domain/models/Competence');
const { NotFoundError } = require('../../../../lib/domain/errors');

const organizationService = require('../../../../lib/domain/services/organization-service');
const organisationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');

describe('Unit | Service | OrganizationService', () => {

  describe('#generateOrganizationCode', () => {

    it('should exist', () => {
      expect(organizationService.generateOrganizationCode).to.exist.and.to.be.a('function');
    });

    it('should generate a code', () => {
      // when
      const code = organizationService.generateOrganizationCode();

      // then
      expect(code).to.match(/[A-Z]{4}\d{2}/);
    });
  });

  describe('#getOrganizationSharedProfilesAsCsv', () => {

    const organization = new Organization({ id: 123, type: 'PRO' });
    const competences = [
      new Competence({ id: 2, index: '1.1', name: 'Mener une recherche et une veille d’information' }),
      new Competence({ id: 3, index: '1.2', name: 'Gérer des données' }),
      new Competence({ id: 4, index: '1.3', name: 'Traiter des données' }),
    ];

    let dependencies;

    beforeEach(() => {
      // given
      dependencies = {
        organizationRepository: { get: sinon.stub().resolves(organization) },
        competenceRepository: { find: sinon.stub().resolves(competences) },
        snapshotRepository: { getSnapshotsByOrganizationId: sinon.stub().resolves([]) },
        bookshelfUtils: { mergeModelWithRelationship: sinon.stub().resolves([]) },
        snapshotsCsvConverter: { convertJsonToCsv: sinon.stub().returns() }
      };
    });

    context('[interactions]', () => {

      it('should fetch the organization', () => {
        // when
        const promise = organizationService.getOrganizationSharedProfilesAsCsv(dependencies, 123);

        // then
        return promise.then(() => {
          expect(dependencies.organizationRepository.get).to.have.been.calledWith(organization.id);
        });
      });

      it('should fetch the competences', () => {
        // when
        const promise = organizationService.getOrganizationSharedProfilesAsCsv(dependencies, 123);

        // then
        return promise.then(() => {
          expect(dependencies.competenceRepository.find).to.have.been.called;
        });
      });

      it('should fetch the shared profiles to the organization', () => {
        // when
        const promise = organizationService.getOrganizationSharedProfilesAsCsv(dependencies, 123);

        // then
        return promise.then(() => {
          expect(dependencies.snapshotRepository.getSnapshotsByOrganizationId).to.have.been.calledWith(123);
        });
      });

      it('should load the user of each shared profiles', () => {
        // when
        const promise = organizationService.getOrganizationSharedProfilesAsCsv(dependencies, 123);

        // then
        return promise.then(() => {
          expect(dependencies.bookshelfUtils.mergeModelWithRelationship).to.have.been.calledWith([], 'user');
        });
      });

      it('should convert the profiles into CSV format', () => {
        // when
        const promise = organizationService.getOrganizationSharedProfilesAsCsv(dependencies, 123);

        // then
        return promise.then(() => {
          expect(dependencies.snapshotsCsvConverter.convertJsonToCsv).to.have.been.calledWith(organization, competences, []);
        });
      });
    });

    context('[errors]', () => {

      it('should reject with a "NotFoundError" instance, when organization ID is unknown', () => {
        // given
        dependencies.organizationRepository.get = sinon.stub().rejects(new NotFoundError('Not found organization for ID 1234'));

        //when
        const promise = organizationService.getOrganizationSharedProfilesAsCsv(dependencies, 123);

        // then
        return promise.then(() => {
          expect.fail('Treatment did not throw an error as expected', 'Expected a "NotFoundError" to have been throwed');
        }).catch(err => {
          expect(err).to.be.an.instanceof(NotFoundError);
        });
      });
    });
  });

  describe('#search', () => {

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an empty list of organizations if no code given in filters', () => {
      // given
      const filters = { param1: 'param1' };

      // when
      const promise = organizationService.search(filters);

      // then
      return promise.then((organization) => {
        expect(organization).to.be.an('array').that.is.empty;
      });
    });

    it('should return an empty list of organizations if a code is given but is empty', () => {
      // given
      const filters = { code: ' ' };

      // when
      const promise = organizationService.search(filters);

      // then
      return promise.then((organization) => {
        expect(organization).to.be.an('array').that.is.empty;
      });
    });

    it('should return the organization found for the given filters, without the email', () => {
      // given
      const filters = { code: 'OE34RND', type: 'SCO' };
      const organizationWithEmail = [new Organization({ type: 'SCO', name: 'Lycée des Tuileries', code: 'OE34RND', email: 'tuileries@sco.com' })];
      const expectedReturnedOrganizationWithoutEmail = [new Organization({ type: 'SCO', name: 'Lycée des Tuileries', code: 'OE34RND' })];

      sandbox.stub(organisationRepository, 'findBy').withArgs(filters).resolves(organizationWithEmail);

      // when
      const promise = organizationService.search(filters);

      // then
      return promise.then((organization) => {
        expect(organization).to.deep.equal(expectedReturnedOrganizationWithoutEmail);
      });
    });

  });

});
