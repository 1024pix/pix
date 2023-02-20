class ProgressionLogger {
  constructor(output) {
    this.output = output;
    this.count = 0;
  }

  setTotal(total) {
    this.total = total;
  }

  log(data) {
    this.output.write(data.toString());
    this.output.write('\n');
  }

  logCount() {
    this.count += 1;
    this.output.cursorTo(0);
    this.output.write(`progress : ${this.count}/${this.total}`);
  }
}

export default ProgressionLogger;
