#! /usr/bin/env node
'use strict';
require('dotenv').config();
const cache = require('../lib/infrastructure/caches/learning-content-cache');
const learningContentDatasource = require('../lib/infrastructure/datasources/learning-content/datasource');

if (require.main === module) {
  learningContentDatasource
    .refreshLearningContentCacheRecords()
    .catch((e) => console.error('Error while reloading cache', e))
    .finally(() => cache.quit());
}
