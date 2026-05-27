import { OrganizationFeature } from '../../../../../src/organizational-entities/domain/models/OrganizationFeature.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Unit | Organizational Entities | Domain | Model | OrganizationFeature', function () {
  let organizationFeature, featureName, organizationId, params, features;

  describe('#DEFAULT', function () {
    beforeEach(function () {
      // given
      featureName = 'TOTO';
      organizationId = 2;
      params = { id: 3 };
      features = [
        {
          key: 'TATA',
          id: 1,
        },
      ];
    });

    it('should throw EntityErrorValidation given unknown feature', function () {
      //when
      const error = catchErrSync(() => new OrganizationFeature({ featureName, organizationId, params, features }))();

      expect(error).instanceOf(EntityValidationError);
      expect(error.code).equal('UNKNOWN_FEATURE');
    });
  });

  describe('#ATTESTATIONS_MANAGEMENT', function () {
    beforeEach(function () {
      // given
      featureName = ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key;
      organizationId = 2;
      params = ['RIRI', 'FIFI', 'LOULOU'];
      features = [
        {
          key: ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key,
          id: 1,
        },
      ];
    });

    it('should initialize an instance with given params', function () {
      //when
      organizationFeature = new OrganizationFeature({ featureName, organizationId, params, features });
      // then
      expect(organizationFeature).to.deep.equal({
        featureId: 1,
        organizationId: 2,
        params: ['RIRI', 'FIFI', 'LOULOU'],
        deleteLearner: false,
      });
    });

    it('should throw EntityErrorValidation given empty params', function () {
      //when
      const error = catchErrSync(() => new OrganizationFeature({ featureName, organizationId, features }))();

      // then
      expect(error).instanceOf(EntityValidationError);
    });

    it('should throw EntityErrorValidation on deleteLearner', function () {
      //when
      const error = catchErrSync(
        () => new OrganizationFeature({ featureName, organizationId, deleteLearner: true, features }),
      )();

      // then
      expect(error).instanceOf(EntityValidationError);
    });
  });

  describe('#ORALIZATION_MANAGED_BY_PRESCRIBER', function () {
    beforeEach(function () {
      // given
      featureName = ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER.key;
      organizationId = 2;
      params = { id: 3 };
      features = [
        {
          key: ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER.key,
          id: 1,
        },
      ];
    });

    it('should initialize an instance with given params', function () {
      //when
      organizationFeature = new OrganizationFeature({ featureName, organizationId, params, features });
      // then
      expect(organizationFeature).to.deep.equal({
        featureId: 1,
        organizationId: 2,
        params: { id: 3 },
        deleteLearner: false,
      });
    });

    it('should initialize an instance with given empty params', function () {
      //when
      organizationFeature = new OrganizationFeature({ featureName, organizationId, features });

      // then
      expect(organizationFeature).to.deep.equal({
        featureId: 1,
        organizationId: 2,
        params: null,
        deleteLearner: false,
      });
    });

    it('should throw EntityErrorValidation on deleteLearner', function () {
      //when
      const error = catchErrSync(
        () => new OrganizationFeature({ featureName, organizationId, deleteLearner: true, features }),
      )();

      // then
      expect(error).instanceOf(EntityValidationError);
    });
  });

  describe('#PLACES_MANAGEMENT', function () {
    beforeEach(function () {
      // given
      featureName = ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key;
      organizationId = 2;
      params = { id: 3 };
      features = [
        {
          key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
          id: 1,
        },
      ];
    });

    it('should initialize an instance with given params', function () {
      //when
      organizationFeature = new OrganizationFeature({ featureName, organizationId, params, features });
      // then
      expect(organizationFeature).to.deep.equal({
        featureId: 1,
        organizationId: 2,
        params: { id: 3 },
        deleteLearner: false,
      });
    });

    it('should initialize an instance with given empty params', function () {
      //when
      organizationFeature = new OrganizationFeature({ featureName, organizationId, features });

      // then
      expect(organizationFeature).to.deep.equal({
        featureId: 1,
        organizationId: 2,
        params: null,
        deleteLearner: false,
      });
    });

    it('should throw EntityErrorValidation on deleteLearner', function () {
      //when
      const error = catchErrSync(
        () => new OrganizationFeature({ featureName, organizationId, deleteLearner: true, features }),
      )();

      // then
      expect(error).instanceOf(EntityValidationError);
    });
  });

  describe('#LEARNER_IMPORT', function () {
    beforeEach(function () {
      // given
      featureName = ORGANIZATION_FEATURE.LEARNER_IMPORT.key;
      organizationId = 2;
      params = { id: 3 };
      features = [
        {
          key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key,
          id: 1,
        },
      ];
    });

    it('should initialize an instance with given params', function () {
      //when
      organizationFeature = new OrganizationFeature({ featureName, organizationId, params, features });
      // then
      expect(organizationFeature).to.deep.equal({
        featureId: 1,
        organizationId: 2,
        params: { id: 3 },
        deleteLearner: false,
      });
    });

    it('should throw EntityErrorValidation on empty params', function () {
      //when
      const error = catchErrSync(() => new OrganizationFeature({ featureName, organizationId, features }))();

      // then
      expect(error).instanceOf(EntityValidationError);
    });

    it('should throw EntityErrorValidation on non object params', function () {
      //when
      const error = catchErrSync(
        () => new OrganizationFeature({ featureName, organizationId, features, params: [] }),
      )();

      // then
      expect(error).instanceOf(EntityValidationError);
    });

    describe('#deleteLearner', function () {
      it('should activate learner deletion given yes params', function () {
        //when
        organizationFeature = new OrganizationFeature({
          featureName,
          organizationId,
          params,
          deleteLearner: true,
          features,
        });
        // then
        expect(organizationFeature.deleteLearner).to.be.true;
      });

      it('should deactivate learner deletion given no params', function () {
        //when
        organizationFeature = new OrganizationFeature({
          featureName,
          organizationId,
          params,
          deleteLearner: false,
          features,
        });
        // then
        expect(organizationFeature.deleteLearner).to.be.false;
      });

      it('should deactivate learner deletion given empty params', function () {
        //when
        organizationFeature = new OrganizationFeature({ featureName, organizationId, params, features });
        // then
        expect(organizationFeature.deleteLearner).to.be.false;
      });

      it('should throw EntityErrorValidation on invalid value deleteLearner', function () {
        //when
        const error = catchErrSync(
          () => new OrganizationFeature({ featureName, organizationId, deleteLearner: 'Oui oui', features }),
        )();

        // then
        expect(error).instanceOf(EntityValidationError);
      });
    });
  });

  [
    ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key,
    ORGANIZATION_FEATURE.COVER_RATE.key,
    ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key,
    ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key,
    ORGANIZATION_FEATURE.COVER_RATE.key,
    ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key,
    ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key,
  ].forEach((featureName) => {
    describe(`#${featureName}`, function () {
      beforeEach(function () {
        // given
        organizationId = 2;
        params = { id: 3 };
        features = [
          {
            key: featureName,
            id: 1,
          },
        ];
      });

      it('should initialize an instance with given params', function () {
        //when
        organizationFeature = new OrganizationFeature({ featureName, organizationId, features });
        // then
        expect(organizationFeature).to.deep.equal({
          featureId: 1,
          organizationId: 2,
          params: null,
          deleteLearner: false,
        });
      });

      it('should throw EntityErrorValidation given params', function () {
        //when
        const error = catchErrSync(() => new OrganizationFeature({ featureName, organizationId, features, params }))();

        // then
        expect(error).instanceOf(EntityValidationError);
      });

      it('should throw EntityErrorValidation on deleteLearner', function () {
        //when
        const error = catchErrSync(
          () => new OrganizationFeature({ featureName, organizationId, deleteLearner: true, features }),
        )();

        // then
        expect(error).instanceOf(EntityValidationError);
      });
    });
  });
});
