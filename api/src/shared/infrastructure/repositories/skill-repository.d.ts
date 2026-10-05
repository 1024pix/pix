// To delete when skill-repository.js is converted to TypeScript.
// Only the functions used from TypeScript code are declared.
import { type Skill } from '../../domain/models/Skill.js';

export function list(): Promise<Skill[]>;
