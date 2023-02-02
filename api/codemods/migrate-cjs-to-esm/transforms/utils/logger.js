// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */
class Logger {
  constructor(file, options) {
    this.prefix = `${file.path}:`;
    this.silent = options.silent;
    this.verbose = options.verbose;
  }

  log(...text) {
    if (!this.silent && this.verbose > 0) console.log('[LOG]', this.prefix, ...text);
  }

  warn(...text) {
    if (!this.silent) console.warn('[WARNING]', this.prefix, ...text);
  }

  error(...text) {
    if (!this.silent) console.error('[ERROR]', this.prefix, ...text);
  }

  /**
   * Show lines in the form (lines <start> to <end>) from a node.
   * If <start> and <end> correspond to the same line, show (line <start>).
   *
   * @param {Node} node
   * @return {String}
   */
  lines(node) {
    if (node.loc) {
      if (node.loc.start.line === node.loc.end.line) return `(line ${node.loc.start.line})`;
      return `(lines ${node.loc.start.line} to ${node.loc.end.line})`;
    }
    return '';
  }
}
module.exports = Logger;
