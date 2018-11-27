const { expect, sinon, domainBuilder } = require('../../../test-helper');
const Competence = require('../../../../lib/domain/models/Competence');
const Organization = require('../../../../lib/domain/models/Organization');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const { NotFoundError } = require('../../../../lib/domain/errors');

const organizationService = require('../../../../lib/domain/services/organization-service');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | Service | OrganizationService', () => {

  describe('#generateUniqueOrganizationCode', () => {

    it('should exist', () => {
      expect(organizationService.generateUniqueOrganizationCode).to.exist.and.to.be.a('function');
    });

    it('should generate a random code with 4 letters and 2 numbers', () => {
      // given
      const organizationRepository = { isCodeAvailable: sinon.stub() };
      organizationRepository.isCodeAvailable.resolves(true);

      // when
      const promise = organizationService.generateUniqueOrganizationCode({ organizationRepository });

      // then
      return promise.then((code) => {
        expect(code).to.match(/[A-Z]{4}\d{2}/);
      });
    });

    it('should re-generate a code if the first ones already exist', () => {
      // given
      const organizationRepository = { isCodeAvailable: sinon.stub() };
      organizationRepository.isCodeAvailable
        .onFirstCall().rejects()
        .onSecondCall().resolves(true);

      // when
      const promise = organizationService.generateUniqueOrganizationCode({ organizationRepository });

      // then
      return promise.then(() => {
        expect(organizationRepository.isCodeAvailable).to.have.been.calledTwice;
      });
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
        competenceRepository: { list: sinon.stub().resolves(competences) },
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
          expect(dependencies.competenceRepository.list).to.have.been.called;
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
        }).catch((err) => {
          expect(err).to.be.an.instanceof(NotFoundError);
        });
      });
    });
  });

  describe('#search', () => {

    let sandbox;
    const userId = 1234;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(userRepository, 'hasRolePixMaster');
      sandbox.stub(organizationRepository, 'findBy');
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('when user has role PIX_MASTER', () => {

      beforeEach(() => {
        userRepository.hasRolePixMaster.resolves(true);
      });

      it('should return all the existing organizations', () => {
        // given
        const filters = {};
        const organizations = [
          new Organization({ name: 'organization_1', type: 'PRO', code: 'ORGA1' }),
          new Organization({ name: 'organization_2', type: 'SCO', code: 'ORGA2' }),
          new Organization({ name: 'organization_3', type: 'SUP', code: 'ORGA3' }),
        ];
        organizationRepository.findBy.withArgs(filters).resolves(organizations);

        // when
        const promise = organizationService.search(userId, filters);

        // then
        return promise.then((organizations) => {
          expect(organizations).to.be.an('array');
          expect(organizations).to.have.lengthOf(3);
        });
      });

    });

    context('when user does not have role PIX_MASTER', () => {

      beforeEach(() => {
        userRepository.hasRolePixMaster.resolves(false);
      });

      it('should return an empty list of organizations if no code given in filters', () => {
        // given
        const filters = { param1: 'param1' };

        // when
        const promise = organizationService.search(userId, filters);

        // then
        return promise.then((organization) => {
          expect(organization).to.be.an('array').that.is.empty;
        });
      });

      it('should return an empty list of organizations if a code is given but is empty', () => {
        // given
        const filters = { code: ' ' };

        // when
        const promise = organizationService.search(userId, filters);

        // then
        return promise.then((organization) => {
          expect(organization).to.be.an('array').that.is.empty;
        });
      });

      it('should return the organization found for the given filters, without the email', () => {
        // given
        const filters = { code: 'OE34RND', type: 'SCO' };
        const organizationWithEmail = [new Organization({
          type: 'SCO',
          name: 'Lycée des Tuileries',
          code: 'OE34RND',
          email: 'tuileries@sco.com'
        })];
        const expectedReturnedOrganizationWithoutEmail = [new Organization({
          type: 'SCO',
          name: 'Lycée des Tuileries',
          code: 'OE34RND'
        })];

        organizationRepository.findBy.withArgs(filters).resolves(organizationWithEmail);

        // when
        const promise = organizationService.search(userId, filters);

        // then
        return promise.then((organization) => {
          expect(organization).to.deep.equal(expectedReturnedOrganizationWithoutEmail);
        });
      });
    });
  });

  describe('#findAllTargetProfilesAvailableForOrganization', () => {

    let sandbox;
    let organizationId;
    let targetProfilesOwnedByOrganization;
    let targetProfileSharesWithOrganization;
    let publicTargetProfiles;

    beforeEach(() => {
      organizationId = 1;
      targetProfilesOwnedByOrganization = [domainBuilder.buildTargetProfile({ organizationId, isPublic: false })];
      targetProfileSharesWithOrganization = domainBuilder.buildTargetProfile({ isPublic: false });
      publicTargetProfiles = [domainBuilder.buildTargetProfile({ isPublic: true })];
      const targetProfileShares = [{
        targetProfile: targetProfileSharesWithOrganization
      }];
      const organization = domainBuilder.buildOrganization({ id: organizationId, targetProfileShares });

      sandbox = sinon.sandbox.create();
      sandbox.stub(targetProfileRepository, 'findPublicTargetProfiles').resolves(publicTargetProfiles);
      sandbox.stub(targetProfileRepository, 'findTargetProfilesOwnedByOrganizationId').resolves(targetProfilesOwnedByOrganization);
      sandbox.stub(organizationRepository, 'get').resolves(organization);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of target profiles', () => {
      // when
      const promise = organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      return promise.then((availableTargetProfiles) => {
        expect(availableTargetProfiles).to.be.an('array');
        expect(availableTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
      });
    });

    it('should return public profiles and profiles owned by or shared with anyOrganization', () => {
      // when
      const promise = organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      return promise.then((availableTargetProfiles) => {
        expect(availableTargetProfiles.length).to.equal(3);
        expect(availableTargetProfiles).to.include.deep.members(targetProfilesOwnedByOrganization);
        expect(availableTargetProfiles).to.include(targetProfileSharesWithOrganization);
        expect(availableTargetProfiles).to.include.deep.members(publicTargetProfiles);
      });
    });

    it('should not have duplicate in targetProfiles', () => {
      // given
      targetProfileRepository.findPublicTargetProfiles.resolves(targetProfilesOwnedByOrganization);

      // when
      const promise = organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      return promise.then((availableTargetProfiles) => {
        expect(availableTargetProfiles.length).to.equal(2);
      });
    });

    it('should return a list ordered by private profile before public profile and alphabetically', () => {
      // given
      targetProfilesOwnedByOrganization = [
        domainBuilder.buildTargetProfile({ name: 'C owned profile', organizationId, isPublic: false }),
        domainBuilder.buildTargetProfile({ name: 'A owned profile', organizationId, isPublic: false })
      ];
      targetProfileSharesWithOrganization = domainBuilder.buildTargetProfile({ name: 'B shared profile', isPublic: false });
      publicTargetProfiles = [
        domainBuilder.buildTargetProfile({ name: 'B Public profile', isPublic: true }),
        domainBuilder.buildTargetProfile({ name: 'A Public profile', isPublic: true })
      ];
      const targetProfileShares = [{
        targetProfile: targetProfileSharesWithOrganization
      }];
      const organization = domainBuilder.buildOrganization({ id: organizationId, targetProfileShares });

      targetProfileRepository.findPublicTargetProfiles.resolves(publicTargetProfiles);
      targetProfileRepository.findTargetProfilesOwnedByOrganizationId.resolves(targetProfilesOwnedByOrganization);
      organizationRepository.get.resolves(organization);
      // when
      const promise = organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      return promise.then((availableTargetProfiles) => {
        expect(availableTargetProfiles.length).to.equal(5);
        expect(availableTargetProfiles[0].name).equal('A owned profile');
        expect(availableTargetProfiles[1].name).equal('B shared profile');
        expect(availableTargetProfiles[2].name).equal('C owned profile');
        expect(availableTargetProfiles[3].name).equal('A Public profile');
        expect(availableTargetProfiles[4].name).equal('B Public profile');

      });
    });
  });
});
