export function testPlugin(options = {}) {
  return {
    /** Unique name used for de-duplication/overrides */
    name: 'test-test-test-plugin',

    /** Early adjustments before any clone/style work. */
    async beforeSnap(context) {
      console.log('beforeSnap');
    },

    /** Before subtree cloning (use sparingly if touching the live DOM). */
    async beforeClone(context) {
      console.log('beforeClone');
    },

    /** After subtree cloning (safe to modify the cloned tree). */
    async afterClone(context) {
      console.log('afterClone');
      console.log({ element: context.element, clone: context.clone });
    },

    /** Right before serialization (SVG/dataURL). */
    async beforeRender(context) {},

    /** After serialization; inspect context.svgString/context.dataURL if needed. */
    async afterRender(context) {},

    /** Before EACH export call (toPng/toSvg/toBlob/...). */
    async beforeExport(context) {},

    /** Runs ONCE after the FIRST export finishes (cleanup). */
    async afterSnap(context) {},
  };
}
