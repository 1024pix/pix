import { generateCode } from '../../infrastructure/utils/code-generator.js';

export async function generateAvailableAccessCode(isAvailableCallback, dependencies = { generateCode }) {
  const letters = dependencies.generateCode(6, 'alphaSafe').toUpperCase();
  const numbers = dependencies.generateCode(3, 'numericSafe');
  const code = letters.concat(numbers);

  const isCodeAvailable = await isAvailableCallback(code);
  if (isCodeAvailable) return code;

  return generateAvailableAccessCode(isAvailableCallback, dependencies);
}
