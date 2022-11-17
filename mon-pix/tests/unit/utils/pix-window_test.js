import { expect } from 'chai';
import { describe, it } from 'mocha';
import PixWindow from 'mon-pix/utils/pix-window';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Utilities | pix-window', function () {
  setupTest();

  afterEach(function () {
    sinon.restore();
  });

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

  context('GET window.location.hash', function () {
    it('should return the hash found in the URL', function () {
      // given
      sinon.stub(PixWindow, 'getLocationHash').returns('#hash');

      // when
      const hash = PixWindow.getLocationHash();

      // then
      expect(hash).to.equal('#hash');
    });
  });
});
