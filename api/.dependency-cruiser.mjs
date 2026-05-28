import { buildForbiddenRules } from './tests/tooling/dependency-cruiser-generator.js';

const CONTEXTS = [
  {
    name: 'shared',
    // dependsOn: [],
    circular: 'forbidden',
  },
  {
    name: 'banner',
    // dependsOn: ['shared'],
    circular: 'forbidden',
  },
  {
    name: 'learning-content',
    // dependsOn: ['shared'],
    circular: 'forbidden',
  },
];

export default {
  forbidden: buildForbiddenRules(CONTEXTS),
  options: {
    doNotFollow: { path: 'node_modules' },
  },
};
