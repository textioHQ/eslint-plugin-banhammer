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
            return fn.split('.');
        });

        var identifiers = restrictedCalls.map(function(names) {
            return names.slice(-1)[0];
        });

        return {
            Identifier: function(node) {
                var og = node;
                var index = identifiers.indexOf(node.name);

                if (index === -1 && node.parent && node.parent.type === 'MemberExpression' && node.parent.object && node.parent.object.name && node.name !== node.parent.object.name) {
                    index = identifiers.indexOf(node.parent.object.name);
                    for (var i = 0; i < identifiers.length; i++) {
                        if (identifiers[i] === '*' && restrictedCalls[i].slice(-2, -1)[0] === node.parent.object.name) {
                            index = i;
                            node = node.parent;
                            break;
                        }
                    }
                }

                if (index !== -1) {
                    var shouldBlock = false;
                    var toMatch = restrictedCalls[index].slice(0, -1);
                    toMatch.reverse();
                    var ancestors = context.getAncestors().slice();
                    ancestors.reverse();

                    if (toMatch.length === 0) {
                        if (ancestors.length > 0) {
                            var ancestor = ancestors[0];
                            if (ancestors[0].type === 'MemberExpression' && ancestors[0].object && ancestors[0].object.name === 'window') {
                                ancestor = ancestors[1];
                            }
                            shouldBlock = ancestor.type === 'CallExpression';
                        }
                    }
                    else if (ancestors.length >= toMatch.length) {
                        var valid = true;
                        for (var i = 0; i < toMatch.length - 1; i++) {
                            if (ancestors[i].type !== 'MemberExpression' || ancestors[i].object.property.name !== toMatch[i]) {
                                valid = false;
                                break;
                            }
                        }

                        if (valid) {
                            var root = ancestors[i];
                            if ((root.type === 'CallExpression' && root.callee.object && root.callee.object.object && root.callee.object.object.name === toMatch[i]) ||
                            (root.type === 'MemberExpression' && root.object.name === toMatch[i] && root.parent && root.parent.type === 'CallExpression')) {
                                shouldBlock = true;
                            }

                        }
                    }

                    if (shouldBlock) {
                        context.report(node, restrictedCalls[index].join('.') + ' is not allowed');
                    }
                }
            },
        };
    }
};
