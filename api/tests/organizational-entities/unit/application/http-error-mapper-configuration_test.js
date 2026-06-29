import { organizationalEntitiesDomainErrorMappingConfiguration } from '../../../../src/organizational-entities/application/http-error-mapper-configuration.js';
import {
  ArchiveOrganizationError,
  CountryNotFoundError,
  NetworkAlreadyExistError,
  ParentOrganizationNotInNetworkError,
  StructureNotFoundError,
  TagNotFoundError,
  UnableToDetachParentOrganizationFromChildOrganization,
} from '../../../../src/organizational-entities/domain/errors.js';
import { OrganizationLearnerTypeNotFound } from '../../../../src/organizational-entities/domain/errors.js';
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../../src/shared/application/errors/http-errors.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Organizational Entities | Application | HttpErrorMapperConfiguration', function () {
  context('when mapping "TagNotFoundError"', function () {
    it('returns an NotFoundError Http Error', function () {
      //given
      const httpErrorMapper = organizationalEntitiesDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === TagNotFoundError.name,
      );
      const meta = 'Test meta';

      //when
      const error = httpErrorMapper.httpErrorFn(new TagNotFoundError(meta));

      //then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Tag does not exist');
      expect(error.meta).to.equal(meta);
    });
  });

  context('when mapping "UnableToDetachParentOrganizationFromChildOrganization"', function () {
    it('should return a UnprocessableEntityError Http Error', function () {
      // given
      const httpErrorMapper = organizationalEntitiesDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === UnableToDetachParentOrganizationFromChildOrganization.name,
      );

      const meta = { organizationId: 1234 };

      // when
      const error = httpErrorMapper.httpErrorFn(new UnableToDetachParentOrganizationFromChildOrganization({ meta }));

      // then
      expect(error).to.be.instanceOf(UnprocessableEntityError);
      expect(error.message).to.equal('Unable to detach parent organization from child organization');
      expect(error.meta).to.equal(meta);
    });
  });

  context('when mapping "CountryNotFoundError"', function () {
    it('should return a Not found Http Error', function () {
      // given
      const httpErrorMapper = organizationalEntitiesDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CountryNotFoundError.name,
      );

      const meta = { countryCode: 123456 };

      // when
      const error = httpErrorMapper.httpErrorFn(new CountryNotFoundError({ meta }));

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Country not found');
      expect(error.meta).to.equal(meta);
    });
  });

  context('when mapping "OrganizationLearnerTypeNotFound"', function () {
    it('should return a UnprocessableEntityError Http Error', function () {
      // given
      const httpErrorMapper = organizationalEntitiesDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === OrganizationLearnerTypeNotFound.name,
      );

      const meta = { organizationLearnerTypeId: 123 };

      // when
      const error = httpErrorMapper.httpErrorFn(new OrganizationLearnerTypeNotFound({ meta }));

      // then
      expect(error).to.be.instanceOf(UnprocessableEntityError);
      expect(error.message).to.equal('Organization learner type does not exist');
      expect(error.meta).to.equal(meta);
    });
  });

  context('when mapping "NetworkAlreadyExistError"', function () {
    it('should return a ConflictError Http Error', function () {
      // given
      const httpErrorMapper = organizationalEntitiesDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === NetworkAlreadyExistError.name,
      );

      const meta = { organizationLearnerTypeId: 123 };

      // when
      const error = httpErrorMapper.httpErrorFn(new NetworkAlreadyExistError({ meta }));

      // then
      expect(error).to.be.instanceOf(ConflictError);
      expect(error.message).to.equal('Network already exists');
      expect(error.meta).to.equal(meta);
    });
  });

  context('when mapping "ParentOrganizationNotInNetworkError"', function () {
    it('should return an UnprocessableEntityError Http Error', function () {
      // given
      const httpErrorMapper = organizationalEntitiesDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === ParentOrganizationNotInNetworkError.name,
      );

      const meta = { parentOrganizationId: 123 };

      // when
      const error = httpErrorMapper.httpErrorFn(new ParentOrganizationNotInNetworkError({ meta }));

      // then
      expect(error).to.be.instanceOf(UnprocessableEntityError);
      expect(error.message).to.equal('Parent organization not in network');
      expect(error.meta).to.equal(meta);
    });
  });

  context('when mapping "StructureNotFoundError"', function () {
    it('should return a UnprocessableEntityError Http Error', function () {
      // given
      const httpErrorMapper = organizationalEntitiesDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === StructureNotFoundError.name,
      );

      const meta = { organizationId: 99 };

      // when
      const error = httpErrorMapper.httpErrorFn(new StructureNotFoundError({ meta }));

      // then
      expect(error).to.be.instanceOf(UnprocessableEntityError);
      expect(error.message).to.equal('Structure not found');
      expect(error.meta).to.equal(meta);
    });
  });

  context('when mapping "ArchiveOrganizationError"', function () {
    it('should return a UnprocessableEntityError Http Error', function () {
      // given
      const httpErrorMapper = organizationalEntitiesDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === ArchiveOrganizationError.name,
      );

      const meta = { organizationId: 1234 };

      // when
      const error = httpErrorMapper.httpErrorFn(new ArchiveOrganizationError({ meta }));

      // then
      expect(error).to.be.instanceOf(UnprocessableEntityError);
      expect(error.message).to.equal('Error during organization archiving');
      expect(error.meta).to.equal(meta);
    });
  });
});
