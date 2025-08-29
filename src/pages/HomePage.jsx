import { useState, useEffect } from "react";
import { JsonStructureView } from "../components/JsonStructureVIew";
import { StructureTestView } from "../components/structure-test";

const ERROR_NAME = {
  TypeError: "TypeError",
  SyntaxError: "SyntaxError",
};

const ERROR_MESSAGE = {
  [ERROR_NAME.TypeError]: "Fallo el fetch",
  [ERROR_NAME.SyntaxError]: "Endpoint no valido",
};

// Métodos HTTP que requieren body
const METHODS_WITH_BODY = ["POST", "PUT", "PATCH"];

export default function HomePage() {
  const [endpoint, setEndpoint] = useState("");
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState("raw");
  const [expectedStructure, setExpectedStructure] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [requestBody, setRequestBody] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [responseHeaders, setResponseHeaders] = useState([]);
  const [authHeader, setAuthHeader] = useState(null);
  const [includeBearer, setIncludeBearer] = useState(true); // Nuevo estado

  useEffect(() => {
    const saved = localStorage.getItem("expectedStructure");
    if (saved) {
      setExpectedStructure(saved);
    }
  }, []);

  useEffect(() => {
    if (expectedStructure) {
      localStorage.setItem("expectedStructure", expectedStructure);
    } else {
      localStorage.removeItem("expectedStructure");
    }
  }, [expectedStructure]);

  const handleClickExecuteEndpoint = async () => {
    try {
      if (endpoint.trim() === "") {
        setResponse({ status: "400", data: "El campo debe ser no nulo" });
        return;
      }

      // Configurar opciones de la solicitud
      const requestOptions = {
        method: httpMethod,
        headers: {},
      };

      // Agregar body si el método lo requiere
      if (METHODS_WITH_BODY.includes(httpMethod) && requestBody.trim() !== "") {
        try {
          requestOptions.body = JSON.stringify(JSON.parse(requestBody));
          requestOptions.headers["Content-Type"] = "application/json";
        } catch (error) {
          setResponse({ status: "400", data: "JSON en body no válido" });
          return;
        }
      }

      // Agregar token de autorización si está presente
      console.log(authToken);
      if (authToken.trim() !== "") {
        let tokenValue = authToken.trim();

        // Limpiar el token si ya tiene "Bearer" pero no queremos incluirlo
        if (!includeBearer) {
          tokenValue = tokenValue.replace(/^Bearer\s+/i, "");
        }
        // Agregar "Bearer" si queremos incluirlo pero no está presente
        else if (!/^Bearer\s+/i.test(tokenValue)) {
          tokenValue = `Bearer ${tokenValue}`;
        }

        requestOptions.headers["Authorization"] = tokenValue;
      }
      console.log(requestOptions);
      const response = await fetch(endpoint, requestOptions);
      const data = await response.json();

      // Capturar headers de respuesta
      const headers = [];
      let authHeaderValue = null;

      response.headers.forEach((value, name) => {
        headers.push({ name, value });

        // Capturar específicamente el header de Authorization
        if (name.toLowerCase() === "authorization") {
          authHeaderValue = { name, value };
        }
      });

      setResponseHeaders(headers);
      setAuthHeader(authHeaderValue);
      setResponse({ status: response.status, data });
      setActiveTab("raw");
    } catch (error) {
      setResponse({
        status: "400",
        data: ERROR_MESSAGE[error.name] || "Error desconocido",
      });
    }
  };

  const tabs = [
    { id: "raw", label: "JSON Raw" },
    { id: "structure", label: "Estructura" },
    { id: "tests", label: "Tests" },
    { id: "headers", label: "Headers" },
  ];

  return (
    <main className="flex flex-col items-center min-h-screen p-4 w-full">
      <h1 className="text-2xl font-bold mb-6">Pruebas de Endpoint</h1>

      <section className="flex flex-col gap-4 w-full max-w-4xl">
        <div className="flex gap-4 items-center">
          <div className="flex flex-col">
            <label htmlFor="httpMethod" className="font-semibold">
              Método HTTP
            </label>
            <select
              id="httpMethod"
              className="border border-gray-300 rounded px-4 py-2"
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="endpoint" className="font-semibold">
              Endpoint
            </label>
            <input
              id="endpoint"
              type="text"
              placeholder="Coloque aqui su endpoint..."
              className="border border-gray-300 rounded px-4 py-2 w-96"
              onChange={(e) => setEndpoint(e.target.value)}
              value={endpoint}
            />
          </div>

          <button
            className="bg-red-200 cursor-pointer py-2 px-6 border-4 rounded-2xl border-amber-100 hover:bg-red-300 transition-colors whitespace-nowrap mt-6"
            onClick={handleClickExecuteEndpoint}
          >
            Ejecutar
          </button>
        </div>

        {METHODS_WITH_BODY.includes(httpMethod) && (
          <div className="mt-4">
            <label htmlFor="requestBody" className="font-semibold">
              Body (JSON)
            </label>
            <textarea
              id="requestBody"
              placeholder='Ej: {"key": "value"}'
              className="border border-gray-300 rounded px-4 py-2 w-full h-32 font-mono text-sm"
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
            />
          </div>
        )}

        <div className="mt-4">
          <button
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => setShowAuth(!showAuth)}
          >
            {showAuth ? "Ocultar" : "Mostrar"} configuración de autenticación
          </button>

          {showAuth && (
            <div className="mt-2 space-y-2">
              <label htmlFor="authToken" className="font-semibold">
                Token de autorización
              </label>
              <input
                id="authToken"
                type="text"
                placeholder="Ingrese el token..."
                className="border border-gray-300 rounded px-4 py-2 w-full"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
              />

              <div className="flex items-center mt-2">
                <input
                  id="includeBearer"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={includeBearer}
                  onChange={(e) => setIncludeBearer(e.target.checked)}
                />
                <label
                  htmlFor="includeBearer"
                  className="ml-2 text-sm text-gray-700"
                >
                  Incluir prefijo "Bearer" (formato estándar)
                </label>
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {includeBearer
                  ? "El token se enviará como: Bearer [token]"
                  : "El token se enviará sin prefijo: [token]"}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 w-full max-w-6xl">
        {response && (
          <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h2 className="font-bold">Respuesta:</h2>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong> {response.status}
              </p>

              <div className="flex mt-2 border-b border-gray-300 -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full overflow-x-auto bg-white">
              {activeTab === "raw" && (
                <pre className="p-4 text-sm min-w-max">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              )}

              {activeTab === "structure" && (
                <div className="p-4">
                  <JsonStructureView data={response.data} />
                </div>
              )}

              {activeTab === "tests" && (
                <StructureTestView
                  response={response}
                  expectedStructure={expectedStructure}
                  onStructureChange={setExpectedStructure}
                />
              )}

              {activeTab === "headers" && (
                <div className="p-4">
                  {authHeader && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h3 className="font-bold text-yellow-800 mb-2">
                        Header de Autorización Detectado:
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-yellow-700">
                          Nombre:
                        </span>
                        <span className="col-span-2 font-mono text-yellow-800 break-all">
                          {authHeader.name}
                        </span>

                        <span className="font-medium text-yellow-700">
                          Valor:
                        </span>
                        <span className="col-span-2 font-mono text-yellow-800 break-all">
                          {authHeader.value}
                        </span>
                      </div>
                    </div>
                  )}

                  <h3 className="font-bold mb-3">
                    Todos los Headers de Respuesta:
                  </h3>
                  {responseHeaders.length > 0 ? (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Header
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valor
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {responseHeaders.map((header, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {header.name}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500 break-all">
                                {header.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No se recibieron headers en la respuesta.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
