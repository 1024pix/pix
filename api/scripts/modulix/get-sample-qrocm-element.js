#!/usr/bin/env node

import { getQrocmSample } from '../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/qrocm.sample.js';

console.log('');
console.log(JSON.stringify(getQrocmSample(), null, 2));
console.log('');
console.log('Voici un QROCM. Bon courage pour la contrib !');
