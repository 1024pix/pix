import { expect } from 'chai';
import { describe, it } from 'mocha';
import PixWindow from 'mon-pix/utils/pix-window';
import sinon from 'sinon';

describe('Unit | Utilities | pix-window', function () {
  context('GET window.location.href', function () {
    it('should return an URL', function () {
      // given
      sinon.stub(PixWindow, 'getLocationHref').returns('http://domain.com/timely#hash');

      // when
      const url = PixWindow.getLocationHref();

      // then
      expect(url).to.equal('http://domain.com/timely#hash');
    });
  });
});
