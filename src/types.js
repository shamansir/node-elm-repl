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
        const name = t.def.subNames ? (t.def.name + '.' + t.def.subNames[0]) : t.def.name;
        return t.msgvar ? (name + ' ' + t.msgvar) : name;
    }
    if (t.type === 'lambda') {
        return ((t.left.type !== 'lambda') ? stringify(t.left) : '(' + stringify(t.left) + ')')
            + ' -> ' + stringify(t.right);
    }
    if (t.type === 'app') {
        if ((t.subject.type === 'type') && (t.subject.def.name.indexOf('_Tuple') === 0)) {
            return '( ' + t.object.map(stringify).join(', ') + ' )';
        } else if ((t.subject.type === 'type') && (t.subject.def.name === 'List')) {
            return 'List ' + t.object.map(function(t) {
                return (t.type === 'aliased') ? '(' + stringify(t) + ')' : stringify(t);
            }).join(' ');
        } else {
            return stringify(t.subject)
                + ' ' + t.object.map(stringify).join(' ');
        }
    }
    if (t.type === 'record') {
        return '{ ' + t.fields.map(function(pair) {
            return pair.name + ' : ' + stringify(pair.node);
        }).join(', ') + ' }';
    }
}

Types.stringify = stringify;

Types.stringifyAll = function(types) {
    return types ? types.map(Types.stringify) : [];
}

function extractTypes(ifaceTypes) {
    var typeTable = {};
    ifaceTypes.forEach(function(typeData) {
        typeTable[typeData.name] = typeData.value;
    });
    return typeTable;
}

module.exports = Types;
