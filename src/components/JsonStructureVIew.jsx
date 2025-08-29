import { analyzeJsonStructure } from "../utils/analyzeJsonStructure";

export const JsonStructureView = ({ data }) => {
  const structure = analyzeJsonStructure(data);

  const renderStructure = (struct, level = 0) => {
    const indent = "  ".repeat(level);

    if (struct.type === "object") {
      return (
        <div className="font-mono text-sm">
          <span className="text-purple-600">{"{"}</span>
          {Object.entries(struct.properties).map(
            ([key, value], index, array) => (
              <div key={key} className="ml-4">
                <span className="text-green-600">"{key}"</span>
                <span className="text-gray-600">: </span>
                {renderStructure(value, level + 1)}
                {index < array.length - 1 && (
                  <span className="text-gray-600">,</span>
                )}
              </div>
            )
          )}
          <span className="text-purple-600">{"}"}</span>
        </div>
      );
    }

    if (struct.type === "array") {
      return (
        <div className="font-mono text-sm">
          <span className="text-blue-600">[</span>
          {struct.items !== "empty" && (
            <div className="ml-4">
              {renderStructure(struct.items, level + 1)}
              <span className="text-gray-400"> // {struct.length} items</span>
            </div>
          )}
          <span className="text-blue-600">]</span>
        </div>
      );
    }

    return (
      <span
        className={`${
          struct.type === "string"
            ? "text-orange-600"
            : struct.type === "number"
            ? "text-blue-600"
            : struct.type === "boolean"
            ? "text-red-600"
            : "text-gray-600"
        }`}
      >
        {struct.type}
        {struct.example !== undefined &&
          ` (ej: ${String(struct.example).substring(0, 20)}${
            String(struct.example).length > 20 ? "..." : ""
          })`}
      </span>
    );
  };

  return (
    <div className="p-4 bg-gray-50 rounded">{renderStructure(structure)}</div>
  );
};
