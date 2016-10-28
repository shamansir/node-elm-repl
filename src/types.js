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

function extractTypes(ifaceTypes) {
    var typeTable = {};
    ifaceTypes.forEach(function(typeData) {
        typeTable[typeData.name] = extractType(typeData.value);
    });
    return typeTable;
}

const extractionTable = {
    'var': function(v) { return [ v.name ]; },
    'type': function(t) { return [ t.def.name ]; },
    'lambda': function(l) {
        return extractionTable[l.right.type](l.right)
            .concat(extractionTable[l.left.type](l.left)); },
    'app': function(a) {
        return extractionTable[a.subject.type](a.subject)
            .concat(a.object.map(function(obj) {
                return extractionTable[obj.type](obj); })
            );
    },
    'record': function(r) { return [ r ]; }
}

function extractType(ifaceType) {
    return extractionTable[ifaceType.type](ifaceType);
}

module.exports = Types;
