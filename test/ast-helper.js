// Novel way to drive behavior of Smart Contract.

// From Consensys Academy "Supply Chain Exercise"
const CDTYPE = "ContractDefinition";
const CNAME = "LandTitle";
const contractDefn = ca =>
  ca.ast.nodes.find(n => n.nodeType === CDTYPE && n.name === CNAME);

const titles = (ca) => {
  const title = contractDefn(ca).nodes.find((n) => n.name === "Title");
  if (!title) return null;

  return title
    .members
    .map((t) => ({
      name: t.name,
      nodeType: t.nodeType,
      stateVariable: t.stateVariable,
      type: t.typeName.name,
      mutability: t.typeName.stateMutability,
    }));
};

const isDefined = members => variableName => {
  return members 
    ? members.find((title) => title.name === variableName) 
    : null;
};

const isPayable = members => variableName => {
  if (members === undefined) return false;
  const definition = members.find((title) => title.name === variableName);
  return definition && definition.mutability === "payable";
};

const isType = members => variableName => type => {
  if (members === undefined) return false;
  const definition = members.find((title) => title.name === variableName);
  return definition && definition.type === type;
};

module.exports = {
  titles,
  isDefined,
  isPayable,
  isType,
};
