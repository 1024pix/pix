import { expect } from '../../../../test-helper.js';
import { DomainErrorMappingConfiguration } from '../../../../../src/shared/application/models/domain-error-mapping-configuration.js';
import { ObjectValidationError } from '../../../../../lib/domain/errors.js';

describe('Unit | Shared | Application | Models | DomainErrorMappingConfiguration', function () {
  context('when parameters are valid', function () {
    it('creates an HttpErrorMapper instance', function () {
      // given
      const params = { name: 'DomainErrorName', httpErrorFn: () => undefined };

      // when
      const instance = new DomainErrorMappingConfiguration(params);

      // then
      expect(instance).to.be.instanceOf(DomainErrorMappingConfiguration);
      expect(instance.name).to.equal('DomainErrorName');
      expect(instance.httpErrorFn).to.be.a('function');
    });
  });

  context('when "name" parameter is empty', function () {
    it('throws an ObjectValidationError', function () {
      // given
      const params = { name: '', httpErrorFn: () => undefined };
      let error;

      // when
      try {
        new DomainErrorMappingConfiguration(params);
      } catch (err) {
        error = err;
      }
      // then
      expect(error).to.be.instanceOf(ObjectValidationError);
    });
  });

  context('when "httpErrorFn" parameter is not a function', function () {
    it('throws an ObjectValidationError', function () {
      // given
      const params = { name: 'DomainErrorName', httpErrorFn: undefined };
      let error;

      // when
      try {
        new DomainErrorMappingConfiguration(params);
      } catch (err) {
        error = err;
      }
      // then
      expect(error).to.be.instanceOf(ObjectValidationError);
    });
  });

  context('when no parameter is given', function () {
    it('throws a ObjectValidationError', function () {
      // given
      let error;

      // when
      try {
        new DomainErrorMappingConfiguration();
      } catch (err) {
        error = err;
      }
      // then
      expect(error).to.be.instanceOf(ObjectValidationError);
    });
  });
});
