import * as certificationFrameworkSerializer from '../../../../../../src/certification/configuration/infrastructure/serializers/certification-framework-serializer.js';

describe('Unit | Certification | Configuration | Serializer | certification-framework-serializer', function () {
  describe('#serialize', function () {
    it('should serialize certification frameworks with their active version start date', function () {
      // given
      const frameworks = [
        { id: 'CORE', name: 'CORE', activeVersionStartDate: new Date('2025-01-15') },
        { id: 'DROIT', name: 'DROIT', activeVersionStartDate: new Date('2025-06-01') },
        { id: 'CLEA', name: 'CLEA', activeVersionStartDate: null },
      ];

      // when
      const serialized = certificationFrameworkSerializer.serialize(frameworks);

      // then
      expect(serialized).to.deep.equal({
        data: [
          {
            type: 'certification-frameworks',
            id: 'CORE',
            attributes: {
              name: 'CORE',
              'active-version-start-date': new Date('2025-01-15'),
            },
          },
          {
            type: 'certification-frameworks',
            id: 'DROIT',
            attributes: {
              name: 'DROIT',
              'active-version-start-date': new Date('2025-06-01'),
            },
          },
          {
            type: 'certification-frameworks',
            id: 'CLEA',
            attributes: {
              name: 'CLEA',
              'active-version-start-date': null,
            },
          },
        ],
      });
    });
  });
});
