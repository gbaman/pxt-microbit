///<reference path='blockly.d.ts'/>
///<reference path='touchdevelop.d.ts'/>
/// <reference path="../built/pxtlib.d.ts" />
var B = Blockly;
var pxt;
(function (pxt) {
    var blocks;
    (function (blocks) {
        // A series of utility functions for constructing various J* AST nodes.
        var Helpers;
        (function (Helpers) {
            // Digits are operators...
            function mkDigit(x) {
                return mkOp(x);
            }
            Helpers.mkDigit = mkDigit;
            function mkArrayLiteral(args) {
                return {
                    nodeType: "arrayLiteral",
                    id: null,
                    values: args
                };
            }
            Helpers.mkArrayLiteral = mkArrayLiteral;
            function mkNumberLiteral(x) {
                return {
                    nodeType: "numberLiteral",
                    id: null,
                    value: x
                };
            }
            Helpers.mkNumberLiteral = mkNumberLiteral;
            function mkBooleanLiteral(x) {
                return {
                    nodeType: "booleanLiteral",
                    id: null,
                    value: x
                };
            }
            Helpers.mkBooleanLiteral = mkBooleanLiteral;
            function mkStringLiteral(x) {
                return {
                    nodeType: "stringLiteral",
                    id: null,
                    value: x
                };
            }
            Helpers.mkStringLiteral = mkStringLiteral;
            function mkOp(x) {
                return {
                    nodeType: "operator",
                    id: null,
                    op: x
                };
            }
            Helpers.mkOp = mkOp;
            // A map from "classic" [JPropertyRef]s to their proper [parent].
            var knownPropertyRefs = {
                "=": "Unknown",
            };
            ["==", "!=", "<", "<=", ">", ">=", "+", "-", "/", "*"].forEach(function (x) { return knownPropertyRefs[x] = "Number"; });
            ["&&", "||", "!"].forEach(function (x) { return knownPropertyRefs[x] = "Boolean"; });
            function mkPropertyRef(x, p) {
                return {
                    nodeType: "propertyRef",
                    id: null,
                    name: x,
                    parent: mkTypeRef(p),
                };
            }
            Helpers.mkPropertyRef = mkPropertyRef;
            function mkCall(name, parent, args, property) {
                if (property === void 0) { property = false; }
                return {
                    nodeType: "call",
                    id: null,
                    name: name,
                    parent: parent,
                    args: args,
                    property: property
                };
            }
            Helpers.mkCall = mkCall;
            var librarySymbol = "♻";
            var libraryName = "micro:bit";
            var librarySingleton = mkSingletonRef(librarySymbol);
            function mkSingletonRef(name) {
                return {
                    nodeType: "singletonRef",
                    id: null,
                    name: name,
                    type: mkTypeRef(name)
                };
            }
            // A library "♻ foobar" is actually a call to the method "foobar" of the
            // global singleton object "♻".
            function mkLibrary(name) {
                return mkCall(name, mkTypeRef(librarySymbol), [librarySingleton]);
            }
            Helpers.mkLibrary = mkLibrary;
            // Call function [name] from the standard device library with arguments
            // [args].
            function stdCall(name, args) {
                return mkCall(name, mkTypeRef(libraryName), [mkLibrary(libraryName)].concat(args));
            }
            Helpers.stdCall = stdCall;
            // Call extension method [name] on the first argument
            function extensionCall(name, args, property) {
                return mkCall(name, mkTypeRef("call"), args, property);
            }
            Helpers.extensionCall = extensionCall;
            function mkNamespaceRef(lib, namespace) {
                return {
                    nodeType: "singletonRef",
                    id: null,
                    libraryName: lib,
                    name: namespace,
                    type: mkTypeRef(namespace)
                };
            }
            // Call function [name] from the specified [namespace] in the micro:bit
            // library.
            function namespaceCall(namespace, name, args) {
                return mkCall(name, mkTypeRef(libraryName), [mkNamespaceRef(libraryName, namespace)].concat(args));
            }
            Helpers.namespaceCall = namespaceCall;
            // Call a function from the Math library. Apparently, the Math library is a
            // different object than other libraries, so its AST typeesentation is not the
            // same. Go figure.
            function mathCall(name, args) {
                return mkCall(name, mkTypeRef("Math"), [mkSingletonRef("Math")].concat(args));
            }
            Helpers.mathCall = mathCall;
            function stringCall(name, args) {
                return mkCall(name, mkTypeRef("String"), args);
            }
            Helpers.stringCall = stringCall;
            function booleanCall(name, args) {
                return mkCall(name, mkTypeRef("Boolean"), args);
            }
            Helpers.booleanCall = booleanCall;
            function mkGlobalRef(name) {
                return mkCall(name, mkTypeRef("data"), [mkSingletonRef("data")]);
            }
            Helpers.mkGlobalRef = mkGlobalRef;
            // Assumes its parameter [p] is in the [knownPropertyRefs] table.
            function mkSimpleCall(p, args) {
                assert(knownPropertyRefs[p] != undefined);
                return mkCall(p, mkTypeRef(knownPropertyRefs[p]), args);
            }
            Helpers.mkSimpleCall = mkSimpleCall;
            function mkTypeRef(t) {
                // The interface is a lie -- actually, this type is just string.
                return t;
            }
            Helpers.mkTypeRef = mkTypeRef;
            function mkLTypeRef(t) {
                return JSON.stringify({ o: t, l: libraryName });
            }
            Helpers.mkLTypeRef = mkLTypeRef;
            function mkGTypeRef(t) {
                return JSON.stringify({ g: t });
            }
            Helpers.mkGTypeRef = mkGTypeRef;
            function mkVarDecl(x, t) {
                return {
                    nodeType: "data",
                    id: null,
                    name: x,
                    type: t,
                    comment: "",
                    isReadonly: false,
                    isTransient: true,
                    isCloudEnabled: false,
                };
            }
            Helpers.mkVarDecl = mkVarDecl;
            // Generates a local definition for [x] at type [t]; this is not enough to
            // properly define a variable, though (see [mkDefAndAssign]).
            function mkDef(x, t) {
                assert(!!x);
                return {
                    nodeType: "localDef",
                    id: null,
                    name: x,
                    type: t,
                    isByRef: false,
                };
            }
            Helpers.mkDef = mkDef;
            // Generates a reference to bound variable [x]
            function mkLocalRef(x, t) {
                assert(!!x);
                return {
                    nodeType: "localRef",
                    id: null,
                    name: x,
                    localId: null,
                    type: t
                };
            }
            Helpers.mkLocalRef = mkLocalRef;
            // [defs] are the variables that this expression binds; this means that this
            // expression *introduces* new variables, whose scope runs until the end of
            // the parent block (see comments for [JExprHolder]).
            function mkExprHolder(defs, tree) {
                return {
                    nodeType: "exprHolder",
                    id: null,
                    tokens: null,
                    tree: tree,
                    locals: defs,
                };
            }
            Helpers.mkExprHolder = mkExprHolder;
            // Injection of expressions into statements is explicit in TouchDevelop.
            function mkExprStmt(expr) {
                return {
                    nodeType: "exprStmt",
                    id: null,
                    expr: expr,
                };
            }
            Helpers.mkExprStmt = mkExprStmt;
            // Refinement of the above function for [J.JInlineActions], a subclass of
            // [J.JExprStmt]
            function mkInlineActions(actions, expr) {
                return {
                    nodeType: "inlineActions",
                    id: null,
                    actions: actions,
                    expr: expr,
                };
            }
            Helpers.mkInlineActions = mkInlineActions;
            function mkWhile(condition, body) {
                return {
                    nodeType: "while",
                    id: null,
                    condition: condition,
                    body: body
                };
            }
            Helpers.mkWhile = mkWhile;
            function mkFor(index, bound, body) {
                return {
                    nodeType: "for",
                    id: null,
                    index: mkDef(index, mkTypeRef("Number")),
                    body: body,
                    bound: bound
                };
            }
            Helpers.mkFor = mkFor;
            function mkComment(text) {
                return {
                    nodeType: "comment",
                    id: null,
                    text: text || ""
                };
            }
            Helpers.mkComment = mkComment;
            // An if-statement that has no [else] branch.
            function mkSimpleIf(condition, thenBranch) {
                return {
                    nodeType: "if",
                    id: null,
                    condition: condition,
                    thenBody: thenBranch,
                    elseBody: null,
                    isElseIf: false,
                };
            }
            Helpers.mkSimpleIf = mkSimpleIf;
            // This function takes care of generating an if node *and* de-constructing the
            // else branch to abide by the TouchDevelop typeesentation (see comments in
            // [jsonInterfaces.ts]).
            function mkIf(condition, thenBranch, elseBranch) {
                var ifNode = mkSimpleIf(condition, thenBranch);
                // The transformation into a "flat" if / else if / else sequence is only
                // valid if the else branch it itself such a sequence.
                var fitForFlattening = elseBranch.length && elseBranch.every(function (s, i) {
                    return s.nodeType == "if" && (i == 0 || s.isElseIf);
                });
                if (fitForFlattening) {
                    var first = elseBranch[0];
                    assert(!first.isElseIf);
                    first.isElseIf = true;
                    return [ifNode].concat(elseBranch);
                }
                else {
                    ifNode.elseBody = elseBranch;
                    return [ifNode];
                }
            }
            Helpers.mkIf = mkIf;
            function mkAssign(x, e) {
                var assign = mkSimpleCall("=", [x, e]);
                var expr = mkExprHolder([], assign);
                return mkExprStmt(expr);
            }
            Helpers.mkAssign = mkAssign;
            // Generate the AST for:
            //   [var x: t := e]
            function mkDefAndAssign(x, t, e) {
                var def = mkDef(x, t);
                var assign = mkSimpleCall("=", [mkLocalRef(x, t), e]);
                var expr = mkExprHolder([def], assign);
                return mkExprStmt(expr);
            }
            Helpers.mkDefAndAssign = mkDefAndAssign;
            function mkInlineAction(body, isImplicit, reference, inParams, outParams) {
                if (inParams === void 0) { inParams = []; }
                if (outParams === void 0) { outParams = []; }
                return {
                    nodeType: "inlineAction",
                    id: null,
                    body: body,
                    inParameters: inParams,
                    outParameters: outParams,
                    locals: null,
                    reference: reference,
                    isImplicit: isImplicit,
                    isOptional: false,
                    capturedLocals: [],
                    allLocals: [],
                };
            }
            Helpers.mkInlineAction = mkInlineAction;
            function mkAction(name, body, inParams, outParams) {
                if (inParams === void 0) { inParams = []; }
                if (outParams === void 0) { outParams = []; }
                return {
                    nodeType: "action",
                    id: null,
                    name: name,
                    body: body,
                    inParameters: inParams,
                    outParameters: outParams,
                    isPrivate: false,
                    isOffline: false,
                    isQuery: false,
                    isTest: false,
                    isAsync: true,
                    description: "Action converted from a Blockly script",
                };
            }
            Helpers.mkAction = mkAction;
            function mkApp(name, description, decls) {
                return {
                    nodeType: "app",
                    id: null,
                    textVersion: "v2.2,js,ctx,refs,localcloud,unicodemodel,allasync,upperplex",
                    jsonVersion: "v0.1,resolved",
                    name: name,
                    comment: description,
                    autoIcon: "",
                    autoColor: "",
                    platform: "current",
                    isLibrary: false,
                    useCppCompiler: false,
                    showAd: false,
                    hasIds: false,
                    rootId: "TODO",
                    decls: decls,
                    deletedDecls: [],
                };
            }
            Helpers.mkApp = mkApp;
        })(Helpers || (Helpers = {}));
        var H = Helpers;
        ///////////////////////////////////////////////////////////////////////////////
        // Miscellaneous utility functions
        ///////////////////////////////////////////////////////////////////////////////
        // Mutate [a1] in place and append to it the elements from [a2].
        function append(a1, a2) {
            a1.push.apply(a1, a2);
        }
        // A few wrappers for basic Block operations that throw errors when compilation
        // is not possible. (The outer code catches these and highlights the relevant
        // block.)
        // Internal error (in our code). Compilation shouldn't proceed.
        function assert(x) {
            if (!x)
                throw new Error("Assertion failure");
        }
        function throwBlockError(msg, block) {
            var e = new Error(msg);
            e.block = block;
            throw e;
        }
        var Errors;
        (function (Errors) {
            var errors = [];
            function report(m, b) {
                errors.push({ msg: m, block: b });
            }
            Errors.report = report;
            function clear() {
                errors = [];
            }
            Errors.clear = clear;
            function get() {
                return errors;
            }
            Errors.get = get;
        })(Errors || (Errors = {}));
        ///////////////////////////////////////////////////////////////////////////////
        // Types
        //
        // We slap a very simple type system on top of Blockly. This is needed to ensure
        // we generate valid TouchDevelop code (otherwise compilation from TD to C++
        // would not work).
        ///////////////////////////////////////////////////////////////////////////////
        // There are several layers of abstraction for the type system.
        // - Block are annotated with a string return type, and a string type for their
        //   input blocks (see blocks-custom.js). We use that as the reference semantics
        //   for the blocks.
        // - In this "type system", we use the enum Type. Using an enum rules out more
        //   mistakes.
        // - When emitting code, we target the "TouchDevelop types".
        //
        // Type inference / checking is done as follows. First, we try to assign a type
        // to all variables. We do this by examining all variable assignments and
        // figuring out the type from the right-hand side. There's a fixpoint computation
        // (see [mkEnv]). Then, we propagate down the expected type when doing code
        // generation; when generating code for a variable dereference, if the expected
        // type doesn't match the inferred type, it's an error. If the type was
        // undetermined as of yet, the type of the variable becomes the expected type.
        var Point = (function () {
            function Point(link, type) {
                this.link = link;
                this.type = type;
            }
            return Point;
        }());
        function find(p) {
            if (p.link)
                return find(p.link);
            else
                return p;
        }
        function union(p1, p2) {
            p1 = find(p1);
            p2 = find(p2);
            assert(p1.link == null && p2.link == null);
            if (p1 == p2)
                return;
            var t = unify(p1.type, p2.type);
            p1.link = p2;
            p1.type = null;
            p2.type = t;
        }
        // Ground types.
        function mkPoint(t) {
            return new Point(null, t);
        }
        var pNumber = mkPoint("number");
        var pBoolean = mkPoint("boolean");
        var pString = mkPoint("string");
        var pUnit = mkPoint("void");
        function ground(t) {
            if (!t)
                return mkPoint(t);
            switch (t.toLowerCase()) {
                case "number": return pNumber;
                case "boolean": return pBoolean;
                case "string": return pString;
                case "void": return pUnit;
                default:
                    // Unification variable.
                    return mkPoint(t);
            }
        }
        ///////////////////////////////////////////////////////////////////////////////
        // Type inference
        //
        // Expressions are now directly compiled as a tree. This requires knowing, for
        // each property ref, the right value for its [parent] property.
        ///////////////////////////////////////////////////////////////////////////////
        // Infers the expected type of an expression by looking at the untranslated
        // block and figuring out, from the look of it, what type of expression it
        // holds.
        function returnType(e, b) {
            assert(b != null);
            if (b.type == "placeholder")
                return find(b.p);
            if (b.type == "variables_get")
                return find(lookup(e, escapeVarName(b.getFieldValue("VAR"))).type);
            assert(!b.outputConnection || b.outputConnection.check_ && b.outputConnection.check_.length > 0);
            if (!b.outputConnection)
                return ground(pUnit.type);
            return ground(b.outputConnection.check_[0]);
        }
        // Basic type unification routine; easy, because there's no structural types.
        function unify(t1, t2) {
            if (t1 == null)
                return t2;
            else if (t2 == null)
                return t1;
            else if (t1 == t2)
                return t1;
            else
                throw new Error("cannot mix " + t1 + " with " + t2);
        }
        function mkPlaceholderBlock(e) {
            // XXX define a proper placeholder block type
            return {
                type: "placeholder",
                p: mkPoint(null),
                workspace: e.workspace,
            };
        }
        function attachPlaceholderIf(e, b, n) {
            // Ugly hack to keep track of the type we want there.
            if (!b.getInputTargetBlock(n)) {
                var i = b.inputList.filter(function (x) { return x.name == n; })[0];
                assert(i != null);
                i.connection.targetConnection = new B.Connection(mkPlaceholderBlock(e), 0);
            }
        }
        function removeAllPlaceholders(w) {
            w.getAllBlocks().forEach(function (b) {
                b.inputList.forEach(function (i) {
                    if (i.connection && i.connection.targetBlock() != null
                        && i.connection.targetBlock().type == "placeholder")
                        i.connection.targetConnection = null;
                });
            });
        }
        // Unify the *return* type of the parameter [n] of block [b] with point [p].
        function unionParam(e, b, n, p) {
            try {
                attachPlaceholderIf(e, b, n);
                union(returnType(e, b.getInputTargetBlock(n)), p);
            }
            catch (e) {
                throwBlockError("The parameter " + n + " of this block is of the wrong type. More precisely: " + e, b);
            }
        }
        function infer(e, w) {
            w.getAllBlocks().forEach(function (b) {
                try {
                    switch (b.type) {
                        case "math_op2":
                            unionParam(e, b, "x", ground(pNumber.type));
                            unionParam(e, b, "y", ground(pNumber.type));
                            break;
                        case "math_op3":
                            unionParam(e, b, "x", ground(pNumber.type));
                            break;
                        case "math_arithmetic":
                        case "logic_compare":
                            switch (b.getFieldValue("OP")) {
                                case "ADD":
                                case "MINUS":
                                case "MULTIPLY":
                                case "DIVIDE":
                                case "LT":
                                case "LTE":
                                case "GT":
                                case "GTE":
                                case "POWER":
                                    unionParam(e, b, "A", ground(pNumber.type));
                                    unionParam(e, b, "B", ground(pNumber.type));
                                    break;
                                case "AND":
                                case "OR":
                                    unionParam(e, b, "A", ground(pBoolean.type));
                                    unionParam(e, b, "B", ground(pBoolean.type));
                                    break;
                                case "EQ":
                                case "NEQ":
                                    attachPlaceholderIf(e, b, "A");
                                    attachPlaceholderIf(e, b, "B");
                                    var p1_1 = returnType(e, b.getInputTargetBlock("A"));
                                    var p2 = returnType(e, b.getInputTargetBlock("B"));
                                    try {
                                        union(p1_1, p2);
                                    }
                                    catch (e) {
                                        throwBlockError("Comparing objects of different types", b);
                                    }
                                    var t = find(p1_1).type;
                                    if (t != pString.type && t != pBoolean.type && t != pNumber.type && t != null)
                                        throwBlockError("I can only compare strings, booleans and numbers", b);
                                    break;
                            }
                            break;
                        case "logic_operation":
                            unionParam(e, b, "A", ground(pBoolean.type));
                            unionParam(e, b, "B", ground(pBoolean.type));
                            break;
                        case "logic_negate":
                            unionParam(e, b, "BOOL", ground(pBoolean.type));
                            break;
                        case "controls_if":
                            for (var i = 0; i <= b.elseifCount_; ++i)
                                unionParam(e, b, "IF" + i, ground(pBoolean.type));
                            break;
                        case "controls_simple_for":
                            unionParam(e, b, "TO", ground(pNumber.type));
                            break;
                        case "variables_set":
                        case "variables_change":
                            var x = escapeVarName(b.getFieldValue("VAR"));
                            var p1 = lookup(e, x).type;
                            attachPlaceholderIf(e, b, "VALUE");
                            var rhs = b.getInputTargetBlock("VALUE");
                            if (rhs) {
                                var tr = returnType(e, rhs);
                                try {
                                    union(p1, tr);
                                }
                                catch (e) {
                                    throwBlockError("Assigning a value of the wrong type to variable " + x, b);
                                }
                            }
                            break;
                        case "controls_repeat_ext":
                            unionParam(e, b, "TIMES", ground(pNumber.type));
                            break;
                        case "device_while":
                            unionParam(e, b, "COND", ground(pBoolean.type));
                            break;
                        default:
                            if (b.type in e.stdCallTable) {
                                e.stdCallTable[b.type].args.forEach(function (p) {
                                    if (p.field && !b.getFieldValue(p.field)) {
                                        var i = b.inputList.filter(function (i) { return i.name == p.field; })[0];
                                        // This will throw if someone modified blocks-custom.js and forgot to add
                                        // [setCheck]s in the block definition. This is intentional and MUST be
                                        // fixed.
                                        var t = i.connection.check_[0];
                                        unionParam(e, b, p.field, ground(t));
                                    }
                                });
                            }
                    }
                }
                catch (e) {
                    if (e.block)
                        Errors.report(e + "", e.block);
                    else
                        Errors.report(e + "", b);
                }
            });
            // Last pass: if some variable has no type (because it was never used or
            // assigned to), just unify it with int...
            e.bindings.forEach(function (b) {
                if (find(b.type).type == null)
                    union(b.type, ground(pNumber.type));
            });
        }
        ///////////////////////////////////////////////////////////////////////////////
        // Expressions
        //
        // Expressions are now directly compiled as a tree. This requires knowing, for
        // each property ref, the right value for its [parent] property.
        ///////////////////////////////////////////////////////////////////////////////
        function extractNumber(b) {
            var v = b.getFieldValue("NUM");
            if (!v.match(/\d+/)) {
                Errors.report(v + " is not a valid numeric value", b);
                return 0;
            }
            else {
                var i = parseInt(v);
                if (i >> 0 != i) {
                    Errors.report(v + " is either too big or too small", b);
                    return 0;
                }
                return parseInt(v);
            }
        }
        function compileNumber(e, b) {
            return H.mkNumberLiteral(extractNumber(b));
        }
        var opToTok = {
            // POWER gets a special treatment because there's no operator for it in
            // TouchDevelop
            "ADD": "+",
            "MINUS": "-",
            "MULTIPLY": "*",
            "DIVIDE": "/",
            "LT": "<",
            "LTE": "<=",
            "GT": ">",
            "GTE": ">=",
            "AND": "&&",
            "OR": "||",
            "EQ": "==",
            "NEQ": "!=",
        };
        function compileArithmetic(e, b) {
            var bOp = b.getFieldValue("OP");
            var left = b.getInputTargetBlock("A");
            var right = b.getInputTargetBlock("B");
            var args = [compileExpression(e, left), compileExpression(e, right)];
            var t = returnType(e, left).type;
            if (t == pString.type) {
                if (bOp == "EQ")
                    return H.stringCall("==", args);
                else if (bOp == "NEQ")
                    return H.stringCall("!=", args);
            }
            else if (t == pBoolean.type)
                return H.mkSimpleCall(opToTok[bOp], args);
            // Compilation of math operators.
            if (bOp == "POWER")
                return H.mathCall("pow", args);
            else {
                assert(bOp in opToTok);
                return H.mkSimpleCall(opToTok[bOp], args);
            }
        }
        function compileMathOp2(e, b) {
            var op = b.getFieldValue("op");
            var x = compileExpression(e, b.getInputTargetBlock("x"));
            var y = compileExpression(e, b.getInputTargetBlock("y"));
            return H.mathCall(op, [x, y]);
        }
        function compileMathOp3(e, b) {
            var x = compileExpression(e, b.getInputTargetBlock("x"));
            return H.mathCall("abs", [x]);
        }
        function compileText(e, b) {
            return H.mkStringLiteral(b.getFieldValue("TEXT"));
        }
        function compileBoolean(e, b) {
            return H.mkBooleanLiteral(b.getFieldValue("BOOL") == "TRUE");
        }
        function compileNot(e, b) {
            var expr = compileExpression(e, b.getInputTargetBlock("BOOL"));
            return H.mkSimpleCall("!", [expr]);
        }
        function compileRandom(e, b) {
            var expr = compileExpression(e, b.getInputTargetBlock("limit"));
            if (expr.nodeType == "numberLiteral")
                return H.mathCall("random", [H.mkNumberLiteral(expr.value + 1)]);
            else
                return H.mathCall("random", [H.mkSimpleCall(opToTok["+"], [expr, H.mkNumberLiteral(1)])]);
        }
        function compileCreateList(e, b) {
            // collect argument
            var args = b.inputList.map(function (input) { return input.connection && input.connection.targetBlock() ? compileExpression(e, input.connection.targetBlock()) : undefined; })
                .filter(function (e) { return !!e; });
            // we need at least 1 element to determine the type...
            if (args.length < 0)
                pxt.U.userError(lf("The list must have at least one element"));
            return H.mkArrayLiteral(args);
        }
        function defaultValueForType(t) {
            if (t.type == null) {
                union(t, ground(pNumber.type));
                t = find(t);
            }
            switch (t.type) {
                case "boolean":
                    return H.mkBooleanLiteral(false);
                case "number":
                    return H.mkNumberLiteral(0);
                case "string":
                    return H.mkStringLiteral("");
                default:
                    return H.mkLocalRef("null");
            }
        }
        // [t] is the expected type; we assume that we never null block children
        // (because placeholder blocks have been inserted by the type-checking phase
        // whenever a block was actually missing).
        function compileExpression(e, b) {
            assert(b != null);
            var expr;
            if (b.disabled || b.type == "placeholder")
                expr = defaultValueForType(returnType(e, b));
            else
                switch (b.type) {
                    case "math_number":
                        expr = compileNumber(e, b);
                        break;
                    case "math_op2":
                        expr = compileMathOp2(e, b);
                        break;
                    case "math_op3":
                        expr = compileMathOp3(e, b);
                        break;
                    case "device_random":
                        expr = compileRandom(e, b);
                        break;
                    case "math_arithmetic":
                    case "logic_compare":
                    case "logic_operation":
                        expr = compileArithmetic(e, b);
                        break;
                    case "logic_boolean":
                        expr = compileBoolean(e, b);
                        break;
                    case "logic_negate":
                        expr = compileNot(e, b);
                        break;
                    case "variables_get":
                        expr = compileVariableGet(e, b);
                        break;
                    case "text":
                        expr = compileText(e, b);
                        break;
                    case "lists_create_with":
                        expr = compileCreateList(e, b);
                        break;
                    default:
                        var call = e.stdCallTable[b.type];
                        if (call) {
                            if (call.imageLiteral)
                                expr = compileImage(e, b, call.imageLiteral, call.namespace, call.f, call.args.map(function (ar) { return compileArgument(e, b, ar); }));
                            else
                                expr = compileStdCall(e, b, call);
                        }
                        else {
                            pxt.reportError("Unable to compile expression: " + b.type, null);
                            expr = defaultValueForType(returnType(e, b));
                        }
                        break;
                }
            expr.id = b.id;
            return expr;
        }
        var VarUsage;
        (function (VarUsage) {
            VarUsage[VarUsage["Unknown"] = 0] = "Unknown";
            VarUsage[VarUsage["Read"] = 1] = "Read";
            VarUsage[VarUsage["Assign"] = 2] = "Assign";
        })(VarUsage || (VarUsage = {}));
        function isCompiledAsForIndex(b) {
            return b.usedAsForIndex && !b.incompatibleWithFor;
        }
        function extend(e, x, t) {
            assert(lookup(e, x) == null);
            return {
                workspace: e.workspace,
                bindings: [{ name: x, type: ground(t), usedAsForIndex: 0 }].concat(e.bindings),
                stdCallTable: e.stdCallTable
            };
        }
        function lookup(e, n) {
            for (var i = 0; i < e.bindings.length; ++i)
                if (e.bindings[i].name == n)
                    return e.bindings[i];
            return null;
        }
        function fresh(e, s) {
            var i = 0;
            var unique = s;
            while (lookup(e, unique) != null)
                unique = s + i++;
            return unique;
        }
        function emptyEnv(w) {
            return {
                workspace: w,
                bindings: [],
                stdCallTable: {}
            };
        }
        ;
        ///////////////////////////////////////////////////////////////////////////////
        // Statements
        ///////////////////////////////////////////////////////////////////////////////
        function compileControlsIf(e, b) {
            var stmts = [];
            // Notice the <= (if there's no else-if, we still compile the primary if).
            for (var i = 0; i <= b.elseifCount_; ++i) {
                var cond = compileExpression(e, b.getInputTargetBlock("IF" + i));
                var thenBranch = compileStatements(e, b.getInputTargetBlock("DO" + i));
                stmts.push(H.mkSimpleIf(H.mkExprHolder([], cond), thenBranch));
                if (i > 0)
                    stmts[stmts.length - 1].isElseIf = true;
            }
            if (b.elseCount_) {
                stmts[stmts.length - 1].elseBody = compileStatements(e, b.getInputTargetBlock("ELSE"));
            }
            return stmts;
        }
        function isClassicForLoop(b) {
            if (b.type == "controls_simple_for") {
                return true;
            }
            else if (b.type == "controls_for") {
                var bBy = b.getInputTargetBlock("BY");
                var bFrom = b.getInputTargetBlock("FROM");
                return bBy.type.match(/^math_number/) && extractNumber(bBy) == 1 &&
                    bFrom.type.match(/^math_number/) && extractNumber(bFrom) == 0;
            }
            else {
                throw new Error("Invalid argument: isClassicForLoop");
            }
        }
        function compileControlsFor(e, b) {
            var bVar = escapeVarName(b.getFieldValue("VAR"));
            var bTo = b.getInputTargetBlock("TO");
            var bDo = b.getInputTargetBlock("DO");
            var binding = lookup(e, bVar);
            assert(binding.usedAsForIndex > 0);
            if (isClassicForLoop(b) && !binding.incompatibleWithFor) {
                var bToExpr = compileExpression(e, bTo);
                if (bToExpr.nodeType == "numberLiteral")
                    bToExpr = H.mkNumberLiteral(bToExpr.value + 1);
                else
                    bToExpr = H.mkSimpleCall("+", [bToExpr, H.mkNumberLiteral(1)]);
                // In the perfect case, we can do a local binding that declares a local
                // variable. The code that generates global variable declarations is in sync
                // and won't generate a global binding.
                return [
                    // FOR 0 <= VAR
                    H.mkFor(bVar, 
                    // < TO + 1 DO
                    H.mkExprHolder([], bToExpr), compileStatements(e, bDo))
                ];
            }
            else {
                // Evaluate the bound first, and store it in b (bound may change over
                // several loop iterations).
                var local = fresh(e, "bound");
                e = extend(e, local, pNumber.type);
                var eLocal = H.mkLocalRef(local);
                var eTo = compileExpression(e, bTo);
                var eVar = H.mkLocalRef(bVar);
                var eBy = H.mkNumberLiteral(1);
                var eFrom = H.mkNumberLiteral(0);
                // Fallback to a while loop followed by an assignment to
                // make sure we don't overshoot the loop variable above the "to" field
                // (since Blockly allows someone to read it afterwards).
                return [
                    // LOCAL = TO
                    H.mkAssign(eLocal, eTo),
                    // let = FROM
                    H.mkAssign(eVar, eFrom),
                    // while
                    H.mkWhile(
                    // let <= B
                    H.mkExprHolder([], H.mkSimpleCall("<=", [eVar, eLocal])), 
                    // DO
                    compileStatements(e, bDo).concat([
                        H.mkExprStmt(H.mkExprHolder([], 
                        // let =
                        H.mkSimpleCall("=", [eVar,
                            // let + BY
                            H.mkSimpleCall("+", [eVar, eBy])])))])),
                ];
            }
        }
        function compileControlsRepeat(e, b) {
            var bound = compileExpression(e, b.getInputTargetBlock("TIMES"));
            var body = compileStatements(e, b.getInputTargetBlock("DO"));
            var valid = function (x) { return !lookup(e, x) || !isCompiledAsForIndex(lookup(e, x)); };
            var name = "i";
            for (var i = 0; !valid(name); i++)
                name = "i" + i;
            return H.mkFor(name, H.mkExprHolder([], bound), body);
        }
        function compileWhile(e, b) {
            var cond = compileExpression(e, b.getInputTargetBlock("COND"));
            var body = compileStatements(e, b.getInputTargetBlock("DO"));
            return H.mkWhile(H.mkExprHolder([], cond), body);
        }
        function compileForever(e, b) {
            var bBody = b.getInputTargetBlock("HANDLER");
            var body = compileStatements(e, bBody);
            return mkCallWithCallback(e, "basic", "forever", [], body);
        }
        // convert to javascript friendly name
        function escapeVarName(name) {
            if (!name)
                return '_';
            var n = name.split(/[^a-zA-Z0-9_$]+/)
                .map(function (c, i) { return (i ? c[0].toUpperCase() : c[0].toLowerCase()) + c.substr(1); })
                .join('');
            return n;
        }
        function compileVariableGet(e, b) {
            var name = escapeVarName(b.getFieldValue("VAR"));
            var binding = lookup(e, name);
            if (!binding.assigned)
                binding.assigned = VarUsage.Read;
            assert(binding != null && binding.type != null);
            return H.mkLocalRef(name);
        }
        function compileSet(e, b) {
            var bVar = escapeVarName(b.getFieldValue("VAR"));
            var bExpr = b.getInputTargetBlock("VALUE");
            var binding = lookup(e, bVar);
            if (!binding.assigned && !findParent(b))
                binding.assigned = VarUsage.Assign;
            var expr = compileExpression(e, bExpr);
            var ref = H.mkLocalRef(bVar);
            return H.mkExprStmt(H.mkExprHolder([], H.mkSimpleCall("=", [ref, expr])));
        }
        function compileChange(e, b) {
            var bVar = escapeVarName(b.getFieldValue("VAR"));
            var bExpr = b.getInputTargetBlock("VALUE");
            var binding = lookup(e, bVar);
            if (!binding.assigned)
                binding.assigned = VarUsage.Read;
            var expr = compileExpression(e, bExpr);
            var ref = H.mkLocalRef(bVar);
            return H.mkExprStmt(H.mkExprHolder([], H.mkSimpleCall("=", [ref, H.mkSimpleCall("+", [ref, expr])])));
        }
        function compileCall(e, b) {
            var call = e.stdCallTable[b.type];
            return call.imageLiteral
                ? H.mkExprStmt(H.mkExprHolder([], compileImage(e, b, call.imageLiteral, call.namespace, call.f, call.args.map(function (ar) { return compileArgument(e, b, ar); }))))
                : call.hasHandler ? compileEvent(e, b, call.f, call.args.map(function (ar) { return ar.field; }).filter(function (ar) { return !!ar; }), call.namespace)
                    : H.mkExprStmt(H.mkExprHolder([], compileStdCall(e, b, e.stdCallTable[b.type])));
        }
        function compileArgument(e, b, p) {
            var lit = p.literal;
            if (lit)
                return lit instanceof String ? H.mkStringLiteral(lit) : H.mkNumberLiteral(lit);
            var f = b.getFieldValue(p.field);
            if (f)
                return H.mkLocalRef(f);
            else
                return compileExpression(e, b.getInputTargetBlock(p.field));
        }
        function compileStdCall(e, b, func) {
            var args = func.args.map(function (p) { return compileArgument(e, b, p); });
            if (func.isExtensionMethod) {
                return H.extensionCall(func.f, args, !!func.property);
            }
            else if (func.namespace) {
                return H.namespaceCall(func.namespace, func.f, args);
            }
            else {
                return H.stdCall(func.f, args);
            }
        }
        function compileStdBlock(e, b, f) {
            return H.mkExprStmt(H.mkExprHolder([], compileStdCall(e, b, f)));
        }
        function mkCallWithCallback(e, n, f, args, body) {
            var def = H.mkDef("_body_", H.mkGTypeRef("Action"));
            return H.mkInlineActions([H.mkInlineAction(body, true, def)], H.mkExprHolder([def], H.namespaceCall(n, f, args)));
        }
        function compileEvent(e, b, event, args, ns) {
            var bBody = b.getInputTargetBlock("HANDLER");
            var compiledArgs = args.map(function (arg) {
                // b.getFieldValue may be string, numbers
                var argb = b.getInputTargetBlock(arg);
                if (argb)
                    return compileExpression(e, argb);
                return H.mkLocalRef(b.getFieldValue(arg));
            });
            var body = compileStatements(e, bBody);
            return mkCallWithCallback(e, ns, event, compiledArgs, body);
        }
        function compileImage(e, b, frames, n, f, args) {
            args = args === undefined ? [] : args;
            var state = "\n";
            var rows = 5;
            var columns = frames * 5;
            for (var i = 0; i < rows; ++i) {
                if (i > 0)
                    state += '\n';
                for (var j = 0; j < columns; ++j) {
                    if (j > 0)
                        state += ' ';
                    state += /TRUE/.test(b.getFieldValue("LED" + j + i)) ? "#" : ".";
                }
            }
            return H.namespaceCall(n, f, [H.mkStringLiteral(state)].concat(args));
        }
        function compileStatementBlock(e, b) {
            var r;
            switch (b.type) {
                case 'controls_if':
                    r = compileControlsIf(e, b);
                    break;
                case 'controls_for':
                case 'controls_simple_for':
                    r = compileControlsFor(e, b);
                    break;
                case 'variables_set':
                    r = [compileSet(e, b)];
                    break;
                case 'variables_change':
                    r = [compileChange(e, b)];
                    break;
                case 'controls_repeat_ext':
                    r = [compileControlsRepeat(e, b)];
                    break;
                case 'device_while':
                    r = [compileWhile(e, b)];
                    break;
                default:
                    var call = e.stdCallTable[b.type];
                    if (call)
                        r = [compileCall(e, b)];
                    else
                        r = [H.mkExprStmt(H.mkExprHolder([], compileExpression(e, b)))];
                    break;
            }
            var l = r[r.length - 1];
            if (l)
                l.id = b.id;
            return r;
        }
        function compileStatements(e, b) {
            if (!b)
                return [];
            var stmts = [];
            while (b) {
                if (!b.disabled)
                    append(stmts, compileStatementBlock(e, b));
                b = b.getNextBlock();
            }
            return stmts;
        }
        // Find the parent (as in "scope" parent) of a Block. The [parentNode_] property
        // will return the visual parent, that is, the one connected to the top of the
        // block.
        function findParent(b) {
            var candidate = b.parentBlock_;
            if (!candidate)
                return null;
            var isActualInput = false;
            candidate.inputList.forEach(function (i) {
                if (i.name && candidate.getInputTargetBlock(i.name) == b)
                    isActualInput = true;
            });
            return isActualInput && candidate || null;
        }
        function isTopBlock(b) {
            if (!b.parentBlock_)
                return true;
            return isTopBlock(b.parentBlock_);
        }
        // This function creates an empty environment where type inference has NOT yet
        // been performed.
        // - All variables have been assigned an initial [Point] in the union-find.
        // - Variables have been marked to indicate if they are compatible with the
        //   TouchDevelop for-loop model.
        function mkEnv(w, blockInfo) {
            // The to-be-returned environment.
            var e = emptyEnv(w);
            // append functions in stdcalltable
            if (blockInfo)
                blockInfo.blocks
                    .forEach(function (fn) {
                    if (e.stdCallTable[fn.attributes.blockId]) {
                        pxt.reportError("compiler: function " + fn.attributes.blockId + " already defined", null);
                        return;
                    }
                    var fieldMap = pxt.blocks.parameterNames(fn);
                    var instance = fn.kind == ts.pxt.SymbolKind.Method || fn.kind == ts.pxt.SymbolKind.Property;
                    var args = (fn.parameters || []).map(function (p) {
                        if (fieldMap[p.name] && fieldMap[p.name].name)
                            return { field: fieldMap[p.name].name };
                        else
                            return null;
                    }).filter(function (a) { return !!a; });
                    if (instance)
                        args.unshift({
                            field: fieldMap["this"].name
                        });
                    e.stdCallTable[fn.attributes.blockId] = {
                        namespace: fn.namespace,
                        f: fn.name,
                        isExtensionMethod: instance,
                        imageLiteral: fn.attributes.imageLiteral,
                        hasHandler: fn.parameters && fn.parameters.some(function (p) { return p.type == "() => void"; }),
                        property: !fn.parameters,
                        args: args
                    };
                });
            var variableIsScoped = function (b, name) {
                if (!b)
                    return false;
                else if ((b.type == "controls_for" || b.type == "controls_simple_for")
                    && escapeVarName(b.getFieldValue("VAR")) == name)
                    return true;
                else
                    return variableIsScoped(findParent(b), name);
            };
            // collect loop variables.
            w.getAllBlocks().forEach(function (b) {
                if (b.type == "controls_for" || b.type == "controls_simple_for") {
                    var x = escapeVarName(b.getFieldValue("VAR"));
                    // It's ok for two loops to share the same variable.
                    if (lookup(e, x) == null)
                        e = extend(e, x, pNumber.type);
                    lookup(e, x).usedAsForIndex++;
                    // Unless the loop starts at 0 and and increments by one, we can't compile
                    // as a TouchDevelop for loop. Also, if multiple loops share the same
                    // variable, that means there's potential race conditions in concurrent
                    // code, so faithfully compile this as a global variable.
                    if (!isClassicForLoop(b) || lookup(e, x).usedAsForIndex > 1)
                        lookup(e, x).incompatibleWithFor = true;
                }
            });
            // determine for-loop compatibility: for each get or
            // set block, 1) make sure that the variable is bound, then 2) mark the variable if needed.
            w.getAllBlocks().forEach(function (b) {
                if (b.type == "variables_get" || b.type == "variables_set" || b.type == "variables_change") {
                    var x = escapeVarName(b.getFieldValue("VAR"));
                    if (lookup(e, x) == null)
                        e = extend(e, x, null);
                    var binding = lookup(e, x);
                    if (binding.usedAsForIndex && !variableIsScoped(b, x))
                        // loop index is read outside the loop.
                        binding.incompatibleWithFor = true;
                }
            });
            return e;
        }
        function compileWorkspace(w, blockInfo) {
            var decls = [];
            try {
                var e_1 = mkEnv(w, blockInfo);
                infer(e_1, w);
                // [stmtsHandlers] contains calls to register event handlers. They must be
                // executed before the code that goes in the main function, as that latter
                // code may block, and prevent the event handler from being registered.
                var stmtsMain_1 = [];
                w.getTopBlocks(true).map(function (b) {
                    append(stmtsMain_1, compileStatements(e_1, b));
                });
                // All variables in this script are compiled as locals within main unless loop or previsouly assigned
                var stmtsVariables = e_1.bindings.filter(function (b) { return !isCompiledAsForIndex(b) && b.assigned != VarUsage.Assign; })
                    .map(function (b) {
                    var btype = find(b.type);
                    return H.mkDefAndAssign(b.name, H.mkTypeRef(find(b.type).type), defaultValueForType(find(b.type)));
                });
                decls.push(H.mkAction("main", stmtsVariables.concat(stmtsMain_1), [], []));
            }
            finally {
                removeAllPlaceholders(w);
            }
            return H.mkApp('untitled', '', decls);
        }
        function findBlockId(sourceMap, loc) {
            if (!loc)
                return undefined;
            for (var i = 0; i < sourceMap.length; ++i) {
                var chunk = sourceMap[i];
                if (chunk.start <= loc.start && chunk.end >= loc.start + loc.length)
                    return chunk.id;
            }
            return undefined;
        }
        blocks.findBlockId = findBlockId;
        function compile(b, blockInfo) {
            Errors.clear();
            return tdASTtoTS(compileWorkspace(b, blockInfo));
        }
        blocks.compile = compile;
        function tdASTtoTS(app) {
            var sourceMap = [];
            var output = "";
            var indent = "";
            var variables = [{}];
            var currInlineAction = null;
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
            var infixPriTable = {
                "=": 3,
                "||": 5,
                "&&": 6,
                "|": 7,
                "^": 8,
                "&": 9,
                "==": 10,
                "!=": 10,
                "===": 10,
                "!==": 10,
                "<": 11,
                ">": 11,
                "<=": 11,
                ">=": 11,
                ">>": 12,
                ">>>": 12,
                "<<": 12,
                "+": 13,
                "-": 13,
                "*": 14,
                "/": 14,
                "%": 14,
                "!": 15,
            };
            function flatten(e0) {
                var r = [];
                function pushOp(c) {
                    r.push({
                        nodeType: "operator",
                        id: "",
                        op: c
                    });
                }
                function call(e, outPrio) {
                    var infixPri = 0;
                    if (infixPriTable.hasOwnProperty(e.name))
                        infixPri = infixPriTable[e.name];
                    if (infixPri) {
                        // This seems wrong
                        if (e.name == "-" &&
                            (e.args[0].nodeType == "numberLiteral") &&
                            (e.args[0].value === 0.0) &&
                            (!e.args[0].stringForm)) {
                            pushOp(e.name);
                            rec(e.args[1], 98);
                            return;
                        }
                        if (infixPri < outPrio)
                            pushOp("(");
                        if (e.args.length == 1) {
                            pushOp(e.name);
                            rec(e.args[0], infixPri);
                        }
                        else {
                            var bindLeft = infixPri != 3 && e.name != "**";
                            var letType = undefined;
                            if (e.name == "=" && e.args[0].nodeType == 'localRef') {
                                var varloc = e.args[0];
                                var varname = varloc.name;
                                if (!variables[variables.length - 1][varname]) {
                                    variables[variables.length - 1][varname] = "1";
                                    pushOp("let");
                                    letType = varloc.type;
                                }
                            }
                            rec(e.args[0], bindLeft ? infixPri : infixPri + 0.1);
                            if (letType && letType != "number") {
                                pushOp(":");
                                pushOp(letType);
                            }
                            pushOp(e.name);
                            rec(e.args[1], !bindLeft ? infixPri : infixPri + 0.1);
                        }
                        if (infixPri < outPrio)
                            pushOp(")");
                    }
                    else {
                        rec(e.args[0], 1000);
                        r.push({
                            nodeType: "propertyRef",
                            name: e.name,
                            parent: e.parent,
                            declId: e.declId,
                        });
                        if (!e.property) {
                            pushOp("(");
                            e.args.slice(1).forEach(function (ee, i) {
                                if (i > 0)
                                    pushOp(",");
                                rec(ee, -1);
                            });
                            pushOp(")");
                        }
                    }
                }
                function rec(e, prio) {
                    switch (e.nodeType) {
                        case "call":
                            emitAndMap(e.id, function () { return call(e, prio); });
                            break;
                        case "numberLiteral":
                            pushOp(e.value.toString());
                            break;
                        case "arrayLiteral":
                        case "stringLiteral":
                        case "booleanLiteral":
                        case "localRef":
                        case "placeholder":
                        case "singletonRef":
                            r.push(e);
                            break;
                        case "show":
                        case "break":
                        case "return":
                        case "continue":
                            pushOp(e.nodeType);
                            var ee = e.expr;
                            if (ee)
                                rec(ee, prio);
                            break;
                        default:
                            pxt.reportError("invalid nodeType when flattening: " + e.nodeType, null);
                            pxt.Util.oops("invalid nodeType when flattening: " + e.nodeType);
                    }
                }
                rec(e0, -1);
                return r;
            }
            function stringLit(s) {
                if (s.length > 20 && /\n/.test(s))
                    return "`" + s.replace(/[\\`${}]/g, function (f) { return "\\" + f; }) + "`";
                else
                    return JSON.stringify(s);
            }
            function emitAndMap(id, f) {
                if (!id) {
                    f();
                    return;
                }
                var start = output.length;
                f();
                var end = output.length;
                if (start != end)
                    sourceMap.push({ id: id, start: start, end: end });
            }
            var byNodeType = {
                app: function (n) {
                    pxt.Util.assert(n.decls.length == 1);
                    pxt.Util.assert(n.decls[0].nodeType == "action");
                    n.decls[0].body.forEach(emit);
                },
                exprStmt: function (n) { return emitAndMap(n.id, function () {
                    emit(n.expr);
                    write(";\n");
                }); },
                inlineAction: function (n) {
                    pxt.Util.assert(n.inParameters.length == 0);
                    write("() => ");
                    emitBlock(n.body);
                },
                inlineActions: function (n) {
                    pxt.Util.assert(n.actions.length == 1);
                    currInlineAction = n.actions[0];
                    emit(n.expr);
                    if (currInlineAction.isImplicit) {
                        output = output.replace(/\)\s*$/, "");
                        if (!/\($/.test(output))
                            write(", ");
                        emit(currInlineAction);
                        output = output.replace(/\s*$/, "");
                        write(")");
                    }
                    write(";\n");
                },
                exprHolder: function (n) {
                    var toks = flatten(n.tree);
                    toks.forEach(emit);
                },
                localRef: function (n) {
                    if (n.name == "_body_")
                        emit(currInlineAction);
                    else
                        localRef(n.name);
                },
                operator: function (n) {
                    if (n.op == "let")
                        write(n.op + " ");
                    else if (/^[\d()]/.test(n.op))
                        write(n.op);
                    else if (n.op == ",")
                        write(n.op + " ");
                    else
                        write(" " + n.op + " ");
                },
                singletonRef: function (n) {
                    write(jsName(n.name));
                },
                propertyRef: function (n) {
                    write("." + jsName(n.name));
                },
                stringLiteral: function (n) {
                    output += stringLit(n.value);
                },
                booleanLiteral: function (n) {
                    write(n.value ? "true" : "false");
                },
                arrayLiteral: function (n) {
                    write("[");
                    if (n.values)
                        n.values.forEach(function (a, i) {
                            if (i > 0)
                                write(', ');
                            var toks = flatten(a);
                            toks.forEach(emit);
                        });
                    write("]");
                },
                "if": function (n) {
                    if (n.isElseIf)
                        write("else ");
                    write("if (");
                    emitAndMap(n.id, function () { return emit(n.condition); });
                    write(") ");
                    emitBlock(n.thenBody);
                    if (n.elseBody) {
                        write("else ");
                        emitBlock(n.elseBody);
                    }
                },
                "for": function (n) {
                    write("for (let ");
                    localRef(n.index.name);
                    write(" = 0; ");
                    localRef(n.index.name);
                    write(" < ");
                    emitAndMap(n.id, function () { return emit(n.bound); });
                    write("; ");
                    localRef(n.index.name);
                    write("++) ");
                    emitBlock(n.body);
                },
                "while": function (n) {
                    write("while (");
                    emitAndMap(n.id, function () { return emit(n.condition); });
                    write(") ");
                    emitBlock(n.body);
                },
            };
            emit(app);
            output = output.replace(/^\s*\n/mg, "").replace(/\s+;$/mg, ";");
            // never return empty string - TS compiler service thinks it's an error
            output += "\n";
            return {
                source: output,
                sourceMap: sourceMap
            };
            function localRef(n) {
                write(jsName(n));
            }
            function emitBlock(s) {
                block(function () {
                    s.forEach(emit);
                });
            }
            function jsName(s) {
                return s.replace(/ (.)/g, function (f, m) { return m.toUpperCase(); });
            }
            function emit(n) {
                var f = byNodeType[n.nodeType];
                if (!f)
                    pxt.Util.oops("unsupported node type " + n.nodeType);
                f(n);
            }
            function write(s) {
                output += s.replace(/\n/g, "\n" + indent);
            }
            function block(f) {
                var vars = pxt.U.clone(variables[variables.length - 1] || {});
                variables.push(vars);
                indent += "    ";
                write("{\n");
                f();
                indent = indent.slice(4);
                write("\n}\n");
                variables.pop();
            }
        }
    })(blocks = pxt.blocks || (pxt.blocks = {}));
})(pxt || (pxt = {}));
///<reference path='blockly.d.ts'/>
///<reference path='touchdevelop.d.ts'/>
/// <reference path="../built/pxtlib.d.ts" />
var pxt;
(function (pxt) {
    var blocks;
    (function (blocks_1) {
        function saveWorkspaceXml(ws) {
            var xml = Blockly.Xml.workspaceToDom(ws);
            var text = Blockly.Xml.domToPrettyText(xml);
            return text;
        }
        blocks_1.saveWorkspaceXml = saveWorkspaceXml;
        /**
         * Loads the xml into a off-screen workspace (not suitable for size computations)
         */
        function loadWorkspaceXml(xml) {
            var workspace = new Blockly.Workspace();
            try {
                Blockly.Xml.domToWorkspace(workspace, Blockly.Xml.textToDom(xml));
                return workspace;
            }
            catch (e) {
                pxt.reportException(e, { xml: xml });
                return null;
            }
        }
        blocks_1.loadWorkspaceXml = loadWorkspaceXml;
        function importXml(info, xml) {
            try {
                var parser = new DOMParser();
                var doc = parser.parseFromString(xml, "application/xml");
                // build upgrade map
                var enums = {};
                for (var k in info.apis.byQName) {
                    var api = info.apis.byQName[k];
                    if (api.kind == ts.pxt.SymbolKind.EnumMember)
                        enums[api.namespace + '.' + (api.attributes.blockImportId || api.attributes.block || api.attributes.blockId || api.name)] = api.namespace + '.' + api.name;
                }
                // walk through blocks and patch enums
                var blocks_2 = doc.getElementsByTagName("block");
                for (var i = 0; i < blocks_2.length; ++i)
                    patchBlock(info, enums, blocks_2[i]);
                // serialize and return
                return new XMLSerializer().serializeToString(doc);
            }
            catch (e) {
                pxt.reportException(e, xml);
                return xml;
            }
        }
        blocks_1.importXml = importXml;
        function patchBlock(info, enums, block) {
            var type = block.getAttribute("type");
            var b = Blockly.Blocks[type];
            var symbol = blocks_1.blockSymbol(type);
            if (!symbol || !b)
                return;
            var params = blocks_1.parameterNames(symbol);
            symbol.parameters.forEach(function (p, i) {
                var ptype = info.apis.byQName[p.type];
                if (ptype && ptype.kind == ts.pxt.SymbolKind.Enum) {
                    var field = block.querySelector("field[name=" + params[p.name].name + "]");
                    if (field) {
                        var en = enums[ptype.name + '.' + field.textContent];
                        if (en)
                            field.textContent = en;
                    }
                }
            });
        }
    })(blocks = pxt.blocks || (pxt.blocks = {}));
})(pxt || (pxt = {}));
var pxt;
(function (pxt) {
    var blocks;
    (function (blocks_3) {
        var layout;
        (function (layout) {
            function verticalAlign(ws, emPixels) {
                var blocks = ws.getTopBlocks(true);
                var y = 0;
                blocks.forEach(function (block) {
                    block.moveBy(0, y);
                    y += block.getHeightWidth().height;
                    y += emPixels; //buffer            
                });
            }
            layout.verticalAlign = verticalAlign;
            ;
            function shuffle(ws) {
                var blocks = ws.getAllBlocks();
                // unplug all blocks
                blocks.forEach(function (b) { return b.unplug(); });
                // TODO: better layout
                // randomize order
                fisherYates(blocks);
                // apply layout
                flow(blocks);
            }
            layout.shuffle = shuffle;
            function flow(blocks) {
                var gap = 14;
                // compute total block surface and infer width
                var surface = 0;
                for (var _i = 0, blocks_4 = blocks; _i < blocks_4.length; _i++) {
                    var block = blocks_4[_i];
                    var s = block.getHeightWidth();
                    surface += s.width * s.height;
                }
                var maxx = Math.sqrt(surface) * 1.62;
                var insertx = 0;
                var inserty = 0;
                var endy = 0;
                for (var _a = 0, blocks_5 = blocks; _a < blocks_5.length; _a++) {
                    var block = blocks_5[_a];
                    var r = block.getBoundingRectangle();
                    var s = block.getHeightWidth();
                    // move block to insertion point
                    block.moveBy(insertx - r.topLeft.x, inserty - r.topLeft.y);
                    insertx += s.width + gap;
                    endy = Math.max(endy, inserty + s.height + gap);
                    if (insertx > maxx) {
                        insertx = 0;
                        inserty = endy;
                    }
                }
            }
            function robertJenkins() {
                var seed = 0x2F6E2B1;
                return function () {
                    // https://gist.github.com/mathiasbynens/5670917
                    // Robert Jenkins’ 32 bit integer hash function
                    seed = ((seed + 0x7ED55D16) + (seed << 12)) & 0xFFFFFFFF;
                    seed = ((seed ^ 0xC761C23C) ^ (seed >>> 19)) & 0xFFFFFFFF;
                    seed = ((seed + 0x165667B1) + (seed << 5)) & 0xFFFFFFFF;
                    seed = ((seed + 0xD3A2646C) ^ (seed << 9)) & 0xFFFFFFFF;
                    seed = ((seed + 0xFD7046C5) + (seed << 3)) & 0xFFFFFFFF;
                    seed = ((seed ^ 0xB55A4F09) ^ (seed >>> 16)) & 0xFFFFFFFF;
                    return (seed & 0xFFFFFFF) / 0x10000000;
                };
            }
            function fisherYates(myArray) {
                var i = myArray.length;
                if (i == 0)
                    return;
                // TODO: seeded random
                var rnd = robertJenkins();
                while (--i) {
                    var j = Math.floor(rnd() * (i + 1));
                    var tempi = myArray[i];
                    var tempj = myArray[j];
                    myArray[i] = tempj;
                    myArray[j] = tempi;
                }
            }
            var nodeSeparation = 12;
            function mst(nodes, edges) {
                var forest = nodes.map(function (node) { var r = {}; r[node] = 1; return r; });
                var sortedEdges = edges.slice(0).sort(function (l, r) { return -l.weight + r.weight; });
                var r = [];
                var _loop_1 = function() {
                    var edge = sortedEdges.pop();
                    var n1 = edge.source;
                    var n2 = edge.target;
                    var t1 = forest.filter(function (tree) { return !!tree[n1]; })[0];
                    var t2 = forest.filter(function (tree) { return !!tree[n2]; })[0];
                    if (t1 != t2) {
                        forest = forest.filter(function (ar) { return ar != t1 && ar != t2; });
                        forest.push(union(t1, t2));
                        r.push(edge);
                    }
                };
                while (forest.length > 1) {
                    _loop_1();
                }
                return r;
                function union(a, b) {
                    var r = {};
                    for (var k in a)
                        r[k] = 1;
                    for (var k in b)
                        r[k] = 1;
                    return r;
                }
            }
            function removeOverlapsOnTinyGraph(blocks) {
                if (blocks.length == 1)
                    return;
                if (blocks.length == 2) {
                    var a = blocks[0];
                    var b = blocks[1];
                    //if (ApproximateComparer.Close(center(a), center(b)))
                    //    b.Center += new Point(0.001, 0);
                    var idealDist = getIdealDistanceBetweenTwoNodes(a, b);
                    var c = center(centerBlock(a), centerBlock(b));
                    var dir = goog.math.Coordinate.difference(centerBlock(a), centerBlock(b));
                    var dist = goog.math.Coordinate.magnitude(dir);
                    dir = scale(dir, 0.5 * idealDist / dist);
                    setCenter(a, goog.math.Coordinate.sum(c, dir));
                    setCenter(b, goog.math.Coordinate.sum(c, dir));
                }
            }
            function scale(c, f) {
                return new goog.math.Coordinate(c.x * f, c.y * f);
            }
            function center(l, r) {
                return new goog.math.Coordinate(l.x + (r.x - l.x) / 2, l.y + (r.y - l.y) / 2);
            }
            function centerBlock(b) {
                var br = b.getBoundingRectangle();
                return center(br.bottomRight, br.topLeft);
            }
            function setCenter(b, c) {
            }
            function getIdealDistanceBetweenTwoNodes(a, b) {
                var abox = a.getBoundingRectangle();
                var bbox = b.getBoundingRectangle();
                //abox.Pad(nodeSeparation / 2);
                //bbox.Pad(nodeSeparation / 2);
                var ac = goog.math.Coordinate.difference(abox.topLeft, abox.bottomRight);
                var bc = goog.math.Coordinate.difference(bbox.topLeft, bbox.bottomRight);
                var ab = goog.math.Coordinate.difference(ac, bc);
                var dx = Math.abs(ab.x);
                var dy = Math.abs(ab.y);
                var wx = (Math.abs(abox.topLeft.x - abox.bottomRight.x) / 2 + Math.abs(bbox.topLeft.x - bbox.bottomRight.x) / 2);
                var wy = (Math.abs(abox.topLeft.y - abox.bottomRight.y) / 2 + Math.abs(bbox.topLeft.y - bbox.bottomRight.y) / 2);
                var machineAcc = 1.0e-16;
                var t;
                if (dx < machineAcc * wx)
                    t = wy / dy;
                else if (dy < machineAcc * wy)
                    t = wx / dx;
                else
                    t = Math.min(wx / dx, wy / dy);
                return t * goog.math.Coordinate.magnitude(ab);
            }
        })(layout = blocks_3.layout || (blocks_3.layout = {}));
    })(blocks = pxt.blocks || (pxt.blocks = {}));
})(pxt || (pxt = {}));
/// <reference path="./blockly.d.ts" />
/// <reference path="../built/pxtlib.d.ts" />
var Util = pxt.Util;
var lf = Util.lf;
var pxt;
(function (pxt) {
    var blocks;
    (function (blocks) {
        var blockColors = {
            loops: 120,
            images: 45,
            variables: 330,
            text: 160,
            lists: 260
        };
        // list of built-in blocks, should be touched.
        var builtinBlocks = {};
        Object.keys(Blockly.Blocks)
            .forEach(function (k) { return builtinBlocks[k] = { block: Blockly.Blocks[k] }; });
        var cachedBlocks = {};
        var cachedToolbox = "";
        function blockSymbol(type) {
            var b = cachedBlocks[type];
            return b ? b.fn : undefined;
        }
        blocks.blockSymbol = blockSymbol;
        function createShadowValue(name, type, v, shadowType) {
            if (v && v.slice(0, 1) == "\"")
                v = JSON.parse(v);
            if (type == "number" && shadowType && shadowType == "value") {
                var field = document.createElement("field");
                field.setAttribute("name", name);
                field.appendChild(document.createTextNode("0"));
                return field;
            }
            var value = document.createElement("value");
            value.setAttribute("name", name);
            var shadow = document.createElement("shadow");
            value.appendChild(shadow);
            shadow.setAttribute("type", shadowType ? shadowType : type == "number" ? "math_number" : type == "string" ? "text" : type);
            if (type == "number" || type == "string") {
                var field = document.createElement("field");
                shadow.appendChild(field);
                field.setAttribute("name", type == "number" ? "NUM" : "TEXT");
                field.appendChild(document.createTextNode(v || (type == "number" ? "0" : "")));
            }
            return value;
        }
        function parameterNames(fn) {
            // collect blockly parameter name mapping
            var instance = fn.kind == ts.pxt.SymbolKind.Method || fn.kind == ts.pxt.SymbolKind.Property;
            var attrNames = {};
            if (instance)
                attrNames["this"] = { name: "this", type: fn.namespace };
            if (fn.parameters)
                fn.parameters.forEach(function (pr) { return attrNames[pr.name] = {
                    name: pr.name,
                    type: pr.type,
                    shadowValue: pr.defaults ? pr.defaults[0] : undefined
                }; });
            if (fn.attributes.block) {
                Object.keys(attrNames).forEach(function (k) { return attrNames[k].name = ""; });
                var rx = /%([a-zA-Z0-9_]+)(=([a-zA-Z0-9_]+))?/g;
                var m = void 0;
                var i = 0;
                while (m = rx.exec(fn.attributes.block)) {
                    if (i == 0 && instance) {
                        attrNames["this"].name = m[1];
                        if (m[3])
                            attrNames["this"].shadowType = m[3];
                        m = rx.exec(fn.attributes.block);
                        if (!m)
                            break;
                    }
                    var at = attrNames[fn.parameters[i++].name];
                    at.name = m[1];
                    if (m[3])
                        at.shadowType = m[3];
                }
            }
            return attrNames;
        }
        blocks.parameterNames = parameterNames;
        function createToolboxBlock(info, fn, attrNames) {
            //
            // toolbox update
            //
            var block = document.createElement("block");
            block.setAttribute("type", fn.attributes.blockId);
            if (fn.attributes.blockGap)
                block.setAttribute("gap", fn.attributes.blockGap);
            if ((fn.kind == ts.pxt.SymbolKind.Method || fn.kind == ts.pxt.SymbolKind.Property)
                && attrNames["this"] && attrNames["this"].shadowType) {
                var attr = attrNames["this"];
                block.appendChild(createShadowValue(attr.name, attr.type, attr.shadowValue, attr.shadowType));
            }
            if (fn.parameters)
                fn.parameters.filter(function (pr) { return !!attrNames[pr.name].name &&
                    (/^(string|number)$/.test(attrNames[pr.name].type)
                        || !!attrNames[pr.name].shadowType
                        || !!attrNames[pr.name].shadowValue); })
                    .forEach(function (pr) {
                    var attr = attrNames[pr.name];
                    block.appendChild(createShadowValue(attr.name, attr.type, attr.shadowValue, attr.shadowType));
                });
            return block;
        }
        function injectToolbox(tb, info, fn, block) {
            var ns = (fn.attributes.blockNamespace || fn.namespace).split('.')[0];
            var catName = pxt.Util.capitalize(ns);
            var category = categoryElement(tb, catName);
            if (!category) {
                console.log('toolbox: adding category ' + ns);
                category = document.createElement("category");
                category.setAttribute("name", catName);
                var nsn = info.apis.byQName[ns];
                var nsWeight = (nsn ? nsn.attributes.weight : 50) || 50;
                category.setAttribute("weight", nsWeight.toString());
                if (nsn && nsn.attributes.color)
                    category.setAttribute("colour", nsn.attributes.color);
                else if (blockColors[ns])
                    category.setAttribute("colour", blockColors[ns].toString());
                // find the place to insert the category        
                var categories = tb.querySelectorAll("category");
                var ci = 0;
                for (ci = 0; ci < categories.length; ++ci) {
                    var cat = categories.item(ci);
                    if (parseInt(cat.getAttribute("weight") || "50") < nsWeight) {
                        tb.insertBefore(category, cat);
                        break;
                    }
                }
                if (ci == categories.length)
                    tb.appendChild(category);
            }
            category.appendChild(block);
        }
        var iconCanvasCache = {};
        function iconToFieldImage(c) {
            var canvas = iconCanvasCache[c];
            if (!canvas) {
                canvas = iconCanvasCache[c] = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                var ctx = canvas.getContext('2d');
                ctx.fillStyle = 'white';
                ctx.font = "56px Icons";
                ctx.textAlign = "center";
                ctx.fillText(c, canvas.width / 2, 56);
            }
            return new Blockly.FieldImage(canvas.toDataURL(), 16, 16, '');
        }
        function injectBlockDefinition(info, fn, attrNames, blockXml) {
            var id = fn.attributes.blockId;
            if (builtinBlocks[id]) {
                pxt.reportError('trying to override builtin block ' + id, null);
                return false;
            }
            var hash = JSON.stringify(fn);
            if (cachedBlocks[id] && cachedBlocks[id].hash == hash) {
                return true;
            }
            if (Blockly.Blocks[fn.attributes.blockId]) {
                console.error("duplicate block definition: " + id);
                return false;
            }
            var cachedBlock = {
                hash: hash,
                fn: fn,
                block: {
                    codeCard: mkCard(fn, blockXml),
                    init: function () { initBlock(this, info, fn, attrNames); }
                }
            };
            cachedBlocks[id] = cachedBlock;
            Blockly.Blocks[id] = cachedBlock.block;
            return true;
        }
        function initField(i, ni, fn, pre, right, type) {
            if (ni == 0 && fn.attributes.icon)
                i.appendField(iconToFieldImage(fn.attributes.icon));
            if (pre)
                i.appendField(pre);
            if (right)
                i.setAlign(Blockly.ALIGN_RIGHT);
            // ignore generic types
            if (type && type != "T")
                i.setCheck(type);
            return i;
        }
        function mkCard(fn, blockXml) {
            return {
                name: fn.namespace + '.' + fn.name,
                description: fn.attributes.jsDoc,
                url: fn.attributes.help ? 'reference/' + fn.attributes.help.replace(/^\//, '') : undefined,
                blocksXml: "<xml xmlns=\"http://www.w3.org/1999/xhtml\">\n        " + blockXml.outerHTML + "\n</xml>",
            };
        }
        function initBlock(block, info, fn, attrNames) {
            var ns = (fn.attributes.blockNamespace || fn.namespace).split('.')[0];
            var instance = fn.kind == ts.pxt.SymbolKind.Method || fn.kind == ts.pxt.SymbolKind.Property;
            var nsinfo = info.apis.byQName[ns];
            if (fn.attributes.help)
                block.setHelpUrl("/reference/" + fn.attributes.help.replace(/^\//, ''));
            block.setTooltip(fn.attributes.jsDoc);
            block.setColour(fn.attributes.color
                || (nsinfo ? nsinfo.attributes.color : undefined)
                || blockColors[ns]
                || 255);
            fn.attributes.block.split('|').map(function (n, ni) {
                var m = /([^%]*)\s*%([a-zA-Z0-9_]+)/.exec(n);
                var i;
                if (!m) {
                    i = initField(block.appendDummyInput(), ni, fn, n);
                }
                else {
                    // find argument
                    var pre = m[1];
                    if (pre)
                        pre = pre.trim();
                    var p_1 = m[2];
                    var n_1 = Object.keys(attrNames).filter(function (k) { return attrNames[k].name == p_1; })[0];
                    if (!n_1) {
                        console.error("block " + fn.attributes.blockId + ": unkown parameter " + p_1);
                        return;
                    }
                    var pr_1 = attrNames[n_1];
                    if (/\[\]$/.test(pr_1.type)) {
                        i = initField(block.appendValueInput(p_1), ni, fn, pre, true, "Array");
                    }
                    else if (instance && n_1 == "this") {
                        i = initField(block.appendValueInput(p_1), ni, fn, pre, true, pr_1.type);
                    }
                    else if (pr_1.type == "number") {
                        if (pr_1.shadowType && pr_1.shadowType == "value") {
                            i = block.appendDummyInput();
                            if (pre)
                                i.appendField(pre);
                            i.appendField(new Blockly.FieldTextInput("0", Blockly.FieldTextInput.numberValidator), p_1);
                        }
                        else
                            i = initField(block.appendValueInput(p_1), ni, fn, pre, true, "Number");
                    }
                    else if (pr_1.type == "boolean") {
                        i = initField(block.appendValueInput(p_1), ni, fn, pre, true, "Boolean");
                    }
                    else if (pr_1.type == "string") {
                        i = initField(block.appendValueInput(p_1), ni, fn, pre, true, "String");
                    }
                    else {
                        var prtype = pxt.Util.lookup(info.apis.byQName, pr_1.type);
                        if (prtype && prtype.kind == ts.pxt.SymbolKind.Enum) {
                            var dd = pxt.Util.values(info.apis.byQName)
                                .filter(function (e) { return e.namespace == pr_1.type; })
                                .map(function (v) { return [v.attributes.block || v.attributes.blockId || v.name, v.namespace + "." + v.name]; });
                            i = initField(block.appendDummyInput(), ni, fn, pre, true);
                            i.appendField(new Blockly.FieldDropdown(dd), attrNames[n_1].name);
                        }
                        else {
                            i = initField(block.appendValueInput(p_1), ni, fn, pre, true, pr_1.type);
                        }
                    }
                }
            });
            var body = fn.parameters ? fn.parameters.filter(function (pr) { return pr.type == "() => void"; })[0] : undefined;
            if (body) {
                block.appendStatementInput("HANDLER")
                    .setCheck("null");
            }
            if (fn.attributes.imageLiteral) {
                for (var r = 0; r < 5; ++r) {
                    var ri = block.appendDummyInput();
                    for (var c = 0; c < fn.attributes.imageLiteral * 5; ++c) {
                        if (c > 0 && c % 5 == 0)
                            ri.appendField("  ");
                        else if (c > 0)
                            ri.appendField(" ");
                        ri.appendField(new Blockly.FieldCheckbox("FALSE"), "LED" + c + r);
                    }
                }
            }
            block.setInputsInline(!fn.attributes.blockExternalInputs && fn.parameters.length < 4 && !fn.attributes.imageLiteral);
            switch (fn.retType) {
                case "number":
                    block.setOutput(true, "Number");
                    break;
                case "string":
                    block.setOutput(true, "String");
                    break;
                case "boolean":
                    block.setOutput(true, "Boolean");
                    break;
                case "void": break; // do nothing
                //TODO
                default: block.setOutput(true, fn.retType);
            }
            // hook up/down if return value is void
            block.setPreviousStatement(fn.retType == "void");
            block.setNextStatement(fn.retType == "void");
            block.setTooltip(fn.attributes.jsDoc);
        }
        function removeCategory(tb, name) {
            var e = categoryElement(tb, name);
            if (e && e.parentElement)
                e.parentElement.removeChild(e);
        }
        function initBlocks(blockInfo, workspace, toolbox) {
            init();
            // create new toolbox and update block definitions
            var tb = toolbox ? toolbox.cloneNode(true) : undefined;
            blockInfo.blocks.sort(function (f1, f2) {
                var ns1 = blockInfo.apis.byQName[f1.namespace.split('.')[0]];
                var ns2 = blockInfo.apis.byQName[f2.namespace.split('.')[0]];
                if (ns1 && !ns2)
                    return -1;
                if (ns2 && !ns1)
                    return 1;
                var c = 0;
                if (ns1 && ns2) {
                    c = (ns2.attributes.weight || 50) - (ns1.attributes.weight || 50);
                    if (c != 0)
                        return c;
                }
                c = (f2.attributes.weight || 50) - (f1.attributes.weight || 50);
                return c;
            });
            var currentBlocks = {};
            var dbg = pxt.debugMode();
            // create new toolbox and update block definitions
            blockInfo.blocks
                .filter(function (fn) { return !tb || !tb.querySelector("block[type='" + fn.attributes.blockId + "']"); })
                .forEach(function (fn) {
                if (fn.attributes.blockBuiltin) {
                    pxt.Util.assert(!!builtinBlocks[fn.attributes.blockId]);
                    builtinBlocks[fn.attributes.blockId].symbol = fn;
                }
                else {
                    var pnames = parameterNames(fn);
                    var block = createToolboxBlock(blockInfo, fn, pnames);
                    if (injectBlockDefinition(blockInfo, fn, pnames, block)) {
                        if (tb && (!fn.attributes.debug || dbg))
                            injectToolbox(tb, blockInfo, fn, block);
                        currentBlocks[fn.attributes.blockId] = 1;
                    }
                }
            });
            // remove ununsed blocks
            Object
                .keys(cachedBlocks).filter(function (k) { return !currentBlocks[k]; })
                .forEach(function (k) { return removeBlock(cachedBlocks[k].fn); });
            // remove unused categories
            var config = pxt.appTarget.runtime || {};
            if (!config.mathBlocks)
                removeCategory(tb, "Math");
            if (!config.textBlocks)
                removeCategory(tb, "Text");
            if (!config.listsBlocks)
                removeCategory(tb, "Lists");
            if (!config.variablesBlocks)
                removeCategory(tb, "Variables");
            if (!config.logicBlocks)
                removeCategory(tb, "Logic");
            if (!config.loopsBlocks)
                removeCategory(tb, "Loops");
            // add extra blocks
            if (tb && pxt.appTarget.runtime && pxt.appTarget.runtime.extraBlocks) {
                pxt.appTarget.runtime.extraBlocks.forEach(function (eb) {
                    var cat = categoryElement(tb, eb.namespace);
                    if (cat) {
                        var el = document.createElement("block");
                        el.setAttribute("type", eb.type);
                        el.setAttribute("weight", (eb.weight || 50).toString());
                        if (eb.gap)
                            el.setAttribute("gap", eb.gap.toString());
                        if (eb.fields) {
                            for (var f in eb.fields) {
                                var fe = document.createElement("field");
                                fe.setAttribute("name", f);
                                fe.appendChild(document.createTextNode(eb.fields[f]));
                                el.appendChild(fe);
                            }
                        }
                        cat.appendChild(el);
                    }
                    else {
                        console.error("trying to add block " + eb.type + " to unknown category " + eb.namespace);
                    }
                });
            }
            // update shadow types
            if (tb) {
                $(tb).find('shadow:empty').each(function (i, shadow) {
                    var type = shadow.getAttribute('type');
                    var b = $(tb).find("block[type=\"" + type + "\"]")[0];
                    if (b)
                        shadow.innerHTML = b.innerHTML;
                });
                // update toolbox   
                if (tb.innerHTML != cachedToolbox && workspace) {
                    cachedToolbox = tb.innerHTML;
                    workspace.updateToolbox(tb);
                }
            }
        }
        blocks.initBlocks = initBlocks;
        function categoryElement(tb, name) {
            return tb ? tb.querySelector("category[name=\"" + pxt.Util.capitalize(name) + "\"]") : undefined;
        }
        function cleanBlocks() {
            console.log('removing all custom blocks');
            for (var b in cachedBlocks)
                removeBlock(cachedBlocks[b].fn);
        }
        blocks.cleanBlocks = cleanBlocks;
        function removeBlock(fn) {
            delete Blockly.Blocks[fn.attributes.blockId];
            delete cachedBlocks[fn.attributes.blockId];
        }
        var blocklyInitialized = false;
        function init() {
            if (blocklyInitialized)
                blocklyInitialized = true;
            goog.provide('Blockly.Blocks.device');
            goog.require('Blockly.Blocks');
            if (window.navigator.pointerEnabled) {
                Blockly.bindEvent_.TOUCH_MAP = {
                    mousedown: 'pointerdown',
                    mousemove: 'pointermove',
                    mouseup: 'pointerup'
                };
                document.body.style.touchAction = 'none';
            }
            Blockly.FieldCheckbox.CHECK_CHAR = '■';
            initMath();
            initVariables();
            initLoops();
            // hats creates issues when trying to round-trip events between JS and blocks. To better support that scenario,
            // we're taking off hats.
            // Blockly.BlockSvg.START_HAT = true;
            // Here's a helper to override the help URL for a block that's *already defined
            // by Blockly*. For blocks that we define ourselves, just change the call to
            // setHelpUrl in the corresponding definition above.
            function monkeyPatchBlock(id, name, url) {
                var old = Blockly.Blocks[id].init;
                if (!old)
                    return;
                // fix sethelpurl
                Blockly.Blocks[id].init = function () {
                    // The magic of dynamic this-binding.
                    old.call(this);
                    this.setHelpUrl("/reference/" + url);
                    if (!this.codeCard) {
                        var tb = document.getElementById('blocklyToolboxDefinition');
                        var xml = tb ? tb.querySelector("category block[type~='" + id + "']") : undefined;
                        this.codeCard = {
                            header: name,
                            name: name,
                            software: 1,
                            description: goog.isFunction(this.tooltip) ? this.tooltip() : this.tooltip,
                            blocksXml: xml ? ("<xml>" + (xml.outerHTML || "<block type=\"" + id + "\"</block>") + "</xml>") : undefined,
                            url: url
                        };
                    }
                };
            }
            monkeyPatchBlock("controls_if", "if", "logic/if");
            monkeyPatchBlock("controls_repeat_ext", "for loop", "loops/repeat");
            monkeyPatchBlock("device_while", "while loop", "loops/while");
            monkeyPatchBlock("variables_set", "variable assignment", "variables/assign");
            monkeyPatchBlock("variables_change", "variable update", "variables/change");
            monkeyPatchBlock("logic_compare", "boolean operator", "types/boolean");
            monkeyPatchBlock("logic_operation", "boolean operation", "types/boolean");
            monkeyPatchBlock("logic_negate", "not operator", "types/boolean");
            monkeyPatchBlock("logic_boolean", "boolean value", "types/boolean");
            monkeyPatchBlock("math_number", "number", "number");
            monkeyPatchBlock("math_arithmetic", "arithmetic operation", "math");
            monkeyPatchBlock("math_op2", "Math min/max operators", "math");
            monkeyPatchBlock("math_op3", "Math abs operator", "math");
            monkeyPatchBlock("device_random", "pick random number", "math/random");
            monkeyPatchBlock("text", "a piece of text", "text");
            monkeyPatchBlock("text_length", "number of characters in the string", "text/length");
        }
        function initLoops() {
            Blockly.Blocks['device_while'] = {
                init: function () {
                    this.setHelpUrl('/reference/loops/while');
                    this.setColour(blockColors['loops']);
                    this.appendValueInput("COND")
                        .setCheck("Boolean")
                        .appendField("while");
                    this.appendStatementInput("DO")
                        .appendField("do");
                    this.setPreviousStatement(true);
                    this.setNextStatement(true);
                    this.setTooltip(lf("Run the same sequence of actions while the condition is met."));
                }
            };
            Blockly.Blocks['controls_simple_for'] = {
                /**
                 * Block for 'for' loop.
                 * @this Blockly.Block
                 */
                init: function () {
                    this.setHelpUrl("/reference/loops/for");
                    this.setColour(Blockly.Blocks.loops.HUE);
                    this.appendDummyInput()
                        .appendField("for")
                        .appendField(new Blockly.FieldVariable(null), 'VAR')
                        .appendField("from 0 to");
                    this.appendValueInput("TO")
                        .setCheck("Number")
                        .setAlign(Blockly.ALIGN_RIGHT);
                    this.appendStatementInput('DO')
                        .appendField(Blockly.Msg.CONTROLS_FOR_INPUT_DO);
                    this.setPreviousStatement(true);
                    this.setNextStatement(true);
                    this.setInputsInline(true);
                    // Assign 'this' to a variable for use in the tooltip closure below.
                    var thisBlock = this;
                    this.setTooltip(function () {
                        return Blockly.Msg.CONTROLS_FOR_TOOLTIP.replace('%1', thisBlock.getFieldValue('VAR'));
                    });
                },
                /**
                 * Return all variables referenced by this block.
                 * @return {!Array.<string>} List of variable names.
                 * @this Blockly.Block
                 */
                getVars: function () {
                    return [this.getFieldValue('VAR')];
                },
                /**
                 * Notification that a variable is renaming.
                 * If the name matches one of this block's variables, rename it.
                 * @param {string} oldName Previous name of variable.
                 * @param {string} newName Renamed variable.
                 * @this Blockly.Block
                 */
                renameVar: function (oldName, newName) {
                    if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
                        this.setFieldValue(newName, 'VAR');
                    }
                },
                /**
                 * Add menu option to create getter block for loop variable.
                 * @param {!Array} options List of menu options to add to.
                 * @this Blockly.Block
                 */
                customContextMenu: function (options) {
                    if (!this.isCollapsed()) {
                        var option = { enabled: true };
                        var name_1 = this.getFieldValue('VAR');
                        option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name_1);
                        var xmlField = goog.dom.createDom('field', null, name_1);
                        xmlField.setAttribute('name', 'VAR');
                        var xmlBlock = goog.dom.createDom('block', null, xmlField);
                        xmlBlock.setAttribute('type', 'variables_get');
                        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
                        options.push(option);
                    }
                }
            };
        }
        function initMath() {
            Blockly.Blocks['math_op2'] = {
                init: function () {
                    this.setHelpUrl('/reference/math');
                    this.setColour(230);
                    this.appendValueInput("x")
                        .setCheck("Number")
                        .appendField(new Blockly.FieldDropdown([["min", "min"], ["max", "max"]]), "op")
                        .appendField("of");
                    this.appendValueInput("y")
                        .setCheck("Number")
                        .appendField("and");
                    this.setInputsInline(true);
                    this.setOutput(true, "Number");
                    this.setTooltip(lf("Math operators."));
                }
            };
            Blockly.Blocks['math_op3'] = {
                init: function () {
                    this.setHelpUrl('/reference/math/abs');
                    this.setColour(230);
                    this.appendDummyInput()
                        .appendField("absolute of");
                    this.appendValueInput("x")
                        .setCheck("Number");
                    this.setInputsInline(true);
                    this.setOutput(true, "Number");
                    this.setTooltip(lf("Math operators."));
                }
            };
            Blockly.Blocks['device_random'] = {
                init: function () {
                    this.setHelpUrl('/reference/math/random');
                    this.setColour(230);
                    this.appendDummyInput()
                        .appendField("pick random 0 to");
                    this.appendValueInput("limit")
                        .setCheck("Number")
                        .setAlign(Blockly.ALIGN_RIGHT);
                    this.setInputsInline(true);
                    this.setOutput(true, "Number");
                    this.setTooltip(lf("Returns a random integer between 0 and the specified bound (inclusive)."));
                }
            };
        }
        function initVariables() {
            Blockly.Variables.flyoutCategory = function (workspace) {
                var variableList = Blockly.Variables.allVariables(workspace);
                variableList.sort(goog.string.caseInsensitiveCompare);
                // In addition to the user's variables, we also want to display the default
                // variable name at the top.  We also don't want this duplicated if the
                // user has created a variable of the same name.
                goog.array.remove(variableList, Blockly.Msg.VARIABLES_DEFAULT_NAME);
                variableList.unshift(Blockly.Msg.VARIABLES_DEFAULT_NAME);
                var xmlList = [];
                // variables getters first
                for (var i = 0; i < variableList.length; i++) {
                    // <block type="variables_get" gap="24">
                    //   <field name="VAR">item</field>
                    // </block>
                    var block = goog.dom.createDom('block');
                    block.setAttribute('type', 'variables_get');
                    block.setAttribute('gap', '8');
                    var field = goog.dom.createDom('field', null, variableList[i]);
                    field.setAttribute('name', 'VAR');
                    block.appendChild(field);
                    xmlList.push(block);
                }
                xmlList[xmlList.length - 1].setAttribute('gap', '24');
                for (var i = 0; i < Math.min(1, variableList.length); i++) {
                    {
                        // <block type="variables_set" gap="8">
                        //   <field name="VAR">item</field>
                        // </block>
                        var block = goog.dom.createDom('block');
                        block.setAttribute('type', 'variables_set');
                        block.setAttribute('gap', '8');
                        {
                            var field = goog.dom.createDom('field', null, variableList[i]);
                            field.setAttribute('name', 'VAR');
                            block.appendChild(field);
                        }
                        {
                            var value = goog.dom.createDom('value');
                            value.setAttribute('name', 'VALUE');
                            var shadow = goog.dom.createDom('shadow');
                            shadow.setAttribute("type", "math_number");
                            value.appendChild(shadow);
                            var field = goog.dom.createDom('field');
                            field.setAttribute('name', 'NUM');
                            field.appendChild(document.createTextNode("0"));
                            shadow.appendChild(field);
                            block.appendChild(value);
                        }
                        xmlList.push(block);
                    }
                    {
                        // <block type="variables_get" gap="24">
                        //   <field name="VAR">item</field>
                        // </block>
                        var block = goog.dom.createDom('block');
                        block.setAttribute('type', 'variables_change');
                        block.setAttribute('gap', '24');
                        var value = goog.dom.createDom('value');
                        value.setAttribute('name', 'VALUE');
                        var shadow = goog.dom.createDom('shadow');
                        shadow.setAttribute("type", "math_number");
                        value.appendChild(shadow);
                        var field = goog.dom.createDom('field');
                        field.setAttribute('name', 'NUM');
                        field.appendChild(document.createTextNode("1"));
                        shadow.appendChild(field);
                        block.appendChild(value);
                        xmlList.push(block);
                    }
                }
                return xmlList;
            };
            Blockly.Blocks['variables_change'] = {
                init: function () {
                    this.appendDummyInput()
                        .appendField("change")
                        .appendField(new Blockly.FieldVariable("item"), "VAR");
                    this.appendValueInput("VALUE")
                        .setCheck("Number")
                        .appendField("by");
                    this.setInputsInline(true);
                    this.setPreviousStatement(true);
                    this.setNextStatement(true);
                    this.setTooltip(lf("Changes the value of the variable by this amount"));
                    this.setHelpUrl('/reference/assign');
                    this.setColour(blockColors['variables']);
                }
            };
        }
    })(blocks = pxt.blocks || (pxt.blocks = {}));
})(pxt || (pxt = {}));
/// <reference path="./blockly.d.ts" />
/// <reference path="../built/pxtlib.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
var pxt;
(function (pxt) {
    var blocks;
    (function (blocks_6) {
        var workspace;
        var blocklyDiv;
        function align(ws, emPixels) {
            var blocks = ws.getTopBlocks(true);
            var y = 0;
            blocks.forEach(function (block) {
                block.moveBy(0, y);
                y += block.getHeightWidth().height;
                y += emPixels; //buffer            
            });
        }
        (function (BlockLayout) {
            BlockLayout[BlockLayout["Align"] = 1] = "Align";
            BlockLayout[BlockLayout["Shuffle"] = 2] = "Shuffle";
            BlockLayout[BlockLayout["Clean"] = 3] = "Clean";
        })(blocks_6.BlockLayout || (blocks_6.BlockLayout = {}));
        var BlockLayout = blocks_6.BlockLayout;
        function render(blocksXml, options) {
            if (options === void 0) { options = { emPixels: 14, layout: BlockLayout.Align }; }
            if (!workspace) {
                blocklyDiv = document.createElement("div");
                blocklyDiv.style.position = "absolute";
                blocklyDiv.style.top = "0";
                blocklyDiv.style.left = "0";
                blocklyDiv.style.width = "1px";
                blocklyDiv.style.height = "1px";
                document.body.appendChild(blocklyDiv);
                workspace = Blockly.inject(blocklyDiv, {
                    scrollbars: false,
                    readOnly: true,
                    zoom: false,
                    media: pxt.webConfig.pxtCdnUrl + "blockly/media/"
                });
            }
            workspace.clear();
            try {
                var text = blocksXml || "<xml></xml>";
                var xml = Blockly.Xml.textToDom(text);
                Blockly.Xml.domToWorkspace(workspace, xml);
                switch (options.layout) {
                    case BlockLayout.Align:
                        pxt.blocks.layout.verticalAlign(workspace, options.emPixels);
                        break;
                    case BlockLayout.Shuffle:
                        pxt.blocks.layout.shuffle(workspace);
                        break;
                    case BlockLayout.Clean:
                        if (workspace.cleanUp_)
                            workspace.cleanUp_();
                        break;
                }
                var metrics = workspace.getMetrics();
                var svg = $(blocklyDiv).find('svg').clone(true, true);
                svg.removeClass("blocklySvg").addClass('blocklyPreview');
                svg.find('.blocklyBlockCanvas,.blocklyBubbleCanvas')
                    .attr('transform', "translate(" + -metrics.contentLeft + ", " + -metrics.contentTop + ") scale(1)");
                svg.find('.blocklyMainBackground').remove();
                svg[0].setAttribute('viewBox', "0 0 " + metrics.contentWidth + " " + metrics.contentHeight);
                svg.removeAttr('width');
                svg.removeAttr('height');
                if (options.emPixels)
                    svg[0].style.width = (metrics.contentWidth / options.emPixels) + 'em';
                return svg;
            }
            catch (e) {
                console.log(e);
                return undefined;
            }
        }
        blocks_6.render = render;
    })(blocks = pxt.blocks || (pxt.blocks = {}));
})(pxt || (pxt = {}));
//# sourceMappingURL=pxtblocks.js.map