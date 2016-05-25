var pxt;
(function (pxt) {
    var docs;
    (function (docs) {
        var codeCard;
        (function (codeCard) {
            var repeat = pxt.Util.repeatMap;
            var socialNetworks = [{
                    parse: function (text) {
                        var links = [];
                        if (text)
                            text.replace(/https?:\/\/(youtu\.be\/([a-z0-9\-_]+))|(www\.youtube\.com\/watch\?v=([a-z0-9\-_]+))/i, function (m, m2, id1, m3, id2) {
                                var ytid = id1 || id2;
                                links.push(ytid);
                                return '';
                            });
                        if (links[0])
                            return { source: 'youtube', id: links[0] };
                        else
                            return undefined;
                    }
                }, {
                    parse: function (text) {
                        var m = /https?:\/\/vimeo\.com\/\S*?(\d{6,})/i.exec(text);
                        if (m)
                            return { source: "vimeo", id: m[1] };
                        else
                            return undefined;
                    }
                }
            ];
            function render(card, options) {
                if (options === void 0) { options = {}; }
                var repeat = pxt.Util.repeatMap;
                var promo = socialNetworks.map(function (sn) { return sn.parse(card.promoUrl); }).filter(function (p) { return !!p; })[0];
                var color = card.color || "";
                if (!color) {
                    if (card.hardware && !card.software)
                        color = 'black';
                    else if (card.software && !card.hardware)
                        color = 'teal';
                }
                var url = card.url ? /^[^:]+:\/\//.test(card.url) ? card.url : ('/' + card.url.replace(/^\.?\/?/, ''))
                    : undefined;
                var link = card.link && url;
                var div = function (parent, cls, tag, text) {
                    if (tag === void 0) { tag = "div"; }
                    if (text === void 0) { text = ''; }
                    var d = document.createElement(tag);
                    if (cls)
                        d.className = cls;
                    if (parent)
                        parent.appendChild(d);
                    if (text)
                        d.appendChild(document.createTextNode(text + ''));
                    return d;
                };
                var a = function (parent, href, text, cls) {
                    var d = document.createElement('a');
                    d.className = cls;
                    d.href = href;
                    d.appendChild(document.createTextNode(text));
                    d.target = '_blank';
                    parent.appendChild(d);
                    return d;
                };
                var r = div(null, 'ui card ' + (card.color || '') + (link ? ' link' : ''), link ? "a" : "div");
                if (link)
                    r.href = url;
                if (!options.hideHeader && (card.header || card.blocks || card.javascript || card.hardware || card.software || card.any)) {
                    var h = div(r, "ui content " + (card.responsive ? " tall desktop only" : ""));
                    var hr_1 = div(h, "right floated meta");
                    if (card.any)
                        div(hr_1, "ui grey circular label tiny", "i", card.any > 0 ? card.any : "");
                    repeat(card.blocks, function (k) { return div(hr_1, "puzzle orange icon", "i"); });
                    repeat(card.javascript, function (k) { return div(hr_1, "keyboard blue icon", "i"); });
                    repeat(card.hardware, function (k) { return div(hr_1, "certificate black icon", "i"); });
                    repeat(card.software, function (k) { return div(hr_1, "square teal icon", "i"); });
                    if (card.header)
                        div(h, 'description', 'span', card.header);
                }
                var img = div(r, "ui image" + (card.responsive ? " tall landscape only" : ""));
                if (promo) {
                    var promoDiv = div(img, "ui embed");
                    promoDiv.dataset["source"] = promo.source;
                    promoDiv.dataset["id"] = promo.id;
                    $(promoDiv).embed();
                }
                if (card.blocksXml) {
                    var svg = pxt.blocks.render(card.blocksXml);
                    if (!svg) {
                        console.error("failed to render blocks");
                        console.log(card.blocksXml);
                    }
                    else {
                        var holder = div(img, '');
                        holder.setAttribute('style', 'width:100%; min-height:10em');
                        holder.appendChild(svg[0]);
                    }
                }
                if (card.typeScript) {
                    var pre = document.createElement("pre");
                    pre.appendChild(document.createTextNode(card.typeScript));
                    img.appendChild(pre);
                }
                var ct = div(r, "ui content");
                if (card.name) {
                    if (url && !link)
                        a(ct, url, card.name, 'header');
                    else
                        div(ct, 'header', 'div', card.name);
                }
                if (card.time) {
                    var meta = div(ct, "ui meta");
                    var m = div(meta, "date", "span");
                    m.appendChild(document.createTextNode(pxt.Util.timeSince(card.time)));
                }
                if (card.description) {
                    var descr = div(ct, 'ui description');
                    descr.appendChild(document.createTextNode(card.description.split('.')[0] + '.'));
                }
                if (url && !link) {
                    var extra = div(r, "ui extra content" + (card.responsive ? " tall desktop only" : ""));
                    a(extra, url, card.url, '');
                }
                return r;
            }
            codeCard.render = render;
        })(codeCard = docs.codeCard || (docs.codeCard = {}));
    })(docs = pxt.docs || (pxt.docs = {}));
})(pxt || (pxt = {}));
var pxt;
(function (pxt) {
    var runner;
    (function (runner) {
        function fillWithWidget($container, $js, $svg, run, hexname, hex) {
            if (!$svg || !$svg[0]) {
                var $c_1 = $('<div class="ui segment"></div>');
                $c_1.append($js);
                $container.replaceWith($c_1);
                return;
            }
            var cdn = pxt.webConfig.pxtCdnUrl;
            var images = cdn + "images";
            var $h = $('<div class="ui bottom attached tabular icon small compact menu">'
                + ' <div class="right icon menu"></div></div>');
            var $c = $('<div class="ui top attached segment"></div>');
            var $menu = $h.find('.right.menu');
            // blocks
            $c.append($svg);
            // js menu
            {
                var $jsBtn = $('<a class="item js"><i aria-label="JavaScript" class="keyboard icon"></i></a>').click(function () {
                    if ($c.find('.js')[0])
                        $c.find('.js').remove(); // remove previous simulators
                    else {
                        var $jsc = $('<div class="ui content js"/>').append($js);
                        if ($svg)
                            $jsc.insertAfter($svg);
                        else
                            $c.append($jsc);
                    }
                });
                $menu.append($jsBtn);
            }
            // runner menu
            if (run) {
                var $runBtn = $('<a class="item"><i aria-label="run" class="play icon"></i></a>').click(function () {
                    if ($c.find('.sim')[0])
                        $c.find('.sim').remove(); // remove previous simulators
                    else {
                        var padding = '81.97%';
                        if (pxt.appTarget.simulator)
                            padding = (100 / pxt.appTarget.simulator.aspectRatio) + '%';
                        var $embed = $("<div class=\"ui card sim\"><div class=\"ui content\"><div style=\"position:relative;height:0;padding-bottom:" + padding + ";overflow:hidden;\"><iframe style=\"position:absolute;top:0;left:0;width:100%;height:100%;\" src=\"" + (getRunUrl() + "?nofooter=1&code=" + encodeURIComponent($js.text())) + "\" allowfullscreen=\"allowfullscreen\" frameborder=\"0\"></iframe></div></div></div>");
                        $c.append($embed);
                    }
                });
                $menu.append($runBtn);
            }
            if (hexname && hex) {
                var $hexBtn = $('<a class="item"><i aria-label="download" class="download icon"></i></a>').click(function () {
                    pxt.BrowserUtils.browserDownloadText(hex, hexname, "application/x-microbit-hex");
                });
                $menu.append($hexBtn);
            }
            // inject container
            $container.replaceWith([$c, $h]);
        }
        function renderNextSnippetAsync(cls, render, options) {
            if (!cls)
                return Promise.resolve();
            var $el = $("." + cls).first();
            if (!$el[0])
                return Promise.resolve();
            return pxt.runner.decompileToBlocksAsync($el.text(), options)
                .then(function (r) {
                try {
                    render($el, r);
                }
                catch (e) {
                    console.error('error while rendering ' + $el.html());
                    $el.append($('<div/>').addClass("ui segment warning").text(e.message));
                }
                $el.removeClass(cls);
                return Promise.delay(1, renderNextSnippetAsync(cls, render, options));
            });
        }
        function renderSnippetsAsync(options) {
            var snippetCount = 0;
            return renderNextSnippetAsync(options.snippetClass, function (c, r) {
                var s = r.compileBlocks && r.compileBlocks.success ? r.blocksSvg : undefined;
                var js = $('<code/>').text(c.text().trim());
                if (options.snippetReplaceParent)
                    c = c.parent();
                var compiled = r.compileJS && r.compileJS.success;
                var hex = options.hex && compiled && r.compileJS.outfiles[ts.pxt.BINARY_HEX]
                    ? r.compileJS.outfiles[ts.pxt.BINARY_HEX] : undefined;
                var hexname = pxt.appTarget.id + "-" + (options.hexName || '') + "-" + snippetCount++ + ".hex";
                fillWithWidget(c, js, s, options.simulator && compiled, hexname, hex);
            });
        }
        function decompileCallInfo(stmt) {
            if (!stmt || stmt.kind != ts.SyntaxKind.ExpressionStatement)
                return null;
            var estmt = stmt;
            if (!estmt.expression || estmt.expression.kind != ts.SyntaxKind.CallExpression)
                return null;
            var call = estmt.expression;
            var info = call.callInfo;
            return info;
        }
        function renderSignaturesAsync(options) {
            return renderNextSnippetAsync(options.signatureClass, function (c, r) {
                var cjs = r.compileJS;
                if (!cjs)
                    return;
                var file = r.compileJS.ast.getSourceFile("main.ts");
                var info = decompileCallInfo(file.statements[0]);
                if (!info)
                    return;
                var s = r.compileBlocks && r.compileBlocks.success ? r.blocksSvg : undefined;
                var sig = info.decl.getText().replace(/^export/, '');
                sig = sig.slice(0, sig.indexOf('{')).trim() + ';';
                var js = $('<code/>').text(sig);
                if (options.snippetReplaceParent)
                    c = c.parent();
                fillWithWidget(c, js, s, false);
            });
        }
        function renderShuffleAsync(options) {
            return renderNextSnippetAsync(options.shuffleClass, function (c, r) {
                var s = r.blocksSvg;
                if (options.snippetReplaceParent)
                    c = c.parent();
                var segment = $('<div class="ui segment"/>').append(s);
                c.replaceWith(segment);
            }, { emPixels: 14, layout: pxt.blocks.BlockLayout.Shuffle });
        }
        function renderBlocksAsync(options) {
            return renderNextSnippetAsync(options.blocksClass, function (c, r) {
                var s = r.blocksSvg;
                if (options.snippetReplaceParent)
                    c = c.parent();
                c.replaceWith(s);
            });
        }
        function renderLinksAsync(cls, replaceParent, ns) {
            return renderNextSnippetAsync(cls, function (c, r) {
                var cjs = r.compileJS;
                if (!cjs)
                    return;
                var file = r.compileJS.ast.getSourceFile("main.ts");
                var stmts = file.statements;
                var ul = $('<div />').addClass('ui cards');
                var addItem = function (card) {
                    if (!card)
                        return;
                    ul.append(pxt.docs.codeCard.render(card, { hideHeader: true }));
                };
                stmts.forEach(function (stmt) {
                    var info = decompileCallInfo(stmt);
                    if (info) {
                        var block = Blockly.Blocks[info.attrs.blockId];
                        if (ns) {
                            var ii = r.compileBlocks.blocksInfo.apis.byQName[info.qName];
                            var nsi = r.compileBlocks.blocksInfo.apis.byQName[ii.namespace];
                            addItem({
                                name: nsi.name,
                                url: nsi.attributes.help || ("reference/" + nsi.name),
                                description: nsi.attributes.jsDoc,
                                blocksXml: block && block.codeCard
                                    ? block.codeCard.blocksXml
                                    : info.attrs.blockId
                                        ? "<xml><block type=\"" + info.attrs.blockId + "\"></block></xml>"
                                        : undefined,
                                link: true
                            });
                        }
                        else if (block) {
                            var card = pxt.U.clone(block.codeCard);
                            if (card) {
                                card.link = true;
                                addItem(card);
                            }
                        }
                    }
                    else
                        switch (stmt.kind) {
                            case ts.SyntaxKind.ExpressionStatement:
                                var es = stmt;
                                switch (es.expression.kind) {
                                    case ts.SyntaxKind.TrueKeyword:
                                    case ts.SyntaxKind.FalseKeyword:
                                        addItem({
                                            name: "Boolean",
                                            url: "reference/types/boolean",
                                            description: lf("True or false values"),
                                            blocksXml: '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="logic_boolean"><field name="BOOL">TRUE</field></block></xml>',
                                            link: true
                                        });
                                        break;
                                    default:
                                        console.log("card expr kind: " + es.expression.kind);
                                        break;
                                }
                                break;
                            case ts.SyntaxKind.IfStatement:
                                addItem({
                                    name: ns ? "Logic" : "if",
                                    url: "reference/logic" + (ns ? "" : "/if"),
                                    description: ns ? lf("Logic operators and constants") : lf("Conditional statement"),
                                    blocksXml: '<xml><block type="controls_if"></block></xml>',
                                    link: true
                                });
                                break;
                            case ts.SyntaxKind.ForStatement:
                                addItem({
                                    name: ns ? "Loops" : "for",
                                    url: "reference/loops" + (ns ? "" : "/for"),
                                    description: ns ? lf("Loops and repetition") : lf("Repeat code for a given number of times."),
                                    blocksXml: '<xml><block type="controls_simple_for"></block></xml>',
                                    link: true
                                });
                                break;
                            case ts.SyntaxKind.VariableStatement:
                                addItem({
                                    name: ns ? "Variables" : "variable declaration",
                                    url: "reference/variables" + (ns ? "" : "/assign"),
                                    description: ns ? lf("Variables") : lf("Assign a value to a named variable."),
                                    blocksXml: '<xml><block type="variables_set"></block></xml>',
                                    link: true
                                });
                                break;
                            default:
                                console.log("card kind: " + stmt.kind);
                        }
                });
                if (replaceParent)
                    c = c.parent();
                c.replaceWith(ul);
            });
        }
        function fillCodeCardAsync(c, card, options) {
            if (!card)
                return Promise.resolve();
            var cc = pxt.docs.codeCard.render(card, options);
            c.replaceWith(cc);
            return Promise.resolve();
        }
        function renderNextCodeCardAsync(cls) {
            if (!cls)
                return Promise.resolve();
            var $el = $("." + cls).first();
            if (!$el[0])
                return Promise.resolve();
            $el.removeClass(cls);
            var card;
            try {
                card = JSON.parse($el.text());
            }
            catch (e) {
                console.error('error while rendering ' + $el.html());
                $el.append($('<div/>').addClass("ui segment warning").text(e.messageText));
            }
            return fillCodeCardAsync($el, card, { hideHeader: true })
                .then(function () { return Promise.delay(1, renderNextCodeCardAsync(cls)); });
        }
        function getRunUrl() {
            return pxt.webConfig && pxt.webConfig.runUrl ? pxt.webConfig.runUrl : '/--run';
        }
        function renderAsync(options) {
            if (!options)
                options = {};
            if (options.simulatorClass) {
                // simulators
                $('.' + options.simulatorClass).each(function (i, c) {
                    var $c = $(c);
                    var padding = '81.97%';
                    if (pxt.appTarget.simulator)
                        padding = (100 / pxt.appTarget.simulator.aspectRatio) + '%';
                    var $sim = $("<div class=\"ui centered card\"><div class=\"ui content\">\n                    <div style=\"position:relative;height:0;padding-bottom:" + padding + ";overflow:hidden;\">\n                    <iframe style=\"position:absolute;top:0;left:0;width:100%;height:100%;\" allowfullscreen=\"allowfullscreen\" frameborder=\"0\"></iframe>\n                    </div>\n                    </div></div>");
                    $sim.find("iframe").attr("src", getRunUrl() + "?nofooter=1&code=" + encodeURIComponent($c.text().trim()));
                    if (options.snippetReplaceParent)
                        $c = $c.parent();
                    $c.replaceWith($sim);
                });
            }
            return Promise.resolve()
                .then(function () { return renderShuffleAsync(options); })
                .then(function () { return renderLinksAsync(options.linksClass, options.snippetReplaceParent, false); })
                .then(function () { return renderLinksAsync(options.namespacesClass, options.snippetReplaceParent, true); })
                .then(function () { return renderSignaturesAsync(options); })
                .then(function () { return renderNextCodeCardAsync(options.codeCardClass); })
                .then(function () { return renderSnippetsAsync(options); })
                .then(function () { return renderBlocksAsync(options); });
        }
        runner.renderAsync = renderAsync;
    })(runner = pxt.runner || (pxt.runner = {}));
})(pxt || (pxt = {}));
/// <reference path="../built/pxtlib.d.ts" />
/// <reference path="../built/pxtblocks.d.ts" />
/// <reference path="../built/pxtsim.d.ts" />
var pxt;
(function (pxt) {
    var runner;
    (function (runner) {
        var EditorPackage = (function () {
            function EditorPackage(ksPkg, topPkg) {
                this.ksPkg = ksPkg;
                this.topPkg = topPkg;
                this.files = {};
            }
            EditorPackage.prototype.getKsPkg = function () {
                return this.ksPkg;
            };
            EditorPackage.prototype.getPkgId = function () {
                return this.ksPkg ? this.ksPkg.id : this.id;
            };
            EditorPackage.prototype.isTopLevel = function () {
                return this.ksPkg && this.ksPkg.level == 0;
            };
            EditorPackage.prototype.setFiles = function (files) {
                this.files = files;
            };
            EditorPackage.prototype.getAllFiles = function () {
                return pxt.Util.mapStringMap(this.files, function (k, f) { return f; });
            };
            return EditorPackage;
        }());
        var Host = (function () {
            function Host() {
            }
            Host.prototype.readFile = function (module, filename) {
                var epkg = getEditorPkg(module);
                return pxt.U.lookup(epkg.files, filename);
            };
            Host.prototype.writeFile = function (module, filename, contents) {
                if (filename == pxt.configName)
                    return; // ignore config writes
                throw pxt.Util.oops("trying to write " + module + " / " + filename);
            };
            Host.prototype.getHexInfoAsync = function (extInfo) {
                return pxt.hex.getHexInfoAsync(this, extInfo);
            };
            Host.prototype.cacheStoreAsync = function (id, val) {
                return Promise.resolve();
            };
            Host.prototype.cacheGetAsync = function (id) {
                return Promise.resolve(null);
            };
            Host.prototype.downloadPackageAsync = function (pkg) {
                var proto = pkg.verProtocol();
                var epkg = getEditorPkg(pkg);
                if (proto == "pub") {
                    return pxt.Cloud.downloadScriptFilesAsync(pkg.verArgument())
                        .then(function (files) { return epkg.setFiles(files); });
                }
                else if (proto == "embed") {
                    epkg.setFiles(pxt.getEmbeddedScript(pkg.verArgument()));
                    return Promise.resolve();
                }
                else if (proto == "empty") {
                    epkg.setFiles(emptyPrjFiles());
                    return Promise.resolve();
                }
                else {
                    return Promise.reject("Cannot download " + pkg.version() + "; unknown protocol");
                }
            };
            Host.prototype.resolveVersionAsync = function (pkg) {
                return pxt.Cloud.privateGetAsync(pxt.pkgPrefix + pkg.id)
                    .then(function (r) {
                    var id = (r || {})["scriptid"];
                    if (!id)
                        pxt.Util.userError(lf("cannot resolve package {0}", pkg.id));
                    return id;
                });
            };
            return Host;
        }());
        function getEditorPkg(p) {
            var r = p._editorPkg;
            if (r)
                return r;
            var top = null;
            if (p != runner.mainPkg)
                top = getEditorPkg(runner.mainPkg);
            var newOne = new EditorPackage(p, top);
            if (p == runner.mainPkg)
                newOne.topPkg = newOne;
            p._editorPkg = newOne;
            return newOne;
        }
        function emptyPrjFiles() {
            var p = pxt.appTarget.tsprj;
            var files = pxt.U.clone(p.files);
            files[pxt.configName] = JSON.stringify(p.config, null, 4) + "\n";
            return files;
        }
        function initInnerAsync() {
            var lang = /lang=([a-z]{2,}(-[A-Z]+)?)/i.exec(window.location.href);
            var cfg = pxt.webConfig;
            return pxt.Util.updateLocalizationAsync(cfg.pxtCdnUrl, lang ? lang[1] : (navigator.userLanguage || navigator.language))
                .then(function () { return pxt.Util.httpGetJsonAsync(cfg.targetCdnUrl + "target.json"); })
                .then(function (trgbundle) {
                pxt.appTarget = trgbundle;
                runner.mainPkg = new pxt.MainPackage(new Host());
            });
        }
        function initFooter(footer, shareId) {
            var theme = pxt.appTarget.appTheme;
            if (footer.length == 0)
                return;
            var body = $('body');
            var footera = $('<a/>').attr('href', theme.homeUrl)
                .attr('target', '_blank');
            footer.append(footera);
            if (theme.organizationLogo)
                footera.append($('<img/>').attr('src', pxt.Util.toDataUri(theme.organizationLogo)));
            else
                footera.append(lf("powered by {0}", theme.title));
            body.mouseenter(function (ev) { return footer.fadeOut(); });
            body.mouseleave(function (ev) { return footer.fadeIn(); });
        }
        runner.initFooter = initFooter;
        function showError(msg) {
            console.error(msg);
        }
        runner.showError = showError;
        function loadPackageAsync(id) {
            var host = runner.mainPkg.host();
            runner.mainPkg = new pxt.MainPackage(host);
            runner.mainPkg._verspec = id ? "pub:" + id : "empty:tsprj";
            return host.downloadPackageAsync(runner.mainPkg)
                .then(function () { return host.readFile(runner.mainPkg, pxt.configName); })
                .then(function (str) {
                if (!str)
                    return Promise.resolve();
                return runner.mainPkg.installAllAsync()
                    .catch(function (e) {
                    showError(lf("Cannot load package: {0}", e.message));
                });
            });
        }
        function getCompileOptionsAsync(hex) {
            var trg = runner.mainPkg.getTargetOptions();
            trg.isNative = !!hex;
            trg.hasHex = !!hex;
            return runner.mainPkg.getCompileOptionsAsync(trg);
        }
        function compileAsync(hex, updateOptions) {
            return getCompileOptionsAsync()
                .then(function (opts) {
                if (updateOptions)
                    updateOptions(opts);
                var resp = ts.pxt.compile(opts);
                if (resp.diagnostics && resp.diagnostics.length > 0) {
                    resp.diagnostics.forEach(function (diag) {
                        console.error(diag.messageText);
                    });
                }
                return resp;
            });
        }
        function generateHexFileAsync(options) {
            return loadPackageAsync(options.id)
                .then(function () { return compileAsync(true, function (opts) {
                if (options.code)
                    opts.fileSystem["main.ts"] = options.code;
            }); })
                .then(function (resp) {
                if (resp.diagnostics && resp.diagnostics.length > 0) {
                    console.error("Diagnostics", resp.diagnostics);
                }
                return resp.outfiles[ts.pxt.BINARY_HEX];
            });
        }
        runner.generateHexFileAsync = generateHexFileAsync;
        function simulateAsync(container, simOptions) {
            return loadPackageAsync(simOptions.id)
                .then(function () { return compileAsync(false, function (opts) {
                if (simOptions.code)
                    opts.fileSystem["main.ts"] = simOptions.code;
            }); })
                .then(function (resp) {
                if (resp.diagnostics && resp.diagnostics.length > 0) {
                    console.error("Diagnostics", resp.diagnostics);
                }
                var js = resp.outfiles[ts.pxt.BINARY_JS];
                if (js) {
                    var options = {};
                    if (pxt.appTarget.simulator)
                        options.aspectRatio = pxt.appTarget.simulator.aspectRatio;
                    var driver = new pxsim.SimulatorDriver(container, options);
                    driver.run(js);
                }
            });
        }
        runner.simulateAsync = simulateAsync;
        function decompileToBlocksAsync(code, options) {
            return loadPackageAsync(null)
                .then(function () { return getCompileOptionsAsync(pxt.appTarget.compile ? pxt.appTarget.compile.hasHex : false); })
                .then(function (opts) {
                // compile
                opts.fileSystem["main.ts"] = code;
                opts.ast = true;
                var resp = ts.pxt.compile(opts);
                if (resp.diagnostics && resp.diagnostics.length > 0)
                    resp.diagnostics.forEach(function (diag) { return console.error(diag.messageText); });
                if (!resp.success)
                    return { compileJS: resp };
                // decompile to blocks
                var apis = ts.pxt.getApiInfo(resp.ast);
                var blocksInfo = ts.pxt.getBlocksInfo(apis);
                pxt.blocks.initBlocks(blocksInfo);
                var bresp = ts.pxt.decompiler.decompileToBlocks(blocksInfo, resp.ast.getSourceFile("main.ts"));
                if (bresp.diagnostics && bresp.diagnostics.length > 0)
                    bresp.diagnostics.forEach(function (diag) { return console.error(diag.messageText); });
                if (!bresp.success)
                    return { compileJS: resp, compileBlocks: bresp };
                console.log(bresp.outfiles["main.blocks"]);
                return {
                    compileJS: resp,
                    compileBlocks: bresp,
                    blocksSvg: pxt.blocks.render(bresp.outfiles["main.blocks"], options)
                };
            });
        }
        runner.decompileToBlocksAsync = decompileToBlocksAsync;
        runner.initCallbacks = [];
        function init() {
            initInnerAsync()
                .done(function () {
                for (var i = 0; i < runner.initCallbacks.length; ++i) {
                    runner.initCallbacks[i]();
                }
            });
        }
        runner.init = init;
        function windowLoad() {
            var f = window.ksRunnerWhenLoaded;
            if (f)
                f();
        }
        windowLoad();
    })(runner = pxt.runner || (pxt.runner = {}));
})(pxt || (pxt = {}));
//# sourceMappingURL=pxtrunner.js.map