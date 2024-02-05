import Markdoc from '@markdoc/markdoc';
import yaml from 'js-yaml';

import { InvalidChallengeStateError } from '../errors.js';

export class ChallengeInstruction {
  props = [];
  variables = undefined;

  #ast;
  #source;

  constructor({ source }) {
    this.#source = source;

    this.#parseSource();
  }

  generateVariables(generator) {
    if (this.props.length === 0) return;

    this.variables = Object.fromEntries(
      this.props.map(({ name, type, params }) => {
        if (!(type in generator)) {
          throw new InvalidChallengeStateError(`Challenge uses unknown variable generator type "${type}"`);
        }
        return [name, generator[type](params)];
      }),
    );
  }

  toString() {
    if (!this.#ast) return this.#source;
    return this.#render();
  }

  get hasVariables() {
    return this.props.length !== 0;
  }

  #parseSource() {
    if (!hasFrontmatter(this.#source)) return;

    this.#ast = Markdoc.parse(this.#source);
    if (!this.#ast.attributes.frontmatter) return;

    const metadata = yaml.load(this.#ast.attributes.frontmatter);
    if (!metadata.variables) return;

    this.props = metadata.variables;
  }

  #render() {
    if (this.props.length !== 0 && this.variables === undefined) {
      throw new InvalidChallengeStateError('Challenge instruction expects variables');
    }

    const article = Markdoc.transform(this.#ast, { variables: this.variables });
    return Markdoc.renderers.html(article.children);
  }
}

function hasFrontmatter(source) {
  return source.startsWith('---\n') && source.includes('\n---\n');
}
