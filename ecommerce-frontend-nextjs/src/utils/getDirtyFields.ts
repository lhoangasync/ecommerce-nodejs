function getDirtyValues<T extends Record<string, any>>(
  dirtyFields: Record<string, any>,
  allValues: T
): Partial<T> {
  const dirtyValues: Record<string, any> = {};

  Object.keys(dirtyFields).forEach((key) => {
    const isDirty = dirtyFields[key];
    if (isDirty === true) {
      // primitive field changed
      dirtyValues[key] = allValues[key];
    } else if (typeof isDirty === "object" && isDirty !== null) {
      // nested object/array
      const nested = getDirtyValues(isDirty, allValues[key] ?? {});
      if (Object.keys(nested).length > 0) {
        dirtyValues[key] = nested;
      }
    }
  });

  return dirtyValues as Partial<T>;
}

export default getDirtyValues;
