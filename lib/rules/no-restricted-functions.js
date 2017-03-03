/**
 * @fileoverview disallow certain global functions from being called
 * @author Anil Kulkarni
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "disallow certain global functions from being called",
            category: "Functions",
            recommended: false,
        },
        fixable: null,
        schema: {
            type: "array",
            items: {
                type: "string"
            },
            uniqueItems: true,
        },
    },

    create: function(context) {
        var restrictedCalls = context.options;
        if (restrictedCalls.length === 0) {
            return {};
        }

        restrictedCalls = restrictedCalls.map(function(fn) {
            var identifiers = fn.split('.');
            if (identifiers[0] === 'window') {
                identifiers.shift();
            }
            return identifiers;
        });

        /**
         * Starts at a call expression and walks up the tree of MemberExpressions,
         * recording the name of each step.
         *
         * E.g.
         *  foo.bar.baz() will generate ['foo', 'bar', 'baz']
         */
        function getCallPath(node) {
            var callIdentifiers = [];
            var currentNode = node.callee;
            while(currentNode.type === 'MemberExpression') {
                var property = currentNode.property;
                if (property.type !== 'Identifier') return;
                callIdentifiers.push(property.name);
                currentNode = currentNode.object;
            }
            if (currentNode.type !== 'Identifier') return;
            callIdentifiers.push(currentNode.name);
            callIdentifiers.reverse();
            if (callIdentifiers[0] === 'window') {
                callIdentifiers.shift();
            }
            return callIdentifiers;
        }

        /**
         * Checks if a restriced path matches a path. They match if
         * they are the same length and if each part match. Parts match
         * if they are the same or if the restricted path contains an '*' at
         * that part.
         */
        function pathsMatch(restrictedPath, path) {
            if (restrictedPath.length !== path.length) {
                return false;
            }
            for(var i = 0; i < restrictedPath.length; i++) {
                if (restrictedPath[i] !== path[i] && restrictedPath[i] !== '*') {
                    return false;
                }
            }
            return true;
        }

        return {
            CallExpression: function(node) {
                var callPath = getCallPath(node);

                if (!callPath) return;

                for(var i = 0; i < restrictedCalls.length; i++) {
                    if (pathsMatch(restrictedCalls[i], callPath)) {
                        context.report(node.callee, restrictedCalls[i].join('.') + ' is not allowed');
                        return;
                    }
                }
            }
        };
    }
}
