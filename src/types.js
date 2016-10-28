function Types(iface) {
    this.types = extractTypes(iface.types);
}

Types.prototype.find = function(name) {
    return this.types[name];
}

Types.prototype.findAll = function(list) {
    return list.map(function(name) {
        return this.types[name];
    }.bind(this))
}

function stringify(t) {
    if (t.type === 'var') return t.name;
    if (t.type === 'type') return t.def.name;
    if (t.type === 'lambda') {
        return stringify(t.left) + ' -> ' + stringify(t.right);
    }
    if (t.type === 'app') {
        return stringify(t.subject) + ' ' + t.object.map(stringify).join('.');
    }
}

Types.stringify = stringify;

Types.stringifyAll = function(types) {
    return types.map(Types.stringify);
}

function extractTypes(ifaceTypes) {
    var typeTable = {};
    ifaceTypes.forEach(function(typeData) {
        typeTable[typeData.name] = typeData.value;
    });
    return typeTable;
}

module.exports = Types;
