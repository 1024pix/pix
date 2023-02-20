export default class AddedCellOption {
  constructor({ labels = [], rowspan = 0, colspan = 0, positionOffset = 0 }) {
    this.labels = labels;
    this.rowspan = rowspan;
    this.colspan = colspan;
    this.positionOffset = positionOffset;
  }
}
