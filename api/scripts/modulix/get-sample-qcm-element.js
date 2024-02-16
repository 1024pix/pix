#!/usr/bin/env node

import { getQcmSample } from '../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/qcm.sample.js';

console.log('');
console.log(JSON.stringify(getQcmSample(), null, 2));
console.log('');
console.log('Voici un petit QCM.');
