import Service from '@ember/service';
import FileSaver from 'file-saver';

export default Service.extend({
  saveAs:FileSaver.saveAs
});
