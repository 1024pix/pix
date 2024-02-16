#!/usr/bin/env node

import { getVideoSample } from '../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/video.sample.js';

console.log('');
console.log(JSON.stringify(getVideoSample(), null, 2));
console.log('');
console.log("Voici un joli élément vidéo. N'oubliez pas de compléter la transcription !");
