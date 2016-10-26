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
            return {
                type: 0,
                name: item
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

    complexType: function(user, project, name) {
        return {
            type: 'type',
            def: {
                user: user,
                project: project,
                name: name,
                name2: name
            }
        };
    }

};
