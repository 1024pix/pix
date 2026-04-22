import { SCOPES } from './Scopes.js';

/**
 * Certification frameworks
 * @readonly
 * @enum {string}
 */
const FRAMEWORKS = Object.freeze({
  CORE: 'CORE',
  DROIT: 'DROIT',
  EDU_1ER_DEGRE: 'EDU_1ER_DEGRE',
  EDU_2ND_DEGRE: 'EDU_2ND_DEGRE',
  EDU_CPE: 'EDU_CPE',
  PRO_SANTE: 'PRO_SANTE',
  CLEA: 'CLEA',
});

export const Frameworks = FRAMEWORKS;

/**
 * @param {string} [framework]
 * @returns {boolean}
 */
export function isEduFramework(framework) {
  return framework.startsWith('EDU_');
}

/**
 * @param {string} [framework]
 * @returns {boolean}
 */
export function hasCoreScope(framework) {
  return [Frameworks.CORE, Frameworks.CLEA].includes(framework);
}

/**
 * @param {string} framework
 * @returns {SCOPES}
 */
export function toScope(framework) {
  if ([Frameworks.CORE, Frameworks.CLEA].includes(framework)) {
    return SCOPES.CORE;
  }
  if (Frameworks.DROIT === framework) {
    return SCOPES.PIX_PLUS_DROIT;
  }
  if (Frameworks.EDU_1ER_DEGRE === framework) {
    return SCOPES.PIX_PLUS_EDU_1ER_DEGRE;
  }
  if (Frameworks.EDU_2ND_DEGRE === framework) {
    return SCOPES.PIX_PLUS_EDU_2ND_DEGRE;
  }
  if (Frameworks.EDU_CPE === framework) {
    return SCOPES.PIX_PLUS_EDU_CPE;
  }
  if (Frameworks.PRO_SANTE === framework) {
    return SCOPES.PIX_PLUS_PRO_SANTE;
  }
  throw new Error(`Framework "${framework}" is not supported.`);
}
