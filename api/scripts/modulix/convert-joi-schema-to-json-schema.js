import { convertJoiToJsonSchema } from '../../src/devcomp/infrastructure/datasources/conversion/joi-to-json-schema.js';
import { moduleSchema } from '../../tests/devcomp/unit/infrastructure/datasources/learning-content/validation/module.js';

const jsonSchema = JSON.stringify(convertJoiToJsonSchema(moduleSchema), null, 2);

console.log(`export const schema = ${jsonSchema};`);
