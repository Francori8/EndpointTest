export const convertJsonToBuilderFormat = (json) => {
  const convert = (obj) => {
    return Object.entries(obj).map(([key, value]) => {
      const field = {
        key,
        type: "string",
        isArray: false,
        nullable: false,
        fields: [],
      };

      if (value && typeof value === "object" && value.nullable) {
        field.nullable = true;
        value = value.type;
      }

      if (Array.isArray(value)) {
        field.isArray = true;
        if (typeof value[0] === "string") {
          field.type = value[0];
        } else if (typeof value[0] === "object") {
          field.type = "object";
          field.fields = convert(value[0]);
        }
      } else if (typeof value === "object") {
        field.type = "object";
        field.fields = convert(value);
      } else {
        field.type = value;
      }

      return field;
    });
  };

  return convert(json);
};
