import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-mocha';
import { mocha } from 'mocha';

mocha.setup({
  timeout: 2000,
  slow: 500,
});

setResolver(resolver);
