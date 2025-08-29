import { useState, useEffect, useRef } from "react";
import {
  StructureBuilder,
  convertJsonToBuilderFormat,
} from "../structure-build";
import { validateStructure } from "./validateStructure";
import TestResults from "./TestResults";

const StructureTestView = ({
  response,
  expectedStructure,
  onStructureChange,
}) => {
  const [testResults, setTestResults] = useState(null);
  const [validateAllArrayItems, setValidateAllArrayItems] = useState(true);
  const [builderStructure, setBuilderStructure] = useState([]);
  const [builderKey, setBuilderKey] = useState(0);
  const [lastHandledStructure, setLastHandledStructure] = useState("");
  const fileInputRef = useRef(null); // Referencia para el input file

  // Cargar estructura del localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem("builderStructure");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBuilderStructure(parsed);
      } catch (error) {
        console.error("Error loading saved structure:", error);
      }
    }
  }, []);

  // Guardar estructura en localStorage cuando cambie
  useEffect(() => {
    if (builderStructure.length > 0) {
      localStorage.setItem(
        "builderStructure",
        JSON.stringify(builderStructure)
      );
    } else {
      localStorage.removeItem("builderStructure");
    }
  }, [builderStructure]);

  const clearAllStructure = () => {
    if (
      window.confirm("¿Estás seguro de que quieres limpiar toda la estructura?")
    ) {
      localStorage.removeItem("builderStructure");
      localStorage.removeItem("expectedStructure");
      setBuilderStructure([]);
      onStructureChange("");
      setTestResults(null);
      setBuilderKey((prev) => prev + 1);
      setLastHandledStructure("");

      // También resetear el input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearTestResults = () => {
    setTestResults(null);
  };

  const clearBuilderOnly = () => {
    setBuilderStructure([]);
    onStructureChange("");
    setBuilderKey((prev) => prev + 1);
    setLastHandledStructure("");

    // Resetear el input file también
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const runTests = () => {
    if (!expectedStructure.trim()) {
      alert("Por favor, define una estructura esperada primero");
      return;
    }

    try {
      const expected = JSON.parse(expectedStructure);
      const results = validateStructure(
        response.data,
        expected,
        "",
        validateAllArrayItems
      );
      setTestResults(results);
    } catch (error) {
      alert("Error parsing expected structure: " + error.message);
    }
  };

  const importFromJson = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          const newBuilderStructure = convertJsonToBuilderFormat(json);
          setBuilderStructure(newBuilderStructure);
          onStructureChange(JSON.stringify(json, null, 2));
          setLastHandledStructure(JSON.stringify(json, null, 2));
        } catch (error) {
          alert("Error al leer el archivo JSON: " + error.message);
        }

        // Resetear el input file después de leer
        event.target.value = "";
      };
      reader.readAsText(file);
    }
  };

  // Función muy simple sin callbacks complejos
  const handleBuilderChange = (newStructureJson) => {
    if (newStructureJson !== lastHandledStructure) {
      onStructureChange(newStructureJson);
      setLastHandledStructure(newStructureJson);

      try {
        if (newStructureJson.trim()) {
          const parsed = JSON.parse(newStructureJson);
          const newBuilderStructure = convertJsonToBuilderFormat(parsed);
          setBuilderStructure(newBuilderStructure);
        } else {
          setBuilderStructure([]);
        }
      } catch (error) {
        console.log("Error parsing structure:", error);
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex gap-4 mb-4 flex-wrap">
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={validateAllArrayItems}
            onChange={(e) => setValidateAllArrayItems(e.target.checked)}
            className="mr-2"
          />
          Validar todos los elementos de arrays
        </label>

        <label className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 cursor-pointer">
          📁 Importar JSON
          <input
            ref={fileInputRef} // Agregar referencia
            type="file"
            accept=".json"
            onChange={importFromJson}
            className="hidden"
          />
        </label>

        {testResults && (
          <button
            onClick={clearTestResults}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            🗑️ Limpiar Resultados
          </button>
        )}

        {(expectedStructure || builderStructure.length > 0) && (
          <div className="flex gap-2">
            <button
              onClick={clearBuilderOnly}
              className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
            >
              🗑️ Limpiar Builder
            </button>
            <button
              onClick={clearAllStructure}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              🗑️ Limpiar Todo
            </button>
          </div>
        )}
      </div>

      <StructureBuilder
        key={builderKey}
        onStructureChange={handleBuilderChange}
        initialStructure={builderStructure}
      />

      {expectedStructure && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Estructura Generada:</h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(expectedStructure);
                alert("Estructura copiada al portapapeles");
              }}
              className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
            >
              📋 Copiar
            </button>
          </div>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {expectedStructure}
          </pre>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={runTests}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          🧪 Ejecutar Tests
        </button>

        {testResults && testResults.length > 0 && (
          <button
            onClick={clearTestResults}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            🗑️ Limpiar Resultados
          </button>
        )}
      </div>

      <TestResults
        testResults={testResults}
        onClearResults={clearTestResults}
      />
    </div>
  );
};

export default StructureTestView;
