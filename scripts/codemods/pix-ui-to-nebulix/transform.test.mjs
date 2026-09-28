import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { transform } from "./transform.mjs";

describe("transform", () => {
  it("merges pix-ui component default imports into a single nebulix-ember named import", () => {
    const source = `import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { hash } from '@ember/helper';
import PixModal from '@1024pix/pix-ui/components/pix-modal';

<template><PixButton /></template>
`;

    const result = transform(source);

    assert.equal(
      result.code,
      `import { PixButton, PixIcon, PixModal } from '@1024pix/nebulix-ember';
import { hash } from '@ember/helper';

<template><PixButton /></template>
`,
    );
    assert.equal(result.converted, 3);
    assert.deepEqual(result.warnings, []);
  });

  it("aliases the nebulix export when the local name differs", () => {
    const source = `import PixTextArea from '@1024pix/pix-ui/components/pix-textarea';
import PixButton from '@1024pix/pix-ui/components/pix-button';
`;

    const result = transform(source);

    assert.equal(
      result.code,
      `import { PixButton, PixTextarea as PixTextArea } from '@1024pix/nebulix-ember';
`,
    );
  });

  it("merges into an existing nebulix-ember import without duplicates", () => {
    const source = `import { PixModal, PixButton } from '@1024pix/nebulix-ember';
import { hash } from '@ember/helper';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
`;

    const result = transform(source);

    assert.equal(
      result.code,
      `import { PixButton, PixIcon, PixModal } from '@1024pix/nebulix-ember';
import { hash } from '@ember/helper';
`,
    );
    assert.equal(result.converted, 2);
  });

  it("merges into an existing multi-line nebulix-ember import", () => {
    const source = `import {
  PixButton,
  PixModal,
} from '@1024pix/nebulix-ember';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
`;

    const result = transform(source);

    assert.equal(
      result.code,
      `import { PixButton, PixIcon, PixModal } from '@1024pix/nebulix-ember';
`,
    );
  });

  it("rewrites modifier imports to the nebulix-ember modifiers subpath", () => {
    const source = `import onEnterAction from '@1024pix/pix-ui/addon/modifiers/on-enter-action';
import trapFocus from '@1024pix/pix-ui/modifiers/trap-focus';
`;

    const result = transform(source);

    assert.equal(
      result.code,
      `import onEnterAction from '@1024pix/nebulix-ember/modifiers/on-enter-action';
import trapFocus from '@1024pix/nebulix-ember/modifiers/trap-focus';
`,
    );
    assert.equal(result.converted, 2);
  });

  it("handles modifier imports placed before component imports", () => {
    const source = `import onEnterAction from '@1024pix/pix-ui/addon/modifiers/on-enter-action';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import { hash } from '@ember/helper';
`;

    const result = transform(source);

    assert.equal(
      result.code,
      `import onEnterAction from '@1024pix/nebulix-ember/modifiers/on-enter-action';
import { PixButton } from '@1024pix/nebulix-ember';
import { hash } from '@ember/helper';
`,
    );
  });

  it("keeps and reports pix-ui imports that have no nebulix-ember equivalent", () => {
    const source = `import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixBackgroundHeader from '@1024pix/pix-ui/components/pix-background-header';
import onFooAction from '@1024pix/pix-ui/addon/modifiers/on-foo-action';
import { something } from '@1024pix/pix-ui/helpers/something';
`;

    const result = transform(source);

    assert.equal(
      result.code,
      `import { PixButton } from '@1024pix/nebulix-ember';
import PixBackgroundHeader from '@1024pix/pix-ui/components/pix-background-header';
import onFooAction from '@1024pix/pix-ui/addon/modifiers/on-foo-action';
import { something } from '@1024pix/pix-ui/helpers/something';
`,
    );
    assert.equal(result.converted, 1);
    assert.deepEqual(result.warnings, [
      {
        line: 2,
        statement:
          "import PixBackgroundHeader from '@1024pix/pix-ui/components/pix-background-header';",
      },
      {
        line: 3,
        statement:
          "import onFooAction from '@1024pix/pix-ui/addon/modifiers/on-foo-action';",
      },
      {
        line: 4,
        statement:
          "import { something } from '@1024pix/pix-ui/helpers/something';",
      },
    ]);
  });

  it("leaves an already migrated file untouched", () => {
    const source = `import { PixButton, PixIcon } from '@1024pix/nebulix-ember';
import { hash } from '@ember/helper';
`;

    const result = transform(source);

    assert.equal(result.code, source);
    assert.equal(result.converted, 0);
  });
});
