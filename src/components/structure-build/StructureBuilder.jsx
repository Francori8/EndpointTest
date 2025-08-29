import { useState, useEffect, useCallback } from "react";
import NestedFields from "./NestedFields";

const StructureBuilder = ({ onStructureChange, initialStructure }) => {
  const [structure, setStructure] = useState(initialStructure || []);

  // Solo actualizar cuando initialStructure cambie realmente
  useEffect(() => {
    if (initialStructure && initialStructure.length > 0) {
      setStructure(initialStructure);
    }
  }, [initialStructure]);

  const emitStructure = useCallback(
    (struct) => {
      const buildJsonStructure = (fields) => {
        const result = {};
        fields.forEach((item) => {
          if (item.key.trim()) {
            let typeDefinition;

            if (item.type === "object") {
              const nestedStructure = buildJsonStructure(item.fields);
              typeDefinition = item.isArray
                ? [nestedStructure]
                : nestedStructure;
            } else {
              typeDefinition = item.isArray ? [item.type] : item.type;
            }

            if (item.nullable) {
              result[item.key] = { type: typeDefinition, nullable: true };
            } else {
              result[item.key] = typeDefinition;
            }
          }
        });
        return result;
      };

      if (struct.length > 0) {
        const jsonStructure = buildJsonStructure(struct);
        onStructureChange(JSON.stringify(jsonStructure, null, 2));
      } else {
        onStructureChange("");
      }
    },
    [onStructureChange]
  );

  useEffect(() => {
    emitStructure(structure);
  }, [structure, emitStructure]);

  // Función para limpiar el builder desde dentro
  const clearBuilder = () => {
    setStructure([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Construir Estructura Esperada:</h3>
        {structure.length > 0 && (
          <button
            onClick={clearBuilder}
            className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
          >
            🗑️ Limpiar Builder
          </button>
        )}
      </div>

      <NestedFields fields={structure} onUpdate={setStructure} />

      {structure.length === 0 && (
        <p className="text-gray-500 text-sm">
          Agrega campos para definir la estructura esperada
        </p>
      )}
    </div>
  );
};

export default StructureBuilder;
