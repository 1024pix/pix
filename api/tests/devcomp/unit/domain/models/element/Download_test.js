import { Download } from '../../../../../../src/devcomp/domain/models/element/Download.js';
import { expect } from '../../../../../test-helper.js';

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
          expect(() => new Download({})).to.throw('The id is required for an element');
        });
      });

      describe('A Download without files', function () {
        it('should throw an error', function () {
          expect(() => new Download({ id: '123' })).to.throw('The Download files should be a list');
        });
      });

      describe('A Download with an empty list of files', function () {
        it('should throw an error', function () {
          expect(() => new Download({ id: '123', files: [] })).to.throw('The files are required for a Download');
        });
      });

      describe('files', function () {
        describe('A file with no URL', function () {
          it('should throw an error', function () {
            expect(() => new Download({ id: '123', files: [{}] })).to.throw('The Download files should have an URL');
          });
        });

        describe('A file with no format', function () {
          it('should throw an error', function () {
            expect(() => new Download({ id: '123', files: [{ url: 'https://example.org' }] })).to.throw(
              'The Download files should have a format',
            );
          });
        });
      });
    });
  });
});
