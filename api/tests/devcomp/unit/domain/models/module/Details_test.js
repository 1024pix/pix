import { expect } from 'chai';

import { Details } from '../../../../../../src/devcomp/domain/models/module/Details.js';

describe('Unit | Devcomp | Domain | Models | Module | Details', function () {
  describe('#constructor', function () {
    it('should create module details and keep attributes', function () {
      // given
      const image = 'https://image.com';
      const description = 'Description';
      const duration = 12;
      const level = 'Débutant';
      const tabletSupport = 'comfortable';
      const objectives = ['MissionInformation #1'];

      // when
      const details = new Details({ image, description, duration, level, tabletSupport, objectives });

      // then
      expect(details.image).to.equal(image);
      expect(details.description).to.equal(description);
      expect(details.duration).to.equal(duration);
      expect(details.level).to.equal(level);
      expect(details.tabletSupport).to.equal(tabletSupport);
      expect(details.objectives).to.equal(objectives);
    });
  });
});
