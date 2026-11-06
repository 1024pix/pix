/**
 * Gives a function computing its result once per input, by reference: the
 * same object gives the same result back, without computing it again. The
 * results are held as long as their input lives.
 *
 * For values derived from a shared, immutable object, such as the learning
 * content lists: the caller must not change the result, which is shared too.
 */
export const memoizeByReference = <Input extends object, Output>(
  compute: (input: Input) => Output,
): ((input: Input) => Output) => {
  const results = new WeakMap<Input, Output>();

  return (input) => {
    if (results.has(input)) return results.get(input) as Output;

    const result = compute(input);
    results.set(input, result);

    return result;
  };
};
