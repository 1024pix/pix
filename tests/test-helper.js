/* globals mocha */
import resolver from './helpers/resolver';
import { setResolver } from 'ember-mocha';
import Reporter from './helpers/ember-cli-mocha-reporter';

mocha.reporter(Reporter);
setResolver(resolver);
