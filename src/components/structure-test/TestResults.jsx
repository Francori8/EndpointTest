const TestResults = ({ testResults, onClearResults }) => {
  if (!testResults) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Resultados de Validación:</h3>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">
            {testResults.length} issue{testResults.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={onClearResults}
            className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
          >
            🗑️ Limpiar
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {testResults.length === 0 ? (
          <div className="bg-green-100 text-green-800 p-3 rounded">
            ✅ Todos los tests pasaron correctamente
          </div>
        ) : (
          testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded ${
                result.status === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              <strong>{result.path}:</strong>{" "}
              {result.status === "error" ? "❌ " : "⚠️ "}
              Esperado: <code>{result.expected}</code>, Actual:{" "}
              <code>{result.actual}</code>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TestResults;
