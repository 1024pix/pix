import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-mocha';
import { mocha } from 'mocha';

mocha.setup({
  timeout: 1500,
  slow: 500,
});

setResolver(resolver);
