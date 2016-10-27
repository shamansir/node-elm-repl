module.exports = {

    version: function(major, minor, patch) {
        return {
            major: major, minor: minor, patch: patch
        };
    },

    exports: function(list) {
        return list.map(function(item) {
            return {
                'path': item
            }
        })
    },

    imports: function(list) {
        return list.map(function(item) {
            if (typeof item === 'string' || item instanceof String) {
                return {
                    type: 0,
                    name: item
                }
            } else {
                var name = Object.keys(item)[0];
                return {
                    type: 2,
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

    complexType: function(user, project, name, subName) {
        return {
            type: 'type',
            def: {
                user: user,
                project: project,
                name: name,
                subName: subName || name
            }
        };
    },

    aliased: function(type, list) {
        return {
            type: 'aliased',
            def: type.def,
            list: list
        };
    },

};
