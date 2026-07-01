import Joi from 'joi';

import { ORGANIZATION_FEATURE } from '../../../shared/constants.js';
import { EntityValidationError } from '../../../shared/domain/errors.js';

class OrganizationFeature {
  #schema = Joi.object({
    featureName: Joi.string()
      .valid(
        ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key,
        ORGANIZATION_FEATURE.COVER_RATE.key,
        ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key,
        ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER.key,
        ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key,
        ORGANIZATION_FEATURE.COVER_RATE.key,
        ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key,
        ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key,
        ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key,
        ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
        ORGANIZATION_FEATURE.LEARNER_IMPORT.key,
      )
      .required(),
    params: Joi.when('featureName', {
      switch: [
        {
          is: Joi.valid(ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key),
          then: Joi.array().required(),
        },
        {
          is: Joi.valid(
            ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
            ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER.key,
          ),
          then: Joi.object().allow(null).optional(),
        },
        {
          is: Joi.valid(ORGANIZATION_FEATURE.LEARNER_IMPORT.key),
          then: Joi.object().required(),
        },
        {
          is: Joi.valid(
            ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key,
            ORGANIZATION_FEATURE.COVER_RATE.key,
            ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key,
            ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key,
            ORGANIZATION_FEATURE.COVER_RATE.key,
            ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key,
            ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key,
          ),
          then: Joi.valid(null).optional(),
        },
      ],
    }),
    deleteLearner: Joi.when('featureName', {
      is: Joi.string().required().valid(ORGANIZATION_FEATURE.LEARNER_IMPORT.key),
      then: Joi.boolean().allow(null).optional(),
      otherwise: Joi.valid(null, false).optional(),
    }),
    organizationId: Joi.number().integer().required(),
  });

  constructor({ featureName, organizationId, params, deleteLearner, features }) {
    const selectedFeature = features.find(({ key }) => key === featureName);

    if (!selectedFeature) {
      throw new EntityValidationError(
        {
          invalidAttributes: [{ attribute: 'featureName', message: 'feature not found' }],
        },
        'UNKNOWN_FEATURE',
      );
    }

    this.#validate({ featureName, params, deleteLearner, organizationId });

    this.featureId = selectedFeature.id;
    this.organizationId = organizationId;
    this.params = params ?? null;
    this.deleteLearner = deleteLearner ?? false;
  }

  #validate(data) {
    const { error } = this.#schema.validate(data, { allowUnknown: false });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}

export { OrganizationFeature };
