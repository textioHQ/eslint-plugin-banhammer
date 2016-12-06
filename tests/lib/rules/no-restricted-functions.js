/**
 * @fileoverview disallow certain global functions from being called
 * @author Anil Kulkarni
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-restricted-functions"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("no-restricted-functions", rule, {

    valid: [
        {
            code: "foo.thisIsOkay()",
            options: ["thisIsOkay"],
        },
        {
            code: "foo();",
            options: ["foo.*"],
        },
        {
            code: "var foo;",
            options: ["foo.*"],
        },
    ],

    invalid: [
        {
            code: "dontCallMe()",
            options: ["dontCallMe"],
            errors: [{
                message: "dontCallMe is not allowed",
                type: "Identifier",
            }],
        },
        {
            code: "window.dontCallMe()",
            options: ["dontCallMe"],
            errors: [{
                message: "dontCallMe is not allowed",
                type: "MemberExpression",
            }],
        },
        {
            code: "localStorage.setItem('foo', 'bar');",
            options: ["localStorage.*"],
            errors: [{
                message: "localStorage.* is not allowed",
                type: "MemberExpression",
            }],
        },
        {
            code: "it.only()",
            options: ["describe.only", "it.only"],
            errors: [{
                message: "it.only is not allowed",
                type: "MemberExpression",
            }],
        }
    ]
});
