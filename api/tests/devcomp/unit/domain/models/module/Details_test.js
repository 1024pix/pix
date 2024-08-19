import { Details } from '../../../../../../src/devcomp/domain/models/module/Details.js';
import { expect } from '../../../../../test-helper.js';

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

    describe('if the details do not have an image', function () {
      it('should throw an error', function () {
        expect(() => new Details({})).to.throw('The image is required for module details');
      });
    });

    describe('if the details do not have a description', function () {
      it('should throw an error', function () {
        expect(() => new Details({ image: 'https://image.com' })).to.throw(
          'The description is required for module details',
        );
      });
    });

    describe('if the details do not have a duration', function () {
      it('should throw an error', function () {
        expect(() => new Details({ image: 'https://image.com', description: 'description' })).to.throw(
          'The duration is required for module details',
        );
      });
    });

    describe('if the details do not have a level', function () {
      it('should throw an error', function () {
        expect(() => new Details({ image: 'https://image.com', description: 'description', duration: 12 })).to.throw(
          'The level is required for module details',
        );
      });
    });

    describe('if the details do not have a tabletSupport', function () {
      it('should throw an error', function () {
        expect(
          () =>
            new Details({
              image: 'https://image.com',
              description: 'description',
              duration: 12,
              level: 'level',
              objectives: ['objective1'],
            }),
        ).to.throw('The tabletSupport is required for module details');
      });
    });

    describe('if the details do not have objectives', function () {
      it('should throw an error', function () {
        expect(
          () =>
            new Details({
              image: 'https://image.com',
              description: 'description',
              duration: 12,
              level: 'level',
              tabletSupport: 'comfortable',
            }),
        ).to.throw('The objectives are required for module details');
      });
    });

    describe('if the objectives is not a list', function () {
      it('should throw an error', function () {
        expect(
          () =>
            new Details({
              image: 'https://image.com',
              description: 'description',
              duration: 12,
              level: 'level',
              tabletSupport: 'comfortable',
              objectives: ' not-a-list',
            }),
        ).to.throw('The module details should contain a list of objectives');
      });
    });

    describe(`if details has less than 1 objective`, function () {
      it('should throw an error', function () {
        expect(
          () =>
            new Details({
              image: 'https://image.com',
              description: 'description',
              duration: 12,
              level: 'level',
              tabletSupport: 'comfortable',
              objectives: [],
            }),
        ).to.throw('The module details should contain at least one objective');
      });
    });
  });
});
