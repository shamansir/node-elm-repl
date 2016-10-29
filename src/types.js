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
    if (t.type === 'var') { return t.name; }
    if ((t.type === 'type') ||
        (t.type === 'aliased')) {
        return t.def.subName ? (t.def.name + '.' + t.def.subName) : t.def.name;
    }
    if (t.type === 'lambda') {
        return ((t.left.type !== 'lambda') ? stringify(t.left) : '(' + stringify(t.left) + ')')
            + ' -> ' + stringify(t.right);
    }
    if (t.type === 'app') {
        if ((t.subject.type === 'type') && (t.subject.def.name.indexOf('_Tuple') === 0)) {
            return '( ' + t.object.map(stringify).join(', ') + ' )';
        } else {
            return stringify(t.subject)
                + ' ' + t.object.map(stringify).join(' ');
        }
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
