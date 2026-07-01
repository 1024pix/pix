import { generateCode } from '../../../shared/infrastructure/utils/code-generator.js';

export function generateSimplePassword() {
  const letterPart = generateCode(6, 'alphaSafe').toLowerCase();
  const numberPart = generateCode(2, 'numeric').padStart(2, '0');
  return `${letterPart}${numberPart}`;
}

export function generateComplexPassword(dependencies = { generateCode }) {
  return dependencies.generateCode(32, 'alphanumeric');
}
