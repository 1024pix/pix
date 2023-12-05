import cp from 'child_process';
import { stdout, stderr } from 'node:process';
import os from 'os';

// Currently built binary of libxmljs2 is node compatible with node20 on
// arm64 macs. We rebuild the binary if its import fails.
try {
  if (os.platform() === 'darwin' && os.arch() === 'arm64') {
    // eslint-disable-next-line n/no-unpublished-import
    await import('libxmljs2');
  }
} catch (err) {
  const process = cp.exec('npm run build', { cwd: './node_modules/libxmljs2' });
  process.stdout.pipe(stdout);
  process.stderr.pipe(stderr);
}
