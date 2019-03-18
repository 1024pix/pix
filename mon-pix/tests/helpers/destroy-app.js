import { run } from '@ember/runloop';

export default function destroyApp(application) {
  run(application, 'destroy');
  if (window.server) {
    window.server.shutdown();
  }

  // XXX Cleanup body scrolling in case a pix-modal was opened
  document.querySelector('#modal-overlays').classList.remove('active');
  document.body.classList.remove('centered-modal-showing');
}
