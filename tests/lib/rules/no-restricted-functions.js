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
    ],

    invalid: [
        {
            code: "window.dontCallMe()",
            options: ["window.dontCallMe"],
            errors: [{
                message: "window.dontCallMe is not allowed",
                type: "Identifier",
            }],
        },
    ]
});
