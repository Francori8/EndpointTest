export const validateStructure = (
  actual,
  expected,
  path = "",
  validateAllArrayItems = true
) => {
  const results = [];

  if (expected && typeof expected === "object" && expected.nullable) {
    if (actual === null) {
      return results;
    }
    expected = expected.type;
  }

  if (typeof expected === "string") {
    if (typeof actual !== expected && actual !== null) {
      results.push({
        path: path || "root",
        expected,
        actual: typeof actual,
        status: "error",
      });
    }
  } else if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      results.push({
        path,
        expected: "array",
        actual: typeof actual,
        status: "error",
      });
    } else if (expected.length > 0) {
      if (actual.length === 0) {
        // Array vacío - solo verificar que es array
        results.push({
          path,
          expected: "non-empty array",
          actual: "empty array",
          status: "warning",
        });
      } else {
        // Validar solo el primer elemento si validateAllArrayItems es false
        if (validateAllArrayItems) {
          // Validar TODOS los elementos
          actual.forEach((item, index) => {
            const itemResults = validateStructure(
              item,
              expected[0],
              `${path}[${index}]`,
              validateAllArrayItems
            );
            results.push(...itemResults);
          });
        } else {
          // Validar solo el PRIMER elemento
          const itemResults = validateStructure(
            actual[0],
            expected[0],
            `${path}[0]`,
            validateAllArrayItems
          );
          results.push(...itemResults);
        }
      }
    }
  } else if (typeof expected === "object" && expected !== null) {
    if (
      typeof actual !== "object" ||
      actual === null ||
      Array.isArray(actual)
    ) {
      results.push({
        path,
        expected: "object",
        actual: Array.isArray(actual) ? "array" : typeof actual,
        status: "error",
      });
    } else {
      Object.keys(expected).forEach((key) => {
        const newPath = path ? `${path}.${key}` : key;
        if (actual.hasOwnProperty(key)) {
          const propResults = validateStructure(
            actual[key],
            expected[key],
            newPath,
            validateAllArrayItems
          );
          results.push(...propResults);
        } else {
          results.push({
            path: newPath,
            expected: "exists",
            actual: "missing",
            status: "error",
          });
        }
      });

      Object.keys(actual).forEach((key) => {
        if (!expected.hasOwnProperty(key)) {
          results.push({
            path: path ? `${path}.${key}` : key,
            expected: "none",
            actual: "exists",
            status: "warning",
          });
        }
      });
    }
  }

  return results;
};
