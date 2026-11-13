import { expect } from 'chai';

import { Download } from '../../../../../../src/devcomp/domain/models/element/Download.js';

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
  });
});
