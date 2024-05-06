import { cell, resource, resourceFactory } from 'ember-resources';

function IsLoading(arg) {
  return resource(() => {
    const isLoading = cell(false);

    if (arg.then && !arg.isSettled) {
      isLoading.set(true);
      arg.then(() => {
        isLoading.set(false);
      });
    }

    return isLoading;
  });
}
resourceFactory(IsLoading);

export { IsLoading };
