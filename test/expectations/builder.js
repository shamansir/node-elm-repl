module.exports = {

    version: function(major, minor, patch) {
        return {
            major: major, minor: minor, patch: patch
        };
    },

    imports: function(list) {
        return list.map(function(item) {
            return {
                'path': item
            }
        })
    },

    exports: function(list) {
        return list.map(function(item) {
            if (typeof item === 'string' || item instanceof String) {
                return {
                    type: 'single',
                    name: item
                }
            } else if (Array.isArray(item)) {
                return {
                    type: 'list',
                    name: item[0]
                }
            } else {
                var name = Object.keys(item)[0];
                return {
                    type: 'nested',
                    name: name,
                    values: item[name]
                }
            }
        })
    },

    lambda: function(left, right) {
        return {
            type: 'lambda',
            left: left,
            right: right
        };
    },

    app: function(subject, object) {
        return {
            type: 'app',
            subject: subject,
            object: object
        };
    },

    var: function(name) {
        return {
            type: 'var',
            name: name
        };
    },

    type: function(name) {
        return {
            type: 'type',
            def: { name: name }
        };
    },

    record: function(fields) {
        return {
            'type': 'record',
            'fields': Object.keys(fields).map(function(name) {
                return {
                    name: name,
                    node: fields[name]
                }
            })
        };
    },

    complexType: function(user, package, path, name) {
        return {
            type: 'type',
            def: {
                user: user,
                package: package,
                path: Array.isArray(path) ? path : [ path ],
                name: name
            }
        };
    },

    aliased: function(type, list) {
        return {
            type: 'aliased',
            def: type.def,
            list: list,
            msgvar: null,
            msgnode: null
        };
    },

};
