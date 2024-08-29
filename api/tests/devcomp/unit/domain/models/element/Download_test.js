import { ModuleInstantiationError } from '../../../../../../src/devcomp/domain/errors.js';
import { Download } from '../../../../../../src/devcomp/domain/models/element/Download.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Element | Download', function () {
  describe('#constructor', function () {
    it('should create a Download and keep attributes', function () {
      // given
      const props = {
        id: 'id',
        files: [{ url: 'https://example.org', format: '.html' }],
      };

      // when
      const download = new Download(props);

      // then
      expect(download.id).to.equal('id');
      expect(download.files).to.equal(props.files);
    });

    describe('errors', function () {
      describe('A Download without an id', function () {
        it('should throw an error', function () {
          // when
          const error = catchErrSync(() => new Download({}))();

          // then
          expect(error).to.be.instanceOf(DomainError);
          expect(error.message).to.equal('The id is required for an element');
        });
      });

      describe('A Download without files', function () {
        it('should throw an error', function () {
          // when
          const error = catchErrSync(() => new Download({ id: '123' }))();

          // then
          expect(error).to.be.instanceOf(ModuleInstantiationError);
          expect(error.message).to.equal('The Download files should be a list');
        });
      });

      describe('A Download with an empty list of files', function () {
        it('should throw an error', function () {
          // when
          const error = catchErrSync(() => new Download({ id: '123', files: [] }))();

          // then
          expect(error).to.be.instanceOf(ModuleInstantiationError);
          expect(error.message).to.equal('The files are required for a Download');
        });
      });

      describe('files', function () {
        describe('A file with no URL', function () {
          it('should throw an error', function () {
            // when
            const error = catchErrSync(() => new Download({ id: '123', files: [{}] }))();

            // then
            expect(error).to.be.instanceOf(DomainError);
            expect(error.message).to.equal('The Download files should have an URL');
          });
        });

        describe('A file with no format', function () {
          it('should throw an error', function () {
            // when
            const error = catchErrSync(() => new Download({ id: '123', files: [{ url: 'https://example.org' }] }))();

            // then
            expect(error).to.be.instanceOf(DomainError);
            expect(error.message).to.equal('The Download files should have a format');
          });
        });
      });
    });
  });
});
