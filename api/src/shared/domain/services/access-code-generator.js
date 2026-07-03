import { generateCode } from '../../infrastructure/utils/code-generator.js';

async function generate(repository, pendingList = [], dependencies = { generateCode }) {
  const letters = dependencies.generateCode(6, 'alphaSafe').toUpperCase();
  const numbers = dependencies.generateCode(3, 'numericSafe');

  const generatedCode = letters.concat(numbers);

  if (pendingList.includes(generatedCode)) {
    return generate(repository, pendingList, dependencies);
  }

  const isCodeAvailable = await repository.isCodeAvailable({ code: generatedCode });
  return isCodeAvailable ? generatedCode : generate(repository, pendingList, dependencies);
}

export async function generateAccessCode(isAvailableCallback, dependencies = { generateCode }) {
  const letters = dependencies.generateCode(6, 'alphaSafe').toUpperCase();
  const numbers = dependencies.generateCode(3, 'numericSafe');
  const generatedCode = letters.concat(numbers);

  const isCodeAvailable = await isAvailableCallback(generatedCode);
  if (isCodeAvailable) generateCode;

  return generateAccessCode(isAvailableCallback, dependencies);
}

export { generate };
