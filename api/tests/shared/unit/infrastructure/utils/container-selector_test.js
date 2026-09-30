import { expect } from 'chai';

import { matchesContainerSelector } from '../../../../../src/shared/infrastructure/utils/container-selector.js';

describe('Shared | Unit | Infrastructure | Utils | container-selector', function () {
  describe('#matchesContainerSelector', function () {
    it('matches every container with "all" and "*"', function () {
      expect(matchesContainerSelector('all', 'web-1')).to.be.true;
      expect(matchesContainerSelector('*', 'worker-12')).to.be.true;
    });

    it('matches a container type', function () {
      expect(matchesContainerSelector('web', 'web-3')).to.be.true;
      expect(matchesContainerSelector('web', 'worker-3')).to.be.false;
      expect(matchesContainerSelector('web-*', 'web-3')).to.be.true;
    });

    it('matches a single container', function () {
      expect(matchesContainerSelector('web-2', 'web-2')).to.be.true;
      expect(matchesContainerSelector('web-2', 'web-20')).to.be.false;
    });

    it('matches any container of a comma or space separated list', function () {
      expect(matchesContainerSelector('web-2,worker-1', 'worker-1')).to.be.true;
      expect(matchesContainerSelector('web-2 worker-1', 'web-2')).to.be.true;
      expect(matchesContainerSelector('web-2,worker-1', 'web-3')).to.be.false;
    });

    it('matches one container out of n with the modulo form', function () {
      expect(matchesContainerSelector('web-%3', 'web-3')).to.be.true;
      expect(matchesContainerSelector('web-%3', 'web-6')).to.be.true;
      expect(matchesContainerSelector('web-%3', 'web-4')).to.be.false;
      expect(matchesContainerSelector('web-%3', 'worker-3')).to.be.false;
    });

    it('matches nothing when the selector or the container name is missing', function () {
      expect(matchesContainerSelector(undefined, 'web-1')).to.be.false;
      expect(matchesContainerSelector('', 'web-1')).to.be.false;
      expect(matchesContainerSelector('all', undefined)).to.be.false;
    });
  });
});
