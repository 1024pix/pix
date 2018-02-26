const { expect, sinon } = require('../../../test-helper');
const Organization = require('../../../../lib/domain/models/Organization');
const Competence = require('../../../../lib/domain/models/Competence');
const { NotFoundError } = require('../../../../lib/domain/errors');

const organizationService = require('../../../../lib/domain/services/organization-service');

describe('Unit | Service | OrganizationService', () => {

  describe('#generateOrganizationCode', () => {

    it('should exist', () => {
      expect(organizationService.generateOrganizationCode).to.exist.and.to.be.a('function');
    });

    it('should generate a code', () => {
      // When
      const code = organizationService.generateOrganizationCode();

      // Then
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
});
