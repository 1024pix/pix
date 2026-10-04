import Joi from 'joi';

import { config } from '../../../../../../config/config.js';
import { EntityValidationError } from '../../../../../shared/domain/errors.js';
import {
  CORE_LEVELS,
  EDU_LEVELS,
  PIX_PLUS_EDU_EXTERNAL_LEVELS,
  STANDARD_PIX_PLUS_LEVELS,
} from '../../../../shared/domain/constants/mesh-configuration.js';
import { Frameworks, hasCoreScope, isEduFramework } from '../../../../shared/domain/models/Frameworks.js';

export const CERTIFICATE_LABEL_CONTEXTS = {
  USER: 'user',
  SHAREABLE: 'shareable',
};

export class CertificateMeshLevel {
  static #schema = Joi.object({
    meshLevel: Joi.string().allow(null),
    certificationFramework: Joi.string().required(),
  });

  /**
   * @param {object} props
   * @param {number} props.reachedMeshIndex
   * @param {string} props.certificationFramework
   * @param {string} [props.eduV3ExternalJuryResult]
   */
  constructor({ reachedMeshIndex, certificationFramework, eduV3ExternalJuryResult }) {
    this.certificationFramework = certificationFramework;
    this.meshLevel = this.#getLevelKey({ reachedMeshIndex, certificationFramework, eduV3ExternalJuryResult });
    this.#validate();
  }

  getLevelLabel(translate) {
    return this.#translate({ translate, key: `${this.meshLevel}.label` });
  }

  getSummaryLabel(translate, context) {
    return this.#translate({ translate, key: `${this.meshLevel}.summary.${context}` });
  }

  getDescriptionLabel(translate, context) {
    return this.#translate({ translate, key: `${this.meshLevel}.description.${context}` });
  }

  get badgeUrl() {
    if (hasCoreScope(this.certificationFramework) || !this.meshLevel || this.meshLevel === 'LEVEL_ADMISSIBLE') {
      return null;
    }

    const framework = this.certificationFramework.toLowerCase();
    const level = this.meshLevel.replace('LEVEL_', '').toLowerCase();

    return `${config.assetsManager.url}/badges-certifies/v3/${framework}/${level}.png`;
  }

  #getLevelKey({ reachedMeshIndex, certificationFramework, eduV3ExternalJuryResult }) {
    if (reachedMeshIndex === null || !certificationFramework) return null;

    if (
      isEduFramework(certificationFramework) &&
      Object.values(PIX_PLUS_EDU_EXTERNAL_LEVELS).includes(eduV3ExternalJuryResult)
    ) {
      return `LEVEL_${eduV3ExternalJuryResult}`;
    }

    switch (certificationFramework) {
      case Frameworks.CORE:
      case Frameworks.CLEA:
        return CORE_LEVELS[reachedMeshIndex];
      case Frameworks.EDU_1ER_DEGRE:
      case Frameworks.EDU_2ND_DEGRE:
      case Frameworks.EDU_CPE:
        return EDU_LEVELS[0];
      case Frameworks.DROIT:
      case Frameworks.PRO_SANTE:
        return STANDARD_PIX_PLUS_LEVELS[reachedMeshIndex];
    }
  }

  #getTranslationFrameworkKey() {
    if (this.certificationFramework === Frameworks.CLEA) return Frameworks.CORE;
    return this.certificationFramework;
  }

  #translate({ translate, key }) {
    const frameworkKey = this.#getTranslationFrameworkKey();
    const translationKey = `certification.meshlevel.${frameworkKey}.${key}`;
    const translation = translate(translationKey);
    if (translation === translationKey) {
      return '';
    }
    return translation;
  }

  #validate() {
    const { error } = CertificateMeshLevel.#schema.validate(this, { allowUnknown: false });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
