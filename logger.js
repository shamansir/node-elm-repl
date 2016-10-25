function unwrapTypeNode(node) {
    if (node.type === 'lambda') {
        return '(lambda ' + unwrapTypeNode(node.left) + ' '
            + unwrapTypeNode(node.right) + ')';
    } else if (node.type === 'var') {
        return '(var ' + node.name + ')';
    } if (node.type === 'type') {
        if (node.def.user) {
            return '(type ' + node.def.user + '/' + node.def.project + ' ' +
                             node.def.name + ' ' + node.def.name2 + ')';
        } else {
            return '(type ' + node.def.name + ')';
        };
    } else if (node.type === 'app') {
        return '(app ' + unwrapTypeNode(node.subject) + ' ' +
                         node.object.map(singleNodeFormatter).map(unwrapTypeNode).join(' ') + ' )';
    } else if (node.type === 'record') {
        return '(record ' + unwrapTypeNode(node.left) + ' '
            + unwrapTypeNode(node.right) + ')';
    } else if (node.type === 'aliased') {
        return '(record ' + unwrapTypeNode(node.left) + ' '
            + unwrapTypeNode(node.right) + ' ' + unwrapTypeNode(node.value) + ')';
    }
}

function logParsedInterface(iface) {
    console.log('compiler version is', iface.version.major + '.' + iface.version.minor + '.' + iface.version.patch);
    console.log('package name is', iface.package.user + '/' + iface.package.name);
    console.log('imports:', iface.imports.length);
    var i = iface.imports.length;
    while (i--) {
        console.log('- ', '[' + i + ']', '(' + iface.imports[i].type + ')', iface.imports[i].name);
    }
    console.log('exports:', iface.exports.length);
    i = iface.exports.length;
    while (i--) {
        console.log('- ', '[' + i + ']', iface.exports[i].path.join('/'));
    }
    console.log('types:', iface.types.length);
    i = iface.types.length;
    while (i--) {
        console.log('- ', '[' + i + ']', iface.types[i].name, unwrapTypeNode(iface.types[i].value));
    }
}

module.exports = logParsedInterface;
