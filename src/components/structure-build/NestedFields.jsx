const NestedFields = ({ fields, onUpdate, path = "" }) => {
  const addField = () => {
    onUpdate([
      ...fields,
      { key: "", type: "string", isArray: false, nullable: false, fields: [] },
    ]);
  };

  const updateField = (index, field, value) => {
    const newFields = [...fields];
    newFields[index][field] = value;
    onUpdate(newFields);
  };

  const removeField = (index) => {
    onUpdate(fields.filter((_, i) => i !== index));
  };

  const updateNestedFields = (index, nestedFields) => {
    const newFields = [...fields];
    newFields[index].fields = nestedFields;
    onUpdate(newFields);
  };

  return (
    <div className="ml-4 md:ml-6 pl-2 md:pl-4 border-l-2 border-gray-300 space-y-2">
      {fields.map((field, index) => (
        <div key={index} className="p-2 bg-gray-50 rounded space-y-2">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-wrap">
            <input
              type="text"
              placeholder="nombre del campo"
              value={field.key}
              onChange={(e) => updateField(index, "key", e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full sm:w-32 text-sm"
            />

            <select
              value={field.type}
              onChange={(e) => updateField(index, "type", e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full sm:w-28 text-sm"
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="object">object</option>
            </select>

            <div className="flex gap-2">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={field.isArray}
                  onChange={(e) =>
                    updateField(index, "isArray", e.target.checked)
                  }
                  className="mr-1"
                />
                Array
              </label>

              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={field.nullable}
                  onChange={(e) =>
                    updateField(index, "nullable", e.target.checked)
                  }
                  className="mr-1"
                />
                Nullable
              </label>
            </div>

            <button
              onClick={() => removeField(index)}
              className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
            >
              ×
            </button>
          </div>

          {field.type === "object" && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campos del objeto:
              </label>
              <NestedFields
                fields={field.fields}
                onUpdate={(nestedFields) =>
                  updateNestedFields(index, nestedFields)
                }
                path={`${path}.${field.key}`}
              />
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addField}
        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
      >
        + Agregar Campo
      </button>
    </div>
  );
};

export default NestedFields;
