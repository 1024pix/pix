import { catchErrSync, expect, sinon } from '../../../test-helper.js';
import { DomainErrorMapper } from '../../../../src/shared/application/domain-error-mapper.js';
import { BaseHttpError, HttpErrors } from '../../../../src/shared/application/http-errors.js';
import { DomainError } from '../../../../src/shared/domain/errors.js';
import { config } from '../../../../src/shared/config.js';

class DomainErrorName extends DomainError {}
class DomainErrorNameWithMeta extends DomainError {
  constructor({ message, meta }) {
    super(message);
    this.meta = meta;
  }
}
class HttpErrorWithMeta extends BaseHttpError {
  constructor({ message, meta }) {
    super(message);
    this.meta = meta;
  }
}

describe('Shared | Unit | Application | DomainErrorMapper', function () {
  describe('#configure', function () {
    context('when no mapping errors has been configured', function () {
      let domainErrorMapper;

      beforeEach(function () {
        domainErrorMapper = new DomainErrorMapper();
      });

      context('when registering new domain mapping errors', function () {
        it('returns updated configured domain mapping errors', function () {
          // Given
          const domainErrorsHttpMapping = [
            {
              name: 'errorName',
              httpErrorFn: () => undefined,
            },
          ];

          // When
          const result = domainErrorMapper.configure(domainErrorsHttpMapping);

          // Then
          expect(result).to.exist;
          expect(result['errorName']).to.exist;
        });
      });
    });

    context('when mapping errors has been configured', function () {
      let domainErrorMapper;

      beforeEach(function () {
        domainErrorMapper = new DomainErrorMapper({
          errorName: () => undefined,
        });
      });

      context('when registering new domain mapping errors', function () {
        it('returns updated configured domain mapping errors', function () {
          // Given
          const domainErrorsHttpMapping = [
            {
              name: 'newErrorName',
              httpErrorFn: () => undefined,
            },
          ];

          // When
          const result = domainErrorMapper.configure(domainErrorsHttpMapping);

          // Then
          expect(result['newErrorName']).to.exist;
        });
      });

      context('when registering a domain mapping errors which contains an already configured error name', function () {
        context('when not in "TEST" environment', function () {
          it('throws an error with the domain error name in the message', function () {
            // Given
            const domainErrorsHttpMapping = [
              {
                name: 'newErrorName',
                httpErrorFn: () => undefined,
              },
              {
                name: 'errorName',
                httpErrorFn: () => undefined,
              },
            ];
            sinon.stub(config, 'environment').value('development');

            // When
            const error = catchErrSync(domainErrorMapper.configure, domainErrorMapper)(domainErrorsHttpMapping);

            // Then
            expect(error).to.be.instanceOf(Error);
            expect(error.message).to.include('errorName');
          });
        });

        context('when in "TEST" environment', function () {
          it('returns updated configured domain mapping errors', function () {
            // Given
            const domainErrorsHttpMapping = [
              {
                name: 'errorName',
                httpErrorFn: () => 'hello',
              },
            ];

            // When
            const result = domainErrorMapper.configure(domainErrorsHttpMapping);

            // Then
            expect(result['errorName']()).to.equal('hello');
          });
        });
      });
    });
  });

  describe('#mapToHttpError', function () {
    context('when no mapping errors has been configured for "DomainErrorName"', function () {
      it('returns "undefined"', function () {
        // given
        const domainErrorMapper = new DomainErrorMapper();

        // when
        const result = domainErrorMapper.mapToHttpError(new DomainErrorName());

        // then
        expect(result).to.be.undefined;
      });
    });

    context('when mapping errors has been configured for "DomainErrorName"', function () {
      it('returns a HttpError', function () {
        // given
        const domainErrorMapper = new DomainErrorMapper({
          DomainErrorName: () => new HttpErrors.BaseHttpError(),
        });

        // when
        const result = domainErrorMapper.mapToHttpError(new DomainErrorName());

        // then
        expect(result).to.be.instanceOf(BaseHttpError);
      });
    });

    context('when mapping errors needs additional information to generate the http error', function () {
      it('returns a HttpError', function () {
        // given
        const domainErrorMapper = new DomainErrorMapper({
          DomainErrorNameWithMeta: (domainError) =>
            new HttpErrorWithMeta({ message: domainError.message, meta: domainError.meta }),
        });

        // when
        const result = domainErrorMapper.mapToHttpError(
          new DomainErrorNameWithMeta({ message: 'coucou', meta: 'hello' }),
        );

        // then
        expect(result).to.be.instanceOf(BaseHttpError);
        expect(result.message).to.equal('coucou');
        expect(result.meta).to.equal('hello');
      });
    });
  });
});
