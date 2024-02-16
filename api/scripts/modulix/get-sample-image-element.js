#!/usr/bin/env node

import { getImageSample } from '../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/image.sample.js';

console.log('');
console.log(JSON.stringify(getImageSample(), null, 2));
console.log('');
console.log('Voici un joli élément image. Pensez à remplir les alternatives !');
