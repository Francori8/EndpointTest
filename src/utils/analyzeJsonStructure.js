export const analyzeJsonStructure = (data, depth = 0) => {
  if (data === null || data === undefined) {
    return { type: "null", value: "null" };
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { type: "array", items: "empty" };
    }
    // Para arrays, mostramos la estructura del primer elemento
    return {
      type: "array",
      items: analyzeJsonStructure(data[0], depth + 1),
      length: data.length,
    };
  }

  if (typeof data === "object") {
    const structure = {};
    for (const key in data) {
      structure[key] = analyzeJsonStructure(data[key], depth + 1);
    }
    return { type: "object", properties: structure };
  }

  return { type: typeof data, example: data };
};
