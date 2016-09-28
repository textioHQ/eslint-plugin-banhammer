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
                var index = identifiers.indexOf(node.name);
                if (index !== -1) {
                    var toMatch = restrictedCalls[index].slice(0, -1);
                    toMatch.reverse();
                    var ancestors = context.getAncestors().slice();
                    ancestors.reverse();


                    var valid = true;
                    if (ancestors.length >= toMatch.length) {
                        for (var i = 0; i < toMatch.length - 1; i++) {
                            if (ancestors[i].type !== 'MemberExpression' || ancestors[i].object.property.name !== toMatch[i]) {
                                valid = false;
                                break;
                            }
                        }

                        var root = ancestors[i];
                        if (valid && (
                                    // TODO there is a better answer by checking the callee.type, but haven't had
                                    // the time yet.
                                    (root.type === 'CallExpression' && root.callee.object && root.callee.object.object && root.callee.object.object.name === toMatch[i]) ||
                                    (root.type === 'MemberExpression' && root.object.name === toMatch[i] && root.parent && root.parent.type === 'CallExpression'))){
                            context.report(node, restrictedCalls[index].join('.') + ' is not allowed');
                        }
                    }
                }
            },
        };
    }
};
