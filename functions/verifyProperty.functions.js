const verifyProperty = async (sessionData, contentData) => {
  const validPropertyIDs = sessionData.map((obj) => {
    const { property } = obj;
    return property.propertyID;
  });
  const requestPropertyIDs = contentData.map((obj) => {
    const { property } = obj;
    return property.propertyID;
  });
  const hasAllPropertyID = requestPropertyIDs.every((value) =>
    validPropertyIDs.includes(value),
  );
  return hasAllPropertyID;
};
module.exports = verifyProperty;
