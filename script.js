// node_modules/marked/lib/marked.esm.js
function v() {
  return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
}
var y = v();
function ee(a3) {
  y = a3;
}
var B = { exec: () => null };
function I(a3) {
  let e = [];
  return (t) => {
    let n = Math.max(0, Math.min(3, t - 1)), s = e[n];
    return s || (s = a3(n), e[n] = s), s;
  };
}
function c(a3, e = "") {
  let t = typeof a3 == "string" ? a3 : a3.source, n = { replace: (s, r) => {
    let o = typeof r == "string" ? r : r.source;
    return o = o.replace(T.caret, "$1"), t = t.replace(s, o), n;
  }, getRegex: () => new RegExp(t, e) };
  return n;
}
var Me = ((a3 = "") => {
  try {
    return !!new RegExp("(?<=1)(?<!1)" + a3);
  } catch {
    return false;
  }
})();
var T = { codeRemoveIndent: /^(?: {0,3}\t| {1,4})/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, endingSpaceTabChar: /[ \t]$/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, leadingSpaceTab: /^[ \t]+/, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, blockquoteMarkerWhitespace: /^( {0,3}>)([ \t]+)/gm, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] +\S/, listReplaceTask: /^\[[ xX]\] +/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, numericCharacterReference: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/, numericCharacterReferenceOrAmpersand: /&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (a3) => new RegExp(`^( {0,3}${a3})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: I((a3) => new RegExp(`^ {0,${a3}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)), hrRegex: I((a3) => new RegExp(`^ {0,${a3}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)), fencesBeginRegex: I((a3) => new RegExp(`^ {0,${a3}}(?:\`\`\`|~~~)`)), headingBeginRegex: I((a3) => new RegExp(`^ {0,${a3}}#{1,6}(?:\\s|$)`)), pedanticHeadingBeginRegex: I((a3) => new RegExp(`^ {0,${a3}}#`)), htmlBeginRegex: I((a3) => new RegExp(`^ {0,${a3}}(?:</?(?:${K})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`, "i")), blockquoteBeginRegex: I((a3) => new RegExp(`^ {0,${a3}}>`)) };
var Ce = /^(?:[ \t]*(?:\n|$))+/;
var Ee = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var Ie = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var U = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var Be = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var ne = / {0,3}(?:[*+-]|\d{1,9}[.)])/;
var me = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var xe = c(me).replace(/bull/g, ne).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var De = c(me).replace(/bull/g, ne).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/hr/g, / {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var re = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/;
var qe = /^[^\n]+/;
var se = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/;
var Ze = c(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", se).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var ve = c(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, ne).getRegex();
var K = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var ie = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var He = c("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?:[ \\t]+|\\n|/?>|$)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", ie).replace("tag", K).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var be = (a3) => c(re).replace("hr", U).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", a3).replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", K).getRegex();
var Ge = be(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/);
var Ne = be(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/);
var Qe = c(/^( {0,3}> ?(?:(?![ \t]*(?:\n|$))(paragraph)|[^\n]*)(?:\n|$))+/).replace("paragraph", Ne).getRegex();
var oe = { blockquote: Qe, code: Ee, def: Ze, fences: Ie, heading: Be, hr: U, html: He, lheading: xe, list: ve, newline: Ce, paragraph: Ge, table: B, text: qe };
var ke = c("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", U).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", K).getRegex();
var je = { ...oe, lheading: De, table: ke, paragraph: c(re).replace("hr", U).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", ke).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", " {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag", K).getRegex() };
var Fe = { ...oe, html: c(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", ie).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: B, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: c(re).replace("hr", U).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", xe).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() };
var Ue = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var Ke = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var Re = /^( {2,}|\\)\n(?!\s*$)[ \t]*/;
var We = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var $ = /[\p{P}\p{S}]/u;
var H = /[\s\p{P}\p{S}]/u;
var W = /[^\s\p{P}\p{S}]/u;
var Xe = c(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, H).getRegex();
var Ve = /[\p{Pi}\p{Ps}"']/u;
var Te = /(?!~)[\p{P}\p{S}]/u;
var Je = /(?!~)[\s\p{P}\p{S}]/u;
var Ye = /(?:[^\s\p{P}\p{S}]|~)/u;
var et = c(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", Me ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
var Oe = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/;
var tt = c(Oe, "u").replace(/punct/g, $).getRegex();
var nt = c(Oe, "u").replace(/punct/g, Te).getRegex();
var rt = /^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/;
var st = c(rt, "u").replace(/openQuote/g, Ve).replace(/punct/g, $).getRegex();
var we = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var it = c(we, "gu").replace(/notPunctSpace/g, W).replace(/punctSpace/g, H).replace(/punct/g, $).getRegex();
var ot = c(we, "gu").replace(/notPunctSpace/g, Ye).replace(/punctSpace/g, Je).replace(/punct/g, Te).getRegex();
var at = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)";
var lt = c(at, "gu").replace(/notPunctSpace/g, W).replace(/punctSpace/g, H).replace(/punct/g, $).getRegex();
var ut = c("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, W).replace(/punctSpace/g, H).replace(/punct/g, $).getRegex();
var pt = "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)";
var ct = c(pt, "gu").replace(/notPunctSpace/g, W).replace(/punctSpace/g, H).replace(/punct/g, $).getRegex();
var ht = c(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, $).getRegex();
var dt = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)";
var kt = c(dt, "gu").replace(/notPunctSpace/g, W).replace(/punctSpace/g, H).replace(/punct/g, $).getRegex();
var gt = c(/\\(punct)/, "gu").replace(/punct/g, $).getRegex();
var ft = c(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/, "gu").replace(/punct/g, $).getRegex();
var mt = c(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var xt = c(ie).replace("(?:-->|$)", "-->").getRegex();
var bt = c("^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", xt).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var Pe = /\[(?:\\[\s\S]|[^\[\]\\])*\]/;
var Y = c(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace("brackets", Pe).getRegex();
var Rt = c(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace("label", Y).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var Tt = c(/^!?\[(label)\]\[(ref)\]/).replace("label", Y).replace("ref", se).getRegex();
var Ot = c(/^!?\[(ref)\](?:\[\])?/).replace("ref", se).getRegex();
var ge = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/;
var wt = c(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace("brackets", Pe).getRegex();
var Pt = c("reflink|nolink(?!\\()", "g").replace("reflink", c(/^!?\[(label)\]\[(ref)\]/).replace("label", wt).replace("ref", ge).getRegex()).replace("nolink", c(/^!?\[(ref)\](?:\[\])?/).replace("ref", ge).getRegex()).getRegex();
var fe = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
var yt = /[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/;
var St = c(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g, yt).getRegex();
var ae = { _backpedal: B, anyPunctuation: gt, anyPunctuationOutsideCode: ft, autolink: mt, blockSkip: et, br: Re, code: Ke, del: B, delLDelim: B, delRDelim: B, emStrongLDelim: tt, emStrongRDelimAst: it, emStrongRDelimUnd: ut, escape: Ue, link: Rt, nolink: Ot, punctuation: Xe, reflink: Tt, reflinkSearch: Pt, tag: bt, text: We, url: B };
var _t = { ...ae, emStrongLDelim: st, emStrongRDelimAst: lt, emStrongRDelimUnd: ct, link: c(/^!?\[(label)\]\((.*?)\)/).replace("label", Y).getRegex(), reflink: c(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Y).getRegex() };
var te = { ...ae, emStrongRDelimAst: ot, emStrongLDelim: nt, delLDelim: ht, delRDelim: kt, url: c(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("emailProtocol", St).replace("protocol", fe).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: c(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace("protocol", fe).replace(/emailProtocol/g, /(?:mailto|xmpp):/).getRegex() };
var $t = { ...te, br: c(Re).replace("{2,}", "*").getRegex(), text: c(te.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() };
var X = { normal: oe, gfm: je, pedantic: Fe };
var G = { normal: ae, gfm: te, breaks: $t, pedantic: _t };
var Lt = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var ye = (a3) => Lt[a3];
function P(a3, e) {
  if (e) {
    if (T.escapeTest.test(a3)) return a3.replace(T.escapeReplace, ye);
  } else if (T.escapeTestNoEncode.test(a3)) return a3.replace(T.escapeReplaceNoEncode, ye);
  return a3;
}
function Se(a3) {
  return T.numericCharacterReference.test(a3) ? a3.replace(T.numericCharacterReferenceOrAmpersand, (e, t, n) => {
    if (t === void 0 && n === void 0) return "&amp;";
    let s = t === void 0 ? Number.parseInt(n, 16) : Number.parseInt(t, 10);
    return s === 0 || s > 1114111 || s >= 55296 && s <= 57343 ? "\uFFFD" : s === 38 ? "&amp;" : String.fromCodePoint(s);
  }) : a3;
}
function le(a3) {
  try {
    a3 = encodeURI(a3).replace(T.percentDecode, "%");
  } catch {
    return null;
  }
  return a3;
}
function ue(a3, e) {
  let t = a3.replace(T.findPipe, (r, o, i2) => {
    let l = false, u = o;
    for (; --u >= 0 && i2[u] === "\\"; ) l = !l;
    return l ? "|" : " |";
  }), n = t.split(T.splitPipe), s = 0;
  if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e) if (n.length > e) n.splice(e);
  else for (; n.length < e; ) n.push("");
  for (; s < n.length; s++) n[s] = n[s].trim().replace(T.slashPipe, "|");
  return n;
}
function z(a3, e, t) {
  let n = a3.length;
  if (n === 0) return "";
  let s = 0;
  for (; s < n; ) {
    let r = a3.charAt(n - s - 1);
    if (r === e && !t) s++;
    else if (r !== e && t) s++;
    else break;
  }
  return a3.slice(0, n - s);
}
function pe(a3) {
  let e = a3.split(`
`), t = e.length - 1;
  for (; t >= 0 && T.blankLine.test(e[t]); ) t--;
  return e.length - t <= 2 ? a3 : e.slice(0, t + 1).join(`
`);
}
function N(a3) {
  return a3.trim().toLowerCase().toUpperCase().toLowerCase();
}
function ce(a3, e) {
  if (a3.indexOf(e[0]) === -1 && a3.indexOf(e[1]) === -1) return -1;
  let t = 0;
  for (let n = 0; n < a3.length; n++) if (a3[n] === "\\") n++;
  else if (a3[n] === e[0]) t++;
  else if (a3[n] === e[1] && (t--, t < 0)) return n;
  return t > 0 ? -2 : -1;
}
function V(a3, e = 0) {
  let t = e, n = "";
  for (let s of a3) if (s === "	") {
    let r = 4 - t % 4;
    n += " ".repeat(r), t += r;
  } else n += s, t++;
  return n;
}
function _e(a3, e, t, n, s) {
  let r = e.href, o = e.title || null, i2 = a3[1].replace(s.other.outputLinkReplace, "$1"), l = a3[0].charAt(0) === "!", u = n.state.inLink, h = n.state.linkEmitted, p = n.state.inRawBlock;
  n.state.inLink = true, n.state.linkEmitted = false;
  let d = n.inlineTokens(i2), g = n.state.linkEmitted;
  if (n.state.linkEmitted = h, n.state.inLink = u, !l) {
    if (g) {
      n.state.inRawBlock = p;
      return;
    }
    n.state.linkEmitted = true;
  }
  return { type: l ? "image" : "link", raw: t, href: r, title: o, text: i2, tokens: d };
}
function At(a3, e, t) {
  let n = a3.match(t.other.indentCodeCompensation);
  if (n === null) return e;
  let s = n[1];
  return e.split(`
`).map((r) => {
    let o = r.match(t.other.beginningSpace);
    if (o === null) return r;
    let [i2] = o;
    return r.slice(Math.min(i2.length, s.length));
  }).join(`
`);
}
function $e(a3, e, t, n) {
  if (!e.includes("<")) return false;
  for (let s = 0; s < e.length; s++) {
    if (e[s] === "\\") {
      s++;
      continue;
    }
    if (e[s] === "`") {
      let i2 = n.inline.code.exec(e.slice(s));
      if (i2) {
        s += i2[0].length - 1;
        continue;
      }
    }
    if (e[s] !== "<") continue;
    let r = a3.slice(t + s), o = n.inline.tag.exec(r) || n.inline.autolink.exec(r);
    if (o) {
      if (o[0].length > e.length - s) return true;
      s += o[0].length - 1;
    }
  }
  return false;
}
var _ = class {
  options;
  rules;
  lexer;
  constructor(e) {
    this.options = e || y;
  }
  space(e) {
    let t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0) return { type: "space", raw: t[0] };
  }
  code(e) {
    let t = this.rules.block.code.exec(e);
    if (t) {
      let n = this.options.pedantic ? t[0] : pe(t[0]), s = n.replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: n, codeBlockStyle: "indented", text: s };
    }
  }
  fences(e) {
    let t = this.rules.block.fences.exec(e);
    if (t) {
      let n = t[0], s = At(n, t[3] || "", this.rules);
      return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: s };
    }
  }
  heading(e) {
    let t = this.rules.block.heading.exec(e);
    if (t) {
      let n = t[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        let s = z(n, "#");
        (this.options.pedantic || !s || this.rules.other.endingSpaceTabChar.test(s)) && (n = s.trim());
      }
      return { type: "heading", raw: z(t[0], `
`), depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
    }
  }
  hr(e) {
    let t = this.rules.block.hr.exec(e);
    if (t) return { type: "hr", raw: z(t[0], `
`) };
  }
  blockquote(e) {
    let t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = z(t[0], `
`).split(`
`), s = "", r = "", o = [];
      for (; n.length > 0; ) {
        let i2 = false, l = [], u;
        for (u = 0; u < n.length; u++) if (this.rules.other.blockquoteStart.test(n[u])) l.push(n[u]), i2 = true;
        else if (!i2) l.push(n[u]);
        else break;
        n = n.slice(u);
        let h = l.join(`
`), p = h.replace(this.rules.other.blockquoteMarkerWhitespace, (k, b, x2) => b + V(x2, b.length)).replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${h}` : h, r = r ? `${r}
${p}` : p;
        let d = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(p, o, true), this.lexer.state.top = d, n.length === 0) break;
        let g = o.at(-1);
        if (g?.type === "code" || g?.type === "heading" || g?.type === "hr" || g?.type === "html") break;
        if (g?.type === "blockquote") {
          let k = g, b = n.join(`
`), x2 = k.raw + `
` + b.replace(this.rules.other.blockquoteSetextReplace2, ""), f = this.blockquote(x2);
          o[o.length - 1] = f;
          let S = x2.substring(f.raw.length).replace(/^\n/, ""), R = S ? S.split(`
`).length : 0, C = R ? n.slice(0, -R) : n;
          C.length > 0 && (s = `${s}
${C.join(`
`)}`), r = r.substring(0, r.length - k.text.length) + f.text;
          break;
        } else if (g?.type === "list") {
          let k = g, b = k.raw + `
` + n.join(`
`), x2 = this.list(b);
          o[o.length - 1] = x2;
          let f = x2.raw.length > k.raw.length ? b.slice(k.raw.length + 1, x2.raw.length).split(`
`).length : 0;
          if (f > 0) {
            let S = n.slice(0, f).join(`
`);
            s = `${s}
${S}`, r = `${r}
${S}`;
          }
          n = n.slice(f);
          continue;
        }
      }
      return { type: "blockquote", raw: s, tokens: o, text: r };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let n = e, s = () => n.length - e.length, r = t[1].trim(), o = r.length > 1, i2 = { type: "list", raw: "", ordered: o, start: o ? +r.slice(0, -1) : "", loose: false, items: [] };
      r = o ? `\\d{1,9}\\${r.slice(-1)}` : `\\${r}`, this.options.pedantic && (r = o ? r : "[*+-]");
      let l = this.rules.other.listItemRegex(r), u = false;
      for (; e; ) {
        let p = false, d = "";
        if (!(t = l.exec(e)) || this.rules.block.hr.test(e)) break;
        let g = s();
        e = e.substring(t[0].length);
        let k = t[2].split(`
`, 1)[0], b = t[1].length, x2 = this.options.pedantic ? V(k, b) : k.replace(this.rules.other.leadingSpaceTab, (Q) => V(Q, b)), f = e.split(`
`, 1)[0], S = !x2.trim(), R = 0;
        if (this.options.pedantic ? (R = 2, d = x2.trimStart()) : S ? R = b + 1 : (R = x2.search(this.rules.other.nonSpaceChar), R = R > 4 ? 1 : R, d = x2.slice(R), R += b), S && this.rules.other.blankLine.test(f) && (e = e.substring(f.length + 1), p = true), !p) {
          let Q = this.rules.other.nextBulletRegex(R), E = this.rules.other.hrRegex(R), j = this.rules.other.fencesBeginRegex(R), F = this.options.pedantic ? this.rules.other.pedanticHeadingBeginRegex(R) : this.rules.other.headingBeginRegex(R), Le = this.rules.other.htmlBeginRegex(R), Ae = this.rules.other.blockquoteBeginRegex(R);
          for (; e; ) {
            let he = e.split(`
`, 1)[0], Z;
            if (f = he, this.options.pedantic ? (f = f.replace(this.rules.other.listReplaceNesting, "  "), Z = f) : Z = f.replace(this.rules.other.leadingSpaceTab, (de) => V(de)), j.test(f) || F.test(f) || Le.test(f) || Ae.test(f) || Q.test(f) || E.test(f)) break;
            if (Z.search(this.rules.other.nonSpaceChar) >= R || !f.trim()) d += `
` + Z.slice(R);
            else {
              if (S || x2.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || j.test(x2) || F.test(x2) || E.test(x2)) break;
              let ze = !this.options.pedantic && /^ {0,3}(?:=+|-+) *$/.test(f) && this.rules.block.lheading.test(`${x2}
${f}`) ? `    ${Z.replace(/^ {0,3}/, "")}` : f;
              d += `
` + ze;
            }
            S = !f.trim(), e = e.substring(he.length + 1), x2 = Z.slice(R);
          }
        }
        let C = n.slice(g, s());
        i2.loose || (u ? i2.loose = true : this.rules.other.doubleBlankLine.test(C) && (u = true)), i2.items.push({ type: "list_item", raw: C, task: !!this.options.gfm && this.rules.other.listIsTask.test(d), loose: false, text: d, tokens: [] });
      }
      let h = i2.items.at(-1);
      if (h) h.raw = h.raw.trimEnd(), h.text = h.text.trimEnd();
      else return;
      i2.raw = n.slice(0, s()).trimEnd();
      for (let p of i2.items) if (this.lexer.state.top = false, p.tokens = this.lexer.blockTokens(p.text, []), !i2.loose) {
        let d = p.tokens.filter((k) => k.type === "space"), g = d.length > 0 && d.some((k) => this.rules.other.anyLine.test(k.raw));
        i2.loose = g;
      }
      for (let p of i2.items) {
        let d = p.tokens[0];
        if (p.task && (d?.type === "text" || d?.type === "paragraph")) {
          p.text = p.text.replace(this.rules.other.listReplaceTask, ""), d.raw = d.raw.replace(this.rules.other.listReplaceTask, ""), d.text = d.text.replace(this.rules.other.listReplaceTask, "");
          for (let k = this.lexer.inlineQueue.length - 1; k >= 0; k--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[k].src)) {
            this.lexer.inlineQueue[k].src = this.lexer.inlineQueue[k].src.replace(this.rules.other.listReplaceTask, "");
            break;
          }
          let g = this.rules.other.listTaskCheckbox.exec(p.raw);
          if (g) {
            let k = { type: "checkbox", raw: g[0] + " ", checked: g[0] !== "[ ]" };
            p.checked = k.checked, i2.loose ? p.tokens[0] && ["paragraph", "text"].includes(p.tokens[0].type) && "tokens" in p.tokens[0] && p.tokens[0].tokens ? (p.tokens[0].raw = k.raw + p.tokens[0].raw, p.tokens[0].text = k.raw + p.tokens[0].text, p.tokens[0].tokens.unshift(k)) : p.tokens.unshift({ type: "paragraph", raw: k.raw, text: k.raw, tokens: [k] }) : p.tokens.unshift(k);
          }
        } else p.task && (p.task = false);
      }
      if (i2.loose) for (let p of i2.items) {
        p.loose = true;
        for (let d of p.tokens) d.type === "text" && (d.type = "paragraph");
      }
      return i2;
    }
  }
  html(e) {
    let t = this.rules.block.html.exec(e);
    if (t) {
      let n = pe(t[0]);
      return { type: "html", block: true, raw: n, pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: n };
    }
  }
  def(e) {
    let t = this.rules.block.def.exec(e);
    if (t) {
      if (!this.rules.other.startAngleBracket.test(t[2]) && ce(t[2], "()") !== -1) return;
      let n = N(t[1]).replace(this.rules.other.multipleSpaceGlobal, " "), s = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return { type: "def", tag: n, raw: z(t[0], `
`), href: s, title: r };
    }
  }
  table(e) {
    let t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
    let n = ue(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], o = { type: "table", raw: z(t[0], `
`), header: [], align: [], rows: [] };
    if (n.length === s.length) {
      for (let i2 of s) this.rules.other.tableAlignRight.test(i2) ? o.align.push("right") : this.rules.other.tableAlignCenter.test(i2) ? o.align.push("center") : this.rules.other.tableAlignLeft.test(i2) ? o.align.push("left") : o.align.push(null);
      for (let i2 = 0; i2 < n.length; i2++) o.header.push({ text: n[i2], tokens: this.lexer.inline(n[i2]), header: true, align: o.align[i2] });
      for (let i2 of r) o.rows.push(ue(i2, o.header.length).map((l, u) => ({ text: l, tokens: this.lexer.inline(l), header: false, align: o.align[u] })));
      return o;
    }
  }
  lheading(e) {
    let t = this.rules.block.lheading.exec(e);
    if (t) {
      let n = t[1].trim();
      return { type: "heading", raw: z(t[0], `
`), depth: t[2].charAt(0) === "=" ? 1 : 2, text: n, tokens: this.lexer.inline(n) };
    }
  }
  paragraph(e) {
    let t = this.rules.block.paragraph.exec(e);
    if (t) {
      let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
    }
  }
  text(e) {
    let t = this.rules.block.text.exec(e);
    if (t) return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
  }
  escape(e) {
    let t = this.rules.inline.escape.exec(e);
    if (t) return { type: "escape", raw: t[0], text: t[1] };
  }
  tag(e) {
    let t = this.rules.inline.tag.exec(e);
    if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t[0] };
  }
  link(e) {
    if (this.lexer.state.linkParenPossible === false) return;
    let t = this.rules.inline.link.exec(e);
    if (t) {
      let n = t[0].charAt(0) === "!" ? 2 : 1;
      if (!this.options.pedantic && $e(e, t[1], n, this.rules)) return;
      let s = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(s)) {
        if (!this.rules.other.endAngleBracket.test(s)) return;
        let i2 = z(s.slice(0, -1), "\\");
        if ((s.length - i2.length) % 2 === 0) return;
      } else {
        let i2 = ce(t[2], "()");
        if (i2 === -2) return;
        if (i2 > -1) {
          let u = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + i2;
          t[2] = t[2].substring(0, i2), t[0] = t[0].substring(0, u).trim(), t[3] = "";
        }
      }
      let r = t[2], o = "";
      if (this.options.pedantic) {
        let i2 = this.rules.other.pedanticHrefTitle.exec(r);
        i2 && (r = i2[1], o = i2[3]);
      } else o = t[3] ? t[3].slice(1, -1) : "";
      return r = r.trim(), this.rules.other.startAngleBracket.test(r) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(s) ? r = r.slice(1) : r = r.slice(1, -1)), _e(t, { href: r && r.replace(this.rules.inline.anyPunctuation, "$1"), title: o && o.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      let s = n[0].charAt(0) === "!" ? 2 : 1;
      if (!this.options.pedantic && $e(e, n[1], s, this.rules)) return;
      let r = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), o = t[N(r)];
      if (!o) {
        let i2 = n[0].charAt(0);
        return { type: "text", raw: i2, text: i2 };
      }
      return _e(n, o, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || !s[1] && !s[2] && !s[3] && !s[4]) return;
    let r = s[0][0], o = n === r, i2 = t.length - e.length, l = i2;
    for (; !this.options.pedantic && l > 0 && t[l - 1] === r; ) l--;
    let u = [...t.slice(Math.max(0, l - 2), l)].at(-1) ?? "", h = u === "*" || u === "_" || !!this.rules.inline.punctuation.exec(u);
    l < i2 && (n = u);
    let p = l < i2 ? h : !!this.rules.inline.punctuation.exec(n);
    if (s[4] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    let d = s[1] || s[3] || "";
    if (!d || !n || p) {
      let g = [...s[0]].length - 1, k, b, x2 = g, f = 0, S = i2 - l + g, R = !this.options.pedantic && !!u.trim() && (!!d || r === "*" && !h), C = r === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (C.lastIndex = 0, t = t.slice(-1 * e.length + g); (s = C.exec(t)) !== null; ) {
        if (k = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !k) continue;
        if (b = [...k].length, s[3] || s[4]) {
          x2 += b;
          continue;
        } else if (s[5] || s[6] || R) {
          if (o && (s[5] || s[6])) break;
          if (S % 3 && !((S + b) % 3)) {
            f += b;
            continue;
          }
        }
        if (x2 -= b, x2 > 0) continue;
        b = Math.min(b, b + x2 + f);
        let Q = [...s[0]][0].length, E = e.slice(0, g + s.index + Q + b);
        if (Math.min(g, b) % 2) {
          let F = E.slice(1, -1);
          return { type: "em", raw: E, text: F, tokens: this.lexer.inlineTokens(F) };
        }
        let j = E.slice(2, -2);
        return { type: "strong", raw: E, text: j, tokens: this.lexer.inlineTokens(j) };
      }
    }
  }
  codespan(e) {
    let t = this.rules.inline.code.exec(e);
    if (t) {
      let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), s = this.rules.other.nonSpaceChar.test(n), r = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return s && r && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
    }
  }
  br(e) {
    let t = this.rules.inline.br.exec(e);
    if (t) return { type: "br", raw: t[0] };
  }
  del(e, t, n = "") {
    let s = this.rules.inline.delLDelim.exec(e);
    if (!s) return;
    if (!(s[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let o = [...s[0]].length - 1, i2, l, u = o, h = this.rules.inline.delRDelim;
      for (h.lastIndex = 0, t = t.slice(-1 * e.length + o); (s = h.exec(t)) !== null; ) {
        if (i2 = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !i2 || (l = [...i2].length, l !== o)) continue;
        if (s[3] || s[4]) {
          u += l;
          continue;
        }
        if (u -= l, u > 0) continue;
        l = Math.min(l, l + u);
        let p = [...s[0]][0].length, d = e.slice(0, o + s.index + p + l), g = d.slice(o, -o);
        return { type: "del", raw: d, text: g, tokens: this.lexer.inlineTokens(g) };
      }
    }
  }
  autolink(e) {
    let t = this.rules.inline.autolink.exec(e);
    if (t) {
      let n, s;
      return t[2] === "@" ? (n = t[1], s = "mailto:" + n) : (n = t[1], s = n), { type: "link", raw: t[0], text: n, href: s, autolink: true, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  url(e) {
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let n, s;
      if (t[2] === "@") n = t[0], s = "mailto:" + n;
      else {
        let r;
        do
          r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
        while (r !== t[0]);
        n = t[0], t[1] === "www." ? s = "http://" + t[0] : s = t[0];
      }
      return { type: "link", raw: t[0], text: n, href: s, autolink: true, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  inlineText(e) {
    let t = this.rules.inline.text.exec(e);
    if (t) {
      let n = this.lexer.state.inRawBlock;
      return { type: "text", raw: t[0], text: n ? t[0] : Se(t[0]), escaped: n };
    }
  }
};
var O = class a {
  tokens;
  options;
  state;
  inlineQueue;
  tokenizer;
  constructor(e) {
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || y, this.options.tokenizer = this.options.tokenizer || new _(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, linkEmitted: false, linkParenPossible: true, top: true };
    let t = { other: T, block: X.normal, inline: G.normal };
    this.options.pedantic ? (t.block = X.pedantic, t.inline = G.pedantic) : this.options.gfm && (t.block = X.gfm, this.options.breaks ? t.inline = G.breaks : t.inline = G.gfm), this.tokenizer.rules = t;
  }
  static get rules() {
    return { block: X, inline: G };
  }
  static lex(e, t) {
    return new a(t).lex(e);
  }
  static lexInline(e, t) {
    return new a(t).inlineTokens(e);
  }
  lex(e) {
    e = e.replace(T.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let t = 0; t < this.inlineQueue.length; t++) {
      let n = this.inlineQueue[t];
      this.state.inRawBlock = false, this.inlineTokens(n.src, n.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, t = [], n = false) {
    this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(T.tabCharGlobal, "    ").replace(T.spaceLine, ""));
    let s = 1 / 0;
    for (; e; ) {
      if (e.length < s) s = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      let r;
      if (this.options.extensions?.block?.some((i2) => (r = i2.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), true) : false)) continue;
      if (r = this.tokenizer.space(e)) {
        e = e.substring(r.raw.length);
        let i2 = t.at(-1);
        r.raw.length === 1 && i2 !== void 0 ? i2.raw += `
` : t.push(r);
        continue;
      }
      if (r = this.tokenizer.code(e)) {
        e = e.substring(r.raw.length);
        let i2 = t.at(-1);
        i2?.type === "paragraph" || i2?.type === "text" ? (i2.raw += (i2.raw.endsWith(`
`) ? "" : `
`) + r.raw, i2.text += `
` + r.text, this.inlineQueue.at(-1).src = i2.text) : t.push(r);
        continue;
      }
      if (r = this.tokenizer.fences(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.heading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.hr(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.blockquote(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.list(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.html(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.def(e)) {
        e = e.substring(r.raw.length);
        let i2 = t.at(-1);
        i2?.type === "paragraph" || i2?.type === "text" ? (i2.raw += (i2.raw.endsWith(`
`) ? "" : `
`) + r.raw, i2.text += `
` + r.raw, this.inlineQueue.at(-1).src = i2.text) : (this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }), t.push(r));
        continue;
      }
      if (r = this.tokenizer.table(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.lheading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      let o = e;
      if (this.options.extensions?.startBlock) {
        let i2 = 1 / 0, l = e.slice(1), u;
        this.options.extensions.startBlock.forEach((h) => {
          u = h.call({ lexer: this }, l), typeof u == "number" && u >= 0 && (i2 = Math.min(i2, u));
        }), i2 < 1 / 0 && i2 >= 0 && (o = e.substring(0, i2 + 1));
      }
      if (this.state.top && (r = this.tokenizer.paragraph(o))) {
        let i2 = t.at(-1);
        n && i2?.type === "paragraph" ? (i2.raw += (i2.raw.endsWith(`
`) ? "" : `
`) + r.raw, i2.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = i2.text) : t.push(r), n = o.length !== e.length, e = e.substring(r.raw.length);
        continue;
      }
      if (r = this.tokenizer.text(e)) {
        e = e.substring(r.raw.length);
        let i2 = t.at(-1);
        i2?.type === "text" ? (i2.raw += (i2.raw.endsWith(`
`) ? "" : `
`) + r.raw, i2.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = i2.text) : t.push(r);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return this.state.top = true, t;
  }
  inline(e, t = []) {
    return this.inlineQueue.push({ src: e, tokens: t }), t;
  }
  linkInText(e) {
    if (!e.includes("[")) return false;
    let t = this.tokenizer.rules.inline.link;
    for (let n of e.matchAll(this.tokenizer.rules.inline.blockSkip)) if (t.test(n[0]) && e.charAt(n.index - 1) !== "!") return true;
    for (let n of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)) {
      let s = n[0], r = s.lastIndexOf("[");
      if (!(s.charAt(0) === "!" || !Object.hasOwn(this.tokens.links, N(s.slice(r + 1, -1)))) && !(r > 1 && this.linkInText(s.slice(1, r - 1)))) return true;
    }
    return false;
  }
  inlineTokens(e, t = []) {
    this.tokenizer.lexer = this;
    let n = this.state.linkParenPossible;
    this.state.linkParenPossible = n && e.includes(")");
    try {
      return this.#e(e, t);
    } finally {
      this.state.linkParenPossible = n;
    }
  }
  #e(e, t) {
    let n = e.includes("*") || e.includes("_") || e.includes("~") || this.options.hooks?.emStrongMask || this.tokenizer.emStrong !== _.prototype.emStrong || this.tokenizer.del !== _.prototype.del ? this.#t(e) : e, s = false, r = "", o = 1 / 0;
    for (; e; ) {
      if (e.length < o) o = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      s || (r = ""), s = false;
      let i2;
      if (this.options.extensions?.inline?.some((u) => (i2 = u.call({ lexer: this }, e, t)) ? (e = e.substring(i2.raw.length), t.push(i2), true) : false)) continue;
      if (i2 = this.tokenizer.escape(e)) {
        e = e.substring(i2.raw.length), t.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.tag(e)) {
        e = e.substring(i2.raw.length), t.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.link(e)) {
        e = e.substring(i2.raw.length), t.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(i2.raw.length);
        let u = t.at(-1);
        i2.type === "text" && u?.type === "text" ? (u.raw += i2.raw, u.text += i2.text) : t.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.emStrong(e, n, r)) {
        e = e.substring(i2.raw.length), t.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.codespan(e)) {
        e = e.substring(i2.raw.length), t.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.br(e)) {
        e = e.substring(i2.raw.length), t.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.del(e, n, r)) {
        e = e.substring(i2.raw.length), t.push(i2);
        continue;
      }
      if (i2 = this.tokenizer.autolink(e)) {
        e = e.substring(i2.raw.length), t.push(i2);
        continue;
      }
      if (!this.state.inLink && (i2 = this.tokenizer.url(e))) {
        e = e.substring(i2.raw.length), t.push(i2);
        continue;
      }
      let l = e;
      if (this.options.extensions?.startInline) {
        let u = 1 / 0, h = e.slice(1), p;
        this.options.extensions.startInline.forEach((d) => {
          p = d.call({ lexer: this }, h), typeof p == "number" && p >= 0 && (u = Math.min(u, p));
        }), u < 1 / 0 && u >= 0 && (l = e.substring(0, u + 1));
      }
      if (i2 = this.tokenizer.inlineText(l)) {
        e = e.substring(i2.raw.length), i2.raw.slice(-1) !== "_" && (r = i2.raw.slice(-1)), s = true;
        let u = t.at(-1);
        u?.type === "text" ? (u.raw += i2.raw, u.text += i2.text) : t.push(i2);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return t;
  }
  #t(e) {
    let t = e;
    if (this.tokens.links && e.includes("[")) {
      let n = this.tokenizer.rules.inline.reflinkSearch, s = (r) => {
        let o = r.lastIndexOf("[");
        if (!Object.hasOwn(this.tokens.links, N(r.slice(o + 1, -1)))) return r;
        if (o > 1 && r.charAt(0) !== "!") {
          let i2 = r.slice(1, o - 1);
          if (this.linkInText(i2)) return "[" + i2.replace(n, s) + "][" + "a".repeat(r.length - o - 2) + "]";
        }
        return "[" + "a".repeat(r.length - 2) + "]";
      };
      t = t.replace(n, s);
    }
    return t = t.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode, (n, s, r) => r ? "+".repeat(n.length) : s ? s + n.slice(s.length, -s.length).replace(/`/g, "+") + s : n), t = t.replace(this.tokenizer.rules.inline.blockSkip, (n, s, r) => {
      let o = r ? r.length : 0;
      return n.slice(0, o) + "[" + "a".repeat(n.length - o - 2) + "]";
    }), t = this.options.hooks?.emStrongMask?.call({ lexer: this }, t) ?? t, t;
  }
  infiniteLoopError(e) {
    let t = "Infinite loop on byte: " + e;
    if (this.options.silent) console.error(t);
    else throw new Error(t);
  }
};
var L = class {
  options;
  parser;
  constructor(e) {
    this.options = e || y;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    let s = (t || "").match(T.notSpaceStart)?.[0], r = e ? e.replace(T.endingNewline, "") + `
` : "";
    return s ? '<pre><code class="language-' + P(s) + '">' + (n ? r : P(r, true)) + `</code></pre>
` : "<pre><code>" + (n ? r : P(r, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  def(e) {
    return "";
  }
  heading({ tokens: e, depth: t }) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    let t = e.ordered, n = e.start, s = "";
    for (let i2 = 0; i2 < e.items.length; i2++) {
      let l = e.items[i2];
      s += this.listitem(l);
    }
    let r = t ? "ol" : "ul", o = t && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + r + o + `>
` + s + "</" + r + `>
`;
  }
  listitem(e) {
    return `<li>${this.parser.parse(e.tokens)}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t = "", n = "";
    for (let r = 0; r < e.header.length; r++) n += this.tablecell(e.header[r]);
    t += this.tablerow({ text: n });
    let s = "";
    for (let r = 0; r < e.rows.length; r++) {
      let o = e.rows[r];
      n = "";
      for (let i2 = 0; i2 < o.length; i2++) n += this.tablecell(o[i2]);
      s += this.tablerow({ text: n });
    }
    return s && (s = `<tbody>${s}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + s + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
    return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
  }
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${P(e, true)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, text: n, tokens: s, autolink: r }) {
    let o = r ? P(n, true) : this.parser.parseInline(s), i2 = le(e);
    if (i2 === null) return o;
    e = P(i2, r);
    let l = '<a href="' + e + '"';
    return t && (l += ' title="' + P(t) + '"'), l += ">" + o + "</a>", l;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    let r = le(e);
    if (r === null) return P(n);
    e = r;
    let o = `<img src="${P(e)}" alt="${P(n)}"`;
    return t && (o += ` title="${P(t)}"`), o += ">", o;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : P(e.text);
  }
};
var M = class {
  parser;
  strong({ text: e, tokens: t }) {
    return t ? this.parser.parseInline(t, this) : e;
  }
  em({ text: e, tokens: t }) {
    return t ? this.parser.parseInline(t, this) : e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e, tokens: t }) {
    return t ? this.parser.parseInline(t, this) : e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e, tokens: t }) {
    return t ? this.parser.parseInline(t, this) : e;
  }
  image({ text: e, tokens: t }) {
    return t ? this.parser.parseInline(t, this) : e;
  }
  br() {
    return "";
  }
  checkbox({ raw: e }) {
    return e;
  }
};
var w = class a2 {
  options;
  renderer;
  textRenderer;
  constructor(e) {
    this.options = e || y, this.options.renderer = this.options.renderer || new L(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new M(), this.textRenderer.parser = this;
  }
  static parse(e, t) {
    return new a2(t).parse(e);
  }
  static parseInline(e, t) {
    return new a2(t).parseInline(e);
  }
  parse(e) {
    this.renderer.parser = this;
    let t = "";
    for (let n = 0; n < e.length; n++) {
      let s = e[n];
      if (this.options.extensions?.renderers?.[s.type]) {
        let o = s, i2 = this.options.extensions.renderers[o.type].call({ parser: this }, o);
        if (i2 !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "checkbox", "html", "def", "paragraph", "text"].includes(o.type)) {
          t += i2 || "";
          continue;
        }
      }
      let r = s;
      switch (r.type) {
        case "space": {
          t += this.renderer.space(r);
          break;
        }
        case "hr": {
          t += this.renderer.hr(r);
          break;
        }
        case "heading": {
          t += this.renderer.heading(r);
          break;
        }
        case "code": {
          t += this.renderer.code(r);
          break;
        }
        case "table": {
          t += this.renderer.table(r);
          break;
        }
        case "blockquote": {
          t += this.renderer.blockquote(r);
          break;
        }
        case "list": {
          t += this.renderer.list(r);
          break;
        }
        case "checkbox": {
          t += this.renderer.checkbox(r);
          break;
        }
        case "html": {
          t += this.renderer.html(r);
          break;
        }
        case "def": {
          t += this.renderer.def(r);
          break;
        }
        case "paragraph": {
          t += this.renderer.paragraph(r);
          break;
        }
        case "text": {
          t += this.renderer.text(r);
          break;
        }
        default: {
          let o = 'Token with "' + r.type + '" type was not found.';
          if (this.options.silent) return console.error(o), "";
          throw new Error(o);
        }
      }
    }
    return t;
  }
  parseInline(e, t = this.renderer) {
    this.renderer.parser = this;
    let n = "";
    for (let s = 0; s < e.length; s++) {
      let r = e[s];
      if (this.options.extensions?.renderers?.[r.type]) {
        let i2 = this.options.extensions.renderers[r.type].call({ parser: this }, r);
        if (i2 !== false || !["escape", "html", "link", "image", "checkbox", "strong", "em", "codespan", "br", "del", "text"].includes(r.type)) {
          n += i2 || "";
          continue;
        }
      }
      let o = r;
      switch (o.type) {
        case "escape": {
          n += t.text(o);
          break;
        }
        case "html": {
          n += t.html(o);
          break;
        }
        case "link": {
          n += t.link(o);
          break;
        }
        case "image": {
          n += t.image(o);
          break;
        }
        case "checkbox": {
          n += t.checkbox(o);
          break;
        }
        case "strong": {
          n += t.strong(o);
          break;
        }
        case "em": {
          n += t.em(o);
          break;
        }
        case "codespan": {
          n += t.codespan(o);
          break;
        }
        case "br": {
          n += t.br(o);
          break;
        }
        case "del": {
          n += t.del(o);
          break;
        }
        case "text": {
          n += t.text(o);
          break;
        }
        default: {
          let i2 = 'Token with "' + o.type + '" type was not found.';
          if (this.options.silent) return console.error(i2), "";
          throw new Error(i2);
        }
      }
    }
    return n;
  }
};
var A = class {
  options;
  block;
  constructor(e) {
    this.options = e || y;
  }
  static passThroughHooks = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
  static passThroughHooksRespectAsync = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens"]);
  preprocess(e) {
    return e;
  }
  postprocess(e) {
    return e;
  }
  processAllTokens(e) {
    return e;
  }
  emStrongMask(e) {
    return e;
  }
  provideLexer(e = this.block) {
    return e ? O.lex : O.lexInline;
  }
  provideParser(e = this.block) {
    return e ? w.parse : w.parseInline;
  }
};
function D(a3, e) {
  if (Array.isArray(e)) for (let t = 0; t < e.length; t++) a3.push(e[t]);
  else a3.push(e);
}
var J = class {
  defaults = v();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = w;
  Renderer = L;
  TextRenderer = M;
  Lexer = O;
  Tokenizer = _;
  Hooks = A;
  constructor(...e) {
    this.use(...e);
  }
  walkTokens(e, t) {
    let n = [];
    for (let s of e) switch (D(n, t.call(this, s)), s.type) {
      case "table": {
        let r = s;
        for (let o of r.header) D(n, this.walkTokens(o.tokens, t));
        for (let o of r.rows) for (let i2 of o) D(n, this.walkTokens(i2.tokens, t));
        break;
      }
      case "list": {
        let r = s;
        D(n, this.walkTokens(r.items, t));
        break;
      }
      default: {
        let r = s;
        this.defaults.extensions?.childTokens?.[r.type] ? this.defaults.extensions.childTokens[r.type].forEach((o) => {
          let i2 = r[o].flat(1 / 0);
          D(n, this.walkTokens(i2, t));
        }) : r.tokens && D(n, this.walkTokens(r.tokens, t));
      }
    }
    return n;
  }
  use(...e) {
    let t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((n) => {
      let s = { ...n };
      if (s.async = this.defaults.async || s.async || false, n.extensions && (n.extensions.forEach((r) => {
        if (!r.name) throw new Error("extension name required");
        if ("renderer" in r) {
          let o = t.renderers[r.name];
          o ? t.renderers[r.name] = function(...i2) {
            let l = r.renderer.apply(this, i2);
            return l === false && (l = o.apply(this, i2)), l;
          } : t.renderers[r.name] = r.renderer;
        }
        if ("tokenizer" in r) {
          if (!r.level || r.level !== "block" && r.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
          let o = t[r.level];
          o ? o.unshift(r.tokenizer) : t[r.level] = [r.tokenizer], r.start && (r.level === "block" ? t.startBlock ? t.startBlock.push(r.start) : t.startBlock = [r.start] : r.level === "inline" && (t.startInline ? t.startInline.push(r.start) : t.startInline = [r.start]));
        }
        "childTokens" in r && r.childTokens && (t.childTokens[r.name] = r.childTokens);
      }), s.extensions = t), n.renderer) {
        let r = this.defaults.renderer || new L(this.defaults);
        for (let o in n.renderer) {
          if (!(o in r)) throw new Error(`renderer '${o}' does not exist`);
          if (["options", "parser"].includes(o)) continue;
          let i2 = o, l = n.renderer[i2], u = r[i2];
          r[i2] = (...h) => {
            let p = l.apply(r, h);
            return p === false && (p = u.apply(r, h)), p || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        let r = this.defaults.tokenizer || new _(this.defaults);
        for (let o in n.tokenizer) {
          if (!(o in r)) throw new Error(`tokenizer '${o}' does not exist`);
          if (["options", "rules", "lexer"].includes(o)) continue;
          let i2 = o, l = n.tokenizer[i2], u = r[i2];
          r[i2] = (...h) => {
            let p = l.apply(r, h);
            return p === false && (p = u.apply(r, h)), p;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        let r = this.defaults.hooks || new A();
        for (let o in n.hooks) {
          if (!(o in r)) throw new Error(`hook '${o}' does not exist`);
          if (["options", "block"].includes(o)) continue;
          let i2 = o, l = n.hooks[i2], u = r[i2];
          A.passThroughHooks.has(o) ? r[i2] = (h) => {
            if (r.options.async && A.passThroughHooksRespectAsync.has(o)) return (async () => {
              let d = await l.call(r, h);
              return u.call(r, d);
            })();
            let p = l.call(r, h);
            return u.call(r, p);
          } : r[i2] = (...h) => {
            if (r.options.async) return (async () => {
              let d = await l.apply(r, h);
              return d === false && (d = await u.apply(r, h)), d;
            })();
            let p = l.apply(r, h);
            return p === false && (p = u.apply(r, h)), p;
          };
        }
        s.hooks = r;
      }
      if (n.walkTokens) {
        let r = this.defaults.walkTokens, o = n.walkTokens;
        s.walkTokens = function(i2) {
          let l = [];
          return l.push(o.call(this, i2)), r && D(l, r.call(this, i2)), l;
        };
      }
      this.defaults = { ...this.defaults, ...s };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return O.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return w.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (n, s) => {
      let r = { ...s }, o = { ...this.defaults, ...r }, i2 = this.onError(!!o.silent, !!o.async);
      if (this.defaults.async === true && r.async === false) return i2(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null) return i2(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string") return i2(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      if (o.hooks && (o.hooks.options = o, o.hooks.block = e), o.async) return (async () => {
        let l = o.hooks ? await o.hooks.preprocess(n) : n, h = await (o.hooks ? await o.hooks.provideLexer(e) : e ? O.lex : O.lexInline)(l, o), p = o.hooks ? await o.hooks.processAllTokens(h) : h;
        o.walkTokens && await Promise.all(this.walkTokens(p, o.walkTokens));
        let g = await (o.hooks ? await o.hooks.provideParser(e) : e ? w.parse : w.parseInline)(p, o);
        return o.hooks ? await o.hooks.postprocess(g) : g;
      })().catch(i2);
      try {
        o.hooks && (n = o.hooks.preprocess(n));
        let u = (o.hooks ? o.hooks.provideLexer(e) : e ? O.lex : O.lexInline)(n, o);
        o.hooks && (u = o.hooks.processAllTokens(u)), o.walkTokens && this.walkTokens(u, o.walkTokens);
        let p = (o.hooks ? o.hooks.provideParser(e) : e ? w.parse : w.parseInline)(u, o);
        return o.hooks && (p = o.hooks.postprocess(p)), p;
      } catch (l) {
        return i2(l);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        let s = "<p>An error occurred:</p><pre>" + P(n.message + "", true) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t) return Promise.reject(n);
      throw n;
    };
  }
};
var q = new J();
function m(a3, e) {
  return q.parse(a3, e);
}
m.options = m.setOptions = function(a3) {
  return q.setOptions(a3), m.defaults = q.defaults, ee(m.defaults), m;
};
m.getDefaults = v;
m.defaults = y;
function zt(...a3) {
  return q.use(...a3), m.defaults = q.defaults, ee(m.defaults), m;
}
m.use = zt;
m.walkTokens = function(a3, e) {
  return q.walkTokens(a3, e);
};
m.parseInline = q.parseInline;
m.Parser = w;
m.parser = w.parse;
m.Renderer = L;
m.TextRenderer = M;
m.Lexer = O;
m.lexer = O.lex;
m.Tokenizer = _;
m.Hooks = A;
m.parse = m;
var Tn = m.options;
var On = m.setOptions;
var wn = m.walkTokens;
var Pn = m.parseInline;
var Sn = w.parse;
var _n = O.lex;

// node_modules/turndown/lib/turndown.browser.es.js
function extend(destination) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = arguments[i2];
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) destination[key] = source[key];
    }
  }
  return destination;
}
function repeat(character, count) {
  return Array(count + 1).join(character);
}
function trimLeadingNewlines(string) {
  return string.replace(/^\n*/, "");
}
function trimTrailingNewlines(string) {
  var indexEnd = string.length;
  while (indexEnd > 0 && string[indexEnd - 1] === "\n") indexEnd--;
  return string.substring(0, indexEnd);
}
function trimNewlines(string) {
  return trimTrailingNewlines(trimLeadingNewlines(string));
}
var blockElements = ["ADDRESS", "ARTICLE", "ASIDE", "AUDIO", "BLOCKQUOTE", "BODY", "CANVAS", "CENTER", "DD", "DIR", "DIV", "DL", "DT", "FIELDSET", "FIGCAPTION", "FIGURE", "FOOTER", "FORM", "FRAMESET", "H1", "H2", "H3", "H4", "H5", "H6", "HEADER", "HGROUP", "HR", "HTML", "ISINDEX", "LI", "MAIN", "MENU", "NAV", "NOFRAMES", "NOSCRIPT", "OL", "OUTPUT", "P", "PRE", "SECTION", "TABLE", "TBODY", "TD", "TFOOT", "TH", "THEAD", "TR", "UL"];
function isBlock(node) {
  return is(node, blockElements);
}
var voidElements = ["AREA", "BASE", "BR", "COL", "COMMAND", "EMBED", "HR", "IMG", "INPUT", "KEYGEN", "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"];
function isVoid(node) {
  return is(node, voidElements);
}
function hasVoid(node) {
  return has(node, voidElements);
}
var meaningfulWhenBlankElements = ["A", "TABLE", "THEAD", "TBODY", "TFOOT", "TH", "TD", "IFRAME", "SCRIPT", "AUDIO", "VIDEO"];
function isMeaningfulWhenBlank(node) {
  return is(node, meaningfulWhenBlankElements);
}
function hasMeaningfulWhenBlank(node) {
  return has(node, meaningfulWhenBlankElements);
}
function is(node, tagNames) {
  return tagNames.indexOf(node.nodeName) >= 0;
}
function has(node, tagNames) {
  return node.getElementsByTagName && tagNames.some(function(tagName) {
    return node.getElementsByTagName(tagName).length;
  });
}
var markdownEscapes = [[/\\/g, "\\\\"], [/\*/g, "\\*"], [/^-/g, "\\-"], [/^\+ /g, "\\+ "], [/^(=+)/g, "\\$1"], [/^(#{1,6}) /g, "\\$1 "], [/`/g, "\\`"], [/^~~~/g, "\\~~~"], [/\[/g, "\\["], [/\]/g, "\\]"], [/^>/g, "\\>"], [/_/g, "\\_"], [/^(\d+)\. /g, "$1\\. "]];
function escapeMarkdown(string) {
  return markdownEscapes.reduce(function(accumulator, escape) {
    return accumulator.replace(escape[0], escape[1]);
  }, string);
}
var rules = {};
rules.paragraph = {
  filter: "p",
  replacement: function(content) {
    return "\n\n" + content + "\n\n";
  }
};
rules.lineBreak = {
  filter: "br",
  replacement: function(content, node, options) {
    return options.br + "\n";
  }
};
rules.heading = {
  filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
  replacement: function(content, node, options) {
    var hLevel = Number(node.nodeName.charAt(1));
    if (options.headingStyle === "setext" && hLevel < 3) {
      var underline = repeat(hLevel === 1 ? "=" : "-", content.length);
      return "\n\n" + content + "\n" + underline + "\n\n";
    } else {
      return "\n\n" + repeat("#", hLevel) + " " + content + "\n\n";
    }
  }
};
rules.blockquote = {
  filter: "blockquote",
  replacement: function(content) {
    content = trimNewlines(content).replace(/^/gm, "> ");
    return "\n\n" + content + "\n\n";
  }
};
rules.list = {
  filter: ["ul", "ol"],
  replacement: function(content, node) {
    var parent = node.parentNode;
    if (parent.nodeName === "LI" && parent.lastElementChild === node) {
      return "\n" + content;
    } else {
      return "\n\n" + content + "\n\n";
    }
  }
};
rules.listItem = {
  filter: "li",
  replacement: function(content, node, options) {
    var prefix = options.bulletListMarker + "   ";
    var parent = node.parentNode;
    if (parent.nodeName === "OL") {
      var start = parent.getAttribute("start");
      var index = Array.prototype.indexOf.call(parent.children, node);
      prefix = (start ? Number(start) + index : index + 1) + ".  ";
    }
    var isParagraph = /\n$/.test(content);
    content = trimNewlines(content) + (isParagraph ? "\n" : "");
    content = content.replace(/\n/gm, "\n" + " ".repeat(prefix.length));
    return prefix + content + (node.nextSibling ? "\n" : "");
  }
};
rules.indentedCodeBlock = {
  filter: function(node, options) {
    return options.codeBlockStyle === "indented" && node.nodeName === "PRE" && node.firstChild && node.firstChild.nodeName === "CODE";
  },
  replacement: function(content, node, options) {
    return "\n\n    " + node.firstChild.textContent.replace(/\n/g, "\n    ") + "\n\n";
  }
};
rules.fencedCodeBlock = {
  filter: function(node, options) {
    return options.codeBlockStyle === "fenced" && node.nodeName === "PRE" && node.firstChild && node.firstChild.nodeName === "CODE";
  },
  replacement: function(content, node, options) {
    var className = node.firstChild.getAttribute("class") || "";
    var language = (className.match(/language-(\S+)/) || [null, ""])[1];
    var code = node.firstChild.textContent;
    var fenceChar = options.fence.charAt(0);
    var fenceSize = 3;
    var fenceInCodeRegex = new RegExp("^" + fenceChar + "{3,}", "gm");
    var match;
    while (match = fenceInCodeRegex.exec(code)) {
      if (match[0].length >= fenceSize) {
        fenceSize = match[0].length + 1;
      }
    }
    var fence = repeat(fenceChar, fenceSize);
    return "\n\n" + fence + language + "\n" + code.replace(/\n$/, "") + "\n" + fence + "\n\n";
  }
};
rules.horizontalRule = {
  filter: "hr",
  replacement: function(content, node, options) {
    return "\n\n" + options.hr + "\n\n";
  }
};
rules.inlineLink = {
  filter: function(node, options) {
    return options.linkStyle === "inlined" && node.nodeName === "A" && node.getAttribute("href");
  },
  replacement: function(content, node) {
    var href = escapeLinkDestination(node.getAttribute("href"));
    var title = escapeLinkTitle(cleanAttribute(node.getAttribute("title")));
    var titlePart = title ? ' "' + title + '"' : "";
    return "[" + content + "](" + href + titlePart + ")";
  }
};
rules.referenceLink = {
  filter: function(node, options) {
    return options.linkStyle === "referenced" && node.nodeName === "A" && node.getAttribute("href");
  },
  replacement: function(content, node, options) {
    var href = escapeLinkDestination(node.getAttribute("href"));
    var title = cleanAttribute(node.getAttribute("title"));
    if (title) title = ' "' + escapeLinkTitle(title) + '"';
    var replacement;
    var reference;
    switch (options.linkReferenceStyle) {
      case "collapsed":
        replacement = "[" + content + "][]";
        reference = "[" + content + "]: " + href + title;
        break;
      case "shortcut":
        replacement = "[" + content + "]";
        reference = "[" + content + "]: " + href + title;
        break;
      default:
        var id = this.references.length + 1;
        replacement = "[" + content + "][" + id + "]";
        reference = "[" + id + "]: " + href + title;
    }
    this.references.push(reference);
    return replacement;
  },
  references: [],
  append: function(options) {
    var references = "";
    if (this.references.length) {
      references = "\n\n" + this.references.join("\n") + "\n\n";
      this.references = [];
    }
    return references;
  }
};
rules.emphasis = {
  filter: ["em", "i"],
  replacement: function(content, node, options) {
    if (!content.trim()) return "";
    return options.emDelimiter + content + options.emDelimiter;
  }
};
rules.strong = {
  filter: ["strong", "b"],
  replacement: function(content, node, options) {
    if (!content.trim()) return "";
    return options.strongDelimiter + content + options.strongDelimiter;
  }
};
rules.code = {
  filter: function(node) {
    var hasSiblings = node.previousSibling || node.nextSibling;
    var isCodeBlock = node.parentNode.nodeName === "PRE" && !hasSiblings;
    return node.nodeName === "CODE" && !isCodeBlock;
  },
  replacement: function(content) {
    if (!content) return "";
    content = content.replace(/\r?\n|\r/g, " ");
    var extraSpace = /^`|^ .*?[^ ].* $|`$/.test(content) ? " " : "";
    var delimiter = "`";
    var matches = content.match(/`+/gm) || [];
    while (matches.indexOf(delimiter) !== -1) delimiter = delimiter + "`";
    return delimiter + extraSpace + content + extraSpace + delimiter;
  }
};
rules.image = {
  filter: "img",
  replacement: function(content, node) {
    var alt = escapeMarkdown(cleanAttribute(node.getAttribute("alt")));
    var src = escapeLinkDestination(node.getAttribute("src") || "");
    var title = cleanAttribute(node.getAttribute("title"));
    var titlePart = title ? ' "' + escapeLinkTitle(title) + '"' : "";
    return src ? "![" + alt + "](" + src + titlePart + ")" : "";
  }
};
function cleanAttribute(attribute) {
  return attribute ? attribute.replace(/(\n+\s*)+/g, "\n") : "";
}
function escapeLinkDestination(destination) {
  var escaped = destination.replace(/([<>()])/g, "\\$1");
  return escaped.indexOf(" ") >= 0 ? "<" + escaped + ">" : escaped;
}
function escapeLinkTitle(title) {
  return title.replace(/"/g, '\\"');
}
function Rules(options) {
  this.options = options;
  this._keep = [];
  this._remove = [];
  this.blankRule = {
    replacement: options.blankReplacement
  };
  this.keepReplacement = options.keepReplacement;
  this.defaultRule = {
    replacement: options.defaultReplacement
  };
  this.array = [];
  for (var key in options.rules) this.array.push(options.rules[key]);
}
Rules.prototype = {
  add: function(key, rule) {
    this.array.unshift(rule);
  },
  keep: function(filter) {
    this._keep.unshift({
      filter,
      replacement: this.keepReplacement
    });
  },
  remove: function(filter) {
    this._remove.unshift({
      filter,
      replacement: function() {
        return "";
      }
    });
  },
  forNode: function(node) {
    if (node.isBlank) return this.blankRule;
    var rule;
    if (rule = findRule(this.array, node, this.options)) return rule;
    if (rule = findRule(this._keep, node, this.options)) return rule;
    if (rule = findRule(this._remove, node, this.options)) return rule;
    return this.defaultRule;
  },
  forEach: function(fn) {
    for (var i2 = 0; i2 < this.array.length; i2++) fn(this.array[i2], i2);
  }
};
function findRule(rules2, node, options) {
  for (var i2 = 0; i2 < rules2.length; i2++) {
    var rule = rules2[i2];
    if (filterValue(rule, node, options)) return rule;
  }
  return void 0;
}
function filterValue(rule, node, options) {
  var filter = rule.filter;
  if (typeof filter === "string") {
    if (filter === node.nodeName.toLowerCase()) return true;
  } else if (Array.isArray(filter)) {
    if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true;
  } else if (typeof filter === "function") {
    if (filter.call(rule, node, options)) return true;
  } else {
    throw new TypeError("`filter` needs to be a string, array, or function");
  }
}
function collapseWhitespace(options) {
  var element = options.element;
  var isBlock2 = options.isBlock;
  var isVoid2 = options.isVoid;
  var isPre = options.isPre || function(node2) {
    return node2.nodeName === "PRE";
  };
  if (!element.firstChild || isPre(element)) return;
  var prevText = null;
  var keepLeadingWs = false;
  var prev = null;
  var node = next(prev, element, isPre);
  while (node !== element) {
    if (node.nodeType === 3 || node.nodeType === 4) {
      var text2 = node.data.replace(/[ \r\n\t]+/g, " ");
      if ((!prevText || / $/.test(prevText.data)) && !keepLeadingWs && text2[0] === " ") {
        text2 = text2.substr(1);
      }
      if (!text2) {
        node = remove(node);
        continue;
      }
      node.data = text2;
      prevText = node;
    } else if (node.nodeType === 1) {
      if (isBlock2(node) || node.nodeName === "BR") {
        if (prevText) {
          prevText.data = prevText.data.replace(/ $/, "");
        }
        prevText = null;
        keepLeadingWs = false;
      } else if (isVoid2(node) || isPre(node)) {
        prevText = null;
        keepLeadingWs = true;
      } else if (prevText) {
        keepLeadingWs = false;
      }
    } else {
      node = remove(node);
      continue;
    }
    var nextNode = next(prev, node, isPre);
    prev = node;
    node = nextNode;
  }
  if (prevText) {
    prevText.data = prevText.data.replace(/ $/, "");
    if (!prevText.data) {
      remove(prevText);
    }
  }
}
function remove(node) {
  var next2 = node.nextSibling || node.parentNode;
  node.parentNode.removeChild(node);
  return next2;
}
function next(prev, current, isPre) {
  if (prev && prev.parentNode === current || isPre(current)) {
    return current.nextSibling || current.parentNode;
  }
  return current.firstChild || current.nextSibling || current.parentNode;
}
var root = typeof window !== "undefined" ? window : {};
function canParseHTMLNatively() {
  var Parser = root.DOMParser;
  var canParse = false;
  try {
    if (new Parser().parseFromString("", "text/html")) {
      canParse = true;
    }
  } catch (e) {
  }
  return canParse;
}
function createHTMLParser() {
  var Parser = function() {
  };
  {
    if (shouldUseActiveX()) {
      Parser.prototype.parseFromString = function(string) {
        var doc = new window.ActiveXObject("htmlfile");
        doc.designMode = "on";
        doc.open();
        doc.write(string);
        doc.close();
        return doc;
      };
    } else {
      Parser.prototype.parseFromString = function(string) {
        var doc = document.implementation.createHTMLDocument("");
        doc.open();
        doc.write(string);
        doc.close();
        return doc;
      };
    }
  }
  return Parser;
}
function shouldUseActiveX() {
  var useActiveX = false;
  try {
    document.implementation.createHTMLDocument("").open();
  } catch (e) {
    if (root.ActiveXObject) useActiveX = true;
  }
  return useActiveX;
}
var HTMLParser = canParseHTMLNatively() ? root.DOMParser : createHTMLParser();
function RootNode(input, options) {
  var root2;
  if (typeof input === "string") {
    var doc = htmlParser().parseFromString(
      // DOM parsers arrange elements in the <head> and <body>.
      // Wrapping in a custom element ensures elements are reliably arranged in
      // a single element.
      '<x-turndown id="turndown-root">' + input + "</x-turndown>",
      "text/html"
    );
    root2 = doc.getElementById("turndown-root");
  } else {
    root2 = input.cloneNode(true);
  }
  collapseWhitespace({
    element: root2,
    isBlock,
    isVoid,
    isPre: options.preformattedCode ? isPreOrCode : null
  });
  return root2;
}
var _htmlParser;
function htmlParser() {
  _htmlParser = _htmlParser || new HTMLParser();
  return _htmlParser;
}
function isPreOrCode(node) {
  return node.nodeName === "PRE" || node.nodeName === "CODE";
}
function Node(node, options) {
  node.isBlock = isBlock(node);
  node.isCode = node.nodeName === "CODE" || node.parentNode.isCode;
  node.isBlank = isBlank(node);
  node.flankingWhitespace = flankingWhitespace(node, options);
  return node;
}
function isBlank(node) {
  return !isVoid(node) && !isMeaningfulWhenBlank(node) && /^\s*$/i.test(node.textContent) && !hasVoid(node) && !hasMeaningfulWhenBlank(node);
}
function flankingWhitespace(node, options) {
  if (node.isBlock || options.preformattedCode && node.isCode) {
    return {
      leading: "",
      trailing: ""
    };
  }
  var edges = edgeWhitespace(node.textContent);
  if (edges.leadingAscii && isFlankedByWhitespace("left", node, options)) {
    edges.leading = edges.leadingNonAscii;
  }
  if (edges.trailingAscii && isFlankedByWhitespace("right", node, options)) {
    edges.trailing = edges.trailingNonAscii;
  }
  return {
    leading: edges.leading,
    trailing: edges.trailing
  };
}
function edgeWhitespace(string) {
  var m2 = string.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/);
  return {
    leading: m2[1],
    // whole string for whitespace-only strings
    leadingAscii: m2[2],
    leadingNonAscii: m2[3],
    trailing: m2[4],
    // empty for whitespace-only strings
    trailingNonAscii: m2[5],
    trailingAscii: m2[6]
  };
}
function isFlankedByWhitespace(side, node, options) {
  var sibling;
  var regExp;
  var isFlanked;
  if (side === "left") {
    sibling = node.previousSibling;
    regExp = / $/;
  } else {
    sibling = node.nextSibling;
    regExp = /^ /;
  }
  if (sibling) {
    if (sibling.nodeType === 3) {
      isFlanked = regExp.test(sibling.nodeValue);
    } else if (options.preformattedCode && sibling.nodeName === "CODE") {
      isFlanked = false;
    } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
      isFlanked = regExp.test(sibling.textContent);
    }
  }
  return isFlanked;
}
var reduce = Array.prototype.reduce;
function TurndownService(options) {
  if (!(this instanceof TurndownService)) return new TurndownService(options);
  var defaults = {
    rules,
    headingStyle: "setext",
    hr: "* * *",
    bulletListMarker: "*",
    codeBlockStyle: "indented",
    fence: "```",
    emDelimiter: "_",
    strongDelimiter: "**",
    linkStyle: "inlined",
    linkReferenceStyle: "full",
    br: "  ",
    preformattedCode: false,
    blankReplacement: function(content, node) {
      return node.isBlock ? "\n\n" : "";
    },
    keepReplacement: function(content, node) {
      return node.isBlock ? "\n\n" + node.outerHTML + "\n\n" : node.outerHTML;
    },
    defaultReplacement: function(content, node) {
      return node.isBlock ? "\n\n" + content + "\n\n" : content;
    }
  };
  this.options = extend({}, defaults, options);
  this.rules = new Rules(this.options);
}
TurndownService.prototype = {
  /**
   * The entry point for converting a string or DOM node to Markdown
   * @public
   * @param {String|HTMLElement} input The string or DOM node to convert
   * @returns A Markdown representation of the input
   * @type String
   */
  turndown: function(input) {
    if (!canConvert(input)) {
      throw new TypeError(input + " is not a string, or an element/document/fragment node.");
    }
    if (input === "") return "";
    var output = process.call(this, new RootNode(input, this.options));
    return postProcess.call(this, output);
  },
  /**
   * Add one or more plugins
   * @public
   * @param {Function|Array} plugin The plugin or array of plugins to add
   * @returns The Turndown instance for chaining
   * @type Object
   */
  use: function(plugin) {
    if (Array.isArray(plugin)) {
      for (var i2 = 0; i2 < plugin.length; i2++) this.use(plugin[i2]);
    } else if (typeof plugin === "function") {
      plugin(this);
    } else {
      throw new TypeError("plugin must be a Function or an Array of Functions");
    }
    return this;
  },
  /**
   * Adds a rule
   * @public
   * @param {String} key The unique key of the rule
   * @param {Object} rule The rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  addRule: function(key, rule) {
    this.rules.add(key, rule);
    return this;
  },
  /**
   * Keep a node (as HTML) that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  keep: function(filter) {
    this.rules.keep(filter);
    return this;
  },
  /**
   * Remove a node that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  remove: function(filter) {
    this.rules.remove(filter);
    return this;
  },
  /**
   * Escapes Markdown syntax
   * @public
   * @param {String} string The string to escape
   * @returns A string with Markdown syntax escaped
   * @type String
   */
  escape: function(string) {
    return escapeMarkdown(string);
  }
};
function process(parentNode) {
  var self = this;
  return reduce.call(parentNode.childNodes, function(output, node) {
    node = new Node(node, self.options);
    var replacement = "";
    if (node.nodeType === 3) {
      replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue);
    } else if (node.nodeType === 1) {
      replacement = replacementForNode.call(self, node);
    }
    return join(output, replacement);
  }, "");
}
function postProcess(output) {
  var self = this;
  this.rules.forEach(function(rule) {
    if (typeof rule.append === "function") {
      output = join(output, rule.append(self.options));
    }
  });
  return output.replace(/^[\t\r\n]+/, "").replace(/[\t\r\n\s]+$/, "");
}
function replacementForNode(node) {
  var rule = this.rules.forNode(node);
  var content = process.call(this, node);
  var whitespace = node.flankingWhitespace;
  if (whitespace.leading || whitespace.trailing) content = content.trim();
  return whitespace.leading + rule.replacement(content, node, this.options) + whitespace.trailing;
}
function join(output, replacement) {
  var s1 = trimTrailingNewlines(output);
  var s2 = trimLeadingNewlines(replacement);
  var nls = Math.max(output.length - s1.length, replacement.length - s2.length);
  var separator = "\n\n".substring(0, nls);
  return s1 + separator + s2;
}
function canConvert(input) {
  return input != null && (typeof input === "string" || input.nodeType && (input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11));
}

// node_modules/dompurify/dist/purify.es.mjs
function _OverloadYield(e, d) {
  this.v = e, this.k = d;
}
function _arrayLikeToArray(r, a3) {
  (null == a3 || a3 > r.length) && (a3 = r.length);
  for (var e = 0, n = Array(a3); e < a3; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i2, u, a3 = [], f = true, o = false;
    try {
      if (i2 = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = false;
      } else for (; !(f = (e = i2.call(t)).done) && (a3.push(e.value), a3.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a3;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _unsupportedIterableToArray(r, a3) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a3);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a3) : void 0;
  }
}
function AsyncGenerator(e) {
  var t, n;
  function resume(t2, n2) {
    try {
      var r = e[t2](n2), o = r.value, u = o instanceof _OverloadYield;
      Promise.resolve(u ? o.v : o).then(function(n3) {
        if (u) {
          var i2 = "return" === t2 && o.k ? t2 : "next";
          if (!o.k || n3.done) return resume(i2, n3);
          n3 = e[i2](n3).value;
        }
        settle(!!r.done, n3);
      }, function(e2) {
        resume("throw", e2);
      });
    } catch (e2) {
      settle(2, e2);
    }
  }
  function settle(e2, r) {
    2 === e2 ? t.reject(r) : t.resolve({
      value: r,
      done: e2
    }), (t = t.next) ? resume(t.key, t.arg) : n = null;
  }
  this._invoke = function(e2, r) {
    return new Promise(function(o, u) {
      var i2 = {
        key: e2,
        arg: r,
        resolve: o,
        reject: u,
        next: null
      };
      n ? n = n.next = i2 : (t = n = i2, resume(e2, r));
    });
  }, "function" != typeof e.return && (this.return = void 0);
}
AsyncGenerator.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function() {
  return this;
}, AsyncGenerator.prototype.next = function(e) {
  return this._invoke("next", e);
}, AsyncGenerator.prototype.throw = function(e) {
  return this._invoke("throw", e);
}, AsyncGenerator.prototype.return = function(e) {
  return this._invoke("return", e);
};
var entries = Object.entries;
var setPrototypeOf = Object.setPrototypeOf;
var isFrozen = Object.isFrozen;
var getPrototypeOf = Object.getPrototypeOf;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var freeze = Object.freeze;
var seal = Object.seal;
var create = Object.create;
var _ref = typeof Reflect !== "undefined" && Reflect;
var apply = _ref.apply;
var construct = _ref.construct;
if (!freeze) freeze = function freeze2(x2) {
  return x2;
};
if (!seal) seal = function seal2(x2) {
  return x2;
};
if (!apply) apply = function apply2(func, thisArg) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) args[_key - 2] = arguments[_key];
  return func.apply(thisArg, args);
};
if (!construct) construct = function construct2(Func) {
  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) args[_key2 - 1] = arguments[_key2];
  return new Func(...args);
};
var arrayForEach = unapply(Array.prototype.forEach);
Array.prototype.indexOf;
var arrayLastIndexOf = unapply(Array.prototype.lastIndexOf);
var arrayPop = unapply(Array.prototype.pop);
var arrayPush = unapply(Array.prototype.push);
var arraySlice = unapply(Array.prototype.slice);
var arraySplice = unapply(Array.prototype.splice);
var arrayIsArray = Array.isArray;
var setCreate = unconstruct(Set);
var setAdd = unapply(Set.prototype.add);
var setHas = unapply(Set.prototype.has);
var stringToLowerCase = unapply(String.prototype.toLowerCase);
var stringToString = unapply(String.prototype.toString);
var stringMatch = unapply(String.prototype.match);
var stringReplace = unapply(String.prototype.replace);
var stringIndexOf = unapply(String.prototype.indexOf);
var stringTrim = unapply(String.prototype.trim);
var numberToString = unapply(Number.prototype.toString);
var booleanToString = unapply(Boolean.prototype.toString);
var bigintToString = typeof BigInt === "undefined" ? null : unapply(BigInt.prototype.toString);
var symbolToString = typeof Symbol === "undefined" ? null : unapply(Symbol.prototype.toString);
var objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
var objectToString = unapply(Object.prototype.toString);
var regExpTest = unapply(RegExp.prototype.test);
var typeErrorCreate = unconstruct(TypeError);
function unapply(func) {
  return function(thisArg) {
    if (thisArg instanceof RegExp) thisArg.lastIndex = 0;
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) args[_key3 - 1] = arguments[_key3];
    return apply(func, thisArg, args);
  };
}
function unconstruct(Func) {
  return function() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) args[_key4] = arguments[_key4];
    return construct(Func, args);
  };
}
function addToSet(set, array) {
  let transformCaseFunc = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : stringToLowerCase;
  if (setPrototypeOf) setPrototypeOf(set, null);
  if (!arrayIsArray(array)) return set;
  let l = array.length;
  while (l--) {
    let element = array[l];
    if (typeof element === "string") {
      const lcElement = transformCaseFunc(element);
      if (lcElement !== element) {
        if (!isFrozen(array)) array[l] = lcElement;
        element = lcElement;
      }
    }
    set[element] = true;
  }
  return set;
}
function cleanArray(array) {
  for (let index = 0; index < array.length; index++) if (!objectHasOwnProperty(array, index)) array[index] = null;
  return array;
}
function clone(object) {
  const newObject = create(null);
  for (const _ref2 of entries(object)) {
    var _ref3 = _slicedToArray(_ref2, 2);
    const property = _ref3[0];
    const value = _ref3[1];
    if (objectHasOwnProperty(object, property)) {
      if (arrayIsArray(value)) newObject[property] = cleanArray(value);
      else if (value && typeof value === "object" && value.constructor === Object) newObject[property] = clone(value);
      else newObject[property] = value;
    }
  }
  return newObject;
}
function stringifyValue(value) {
  switch (typeof value) {
    case "string":
      return value;
    case "number":
      return numberToString(value);
    case "boolean":
      return booleanToString(value);
    case "bigint":
      return bigintToString ? bigintToString(value) : "0";
    case "symbol":
      return symbolToString ? symbolToString(value) : "Symbol()";
    case "undefined":
      return objectToString(value);
    case "function":
    case "object": {
      if (value === null) return objectToString(value);
      const valueAsRecord = value;
      const valueToString = lookupGetter(valueAsRecord, "toString");
      if (typeof valueToString === "function") {
        const stringified = valueToString(valueAsRecord);
        return typeof stringified === "string" ? stringified : objectToString(stringified);
      }
      return objectToString(value);
    }
    default:
      return objectToString(value);
  }
}
function lookupGetter(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);
    if (desc) {
      if (desc.get) return unapply(desc.get);
      if (typeof desc.value === "function") return unapply(desc.value);
    }
    object = getPrototypeOf(object);
  }
  function fallbackValue() {
    return null;
  }
  return fallbackValue;
}
function lookupAccessor(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);
    if (desc) return desc.get ? unapply(desc.get) : null;
    object = getPrototypeOf(object);
  }
  return null;
}
function isRegex(value) {
  try {
    regExpTest(value, "");
    return true;
  } catch (_unused) {
    return false;
  }
}
var html$1 = freeze([
  "a",
  "abbr",
  "acronym",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "bdi",
  "bdo",
  "big",
  "blink",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "content",
  "data",
  "datalist",
  "dd",
  "decorator",
  "del",
  "details",
  "dfn",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "element",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "mark",
  "marquee",
  "menu",
  "menuitem",
  "meter",
  "nav",
  "nobr",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "search",
  "section",
  "select",
  "shadow",
  "slot",
  "small",
  "source",
  "spacer",
  "span",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "track",
  "tt",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
]);
var svg$1 = freeze([
  "svg",
  "a",
  "altglyph",
  "altglyphdef",
  "altglyphitem",
  "animatecolor",
  "animatemotion",
  "animatetransform",
  "circle",
  "clippath",
  "defs",
  "desc",
  "ellipse",
  "enterkeyhint",
  "exportparts",
  "filter",
  "font",
  "g",
  "glyph",
  "glyphref",
  "hkern",
  "image",
  "inputmode",
  "line",
  "lineargradient",
  "marker",
  "mask",
  "metadata",
  "mpath",
  "part",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialgradient",
  "rect",
  "stop",
  "style",
  "switch",
  "symbol",
  "text",
  "textpath",
  "title",
  "tref",
  "tspan",
  "view",
  "vkern"
]);
var svgFilters = freeze([
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence"
]);
var svgDisallowed = freeze([
  "animate",
  "color-profile",
  "cursor",
  "discard",
  "font-face",
  "font-face-format",
  "font-face-name",
  "font-face-src",
  "font-face-uri",
  "foreignobject",
  "hatch",
  "hatchpath",
  "mesh",
  "meshgradient",
  "meshpatch",
  "meshrow",
  "missing-glyph",
  "script",
  "set",
  "solidcolor",
  "unknown",
  "use"
]);
var mathMl$1 = freeze([
  "math",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mglyph",
  "mi",
  "mlabeledtr",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "ms",
  "mspace",
  "msqrt",
  "mstyle",
  "msub",
  "msup",
  "msubsup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "mprescripts"
]);
var mathMlDisallowed = freeze([
  "maction",
  "maligngroup",
  "malignmark",
  "mlongdiv",
  "mscarries",
  "mscarry",
  "msgroup",
  "mstack",
  "msline",
  "msrow",
  "semantics",
  "annotation",
  "annotation-xml",
  "mprescripts",
  "none"
]);
var text = freeze(["#text"]);
var html = freeze([
  "accept",
  "action",
  "align",
  "alt",
  "autocapitalize",
  "autocomplete",
  "autopictureinpicture",
  "autoplay",
  "background",
  "bgcolor",
  "border",
  "capture",
  "cellpadding",
  "cellspacing",
  "checked",
  "cite",
  "class",
  "clear",
  "color",
  "cols",
  "colspan",
  "command",
  "commandfor",
  "controls",
  "controlslist",
  "coords",
  "crossorigin",
  "datetime",
  "decoding",
  "default",
  "dir",
  "disabled",
  "disablepictureinpicture",
  "disableremoteplayback",
  "download",
  "draggable",
  "enctype",
  "enterkeyhint",
  "exportparts",
  "face",
  "for",
  "headers",
  "height",
  "hidden",
  "high",
  "href",
  "hreflang",
  "id",
  "inert",
  "inputmode",
  "integrity",
  "ismap",
  "kind",
  "label",
  "lang",
  "list",
  "loading",
  "loop",
  "low",
  "max",
  "maxlength",
  "media",
  "method",
  "min",
  "minlength",
  "multiple",
  "muted",
  "name",
  "nonce",
  "noshade",
  "novalidate",
  "nowrap",
  "open",
  "optimum",
  "part",
  "pattern",
  "placeholder",
  "playsinline",
  "popover",
  "popovertarget",
  "popovertargetaction",
  "poster",
  "preload",
  "pubdate",
  "radiogroup",
  "readonly",
  "rel",
  "required",
  "rev",
  "reversed",
  "role",
  "rows",
  "rowspan",
  "spellcheck",
  "scope",
  "selected",
  "shape",
  "size",
  "sizes",
  "slot",
  "span",
  "srclang",
  "start",
  "src",
  "srcset",
  "step",
  "style",
  "summary",
  "tabindex",
  "title",
  "translate",
  "type",
  "usemap",
  "valign",
  "value",
  "width",
  "wrap",
  "xmlns"
]);
var svg = freeze([
  "accent-height",
  "accumulate",
  "additive",
  "alignment-baseline",
  "amplitude",
  "ascent",
  "attributename",
  "attributetype",
  "azimuth",
  "basefrequency",
  "baseline-shift",
  "begin",
  "bias",
  "by",
  "class",
  "clip",
  "clippathunits",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "cx",
  "cy",
  "d",
  "dx",
  "dy",
  "diffuseconstant",
  "direction",
  "display",
  "divisor",
  "dominant-baseline",
  "dur",
  "edgemode",
  "elevation",
  "end",
  "exponent",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "filterunits",
  "flood-color",
  "flood-opacity",
  "font-family",
  "font-size",
  "font-size-adjust",
  "font-stretch",
  "font-style",
  "font-variant",
  "font-weight",
  "fx",
  "fy",
  "g1",
  "g2",
  "glyph-name",
  "glyphref",
  "gradientunits",
  "gradienttransform",
  "height",
  "href",
  "id",
  "image-rendering",
  "in",
  "in2",
  "intercept",
  "k",
  "k1",
  "k2",
  "k3",
  "k4",
  "kerning",
  "keypoints",
  "keysplines",
  "keytimes",
  "lang",
  "lengthadjust",
  "letter-spacing",
  "kernelmatrix",
  "kernelunitlength",
  "lighting-color",
  "local",
  "marker-end",
  "marker-mid",
  "marker-start",
  "markerheight",
  "markerunits",
  "markerwidth",
  "maskcontentunits",
  "maskunits",
  "max",
  "mask",
  "mask-type",
  "media",
  "method",
  "mode",
  "min",
  "name",
  "numoctaves",
  "offset",
  "operator",
  "opacity",
  "order",
  "orient",
  "orientation",
  "origin",
  "overflow",
  "paint-order",
  "path",
  "pathlength",
  "patterncontentunits",
  "patterntransform",
  "patternunits",
  "pointer-events",
  "points",
  "preservealpha",
  "preserveaspectratio",
  "primitiveunits",
  "r",
  "rx",
  "ry",
  "radius",
  "refx",
  "refy",
  "repeatcount",
  "repeatdur",
  "restart",
  "result",
  "rotate",
  "scale",
  "seed",
  "shape-rendering",
  "slope",
  "specularconstant",
  "specularexponent",
  "spreadmethod",
  "startoffset",
  "stddeviation",
  "stitchtiles",
  "stop-color",
  "stop-opacity",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke",
  "stroke-width",
  "style",
  "surfacescale",
  "systemlanguage",
  "tabindex",
  "tablevalues",
  "targetx",
  "targety",
  "transform",
  "transform-origin",
  "text-anchor",
  "text-decoration",
  "text-orientation",
  "text-rendering",
  "textlength",
  "type",
  "u1",
  "u2",
  "unicode",
  "values",
  "vector-effect",
  "viewbox",
  "visibility",
  "version",
  "vert-adv-y",
  "vert-origin-x",
  "vert-origin-y",
  "width",
  "word-spacing",
  "wrap",
  "writing-mode",
  "xchannelselector",
  "ychannelselector",
  "x",
  "x1",
  "x2",
  "xmlns",
  "y",
  "y1",
  "y2",
  "z",
  "zoomandpan"
]);
var mathMl = freeze([
  "accent",
  "accentunder",
  "align",
  "bevelled",
  "close",
  "columnalign",
  "columnlines",
  "columnspacing",
  "columnspan",
  "denomalign",
  "depth",
  "dir",
  "display",
  "displaystyle",
  "encoding",
  "fence",
  "frame",
  "height",
  "href",
  "id",
  "largeop",
  "length",
  "linethickness",
  "lquote",
  "lspace",
  "mathbackground",
  "mathcolor",
  "mathsize",
  "mathvariant",
  "maxsize",
  "minsize",
  "movablelimits",
  "notation",
  "numalign",
  "open",
  "rowalign",
  "rowlines",
  "rowspacing",
  "rowspan",
  "rspace",
  "rquote",
  "scriptlevel",
  "scriptminsize",
  "scriptsizemultiplier",
  "selection",
  "separator",
  "separators",
  "stretchy",
  "subscriptshift",
  "supscriptshift",
  "symmetric",
  "voffset",
  "width",
  "xmlns"
]);
var xml = freeze([
  "xlink:href",
  "xml:id",
  "xlink:title",
  "xml:space",
  "xmlns:xlink"
]);
var MUSTACHE_EXPR = seal(/{{[\w\W]*|^[\w\W]*}}/g);
var ERB_EXPR = seal(/<%[\w\W]*|^[\w\W]*%>/g);
var TMPLIT_EXPR = seal(/\${[\w\W]*/g);
var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/);
var ARIA_ATTR = seal(/^aria-[\-\w]+$/);
var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i);
var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g);
var DOCTYPE_NAME = seal(/^html$/i);
var CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);
var ELEMENT_MARKUP_PROBE = seal(/<[/\w!]/g);
var COMMENT_MARKUP_PROBE = seal(/<[/\w]/g);
var FALLBACK_TAG_CLOSE = seal(/<\/no(script|embed|frames)/i);
var SELF_CLOSING_TAG = seal(/\/>/i);
var NODE_TYPE = {
  element: 1,
  attribute: 2,
  text: 3,
  cdataSection: 4,
  entityReference: 5,
  entityNode: 6,
  processingInstruction: 7,
  comment: 8,
  document: 9,
  documentType: 10,
  documentFragment: 11,
  notation: 12
};
var LITERAL_TEXT_ELEMENTS = freeze(addToSet({}, [
  "style",
  "script",
  "xmp",
  "iframe",
  "noembed",
  "noframes",
  "plaintext",
  "noscript"
]));
var getGlobal = function getGlobal2() {
  return typeof window === "undefined" ? null : window;
};
var _createTrustedTypesPolicy = function _createTrustedTypesPolicy2(trustedTypes, purifyHostElement) {
  if (typeof trustedTypes !== "object" || typeof trustedTypes.createPolicy !== "function") return null;
  let suffix = null;
  const ATTR_NAME = "data-tt-policy-suffix";
  if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) suffix = purifyHostElement.getAttribute(ATTR_NAME);
  const policyName = "dompurify" + (suffix ? "#" + suffix : "");
  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML(html2) {
        return html2;
      },
      createScriptURL(scriptUrl) {
        return scriptUrl;
      }
    });
  } catch (_2) {
    console.warn("TrustedTypes policy " + policyName + " could not be created.");
    return null;
  }
};
var _createHooksMap = function _createHooksMap2() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
};
var _resolveSetOption = function _resolveSetOption2(cfg, key, fallback, options) {
  return objectHasOwnProperty(cfg, key) && arrayIsArray(cfg[key]) ? addToSet(options.base ? clone(options.base) : {}, cfg[key], options.transform) : fallback;
};
var _resolveObjectOption = function _resolveObjectOption2(cfg, key, makeFallback) {
  const value = objectHasOwnProperty(cfg, key) ? cfg[key] : void 0;
  return value && typeof value === "object" ? clone(value) : makeFallback();
};
function createDOMPurify() {
  let window2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : getGlobal();
  const DOMPurify = (root2) => createDOMPurify(root2);
  DOMPurify.version = "3.4.17";
  DOMPurify.removed = [];
  if (!window2 || !window2.document || window2.document.nodeType !== NODE_TYPE.document || !window2.Element) {
    DOMPurify.isSupported = false;
    return DOMPurify;
  }
  let document2 = window2.document;
  const originalDocument = document2;
  const currentScript = originalDocument.currentScript;
  window2.DocumentFragment;
  const HTMLTemplateElement = window2.HTMLTemplateElement, Node2 = window2.Node, Element = window2.Element, NodeFilter = window2.NodeFilter;
  window2.NamedNodeMap === void 0 && (window2.NamedNodeMap || window2.MozNamedAttrMap);
  window2.HTMLFormElement;
  const DOMParser = window2.DOMParser, trustedTypes = window2.trustedTypes;
  const ElementPrototype = Element.prototype;
  const cloneNode = lookupGetter(ElementPrototype, "cloneNode");
  const remove2 = lookupGetter(ElementPrototype, "remove");
  const removeAttributeNode = lookupGetter(ElementPrototype, "removeAttributeNode");
  const getNextSibling = lookupGetter(ElementPrototype, "nextSibling");
  const getChildNodes = lookupGetter(ElementPrototype, "childNodes");
  const getParentNode = lookupGetter(ElementPrototype, "parentNode");
  const getShadowRoot = lookupGetter(ElementPrototype, "shadowRoot");
  const getAttributes = lookupGetter(ElementPrototype, "attributes");
  const getNodeType = Node2 && Node2.prototype ? lookupGetter(Node2.prototype, "nodeType") : null;
  const getNodeName = Node2 && Node2.prototype ? lookupGetter(Node2.prototype, "nodeName") : null;
  const getOwnerDocument = Node2 && Node2.prototype ? lookupGetter(Node2.prototype, "ownerDocument") : null;
  const _readNodeType = function _readNodeType2(node) {
    return getNodeType ? getNodeType(node) : node.nodeType;
  };
  const _readNodeName = function _readNodeName2(node) {
    return getNodeName ? getNodeName(node) : node.nodeName;
  };
  const getNamespaceURI = lookupAccessor(ElementPrototype, "namespaceURI");
  const _readNamespaceURI = function _readNamespaceURI2(element) {
    return getNamespaceURI ? getNamespaceURI(element) : element.namespaceURI;
  };
  if (typeof HTMLTemplateElement === "function") {
    const template = document2.createElement("template");
    if (template.content && template.content.ownerDocument) document2 = template.content.ownerDocument;
  }
  let trustedTypesPolicy;
  let emptyHTML = "";
  let defaultTrustedTypesPolicy;
  let defaultTrustedTypesPolicyResolved = false;
  let IN_TRUSTED_TYPES_POLICY = 0;
  const _assertNotInTrustedTypesPolicy = function _assertNotInTrustedTypesPolicy2() {
    if (IN_TRUSTED_TYPES_POLICY > 0) throw typeErrorCreate('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  };
  const _createTrustedHTML = function _createTrustedHTML2(html2) {
    _assertNotInTrustedTypesPolicy();
    IN_TRUSTED_TYPES_POLICY++;
    try {
      return trustedTypesPolicy.createHTML(html2);
    } finally {
      IN_TRUSTED_TYPES_POLICY--;
    }
  };
  const _createTrustedScriptURL = function _createTrustedScriptURL2(scriptUrl) {
    _assertNotInTrustedTypesPolicy();
    IN_TRUSTED_TYPES_POLICY++;
    try {
      return trustedTypesPolicy.createScriptURL(scriptUrl);
    } finally {
      IN_TRUSTED_TYPES_POLICY--;
    }
  };
  const _getDefaultTrustedTypesPolicy = function _getDefaultTrustedTypesPolicy2() {
    if (!defaultTrustedTypesPolicyResolved) {
      defaultTrustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
      defaultTrustedTypesPolicyResolved = true;
    }
    return defaultTrustedTypesPolicy;
  };
  const _document = document2, implementation = _document.implementation, createNodeIterator = _document.createNodeIterator, createDocumentFragment = _document.createDocumentFragment, getElementsByTagName = _document.getElementsByTagName;
  const importNode = originalDocument.importNode;
  let hooks = _createHooksMap();
  DOMPurify.isSupported = typeof entries === "function" && typeof getParentNode === "function" && implementation && implementation.createHTMLDocument !== void 0;
  const MUSTACHE_EXPR$1 = MUSTACHE_EXPR, ERB_EXPR$1 = ERB_EXPR, TMPLIT_EXPR$1 = TMPLIT_EXPR, DATA_ATTR$1 = DATA_ATTR, ARIA_ATTR$1 = ARIA_ATTR, IS_SCRIPT_OR_DATA$1 = IS_SCRIPT_OR_DATA, ATTR_WHITESPACE$1 = ATTR_WHITESPACE, CUSTOM_ELEMENT$1 = CUSTOM_ELEMENT;
  let IS_ALLOWED_URI$1 = IS_ALLOWED_URI;
  let ALLOWED_TAGS = null;
  const DEFAULT_ALLOWED_TAGS = addToSet({}, [
    ...html$1,
    ...svg$1,
    ...svgFilters,
    ...mathMl$1,
    ...text
  ]);
  let ALLOWED_ATTR = null;
  const DEFAULT_ALLOWED_ATTR = addToSet({}, [
    ...html,
    ...svg,
    ...mathMl,
    ...xml
  ]);
  let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
    tagNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: false
    }
  }));
  let FORBID_TAGS = null;
  let FORBID_ATTR = null;
  const EXTRA_ELEMENT_HANDLING = Object.seal(create(null, {
    tagCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    }
  }));
  let ALLOW_ARIA_ATTR = true;
  let ALLOW_DATA_ATTR = true;
  let ALLOW_UNKNOWN_PROTOCOLS = false;
  let ALLOW_SELF_CLOSE_IN_ATTR = true;
  let SAFE_FOR_TEMPLATES = false;
  let SAFE_FOR_XML = true;
  let WHOLE_DOCUMENT = false;
  let SET_CONFIG = false;
  let SET_CONFIG_ALLOWED_TAGS = null;
  let SET_CONFIG_ALLOWED_ATTR = null;
  let FORCE_BODY = false;
  let RETURN_DOM = false;
  let RETURN_DOM_FRAGMENT = false;
  let RETURN_TRUSTED_TYPE = false;
  let SANITIZE_DOM = true;
  let SANITIZE_NAMED_PROPS = false;
  const SANITIZE_NAMED_PROPS_PREFIX = "user-content-";
  let KEEP_CONTENT = true;
  let IN_PLACE = false;
  let IN_PLACE_VISITED = null;
  let USE_PROFILES = {};
  let FORBID_CONTENTS = null;
  const DEFAULT_FORBID_CONTENTS = addToSet({}, [
    "annotation-xml",
    "audio",
    "colgroup",
    "desc",
    "foreignobject",
    "head",
    "iframe",
    "math",
    "mi",
    "mn",
    "mo",
    "ms",
    "mtext",
    "noembed",
    "noframes",
    "noscript",
    "plaintext",
    "script",
    "selectedcontent",
    "style",
    "svg",
    "template",
    "thead",
    "title",
    "video",
    "xmp"
  ]);
  let DATA_URI_TAGS = null;
  const DEFAULT_DATA_URI_TAGS = addToSet({}, [
    "audio",
    "video",
    "img",
    "source",
    "image",
    "track"
  ]);
  let URI_SAFE_ATTRIBUTES = null;
  const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, [
    "alt",
    "class",
    "for",
    "id",
    "label",
    "name",
    "pattern",
    "placeholder",
    "role",
    "summary",
    "title",
    "value",
    "style",
    "xmlns"
  ]);
  const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
  let NAMESPACE = HTML_NAMESPACE;
  let IS_EMPTY_INPUT = false;
  let ALLOWED_NAMESPACES = null;
  const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [
    MATHML_NAMESPACE,
    SVG_NAMESPACE,
    HTML_NAMESPACE
  ], stringToString);
  const DEFAULT_MATHML_TEXT_INTEGRATION_POINTS = freeze([
    "mi",
    "mo",
    "mn",
    "ms",
    "mtext"
  ]);
  let MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS);
  const DEFAULT_HTML_INTEGRATION_POINTS = freeze(["annotation-xml"]);
  let HTML_INTEGRATION_POINTS = addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS);
  const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, [
    "title",
    "style",
    "font",
    "a",
    "script"
  ]);
  let PARSER_MEDIA_TYPE = null;
  const SUPPORTED_PARSER_MEDIA_TYPES = ["application/xhtml+xml", "text/html"];
  const DEFAULT_PARSER_MEDIA_TYPE = "text/html";
  let transformCaseFunc = null;
  let CONFIG = null;
  const formElement = document2.createElement("form");
  const isRegexOrFunction = function isRegexOrFunction2(testValue) {
    return testValue instanceof RegExp || testValue instanceof Function;
  };
  const _parseConfig = function _parseConfig2() {
    let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (CONFIG && CONFIG === cfg) return;
    if (!cfg || typeof cfg !== "object") cfg = {};
    cfg = clone(cfg);
    PARSER_MEDIA_TYPE = SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;
    transformCaseFunc = PARSER_MEDIA_TYPE === "application/xhtml+xml" ? stringToString : stringToLowerCase;
    ALLOWED_TAGS = _resolveSetOption(cfg, "ALLOWED_TAGS", DEFAULT_ALLOWED_TAGS, { transform: transformCaseFunc });
    ALLOWED_ATTR = _resolveSetOption(cfg, "ALLOWED_ATTR", DEFAULT_ALLOWED_ATTR, { transform: transformCaseFunc });
    ALLOWED_NAMESPACES = _resolveSetOption(cfg, "ALLOWED_NAMESPACES", DEFAULT_ALLOWED_NAMESPACES, { transform: stringToString });
    URI_SAFE_ATTRIBUTES = _resolveSetOption(cfg, "ADD_URI_SAFE_ATTR", DEFAULT_URI_SAFE_ATTRIBUTES, {
      transform: transformCaseFunc,
      base: DEFAULT_URI_SAFE_ATTRIBUTES
    });
    DATA_URI_TAGS = _resolveSetOption(cfg, "ADD_DATA_URI_TAGS", DEFAULT_DATA_URI_TAGS, {
      transform: transformCaseFunc,
      base: DEFAULT_DATA_URI_TAGS
    });
    FORBID_CONTENTS = _resolveSetOption(cfg, "FORBID_CONTENTS", DEFAULT_FORBID_CONTENTS, { transform: transformCaseFunc });
    FORBID_TAGS = _resolveSetOption(cfg, "FORBID_TAGS", clone({}), { transform: transformCaseFunc });
    FORBID_ATTR = _resolveSetOption(cfg, "FORBID_ATTR", clone({}), { transform: transformCaseFunc });
    USE_PROFILES = objectHasOwnProperty(cfg, "USE_PROFILES") ? cfg.USE_PROFILES && typeof cfg.USE_PROFILES === "object" ? clone(cfg.USE_PROFILES) : cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false;
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false;
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false;
    ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false;
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false;
    SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false;
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false;
    RETURN_DOM = cfg.RETURN_DOM || false;
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false;
    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false;
    FORCE_BODY = cfg.FORCE_BODY || false;
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false;
    SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false;
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false;
    IN_PLACE = cfg.IN_PLACE || false;
    IS_ALLOWED_URI$1 = isRegex(cfg.ALLOWED_URI_REGEXP) ? cfg.ALLOWED_URI_REGEXP : IS_ALLOWED_URI;
    NAMESPACE = typeof cfg.NAMESPACE === "string" ? cfg.NAMESPACE : HTML_NAMESPACE;
    MATHML_TEXT_INTEGRATION_POINTS = _resolveObjectOption(cfg, "MATHML_TEXT_INTEGRATION_POINTS", () => addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS));
    HTML_INTEGRATION_POINTS = _resolveObjectOption(cfg, "HTML_INTEGRATION_POINTS", () => addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS));
    const customElementHandling = _resolveObjectOption(cfg, "CUSTOM_ELEMENT_HANDLING", () => create(null));
    CUSTOM_ELEMENT_HANDLING = create(null);
    if (objectHasOwnProperty(customElementHandling, "tagNameCheck") && isRegexOrFunction(customElementHandling.tagNameCheck)) CUSTOM_ELEMENT_HANDLING.tagNameCheck = customElementHandling.tagNameCheck;
    if (objectHasOwnProperty(customElementHandling, "attributeNameCheck") && isRegexOrFunction(customElementHandling.attributeNameCheck)) CUSTOM_ELEMENT_HANDLING.attributeNameCheck = customElementHandling.attributeNameCheck;
    if (objectHasOwnProperty(customElementHandling, "allowCustomizedBuiltInElements") && typeof customElementHandling.allowCustomizedBuiltInElements === "boolean") CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = customElementHandling.allowCustomizedBuiltInElements;
    seal(CUSTOM_ELEMENT_HANDLING);
    if (SAFE_FOR_TEMPLATES) ALLOW_DATA_ATTR = false;
    if (RETURN_DOM_FRAGMENT) RETURN_DOM = true;
    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, text);
      ALLOWED_ATTR = create(null);
      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html$1);
        addToSet(ALLOWED_ATTR, html);
      }
      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg$1);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl$1);
        addToSet(ALLOWED_ATTR, mathMl);
        addToSet(ALLOWED_ATTR, xml);
      }
    }
    EXTRA_ELEMENT_HANDLING.tagCheck = null;
    EXTRA_ELEMENT_HANDLING.attributeCheck = null;
    if (objectHasOwnProperty(cfg, "ADD_TAGS")) {
      if (typeof cfg.ADD_TAGS === "function") EXTRA_ELEMENT_HANDLING.tagCheck = cfg.ADD_TAGS;
      else if (arrayIsArray(cfg.ADD_TAGS)) {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) ALLOWED_TAGS = clone(ALLOWED_TAGS);
        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
      }
    }
    if (objectHasOwnProperty(cfg, "ADD_ATTR")) {
      if (typeof cfg.ADD_ATTR === "function") EXTRA_ELEMENT_HANDLING.attributeCheck = cfg.ADD_ATTR;
      else if (arrayIsArray(cfg.ADD_ATTR)) {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) ALLOWED_ATTR = clone(ALLOWED_ATTR);
        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
      }
    }
    if (objectHasOwnProperty(cfg, "ADD_FORBID_CONTENTS") && arrayIsArray(cfg.ADD_FORBID_CONTENTS)) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) FORBID_CONTENTS = clone(FORBID_CONTENTS);
      addToSet(FORBID_CONTENTS, cfg.ADD_FORBID_CONTENTS, transformCaseFunc);
    }
    if (KEEP_CONTENT) ALLOWED_TAGS["#text"] = true;
    if (WHOLE_DOCUMENT) addToSet(ALLOWED_TAGS, [
      "html",
      "head",
      "body"
    ]);
    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ["tbody"]);
      delete FORBID_TAGS.tbody;
    }
    if (cfg.TRUSTED_TYPES_POLICY) {
      if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== "function") throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== "function") throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const previousTrustedTypesPolicy = trustedTypesPolicy;
      trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;
      try {
        emptyHTML = _createTrustedHTML("");
      } catch (error) {
        trustedTypesPolicy = previousTrustedTypesPolicy;
        throw error;
      }
    } else if (cfg.TRUSTED_TYPES_POLICY === null) {
      trustedTypesPolicy = void 0;
      emptyHTML = "";
    } else {
      if (trustedTypesPolicy === void 0) trustedTypesPolicy = _getDefaultTrustedTypesPolicy();
      if (trustedTypesPolicy && typeof emptyHTML === "string") emptyHTML = _createTrustedHTML("");
    }
    if (freeze) freeze(cfg);
    CONFIG = cfg;
  };
  const ALL_SVG_TAGS = addToSet({}, [
    ...svg$1,
    ...svgFilters,
    ...svgDisallowed
  ]);
  const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);
  const _checkSvgNamespace = function _checkSvgNamespace2(tagName, parent, parentTagName) {
    if (parent.namespaceURI === HTML_NAMESPACE) return tagName === "svg";
    if (parent.namespaceURI === MATHML_NAMESPACE) return tagName === "svg" && (parentTagName === "annotation-xml" || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
    return Boolean(ALL_SVG_TAGS[tagName]);
  };
  const _checkMathMlNamespace = function _checkMathMlNamespace2(tagName, parent, parentTagName) {
    if (parent.namespaceURI === HTML_NAMESPACE) return tagName === "math";
    if (parent.namespaceURI === SVG_NAMESPACE) return tagName === "math" && HTML_INTEGRATION_POINTS[parentTagName];
    return Boolean(ALL_MATHML_TAGS[tagName]);
  };
  const _checkHtmlNamespace = function _checkHtmlNamespace2(tagName, parent, parentTagName) {
    if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) return false;
    if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) return false;
    return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
  };
  const _checkValidNamespace = function _checkValidNamespace2(element) {
    const elementNamespace = _readNamespaceURI(element);
    const tagName = stringToLowerCase(_readNodeName(element));
    const parentNode = getParentNode(element);
    let parent;
    let parentTagName;
    if (parentNode && _readNodeType(parentNode) === NODE_TYPE.element) {
      parent = { namespaceURI: _readNamespaceURI(parentNode) };
      parentTagName = stringToLowerCase(_readNodeName(parentNode));
    } else {
      parent = { namespaceURI: NAMESPACE };
      parentTagName = "template";
    }
    if (!ALLOWED_NAMESPACES[elementNamespace]) return false;
    if (elementNamespace === SVG_NAMESPACE) return _checkSvgNamespace(tagName, parent, parentTagName);
    if (elementNamespace === MATHML_NAMESPACE) return _checkMathMlNamespace(tagName, parent, parentTagName);
    if (elementNamespace === HTML_NAMESPACE) return _checkHtmlNamespace(tagName, parent, parentTagName);
    if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && ALLOWED_NAMESPACES[elementNamespace]) return true;
    return false;
  };
  const _forceRemove = function _forceRemove2(node) {
    arrayPush(DOMPurify.removed, { element: node });
    try {
      getParentNode(node).removeChild(node);
    } catch (_2) {
      remove2(node);
      if (!getParentNode(node)) throw typeErrorCreate("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  };
  const _stripAttributeNode = function _stripAttributeNode2(element, attribute, name) {
    try {
      removeAttributeNode(element, attribute);
    } catch (_2) {
      try {
        element.removeAttribute(name);
      } catch (_3) {
      }
    }
  };
  const _neutralizeRoot = function _neutralizeRoot2(root2) {
    _neutralizeSubtree(root2);
    const childNodes = getChildNodes(root2);
    if (childNodes) arrayForEach(arraySlice(childNodes), (child) => {
      try {
        remove2(child);
      } catch (_2) {
      }
    });
    const attributes = _readNodeType(root2) === NODE_TYPE.element ? getAttributes(root2) : null;
    if (attributes) for (let i2 = attributes.length - 1; i2 >= 0; --i2) {
      const attribute = attributes[i2];
      const name = attribute && attribute.name;
      if (typeof name === "string") _stripAttributeNode(root2, attribute, name);
    }
  };
  const _removeAttribute = function _removeAttribute2(name, element, attr) {
    if (!attr) try {
      attr = element.getAttributeNode(name);
    } catch (_2) {
      attr = null;
    }
    arrayPush(DOMPurify.removed, {
      attribute: attr || null,
      from: element
    });
    try {
      if (attr) removeAttributeNode(element, attr);
      else element.removeAttribute(name);
    } catch (_2) {
      try {
        element.removeAttribute(name);
      } catch (_3) {
      }
    }
    if (name === "is") {
      if (RETURN_DOM || RETURN_DOM_FRAGMENT) try {
        _forceRemove(element);
      } catch (_2) {
      }
      else try {
        element.setAttribute(name, "");
      } catch (_2) {
      }
    }
  };
  const _stripDisallowedAttributes = function _stripDisallowedAttributes2(element) {
    const attributes = getAttributes(element);
    if (!attributes) return;
    for (let i2 = attributes.length - 1; i2 >= 0; --i2) {
      const attribute = attributes[i2];
      const name = attribute && attribute.name;
      if (typeof name !== "string" || ALLOWED_ATTR[transformCaseFunc(name)]) continue;
      _stripAttributeNode(element, attribute, name);
    }
  };
  const _walkTree = function _walkTree2(root2, visit) {
    let intoShadow = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
    const stack = [root2];
    while (stack.length > 0) {
      const node = stack.pop();
      if (visit(node) === false) continue;
      if (intoShadow && _readNodeType(node) === NODE_TYPE.element) {
        const shadowRoot = getShadowRoot(node);
        if (_isDocumentFragment(shadowRoot)) stack.push(shadowRoot);
      }
      const childNodes = getChildNodes(node);
      if (childNodes) for (let i2 = childNodes.length - 1; i2 >= 0; --i2) stack.push(childNodes[i2]);
    }
  };
  const _neutralizeSubtree = function _neutralizeSubtree2(root2) {
    _walkTree(root2, (node) => {
      if (_readNodeType(node) === NODE_TYPE.element) _stripDisallowedAttributes(node);
    });
  };
  const _collectLiveNodes = function _collectLiveNodes2(root2) {
    const nodes = [];
    _walkTree(root2, (node) => {
      nodes.push(node);
    }, true);
    return nodes;
  };
  const _neutralizeEscapedElements = function _neutralizeEscapedElements2(root2, before) {
    const reachable = setCreate();
    arrayForEach(_collectLiveNodes(root2), (node) => {
      if (_readNodeType(node) === NODE_TYPE.element) setAdd(reachable, node);
    });
    arrayForEach(before, (node) => {
      if (_readNodeType(node) === NODE_TYPE.element && !setHas(reachable, node)) _stripDisallowedAttributes(node);
    });
  };
  const _neutralizeDiscarded = function _neutralizeDiscarded2(root2, before) {
    let rootRemoved = false;
    arrayForEach(DOMPurify.removed, (entry) => {
      if (entry.element) {
        rootRemoved = rootRemoved || entry.element === root2;
        _neutralizeSubtree(entry.element);
      }
    });
    _neutralizeEscapedElements(root2, before);
    return rootRemoved;
  };
  const MAX_UNVISITED_ROUNDS = 8;
  const _sanitizeUnvisitedNodes = function _sanitizeUnvisitedNodes2(root2, before) {
    const visited = IN_PLACE_VISITED;
    let original = null;
    const getOriginal = () => {
      if (!original) {
        original = setCreate();
        arrayForEach(before, (beforeNode) => {
          setAdd(original, beforeNode);
        });
      }
      return original;
    };
    for (let round = 0; ; round++) {
      const live = _collectLiveNodes(root2);
      const containers = [root2];
      let pending = false;
      arrayForEach(live, (node) => {
        if (_readNodeType(node) === NODE_TYPE.documentFragment) arrayPush(containers, node);
        else if (!pending && !setHas(visited, node)) pending = setHas(getOriginal(), node);
      });
      if (!pending) return;
      if (round >= MAX_UNVISITED_ROUNDS) throw typeErrorCreate("the tree kept changing during in-place sanitization; refusing to return it");
      arrayForEach(containers, (container, index) => {
        _sanitizeUnvisitedIn(container, index > 0, root2, getOriginal());
      });
    }
  };
  const _sanitizeUnvisitedIn = function _sanitizeUnvisitedIn2(container, inShadow, root2, original) {
    const iterator = _createNodeIterator(container);
    let node;
    while (node = iterator.nextNode()) {
      if (!setHas(original, node) || setHas(IN_PLACE_VISITED, node)) continue;
      if (inShadow) _executeHooks(hooks.uponSanitizeShadowNode, node, null);
      _sanitizeElements(node, root2);
      _sanitizeAttributes(node, root2);
      if (_isDocumentFragment(node.content)) _sanitizeShadowDOM2(node.content);
    }
  };
  const _markVisited = function _markVisited2(node) {
    if (IN_PLACE_VISITED) setAdd(IN_PLACE_VISITED, node);
  };
  const _isPatchLinkageAttribute = function _isPatchLinkageAttribute2(lcName, lcTag) {
    if (!SAFE_FOR_XML) return false;
    if (lcName === "patchsrc") return true;
    return lcName === "for" && lcTag !== "label" && lcTag !== "output";
  };
  const _neutralizePatchLinkage = function _neutralizePatchLinkage2(root2) {
    if (!SAFE_FOR_XML) return;
    _walkTree(root2, (node) => {
      const nodeType = _readNodeType(node);
      if (nodeType === NODE_TYPE.processingInstruction || nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, node.data)) {
        try {
          remove2(node);
        } catch (_2) {
        }
        return false;
      }
      if (nodeType === NODE_TYPE.element) {
        const element = node;
        const lcTag = transformCaseFunc(_readNodeName(node));
        try {
          if (element.hasAttribute && element.hasAttribute("patchsrc")) element.removeAttribute("patchsrc");
          if (element.hasAttribute && element.hasAttribute("for") && _isPatchLinkageAttribute("for", lcTag)) element.removeAttribute("for");
        } catch (_2) {
        }
      }
      return true;
    });
  };
  const _initDocument = function _initDocument2(dirty) {
    let doc = null;
    let leadingWhitespace = null;
    if (FORCE_BODY) dirty = "<remove></remove>" + dirty;
    else {
      const matches = stringMatch(dirty, /^[\r\n\t ]+/);
      leadingWhitespace = matches && matches[0];
    }
    if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && NAMESPACE === HTML_NAMESPACE) dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + "</body></html>";
    const dirtyPayload = trustedTypesPolicy ? _createTrustedHTML(dirty) : dirty;
    if (NAMESPACE === HTML_NAMESPACE) try {
      doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
    } catch (_2) {
    }
    if (!doc || !doc.documentElement) {
      doc = implementation.createDocument(NAMESPACE, "template", null);
      try {
        doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
      } catch (_2) {
      }
    }
    const body2 = doc.body || doc.documentElement;
    if (dirty && leadingWhitespace) body2.insertBefore(document2.createTextNode(leadingWhitespace), body2.childNodes[0] || null);
    if (NAMESPACE === HTML_NAMESPACE) return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? "html" : "body")[0];
    return WHOLE_DOCUMENT ? doc.documentElement : body2;
  };
  const _createNodeIterator = function _createNodeIterator2(root2) {
    const doc = getOwnerDocument ? getOwnerDocument(root2) : root2.ownerDocument;
    return createNodeIterator.call(doc || root2, root2, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION, null);
  };
  const _stripTemplateExpressions = function _stripTemplateExpressions2(value) {
    value = stringReplace(value, MUSTACHE_EXPR$1, " ");
    value = stringReplace(value, ERB_EXPR$1, " ");
    value = stringReplace(value, TMPLIT_EXPR$1, " ");
    return value;
  };
  const _scrubTemplateExpressions2 = function _scrubTemplateExpressions(node) {
    var _node$querySelectorAl;
    _scrubOwnCharacterData(node);
    const templates = (_node$querySelectorAl = node.querySelectorAll) === null || _node$querySelectorAl === void 0 ? void 0 : _node$querySelectorAl.call(node, "template");
    if (templates) arrayForEach(templates, (tmpl) => {
      if (_isDocumentFragment(tmpl.content)) _scrubTemplateExpressions2(tmpl.content);
    });
  };
  const _scrubOwnCharacterData = function _scrubOwnCharacterData2(node) {
    node.normalize();
    const doc = getOwnerDocument ? getOwnerDocument(node) : node.ownerDocument;
    const walker = createNodeIterator.call(doc || node, node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_CDATA_SECTION | NodeFilter.SHOW_PROCESSING_INSTRUCTION, null);
    let currentNode = walker.nextNode();
    while (currentNode) {
      currentNode.data = _stripTemplateExpressions(currentNode.data);
      currentNode = walker.nextNode();
    }
  };
  const _isClobbered = function _isClobbered2(element) {
    const realTagName = getNodeName ? getNodeName(element) : null;
    if (typeof realTagName !== "string") return false;
    if (transformCaseFunc(realTagName) !== "form") return false;
    return typeof element.nodeName !== "string" || typeof element.textContent !== "string" || typeof element.removeChild !== "function" || element.attributes !== getAttributes(element) || typeof element.removeAttribute !== "function" || typeof element.removeAttributeNode !== "function" || typeof element.getAttributeNode !== "function" || typeof element.setAttribute !== "function" || typeof element.namespaceURI !== "string" || typeof element.insertBefore !== "function" || typeof element.hasChildNodes !== "function" || element.nodeType !== getNodeType(element) || element.childNodes !== getChildNodes(element);
  };
  const _isDocumentFragment = function _isDocumentFragment2(value) {
    if (!getNodeType || typeof value !== "object" || value === null) return false;
    try {
      return getNodeType(value) === NODE_TYPE.documentFragment;
    } catch (_2) {
      return false;
    }
  };
  const _isNode = function _isNode2(value) {
    if (!getNodeType || typeof value !== "object" || value === null) return false;
    try {
      return typeof getNodeType(value) === "number";
    } catch (_2) {
      return false;
    }
  };
  function _executeHooks(hooks2, currentNode, data) {
    if (hooks2.length === 0) return;
    arrayForEach(hooks2, (hook) => {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  }
  const _isUnsafeNode = function _isUnsafeNode2(currentNode, tagName) {
    if (SAFE_FOR_XML && currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.textContent) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.innerHTML)) return true;
    if (SAFE_FOR_XML && LITERAL_TEXT_ELEMENTS[tagName] && _readNodeType(currentNode) === NODE_TYPE.element && _readNamespaceURI(currentNode) === HTML_NAMESPACE && (_isNode(currentNode.firstElementChild) || typeof currentNode.textContent === "string" && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.textContent))) return true;
    if (currentNode.nodeType === NODE_TYPE.processingInstruction) return true;
    if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, currentNode.data)) return true;
    return false;
  };
  const _matchesNameCheck = function _matchesNameCheck2(check, name) {
    if (check instanceof RegExp) return regExpTest(check, name);
    if (check instanceof Function) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) args[_key - 2] = arguments[_key];
      return Boolean(check(name, ...args));
    }
    return false;
  };
  const _sanitizeDisallowedNode = function _sanitizeDisallowedNode2(currentNode, tagName, root2) {
    if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) return false;
    if (KEEP_CONTENT && !FORBID_CONTENTS[tagName] && !FORBID_CONTENTS[stringToLowerCase(tagName)]) {
      const parentNode = getParentNode(currentNode);
      const childNodes = getChildNodes(currentNode);
      if (childNodes && parentNode) {
        const childCount = childNodes.length;
        for (let i2 = childCount - 1; i2 >= 0; --i2) {
          const hoisted = currentNode === root2 ? cloneNode(childNodes[i2], true) : childNodes[i2];
          parentNode.insertBefore(hoisted, getNextSibling(currentNode));
        }
      }
    }
    _forceRemove(currentNode);
    return true;
  };
  const _forkSharedAllowlist = function _forkSharedAllowlist2(hookList, set, defaultSet, setConfigSet) {
    if (hookList.length === 0) return set;
    return set === defaultSet || set === setConfigSet ? clone(set) : set;
  };
  const _handleHookDetachedNode = function _handleHookDetachedNode2(currentNode, root2) {
    if (currentNode === root2 || getParentNode(currentNode) !== null) return false;
    if (IN_PLACE) _neutralizeSubtree(currentNode);
    return true;
  };
  const _sanitizeElements = function _sanitizeElements2(currentNode, root2) {
    _markVisited(currentNode);
    _executeHooks(hooks.beforeSanitizeElements, currentNode, null);
    if (_handleHookDetachedNode(currentNode, root2)) return true;
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    const tagName = transformCaseFunc(_readNodeName(currentNode));
    ALLOWED_TAGS = _forkSharedAllowlist(hooks.uponSanitizeElement, ALLOWED_TAGS, DEFAULT_ALLOWED_TAGS, SET_CONFIG_ALLOWED_TAGS);
    _executeHooks(hooks.uponSanitizeElement, currentNode, {
      tagName,
      allowedTags: ALLOWED_TAGS
    });
    if (_handleHookDetachedNode(currentNode, root2)) return true;
    if (_isUnsafeNode(currentNode, tagName)) {
      _forceRemove(currentNode);
      return true;
    }
    if (FORBID_TAGS[tagName] || !(EXTRA_ELEMENT_HANDLING.tagCheck instanceof Function && EXTRA_ELEMENT_HANDLING.tagCheck(tagName)) && !ALLOWED_TAGS[tagName]) {
      const removed = _sanitizeDisallowedNode(currentNode, tagName, root2);
      if (removed === false) {
        _executeHooks(hooks.afterSanitizeElements, currentNode, null);
        if (_handleHookDetachedNode(currentNode, root2)) return true;
      }
      return removed;
    }
    if (_readNodeType(currentNode) === NODE_TYPE.element && !_checkValidNamespace(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    if ((tagName === "noscript" || tagName === "noembed" || tagName === "noframes") && regExpTest(FALLBACK_TAG_CLOSE, currentNode.innerHTML)) {
      _forceRemove(currentNode);
      return true;
    }
    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
      const content = _stripTemplateExpressions(currentNode.textContent);
      if (currentNode.textContent !== content) {
        arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
        currentNode.textContent = content;
      }
    }
    _executeHooks(hooks.afterSanitizeElements, currentNode, null);
    return _handleHookDetachedNode(currentNode, root2);
  };
  const _isValidAttribute = function _isValidAttribute2(lcTag, lcName, value) {
    if (FORBID_ATTR[lcName]) return false;
    if (_isPatchLinkageAttribute(lcName, lcTag)) return false;
    if (SANITIZE_DOM && (lcName === "id" || lcName === "name") && (value in document2 || value in formElement)) return false;
    const nameIsPermitted = ALLOWED_ATTR[lcName] || EXTRA_ELEMENT_HANDLING.attributeCheck instanceof Function && EXTRA_ELEMENT_HANDLING.attributeCheck(lcName, lcTag);
    if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR$1, lcName)) return true;
    if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$1, lcName)) return true;
    if (!nameIsPermitted) return _isBasicCustomElement(lcTag) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName, lcTag) || lcName === "is" && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value);
    if (URI_SAFE_ATTRIBUTES[lcName]) return true;
    if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE$1, ""))) return true;
    if ((lcName === "src" || lcName === "xlink:href" || lcName === "href") && lcTag !== "script" && stringIndexOf(value, "data:") === 0 && DATA_URI_TAGS[lcTag]) return true;
    if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$1, stringReplace(value, ATTR_WHITESPACE$1, ""))) return true;
    return !value;
  };
  const RESERVED_CUSTOM_ELEMENT_NAMES = addToSet({}, [
    "annotation-xml",
    "color-profile",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "missing-glyph"
  ]);
  const _isBasicCustomElement = function _isBasicCustomElement2(tagName) {
    return !RESERVED_CUSTOM_ELEMENT_NAMES[stringToLowerCase(tagName)] && regExpTest(CUSTOM_ELEMENT$1, tagName);
  };
  const _applyTrustedTypesToAttribute = function _applyTrustedTypesToAttribute2(lcTag, lcName, namespaceURI, value) {
    if (trustedTypesPolicy && typeof trustedTypes === "object" && typeof trustedTypes.getAttributeType === "function" && !namespaceURI) switch (trustedTypes.getAttributeType(lcTag, lcName)) {
      case "TrustedHTML":
        return _createTrustedHTML(value);
      case "TrustedScriptURL":
        return _createTrustedScriptURL(value);
    }
    return value;
  };
  const _setAttributeValue = function _setAttributeValue2(currentNode, name, namespaceURI, value) {
    try {
      if (namespaceURI) currentNode.setAttributeNS(namespaceURI, name, value);
      else currentNode.setAttribute(name, value);
      if (_isClobbered(currentNode)) {
        _forceRemove(currentNode);
        return false;
      }
      return true;
    } catch (_2) {
      _removeAttribute(name, currentNode);
      return false;
    }
  };
  const _isUnsafeAttributeValue = function _isUnsafeAttributeValue2(name, value) {
    if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, value)) return true;
    return stringToLowerCase(name) === "attributename" && stringMatch(value, "href") !== null;
  };
  const _sanitizeAttributes = function _sanitizeAttributes2(currentNode, root2) {
    _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);
    if (_handleHookDetachedNode(currentNode, root2)) return;
    const attributes = currentNode.attributes;
    if (!attributes || _isClobbered(currentNode)) return;
    ALLOWED_ATTR = _forkSharedAllowlist(hooks.uponSanitizeAttribute, ALLOWED_ATTR, DEFAULT_ALLOWED_ATTR, SET_CONFIG_ALLOWED_ATTR);
    const hookEvent = {
      attrName: "",
      attrValue: "",
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR,
      forceKeepAttr: void 0
    };
    let l = attributes.length;
    const lcTag = transformCaseFunc(currentNode.nodeName);
    while (l--) {
      const attr = attributes[l];
      const name = attr.name, namespaceURI = attr.namespaceURI, attrValue = attr.value;
      const lcName = transformCaseFunc(name);
      const initValue = attrValue;
      let value = name === "value" ? initValue : stringTrim(initValue);
      let recreatedNamedProp = false;
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = void 0;
      _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
      value = hookEvent.attrValue;
      if (SANITIZE_NAMED_PROPS && (lcName === "id" || lcName === "name") && stringIndexOf(value, SANITIZE_NAMED_PROPS_PREFIX) !== 0) {
        _removeAttribute(name, currentNode, attr);
        value = SANITIZE_NAMED_PROPS_PREFIX + value;
        recreatedNamedProp = true;
      }
      if (_isUnsafeAttributeValue(name, value)) {
        _removeAttribute(name, currentNode, attr);
        continue;
      }
      if (hookEvent.forceKeepAttr) continue;
      if (!hookEvent.keepAttr) {
        _removeAttribute(name, currentNode, attr);
        continue;
      }
      if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(SELF_CLOSING_TAG, value)) {
        _removeAttribute(name, currentNode, attr);
        continue;
      }
      if (SAFE_FOR_TEMPLATES) value = _stripTemplateExpressions(value);
      if (!_isValidAttribute(lcTag, lcName, value)) {
        _removeAttribute(name, currentNode, attr);
        continue;
      }
      value = _applyTrustedTypesToAttribute(lcTag, lcName, namespaceURI, value);
      if (value !== initValue) {
        if (_setAttributeValue(currentNode, name, namespaceURI, value) && recreatedNamedProp) arrayPop(DOMPurify.removed);
      }
    }
    _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);
    _handleHookDetachedNode(currentNode, root2);
  };
  const _sanitizeShadowDOM2 = function _sanitizeShadowDOM(fragment) {
    let shadowNode = null;
    const shadowIterator = _createNodeIterator(fragment);
    _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);
    while (shadowNode = shadowIterator.nextNode()) {
      _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);
      _sanitizeElements(shadowNode, fragment);
      _sanitizeAttributes(shadowNode, fragment);
      if (_isDocumentFragment(shadowNode.content)) _sanitizeShadowDOM2(shadowNode.content);
      if (_readNodeType(shadowNode) === NODE_TYPE.element) {
        const innerSr = getShadowRoot(shadowNode);
        if (_isDocumentFragment(innerSr)) {
          _sanitizeAttachedShadowRoots(innerSr);
          _sanitizeShadowDOM2(innerSr);
        }
      }
    }
    if (SAFE_FOR_TEMPLATES) _scrubOwnCharacterData(fragment);
    _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
  };
  const _sanitizeAttachedShadowRoots = function _sanitizeAttachedShadowRoots2(root2) {
    const stack = [{
      node: root2,
      shadow: null
    }];
    while (stack.length > 0) {
      const item = stack.pop();
      if (item.shadow) {
        _sanitizeShadowDOM2(item.shadow);
        continue;
      }
      const node = item.node;
      const isElement = _readNodeType(node) === NODE_TYPE.element;
      const childNodes = getChildNodes(node);
      if (childNodes) for (let i2 = childNodes.length - 1; i2 >= 0; --i2) stack.push({
        node: childNodes[i2],
        shadow: null
      });
      if (isElement) {
        const rootName = getNodeName ? getNodeName(node) : null;
        if (typeof rootName === "string" && transformCaseFunc(rootName) === "template") {
          const content = node.content;
          if (_isDocumentFragment(content)) stack.push({
            node: content,
            shadow: null
          });
        }
      }
      if (isElement) {
        const sr = getShadowRoot(node);
        if (_isDocumentFragment(sr)) stack.push({
          node: null,
          shadow: sr
        }, {
          node: sr,
          shadow: null
        });
      }
    }
  };
  DOMPurify.sanitize = function(dirty) {
    let cfg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    let body2 = null;
    let importedNode = null;
    let currentNode = null;
    let returnNode = null;
    IS_EMPTY_INPUT = !dirty;
    if (IS_EMPTY_INPUT) dirty = "<!-->";
    if (typeof dirty !== "string" && !_isNode(dirty)) {
      dirty = stringifyValue(dirty);
      if (typeof dirty !== "string") throw typeErrorCreate("dirty is not a string, aborting");
    }
    if (!DOMPurify.isSupported) return dirty;
    if (SET_CONFIG) {
      ALLOWED_TAGS = SET_CONFIG_ALLOWED_TAGS;
      ALLOWED_ATTR = SET_CONFIG_ALLOWED_ATTR;
    } else _parseConfig(cfg);
    if (hooks.uponSanitizeElement.length > 0 || hooks.uponSanitizeAttribute.length > 0) ALLOWED_TAGS = clone(ALLOWED_TAGS);
    if (hooks.uponSanitizeAttribute.length > 0) ALLOWED_ATTR = clone(ALLOWED_ATTR);
    DOMPurify.removed = [];
    const inPlace = IN_PLACE && typeof dirty !== "string" && _isNode(dirty);
    let inPlaceNodes = [];
    const outerVisited = IN_PLACE_VISITED;
    if (inPlace) {
      _neutralizePatchLinkage(dirty);
      const nn = _readNodeName(dirty);
      if (typeof nn === "string") {
        const tagName = transformCaseFunc(nn);
        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
          _neutralizeRoot(dirty);
          throw typeErrorCreate("root node is forbidden and cannot be sanitized in-place");
        }
      }
      if (_isClobbered(dirty)) {
        _neutralizeRoot(dirty);
        throw typeErrorCreate("root node is clobbered and cannot be sanitized in-place");
      }
      inPlaceNodes = _collectLiveNodes(dirty);
      IN_PLACE_VISITED = setCreate();
    } else if (_isNode(dirty)) {
      body2 = _initDocument("<!---->");
      importedNode = body2.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === "BODY") body2 = importedNode;
      else if (importedNode.nodeName === "HTML") body2 = importedNode;
      else body2.appendChild(importedNode);
      _sanitizeAttachedShadowRoots(body2);
    } else {
      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && dirty.indexOf("<") === -1) return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(dirty) : dirty;
      body2 = _initDocument(dirty);
      if (!body2) return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : "";
    }
    if (body2 && FORCE_BODY) _forceRemove(body2.firstChild);
    const walkRoot = inPlace ? dirty : body2;
    try {
      if (inPlace) _sanitizeAttachedShadowRoots(dirty);
      const nodeIterator = _createNodeIterator(walkRoot);
      while (currentNode = nodeIterator.nextNode()) {
        _sanitizeElements(currentNode, walkRoot);
        _sanitizeAttributes(currentNode, walkRoot);
        if (_isDocumentFragment(currentNode.content)) _sanitizeShadowDOM2(currentNode.content);
      }
      if (inPlace) _sanitizeUnvisitedNodes(dirty, inPlaceNodes);
    } catch (error) {
      if (inPlace) {
        _neutralizeRoot(dirty);
        _neutralizeDiscarded(dirty, inPlaceNodes);
      }
      throw error;
    } finally {
      IN_PLACE_VISITED = outerVisited;
    }
    if (inPlace) {
      if (_neutralizeDiscarded(dirty, inPlaceNodes)) throw typeErrorCreate("a node selected for removal could not be safely returned; refusing to sanitize in place");
      if (SAFE_FOR_TEMPLATES) _scrubTemplateExpressions2(dirty);
      return dirty;
    }
    if (RETURN_DOM) {
      if (SAFE_FOR_TEMPLATES) _scrubTemplateExpressions2(body2);
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body2.ownerDocument);
        while (body2.firstChild) returnNode.appendChild(body2.firstChild);
      } else returnNode = body2;
      if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) returnNode = importNode.call(originalDocument, returnNode, true);
      return returnNode;
    }
    let serializedHTML = WHOLE_DOCUMENT ? body2.outerHTML : body2.innerHTML;
    if (WHOLE_DOCUMENT && ALLOWED_TAGS["!doctype"] && body2.ownerDocument && body2.ownerDocument.doctype && body2.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body2.ownerDocument.doctype.name)) serializedHTML = "<!DOCTYPE " + body2.ownerDocument.doctype.name + ">\n" + serializedHTML;
    if (SAFE_FOR_TEMPLATES) serializedHTML = _stripTemplateExpressions(serializedHTML);
    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(serializedHTML) : serializedHTML;
  };
  DOMPurify.setConfig = function() {
    let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    _parseConfig(cfg);
    SET_CONFIG = true;
    SET_CONFIG_ALLOWED_TAGS = ALLOWED_TAGS;
    SET_CONFIG_ALLOWED_ATTR = ALLOWED_ATTR;
  };
  DOMPurify.clearConfig = function() {
    CONFIG = null;
    SET_CONFIG = false;
    SET_CONFIG_ALLOWED_TAGS = null;
    SET_CONFIG_ALLOWED_ATTR = null;
    trustedTypesPolicy = defaultTrustedTypesPolicy;
    emptyHTML = "";
  };
  DOMPurify.isValidAttribute = function(tag, attr, value) {
    if (!CONFIG) _parseConfig({});
    const lcTag = transformCaseFunc(tag);
    const lcName = transformCaseFunc(attr);
    if (typeof value === "string" && (_isUnsafeAttributeValue(attr, value) || !ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(SELF_CLOSING_TAG, value))) return false;
    return _isValidAttribute(lcTag, lcName, value);
  };
  DOMPurify.addHook = function(entryPoint, hookFunction) {
    if (typeof hookFunction !== "function") return;
    if (!objectHasOwnProperty(hooks, entryPoint)) return;
    arrayPush(hooks[entryPoint], hookFunction);
  };
  DOMPurify.removeHook = function(entryPoint, hookFunction) {
    if (!objectHasOwnProperty(hooks, entryPoint)) return;
    if (hookFunction !== void 0) {
      const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);
      return index === -1 ? void 0 : arraySplice(hooks[entryPoint], index, 1)[0];
    }
    return arrayPop(hooks[entryPoint]);
  };
  DOMPurify.removeHooks = function(entryPoint) {
    if (!objectHasOwnProperty(hooks, entryPoint)) return;
    hooks[entryPoint] = [];
  };
  DOMPurify.removeAllHooks = function() {
    hooks = _createHooksMap();
  };
  return DOMPurify;
}
var purify_default = createDOMPurify();

// node_modules/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i2 = 0; i2 < 31; ++i2) {
    b[i2] = start += 1 << eb[i2 - 1];
  }
  var r = new i32(b[30]);
  for (var i2 = 1; i2 < 30; ++i2) {
    for (var j = b[i2]; j < b[i2 + 1]; ++j) {
      r[j] = j - b[i2] << 5 | i2;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i2 = 0;
  var l = new u16(mb);
  for (; i2 < s; ++i2) {
    if (cd[i2])
      ++l[cd[i2] - 1];
  }
  var le2 = new u16(mb);
  for (i2 = 1; i2 < mb; ++i2) {
    le2[i2] = le2[i2 - 1] + l[i2 - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i2 = 0; i2 < s; ++i2) {
      if (cd[i2]) {
        var sv = i2 << 4 | cd[i2];
        var r_1 = mb - cd[i2];
        var v2 = le2[cd[i2] - 1]++ << r_1;
        for (var m2 = v2 | (1 << r_1) - 1; v2 <= m2; ++v2) {
          co[rev[v2] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i2 = 0; i2 < s; ++i2) {
      if (cd[i2]) {
        co[i2] = rev[le2[cd[i2] - 1]++] >> 15 - cd[i2];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a3) {
  var m2 = a3[0];
  for (var i2 = 1; i2 < a3.length; ++i2) {
    if (a3[i2] > m2)
      m2 = a3[i2];
  }
  return m2;
};
var bits = function(d, p, m2) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m2;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v2, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v2.length)
    e = v2.length;
  return new u8(v2.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt2) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt2)
    throw e;
  return e;
};
var inflt = function(dat, st2, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st2.f && !st2.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st2.i != 2;
  var noSt = st2.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st2.f || 0, pos = st2.p || 0, bt2 = st2.b || 0, lm = st2.l, dm = st2.d, lbt = st2.m, dbt = st2.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt2 + l);
        buf.set(dat.subarray(s, t), bt2);
        st2.b = bt2 += l, st2.p = pos = t * 8, st2.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i2 = 0; i2 < hcLen; ++i2) {
          clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i2 = 0; i2 < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i2++] = s;
          } else {
            var c2 = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c2 = ldt[i2 - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i2++] = c2;
          }
        }
        var lt2 = ldt.subarray(0, hLit), dt2 = ldt.subarray(hLit);
        lbt = max(lt2);
        dbt = max(dt2);
        lm = hMap(lt2, lbt, 1);
        dm = hMap(dt2, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt2 + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c2 = lm[bits16(dat, pos) & lms], sym = c2 >> 4;
      pos += c2 & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c2)
        err(2);
      if (sym < 256)
        buf[bt2++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i2 = sym - 257, b = fleb[i2];
          add = bits(dat, pos, (1 << b) - 1) + fl[i2];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt2 = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt2 += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt2 + 131072);
        var end = bt2 + add;
        if (bt2 < dt2) {
          var shift = dl - dt2, dend = Math.min(dt2, end);
          if (shift + bt2 < 0)
            err(3);
          for (; bt2 < dend; ++bt2)
            buf[bt2] = dict[shift + bt2];
        }
        for (; bt2 < end; ++bt2)
          buf[bt2] = buf[bt2 - dt2];
      }
    }
    st2.l = lm, st2.p = lpos, st2.b = bt2, st2.f = final;
    if (lm)
      final = 1, st2.m = lbt, st2.d = dm, st2.n = dbt;
  } while (!final);
  return bt2 != buf.length && noBuf ? slc(buf, 0, bt2) : buf.subarray(0, bt2);
};
var wbits = function(d, p, v2) {
  v2 <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v2;
  d[o + 1] |= v2 >> 8;
};
var wbits16 = function(d, p, v2) {
  v2 <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v2;
  d[o + 1] |= v2 >> 8;
  d[o + 2] |= v2 >> 16;
};
var hTree = function(d, mb) {
  var t = [];
  for (var i2 = 0; i2 < d.length; ++i2) {
    if (d[i2])
      t.push({ s: i2, f: d[i2] });
  }
  var s = t.length;
  var t2 = t.slice();
  if (!s)
    return { t: et2, l: 0 };
  if (s == 1) {
    var v2 = new u8(t[0].s + 1);
    v2[t[0].s] = 1;
    return { t: v2, l: 1 };
  }
  t.sort(function(a3, b) {
    return a3.f - b.f;
  });
  t.push({ s: -1, f: 25001 });
  var l = t[0], r = t[1], i0 = 0, i1 = 1, i22 = 2;
  t[0] = { s: -1, f: l.f + r.f, l, r };
  while (i1 != s - 1) {
    l = t[t[i0].f < t[i22].f ? i0++ : i22++];
    r = t[i0 != i1 && t[i0].f < t[i22].f ? i0++ : i22++];
    t[i1++] = { s: -1, f: l.f + r.f, l, r };
  }
  var maxSym = t2[0].s;
  for (var i2 = 1; i2 < s; ++i2) {
    if (t2[i2].s > maxSym)
      maxSym = t2[i2].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i2 = 0, dt2 = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t2.sort(function(a3, b) {
      return tr[b.s] - tr[a3.s] || a3.f - b.f;
    });
    for (; i2 < s; ++i2) {
      var i2_1 = t2[i2].s;
      if (tr[i2_1] > mb) {
        dt2 += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt2 >>= lft;
    while (dt2 > 0) {
      var i2_2 = t2[i2].s;
      if (tr[i2_2] < mb)
        dt2 -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i2;
    }
    for (; i2 >= 0 && dt2; --i2) {
      var i2_3 = t2[i2].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt2;
      }
    }
    mbt = mb;
  }
  return { t: new u8(tr), l: mbt };
};
var ln = function(n, l, d) {
  return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
};
var lc = function(c2) {
  var s = c2.length;
  while (s && !c2[--s])
    ;
  var cl = new u16(++s);
  var cli = 0, cln = c2[0], cls = 1;
  var w2 = function(v2) {
    cl[cli++] = v2;
  };
  for (var i2 = 1; i2 <= s; ++i2) {
    if (c2[i2] == cln && i2 != s)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w2(32754);
        if (cls > 2) {
          w2(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w2(cln), --cls;
        for (; cls > 6; cls -= 6)
          w2(8304);
        if (cls > 2)
          w2(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w2(cln);
      cls = 1;
      cln = c2[i2];
    }
  }
  return { c: cl.subarray(0, cli), n: s };
};
var clen = function(cf, cl) {
  var l = 0;
  for (var i2 = 0; i2 < cl.length; ++i2)
    l += cf[i2] * cl[i2];
  return l;
};
var wfblk = function(out, pos, dat) {
  var s = dat.length;
  var o = shft(pos + 2);
  out[o] = s & 255;
  out[o + 1] = s >> 8;
  out[o + 2] = out[o] ^ 255;
  out[o + 3] = out[o + 1] ^ 255;
  for (var i2 = 0; i2 < s; ++i2)
    out[o + i2 + 4] = dat[i2];
  return (o + 4 + s) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
  wbits(out, p++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i2 = 0; i2 < lclt.length; ++i2)
    ++lcfreq[lclt[i2] & 31];
  for (var i2 = 0; i2 < lcdt.length; ++i2)
    ++lcfreq[lcdt[i2] & 31];
  var _e2 = hTree(lcfreq, 7), lct = _e2.t, mlcb = _e2.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen)
    return wfblk(out, p, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p, nlc - 257);
    wbits(out, p + 5, ndc - 1);
    wbits(out, p + 10, nlcc - 4);
    p += 14;
    for (var i2 = 0; i2 < nlcc; ++i2)
      wbits(out, p + 3 * i2, lct[clim[i2]]);
    p += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it2 = 0; it2 < 2; ++it2) {
      var clct = lcts[it2];
      for (var i2 = 0; i2 < clct.length; ++i2) {
        var len = clct[i2] & 31;
        wbits(out, p, llm[len]), p += lct[len];
        if (len > 15)
          wbits(out, p, clct[i2] >> 5 & 127), p += clct[i2] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i2 = 0; i2 < li; ++i2) {
    var sym = syms[i2];
    if (sym > 255) {
      var len = sym >> 18 & 31;
      wbits16(out, p, lm[len + 257]), p += ll[len + 257];
      if (len > 7)
        wbits(out, p, sym >> 23 & 31), p += fleb[len];
      var dst = sym & 31;
      wbits16(out, p, dm[dst]), p += dl[dst];
      if (dst > 3)
        wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
    } else {
      wbits16(out, p, lm[sym]), p += ll[sym];
    }
  }
  wbits16(out, p, lm[256]);
  return p + ll[256];
};
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et2 = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st2) {
  var s = st2.z || dat.length;
  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
  var w2 = o.subarray(pre, o.length - post);
  var lst = st2.l;
  var pos = (st2.r || 0) & 7;
  if (lvl) {
    if (pos)
      w2[0] = st2.r >> 3;
    var opt = deo[lvl - 1];
    var n = opt >> 13, c2 = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st2.p || new u16(32768), head = st2.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i3) {
      return (dat[i3] ^ dat[i3 + 1] << bs1_1 ^ dat[i3 + 2] << bs2_1) & msk_1;
    };
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i2 = st2.i || 0, li = 0, wi = st2.w || 0, bs = 0;
    for (; i2 + 2 < s; ++i2) {
      var hv = hsh(i2);
      var imod = i2 & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i2) {
        var rem = s - i2;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w2, 0, syms, lf, df, eb, li, bs, i2 - bs, pos);
          li = lc_1 = eb = 0, bs = i2;
          for (var j = 0; j < 286; ++j)
            lf[j] = 0;
          for (var j = 0; j < 30; ++j)
            df[j] = 0;
        }
        var l = 2, d = 0, ch_1 = c2, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i2 - dif)) {
          var maxn = Math.min(n, rem) - 1;
          var maxd = Math.min(32767, i2);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i2 + l] == dat[i2 + l - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i2 + nl] == dat[i2 + nl - dif]; ++nl)
                ;
              if (nl > l) {
                l = nl, d = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var j = 0; j < mmd; ++j) {
                  var ti = i2 - dif + j & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md)
                    md = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d) {
          syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
          var lin = revfl[l] & 31, din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i2 + l;
          ++lc_1;
        } else {
          syms[li++] = dat[i2];
          ++lf[dat[i2]];
        }
      }
    }
    for (i2 = Math.max(i2, wi); i2 < s; ++i2) {
      syms[li++] = dat[i2];
      ++lf[dat[i2]];
    }
    pos = wblk(dat, w2, lst, syms, lf, df, eb, li, bs, i2 - bs, pos);
    if (!lst) {
      st2.r = pos & 7 | w2[pos / 8 | 0] << 3;
      pos -= 7;
      st2.h = head, st2.p = prev, st2.i = i2, st2.w = wi;
    }
  } else {
    for (var i2 = st2.w || 0; i2 < s + lst; i2 += 65535) {
      var e = i2 + 65535;
      if (e >= s) {
        w2[pos / 8 | 0] = lst;
        e = s;
      }
      pos = wfblk(w2, pos + 1, dat.subarray(i2, e));
    }
    st2.i = s;
  }
  return slc(o, 0, pre + shft(pos) + post);
};
var crct = /* @__PURE__ */ (function() {
  var t = new Int32Array(256);
  for (var i2 = 0; i2 < 256; ++i2) {
    var c2 = i2, k = 9;
    while (--k)
      c2 = (c2 & 1 && -306674912) ^ c2 >>> 1;
    t[i2] = c2;
  }
  return t;
})();
var crc = function() {
  var c2 = -1;
  return {
    p: function(d) {
      var cr = c2;
      for (var i2 = 0; i2 < d.length; ++i2)
        cr = crct[cr & 255 ^ d[i2]] ^ cr >>> 8;
      c2 = cr;
    },
    d: function() {
      return ~c2;
    }
  };
};
var dopt = function(dat, opt, pre, post, st2) {
  if (!st2) {
    st2 = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st2.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st2.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st2);
};
var mrg = function(a3, b) {
  var o = {};
  for (var k in a3)
    o[k] = a3[k];
  for (var k in b)
    o[k] = b[k];
  return o;
};
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
var wbytes = function(d, b, v2) {
  for (; v2; ++b)
    d[b] = v2, v2 >>>= 8;
};
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var fltn = function(d, p, t, o) {
  for (var k in d) {
    var val = d[k], n = p + k, op = o;
    if (Array.isArray(val))
      op = mrg(o, val[1]), val = val[0];
    if (ArrayBuffer.isView(val))
      t[n] = [val, op];
    else {
      t[n += "/"] = [new u8(0), op];
      fltn(val, n, t, o);
    }
  }
};
var te2 = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et2, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i2 = 0; ; ) {
    var c2 = d[i2++];
    var eb = (c2 > 127) + (c2 > 223) + (c2 > 239);
    if (i2 + eb > d.length)
      return { s: r, r: slc(d, i2 - 1) };
    if (!eb)
      r += String.fromCharCode(c2);
    else if (eb == 3) {
      c2 = ((c2 & 15) << 18 | (d[i2++] & 63) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63) - 65536, r += String.fromCharCode(55296 | c2 >> 10, 56320 | c2 & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c2 & 31) << 6 | d[i2++] & 63);
    else
      r += String.fromCharCode((c2 & 15) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63);
  }
};
function strToU8(str, latin1) {
  if (latin1) {
    var ar_1 = new u8(str.length);
    for (var i2 = 0; i2 < str.length; ++i2)
      ar_1[i2] = str.charCodeAt(i2);
    return ar_1;
  }
  if (te2)
    return te2.encode(str);
  var l = str.length;
  var ar = new u8(str.length + (str.length >> 1));
  var ai = 0;
  var w2 = function(v2) {
    ar[ai++] = v2;
  };
  for (var i2 = 0; i2 < l; ++i2) {
    if (ai + 5 > ar.length) {
      var n = new u8(ai + 8 + (l - i2 << 1));
      n.set(ar);
      ar = n;
    }
    var c2 = str.charCodeAt(i2);
    if (c2 < 128 || latin1)
      w2(c2);
    else if (c2 < 2048)
      w2(192 | c2 >> 6), w2(128 | c2 & 63);
    else if (c2 > 55295 && c2 < 57344)
      c2 = 65536 + (c2 & 1023 << 10) | str.charCodeAt(++i2) & 1023, w2(240 | c2 >> 18), w2(128 | c2 >> 12 & 63), w2(128 | c2 >> 6 & 63), w2(128 | c2 & 63);
    else
      w2(224 | c2 >> 12), w2(128 | c2 >> 6 & 63), w2(128 | c2 & 63);
  }
  return slc(ar, 0, ai);
}
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i2 = 0; i2 < dat.length; i2 += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i2, i2 + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z2) {
  var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
  var _a2 = z64hs(d, es, efl, z2, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b + 10), sc, su, fn, es + efl + b2(d, b + 32), off];
};
var z64hs = function(d, b, l, z2, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
  var nf = nsc + nsu + noff;
  if (z2 && nf) {
    for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
      if (b2(d, b) == 1) {
        return [
          nsc ? b8(d, b + 4 + 8 * nsu) : sc,
          nsu ? b8(d, b + 4) : su,
          noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z2 < 2)
      err(13);
  }
  return [sc, su, off, 0];
};
var exfl = function(ex) {
  var le2 = 0;
  if (ex) {
    for (var k in ex) {
      var l = ex[k].length;
      if (l > 65535)
        err(9);
      le2 += l + 4;
    }
  }
  return le2;
};
var wzh = function(d, b, f, fn, u, c2, ce2, co) {
  var fl2 = fn.length, ex = f.extra, col = co && co.length;
  var exl = exfl(ex);
  wbytes(d, b, ce2 != null ? 33639248 : 67324752), b += 4;
  if (ce2 != null)
    d[b++] = 20, d[b++] = f.os;
  d[b] = 20, b += 2;
  d[b++] = f.flag << 1 | (c2 < 0 && 8), d[b++] = u && 8;
  d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
  var dt2 = new Date(f.mtime == null ? Date.now() : f.mtime), y2 = dt2.getFullYear() - 1980;
  if (y2 < 0 || y2 > 119)
    err(10);
  wbytes(d, b, y2 << 25 | dt2.getMonth() + 1 << 21 | dt2.getDate() << 16 | dt2.getHours() << 11 | dt2.getMinutes() << 5 | dt2.getSeconds() >> 1), b += 4;
  if (c2 != -1) {
    wbytes(d, b, f.crc);
    wbytes(d, b + 4, c2 < 0 ? -c2 - 2 : c2);
    wbytes(d, b + 8, f.size);
  }
  wbytes(d, b + 12, fl2);
  wbytes(d, b + 14, exl), b += 16;
  if (ce2 != null) {
    wbytes(d, b, col);
    wbytes(d, b + 6, f.attrs);
    wbytes(d, b + 10, ce2), b += 14;
  }
  d.set(fn, b);
  b += fl2;
  if (exl) {
    for (var k in ex) {
      var exf = ex[k], l = exf.length;
      wbytes(d, b, +k);
      wbytes(d, b + 2, l);
      d.set(exf, b + 4), b += 4 + l;
    }
  }
  if (col)
    d.set(co, b), b += col;
  return b;
};
var wzf = function(o, b, c2, d, e) {
  wbytes(o, b, 101010256);
  wbytes(o, b + 8, c2);
  wbytes(o, b + 10, c2);
  wbytes(o, b + 12, d);
  wbytes(o, b + 16, e);
};
function zipSync(data, opts) {
  if (!opts)
    opts = {};
  var r = {};
  var files = [];
  fltn(data, "", r, opts);
  var o = 0;
  var tot = 0;
  for (var fn in r) {
    var _a2 = r[fn], file = _a2[0], p = _a2[1];
    var compression = p.level == 0 ? 0 : 8;
    var f = strToU8(fn), s = f.length;
    var com = p.comment, m2 = com && strToU8(com), ms = m2 && m2.length;
    var exl = exfl(p.extra);
    if (s > 65535)
      err(11);
    var d = compression ? deflateSync(file, p) : file, l = d.length;
    var c2 = crc();
    c2.p(file);
    files.push(mrg(p, {
      size: file.length,
      crc: c2.d(),
      c: d,
      f,
      m: m2,
      u: s != fn.length || m2 && com.length != ms,
      o,
      compression
    }));
    o += 30 + s + exl + l;
    tot += 76 + 2 * (s + exl) + (ms || 0) + l;
  }
  var out = new u8(tot + 22), oe2 = o, cdl = tot - o;
  for (var i2 = 0; i2 < files.length; ++i2) {
    var f = files[i2];
    wzh(out, f.o, f, f.f, f.u, f.c.length);
    var badd = 30 + f.f.length + exfl(f.extra);
    out.set(f.c, f.o + badd);
    wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
  }
  wzf(out, o, files.length, cdl, oe2);
  return out;
}
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  ;
  var c2 = b2(data, e + 8);
  if (!c2)
    return {};
  var o = b4(data, e + 16);
  var z2 = b4(data, e - 20) == 117853008;
  if (z2) {
    var ze = b4(data, e - 12);
    z2 = b4(data, ze) == 101075792;
    if (z2) {
      c2 = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i2 = 0; i2 < c2; ++i2) {
    var _a2 = zh(data, o, z2), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

// src/youtube.js
var players = /* @__PURE__ */ new Map();
var apiReady;
function loadYouTubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiReady) return apiReady;
  apiReady = new Promise((resolve, reject) => {
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      apiReady = null;
      script.remove();
      reject(new Error("YouTube player could not load. Reload to try again."));
    };
    document.head.append(script);
  });
  return apiReady;
}
async function mountYouTubePlayers(root2) {
  const pending = [...root2.querySelectorAll("iframe[data-youtube-src]")].filter((frame) => frame.isConnected && !players.has(frame)).map((frame) => {
    const record = { frame, player: null };
    players.set(frame, record);
    return record;
  });
  if (!pending.length) return;
  let api;
  try {
    api = await loadYouTubeAPI();
  } catch (error) {
    pending.forEach((record) => {
      if (players.get(record.frame) === record) players.delete(record.frame);
    });
    throw error;
  }
  for (const record of pending) {
    const { frame } = record;
    if (players.get(frame) !== record) continue;
    if (!frame.isConnected) {
      players.delete(frame);
      continue;
    }
    frame.src = frame.dataset.youtubeSrc;
    record.player = new api.Player(frame, {
      events: {
        onReady(event) {
          if (players.get(frame) === record && frame.isConnected) event.target.mute();
        }
      }
    });
  }
}
function unmountYouTubePlayers(root2) {
  for (const [frame, record] of players) {
    if (root2 && !root2.contains(frame)) continue;
    players.delete(frame);
    record.player?.destroy();
    frame.remove();
  }
}

// src/routes.js
function gardenPath(value) {
  const path = value.startsWith("#") ? `/${value.slice(1)}` : value;
  if (path === "/") return "/";
  if (/^\/(?:pages|editor)\/?$/.test(path) || /^\/(?:page|editor)\/[A-Za-z0-9_-]+\/?$/.test(path)) return path.replace(/\/$/, "");
  return null;
}
function cleanMarkdownLinks(markdown) {
  return markdown.replace(/\]\((#(?:pages|editor|(?:page|editor)\/[A-Za-z0-9_-]+))\)/g, (match, target) => `](${gardenPath(target)})`);
}

// src/media-editing.js
function meaningfulSibling(node, direction) {
  let sibling = node[direction];
  while (sibling && (sibling.nodeType === 8 || sibling.nodeType === 3 && !sibling.textContent.trim())) sibling = sibling[direction];
  return sibling;
}
function endsInMedia(root2) {
  let node = root2.lastChild;
  while (node) {
    if (node.nodeType === 8 || node.nodeType === 3 && !node.textContent.trim()) {
      node = node.previousSibling;
      continue;
    }
    if (node.nodeType !== 1) return false;
    if (node.hasAttribute("data-media-kind")) return true;
    node = node.lastChild;
  }
  return false;
}
function createTextLine(document2) {
  const line = document2.createElement("p");
  line.setAttribute("data-editor-line", "");
  line.appendChild(document2.createElement("br"));
  return line;
}
function isEmptyTextLine(node) {
  return node?.nodeType === 1 && !node.textContent.trim() && !node.querySelector("img,video,iframe,[data-media-kind],hr");
}
function ensureTrailingTextLine(root2) {
  if (!endsInMedia(root2)) return null;
  const line = createTextLine(root2.ownerDocument);
  root2.appendChild(line);
  return line;
}
function caretTargetBesideMedia(media, before = false) {
  const sibling = meaningfulSibling(media, before ? "previousSibling" : "nextSibling");
  if (sibling?.nodeType === 3) return sibling;
  if (sibling?.nodeType === 1 && /^(P|DIV|H[1-6]|BLOCKQUOTE|LI)$/.test(sibling.tagName) && sibling.getAttribute("contenteditable") !== "false" && !sibling.hasAttribute("data-media-kind") && !sibling.querySelector("[data-media-kind]")) return sibling;
  const line = createTextLine(media.ownerDocument);
  let anchor = media;
  for (let parent = media.parentElement; parent; parent = parent.parentElement) {
    if (parent.tagName === "P") {
      anchor = parent;
      break;
    }
  }
  anchor.parentNode.insertBefore(line, before ? anchor : anchor.nextSibling);
  return line;
}
function focusTextCaret(editor, target, atEnd = false) {
  editor.focus({ preventScroll: true });
  const range = editor.ownerDocument.createRange();
  range.selectNodeContents(target);
  range.collapse(!atEnd || isEmptyTextLine(target));
  const selection = editor.ownerDocument.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  return range;
}
function editorContentHTML(editor) {
  const copy = editor.cloneNode(true);
  copy.querySelectorAll("[data-editor-line]").forEach((line) => {
    if (isEmptyTextLine(line)) line.parentNode.removeChild(line);
    else line.removeAttribute("data-editor-line");
  });
  return copy.innerHTML;
}

// src/page-references.js
var blockTags = /^(P|DIV|H[1-6]|LI|BLOCKQUOTE|UL|OL)$/;
var boundarySelector = 'a,code,pre,[contenteditable="false"],[data-media-kind]';
function referenceAtCaret(editor, selection = editor.ownerDocument.getSelection()) {
  if (!selection?.rangeCount || !selection.isCollapsed) return null;
  const caret = selection.getRangeAt(0);
  const element = caret.startContainer.nodeType === 1 ? caret.startContainer : caret.startContainer.parentElement;
  if (!editor.contains(caret.startContainer) || element?.closest(boundarySelector)) return null;
  let block = element;
  while (block !== editor && !blockTags.test(block.tagName)) block = block.parentElement;
  let text2 = "", reachedCaret = false;
  const runs = [];
  function read(node) {
    if (reachedCaret) return;
    if (node.nodeType === 3) {
      const value = node.data.slice(0, node === caret.startContainer ? caret.startOffset : node.length);
      runs.push({ node, start: text2.length, length: value.length });
      text2 += value;
      if (node === caret.startContainer) reachedCaret = true;
      return;
    }
    if (node.nodeType !== 1) return;
    if (node !== block && node.tagName === "BR") {
      text2 += "\n";
      return;
    }
    if (node !== block && node.matches(boundarySelector)) {
      text2 += node.matches("pre,figure,[data-media-kind]") ? "\n" : "\uFFFC";
      return;
    }
    if (node !== block && blockTags.test(node.tagName)) text2 += "\n";
    const count = node === caret.startContainer ? caret.startOffset : node.childNodes.length;
    for (let i2 = 0; i2 < count && !reachedCaret; i2++) read(node.childNodes[i2]);
    if (node === caret.startContainer) reachedCaret = true;
    if (!reachedCaret && node !== block && blockTags.test(node.tagName)) text2 += "\n";
  }
  read(block);
  const match = text2.match(/(?:^|\s)!([^!\r\n\uFFFC]*)$/u);
  if (!reachedCaret || !match) return null;
  const start = text2.length - match[1].length - 1;
  const run = runs.find((run2) => start >= run2.start && start < run2.start + run2.length);
  if (!run) return null;
  const range = caret.cloneRange();
  range.setStart(run.node, start - run.start);
  return { range, query: match[1] };
}
function matchingPages(pages, query) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/u).filter(Boolean);
  return pages.filter((page) => !page.deleted && words.every((word) => page.title.toLocaleLowerCase().includes(word)));
}
function pickerPosition(caret, width, height, viewportWidth, viewportHeight) {
  const margin = 8, gap = 7;
  height = Math.min(height, 180);
  const above = Math.max(0, caret.top - gap - margin);
  const below = Math.max(0, viewportHeight - caret.bottom - gap - margin);
  const useAbove = above >= height || above >= below;
  const maxHeight = Math.min(180, useAbove ? above : below);
  const actualHeight = Math.min(height, maxHeight);
  return {
    left: Math.max(margin, Math.min(caret.left, viewportWidth - width - margin)),
    top: Math.max(margin, Math.min(useAbove ? caret.top - gap - actualHeight : caret.bottom + gap, viewportHeight - actualHeight - margin)),
    maxHeight
  };
}
function insertPageReference(editor, token, page) {
  const document2 = editor.ownerDocument;
  const selection = document2.getSelection();
  const anchor = document2.createElement("a");
  anchor.setAttribute("href", page.href);
  anchor.textContent = page.title;
  editor.focus({ preventScroll: true });
  selection.removeAllRanges();
  selection.addRange(token.range);
  if (!document2.execCommand("insertHTML", false, `${anchor.outerHTML} `)) {
    const range = token.range;
    range.deleteContents();
    range.insertNode(anchor);
    const space = document2.createTextNode(" ");
    anchor.parentNode.insertBefore(space, anchor.nextSibling);
    range.setStart(space, 1);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
function createPageReferencePicker({ editor, menu, getPages, onChange, onOpen }) {
  const document2 = editor.ownerDocument, window2 = document2.defaultView;
  let token = null, results = [], selected = 0, composing = false;
  editor.setAttribute("aria-autocomplete", "list");
  editor.setAttribute("aria-haspopup", "listbox");
  editor.setAttribute("aria-controls", menu.id);
  function close() {
    token = null;
    results = [];
    menu.hidden = true;
    editor.removeAttribute("aria-activedescendant");
  }
  function caretRect() {
    const range = document2.getSelection().getRangeAt(0).cloneRange();
    let rect = range.getClientRects()[0] || range.getBoundingClientRect();
    if (rect?.height) return rect;
    const node = range.startContainer, offset = range.startOffset;
    if (node.nodeType === 3 && node.length) {
      range.setStart(node, offset ? offset - 1 : 0);
      range.setEnd(node, offset || 1);
      rect = range.getBoundingClientRect();
      if (rect.height) return { left: offset ? rect.right : rect.left, top: rect.top, bottom: rect.bottom, height: rect.height };
    }
    const element = node.nodeType === 1 ? node : node.parentElement;
    rect = element.getBoundingClientRect();
    return { left: rect.left, top: rect.top, bottom: rect.top + 24, height: 24 };
  }
  function position() {
    if (!token) return;
    if (!document2.getSelection()?.rangeCount || document2.activeElement !== editor) {
      close();
      return;
    }
    const rect = caretRect();
    if (rect.bottom < 0 || rect.top > window2.innerHeight) {
      close();
      return;
    }
    menu.style.maxHeight = "180px";
    const placement = pickerPosition(rect, menu.offsetWidth, menu.scrollHeight, window2.innerWidth, window2.innerHeight);
    menu.style.left = `${placement.left}px`;
    menu.style.top = `${placement.top}px`;
    menu.style.maxHeight = `${placement.maxHeight}px`;
  }
  function highlight() {
    Array.from(menu.querySelectorAll('[role="option"]')).forEach((row, index) => {
      row.setAttribute("aria-selected", String(index === selected));
      if (index === selected) {
        editor.setAttribute("aria-activedescendant", row.id);
        if (row.offsetTop < menu.scrollTop) menu.scrollTop = row.offsetTop;
        else if (row.offsetTop + row.offsetHeight > menu.scrollTop + menu.clientHeight) menu.scrollTop = row.offsetTop + row.offsetHeight - menu.clientHeight;
      }
    });
    if (!results.length) editor.removeAttribute("aria-activedescendant");
  }
  function render() {
    menu.replaceChildren();
    for (const [index, page] of results.entries()) {
      const row = document2.createElement("button");
      row.type = "button";
      row.tabIndex = -1;
      row.setAttribute("role", "option");
      row.id = `${menu.id}-${index}`;
      row.dataset.index = index;
      row.innerHTML = '<svg width="14" height="16" viewBox="0 0 18 20" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M4 1h7l4 4v14H3V1h1zM11 1v5h4M6 10h6M6 13h6"/></svg>';
      const title = document2.createElement("span");
      title.textContent = page.title;
      row.append(title);
      menu.append(row);
    }
    if (!results.length) {
      const empty = document2.createElement("div");
      empty.className = "page-reference-empty";
      empty.setAttribute("role", "status");
      empty.textContent = "No matching pages";
      menu.append(empty);
    }
    menu.hidden = false;
    position();
    highlight();
  }
  function update(allowOpen = false) {
    if (composing) return;
    if (!token && !allowOpen) return;
    if (document2.activeElement !== editor) {
      close();
      return;
    }
    const next2 = referenceAtCaret(editor);
    if (!next2 || token && (next2.range.startContainer !== token.range.startContainer || next2.range.startOffset !== token.range.startOffset)) {
      close();
      return;
    }
    const opening = !token;
    const previousID = results[selected]?.id;
    token = next2;
    results = matchingPages(getPages(), next2.query);
    selected = Math.max(0, results.findIndex((page) => page.id === previousID));
    if (opening) onOpen();
    render();
  }
  function choose(index) {
    const page = results[index];
    update();
    const currentPage = page && results.find((result) => result.id === page.id);
    if (!token || !currentPage) return;
    const range = token;
    close();
    insertPageReference(editor, range, currentPage);
    onChange();
  }
  editor.addEventListener("input", (event) => {
    if (event.isComposing) return;
    update(!!event.data?.includes("!"));
  });
  editor.addEventListener("compositionstart", () => {
    composing = true;
    close();
  });
  editor.addEventListener("compositionend", (event) => {
    composing = false;
    update(!!event.data?.includes("!"));
  });
  editor.addEventListener("keydown", (event) => {
    if (!token || composing || event.isComposing || event.keyCode === 229 || event.metaKey || event.ctrlKey || event.altKey) return;
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      update();
      if (results.length) {
        selected = (selected + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
        highlight();
      }
    } else if (event.key === "Enter" && !event.shiftKey && results.length) {
      event.preventDefault();
      event.stopPropagation();
      choose(selected);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === "Tab" || event.key === "Enter") close();
  }, true);
  menu.addEventListener("mousedown", (event) => event.preventDefault());
  menu.addEventListener("click", (event) => {
    const row = event.target.closest('[role="option"]');
    if (row && menu.contains(row)) choose(Number(row.dataset.index));
  });
  document2.addEventListener("selectionchange", () => update());
  document2.addEventListener("pointerdown", (event) => {
    if (!menu.contains(event.target)) close();
  });
  document2.addEventListener("focusin", (event) => {
    if (event.target !== editor) close();
  });
  window2.addEventListener("blur", close);
  window2.addEventListener("resize", position);
  window2.addEventListener("scroll", (event) => {
    if (!menu.contains(event.target)) position();
  }, true);
  return { close };
}

// src/editor-auth.js
async function readEditorSession(request = fetch) {
  try {
    const response = await request("/auth/session", { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) return null;
    const session = await response.json();
    return session.authenticated === true && typeof session.csrf === "string" && session.csrf ? session : null;
  } catch {
    return null;
  }
}
function editorPath(path) {
  return /^\/editor(?:\/[A-Za-z0-9_-]+)?\/?$/.test(path);
}

// src/app.js
var $2 = (selector) => document.querySelector(selector);
var body = $2("#writing-body");
var titleInput = $2("#entry-title");
var entries2 = /* @__PURE__ */ new Map();
var assets = /* @__PURE__ */ new Map();
var urls = /* @__PURE__ */ new Map();
var HOME_ID = "__garden_home__";
var homeEntry;
var pageReferencePicker;
var editorAuthorized = false;
var routeRevision = 0;
var db;
var activeId;
var savedRange;
var insertMode;
var revision = 0;
var pendingWrites = 0;
var saveFailed = false;
var noticeTimer;
var deletingId = null;
var escapeHTML = (value) => String(value).replace(/[&<>"']/g, (c2) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c2]);
var slug = (value) => value.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "page";
var mdDestination = (value) => value.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
var mdLabel = (value) => String(value).replace(/[\\[\]]/g, "\\$&");
var titleFor = (entry) => entry.title.trim() || (entry.id === HOME_ID ? "Home" : "Untitled page");
var currentEntry = () => activeId === HOME_ID ? homeEntry : entries2.get(activeId);
function notice(message, error = false) {
  clearTimeout(noticeTimer);
  $2("#notice").textContent = message;
  $2("#notice").hidden = false;
  $2("#notice").dataset.error = error;
  noticeTimer = setTimeout(() => {
    $2("#notice").hidden = true;
  }, error ? 9e3 : 4500);
}
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("cybergarden-local-v1", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("entries", { keyPath: "id" });
      request.result.createObjectStore("assets", { keyPath: "path" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Close other garden tabs and reload to open local storage."));
  });
}
function allRecords(store) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(store).objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function writeRecords(store, records) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, "readwrite");
    records.forEach((record) => transaction.objectStore(store).put(record));
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error("Storage write interrupted."));
  });
}
function persist(entry) {
  const currentRevision = ++revision;
  pendingWrites++;
  return writeRecords("entries", [{ ...entry }]).then(() => {
    if (currentRevision === revision) {
      saveFailed = false;
    }
    return true;
  }).catch(() => {
    saveFailed = true;
    notice("Browser storage could not save this change. Keep this tab open and export your page.", true);
    return false;
  }).finally(() => {
    pendingWrites--;
  });
}
function safeURL(value) {
  return /^(https?:\/\/|mailto:|#)/i.test(value) || /^\.?\/?assets\//.test(value) || !!gardenPath(value);
}
function youtubeID(value) {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    let id;
    if (["youtu.be", "www.youtu.be"].includes(url.hostname)) id = url.pathname.split("/")[1];
    if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(url.hostname)) {
      id = url.pathname === "/watch" ? url.searchParams.get("v") : /^\/(embed|shorts|live)\//.test(url.pathname) ? url.pathname.split("/")[2] : null;
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(id || "") ? id : null;
  } catch {
    return null;
  }
}
function assetURL(path) {
  if (path === "./sample.svg" || path === "sample.svg") return "/sample.svg";
  if (!assets.has(path)) return null;
  if (!urls.has(path)) urls.set(path, URL.createObjectURL(assets.get(path).blob));
  return urls.get(path);
}
function mediaBlock(kind, ref, label, editing) {
  const card = document.createElement("figure");
  card.className = "media-block";
  card.dataset.mediaKind = kind;
  card.dataset.ref = ref;
  card.dataset.label = label || "";
  if (editing) {
    card.contentEditable = "false";
    card.tabIndex = 0;
    card.setAttribute("aria-label", kind === "youtube" ? "YouTube video" : `${kind === "image" ? "Image" : "Video"}${label ? `: ${label}` : ""}`);
    const remove2 = document.createElement("button");
    remove2.type = "button";
    remove2.className = "media-delete";
    const action = kind === "image" ? "Remove image" : "Remove video";
    remove2.setAttribute("aria-label", action);
    remove2.title = action;
    remove2.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>';
    card.append(remove2);
  }
  const videoId = kind === "youtube" ? youtubeID(ref) : null;
  if (videoId) {
    const player = document.createElement("iframe");
    player.dataset.youtubeSrc = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=0&origin=${encodeURIComponent(location.origin)}`;
    player.title = "YouTube video player";
    player.width = "560";
    player.height = "315";
    player.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    player.allowFullscreen = true;
    player.referrerPolicy = "strict-origin-when-cross-origin";
    card.append(player);
    return card;
  }
  const media = kind === "youtube" ? null : assetURL(ref);
  if (kind === "image" && media) {
    const img = document.createElement("img");
    img.src = media;
    img.alt = label || "Image";
    card.append(img);
  } else if (kind === "video" && media) {
    const video = document.createElement("video");
    video.src = media;
    video.controls = true;
    video.preload = "metadata";
    video.defaultMuted = true;
    video.muted = true;
    card.append(video);
  }
  if (!media) {
    const name = document.createElement("span");
    name.className = "media-title";
    name.textContent = label || (kind === "image" ? "Image reference" : "Video reference");
    const detail = document.createElement("span");
    detail.className = "media-detail";
    detail.textContent = kind === "youtube" ? "Unsupported YouTube URL." : `${ref} \xB7 Media file not available locally. Import its garden ZIP to restore it.`;
    card.append(name, detail);
  }
  return card;
}
var renderer = new m.Renderer();
renderer.html = ({ text: text2 }) => escapeHTML(text2);
renderer.image = ({ href, text: text2 }) => `<span data-image-ref="${escapeHTML(href)}" data-image-alt="${escapeHTML(text2)}"></span>`;
m.use({ renderer, breaks: true, gfm: true });
function renderMarkdown(markdown, editing = false) {
  const template = document.createElement("template");
  template.innerHTML = purify_default.sanitize(m.parse(markdown), { ADD_ATTR: ["data-image-ref", "data-image-alt"] });
  template.content.querySelectorAll("[data-image-ref]").forEach((image) => {
    const card = mediaBlock("image", image.dataset.imageRef, image.dataset.imageAlt, editing);
    if (image.parentElement?.tagName === "P" && image.parentElement.childNodes.length === 1) image.parentElement.replaceWith(card);
    else image.replaceWith(card);
  });
  template.content.querySelectorAll("a").forEach((link) => {
    let ref = link.getAttribute("href") || "";
    const internalPath = gardenPath(ref);
    if (internalPath) {
      ref = internalPath;
      link.setAttribute("href", ref);
    }
    const ownLine = link.parentElement?.tagName === "P" && link.parentElement.textContent.trim() === link.textContent.trim();
    if (ownLine && youtubeID(ref)) link.parentElement.replaceWith(mediaBlock("youtube", ref, "", editing));
    else if (ownLine && (/^Video:/i.test(link.textContent) || /\.(mp4|webm|mov|m4v|ogv)(?:[?#]|$)/i.test(ref))) link.parentElement.replaceWith(mediaBlock("video", ref, link.textContent.replace(/^Video:\s*/i, ""), editing));
    else if (!safeURL(ref)) link.removeAttribute("href");
    else if (/^https?:/i.test(ref)) link.rel = "noopener noreferrer";
  });
  template.content.querySelectorAll("p").forEach((p) => {
    if (!p.querySelector("*") && youtubeID(p.textContent.trim())) p.replaceWith(mediaBlock("youtube", p.textContent.trim(), "", editing));
  });
  if (editing) ensureTrailingTextLine(template.content);
  return template.content;
}
var turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-", codeBlockStyle: "fenced" });
turndown.addRule("gardenMedia", {
  filter: (node) => node.nodeType === 1 && node.hasAttribute("data-media-kind"),
  replacement: (_2, node) => {
    const kind = node.dataset.mediaKind, ref = mdDestination(node.dataset.ref), label = mdLabel(node.dataset.label || "");
    return `

${kind === "youtube" ? ref : kind === "image" ? `![${label}](${ref})` : `[Video: ${label || "video"}](${ref})`}

`;
  }
});
function saveEditor() {
  if (!editorAuthorized || !activeId || activeId === deletingId || $2("#editor-shell")?.hidden) return;
  ensureTrailingTextLine(body);
  const entry = currentEntry();
  entry.title = titleInput.value;
  entry.markdown = turndown.turndown(editorContentHTML(body));
  if (activeId !== HOME_ID) document.querySelector(`#editor-pages a[data-id="${activeId}"]`).textContent = titleFor(entry);
  return persist(entry);
}
function removeMedia(media) {
  const target = caretTargetBesideMedia(media);
  unmountYouTubePlayers(media);
  media.remove();
  savedRange = focusTextCaret(body, target).cloneRange();
  saveEditor();
}
function renderNavigation() {
  if (body) {
    if (activeId === HOME_ID) $2("#editor-home").setAttribute("aria-current", "page");
    else $2("#editor-home").removeAttribute("aria-current");
    $2("#import-markdown").textContent = activeId === HOME_ID ? "Import Home Markdown\u2026" : "Import Markdown\u2026";
    $2("#editor-pages").replaceChildren();
  }
  $2(".page-shelf nav").replaceChildren();
  $2(".all-pages").replaceChildren();
  for (const entry of entries2.values()) {
    const link = document.createElement("a");
    link.href = `/editor/${entry.id}`;
    link.dataset.id = entry.id;
    link.textContent = titleFor(entry);
    if (activeId === entry.id) link.setAttribute("aria-current", "page");
    $2("#editor-pages")?.append(link);
    const publicLink = document.createElement("a");
    publicLink.href = `/page/${entry.id}`;
    publicLink.dataset.page = entry.id;
    publicLink.textContent = titleFor(entry);
    if ($2(".page-shelf nav").childElementCount < 8) $2(".page-shelf nav").append(publicLink.cloneNode(true));
    const li = document.createElement("li");
    li.append(publicLink);
    $2(".all-pages").append(li);
  }
}
function updateHome() {
  $2("#home-title").textContent = titleFor(homeEntry);
  $2("#home-content").replaceChildren(renderMarkdown(homeEntry.markdown));
}
function migrateLegacyURL() {
  const path = location.hash ? gardenPath(location.hash) : null;
  if (path) {
    history.replaceState(null, "", path + location.search);
    return true;
  }
  if (location.href.endsWith("#")) {
    history.replaceState(null, "", location.pathname + location.search);
    return true;
  }
  return false;
}
async function checkEditorAccess() {
  const session = await readEditorSession();
  if (session) $2("#sign-out-csrf").value = session.csrf;
  return !!session;
}
function lockEditor() {
  editorAuthorized = false;
  if (body) {
    $2("#editor-shell").hidden = true;
    body.contentEditable = "false";
    titleInput.disabled = true;
  }
  pageReferencePicker?.close();
  unmountYouTubePlayers();
  body?.querySelectorAll("video").forEach((video) => video.pause());
  location.replace(`/auth/login?next=${encodeURIComponent(gardenPath(location.pathname) || "/editor")}`);
}
async function route(focus = false) {
  const revision2 = ++routeRevision;
  const path = gardenPath(location.pathname) || "/";
  const editing = editorPath(path);
  if (editing !== !!body) {
    location.replace(path + location.search);
    return;
  }
  if (editing) {
    editorAuthorized = false;
    $2("#editor-shell").hidden = true;
    const allowed = await checkEditorAccess();
    if (revision2 !== routeRevision) return;
    if (!allowed) {
      lockEditor();
      return;
    }
    editorAuthorized = true;
  }
  pageReferencePicker?.close();
  closeWritingMenu();
  closeBlockMenu();
  unmountYouTubePlayers();
  document.querySelectorAll('[data-media-kind="youtube"] iframe').forEach((player) => player.remove());
  body?.querySelectorAll("video").forEach((video) => video.pause());
  $2("#page-content").querySelectorAll("video").forEach((video) => video.pause());
  $2("#home-content").querySelectorAll("video").forEach((video) => video.pause());
  const id = editing ? path.slice(8) : path.startsWith("/page/") ? path.slice(6) : "";
  $2(".site").hidden = editing;
  if (body) $2("#editor-shell").hidden = !editing;
  if (editing) {
    activeId = !id || id === "home" ? HOME_ID : entries2.has(id) ? id : entries2.keys().next().value || HOME_ID;
    const entry = currentEntry();
    $2("#delete-entry").hidden = activeId === HOME_ID;
    $2("#editor-document").hidden = !entry;
    $2("#editor-empty").hidden = !!entry;
    titleInput.value = entry?.title || "";
    body.replaceChildren(entry ? renderMarkdown(entry.markdown, true) : document.createDocumentFragment());
    savedRange = null;
    setBlockFormat("p");
    $2("#preview-entry").href = activeId === HOME_ID ? "/" : entry ? `/page/${activeId}` : "/";
    document.title = entry ? `${titleFor(entry)} \u2014 Local editor` : "Local editor \u2014 Peter";
  } else {
    activeId = null;
    const entry = entries2.get(id);
    const view = entry ? "page" : path === "/pages" ? "pages" : "home";
    document.querySelectorAll(".view").forEach((section) => {
      section.hidden = section.id !== `${view}-view`;
    });
    if (entry) {
      $2("#page-title").textContent = titleFor(entry);
      $2("#page-content").replaceChildren(renderMarkdown(entry.markdown));
      const related = entries2.get(entry.related) || [...entries2.values()].find((item) => item.id !== entry.id);
      $2(".page-connections").hidden = !related;
      if (related) {
        $2("#related-page").textContent = titleFor(related);
        $2("#related-page").href = `/page/${related.id}`;
      }
    }
    document.title = `${entry ? titleFor(entry) : view === "pages" ? "All Pages" : titleFor(homeEntry)} \u2014 Peter`;
    if (view === "home") updateHome();
  }
  renderNavigation();
  mountYouTubePlayers(editing ? body : $2("#home-view").hidden ? $2("#page-content") : $2("#home-content")).catch((error) => notice(error.message, true));
  document.querySelectorAll("[data-page]").forEach((link) => {
    if (link.dataset.page === (entries2.has(id) ? id : path === "/pages" ? "pages" : "home")) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  if (focus) {
    window.scrollTo(0, 0);
    if (!editing) $2("#main").focus({ preventScroll: true });
  }
}
function rememberSelection() {
  const selection = window.getSelection();
  const inMedia = (node) => (node?.nodeType === 1 ? node : node?.parentElement)?.closest('[contenteditable="false"]');
  if (selection.rangeCount && body.contains(selection.anchorNode) && body.contains(selection.focusNode) && !inMedia(selection.anchorNode) && !inMedia(selection.focusNode)) savedRange = selection.getRangeAt(0).cloneRange();
}
function restoreSelection() {
  rememberSelection();
  body.focus();
  const range = savedRange && body.contains(savedRange.commonAncestorContainer) ? savedRange : document.createRange();
  if (range !== savedRange) {
    range.selectNodeContents(body);
    range.collapse(false);
  }
  const mediaParent = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement)?.closest("[data-media-kind]");
  if (mediaParent) {
    range.setStartAfter(mediaParent);
    range.collapse(true);
  }
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}
function setBlockFormat(value) {
  const labels = { p: "Text", h2: "Heading", h3: "Small heading" };
  $2("#block-format").dataset.value = value;
  $2("#block-format-label").textContent = labels[value];
  document.querySelectorAll("[data-block]").forEach((button) => button.setAttribute("aria-checked", String(button.dataset.block === value)));
}
function syncBlockFormat() {
  const node = window.getSelection().focusNode;
  if (!node || !body.contains(node)) return;
  const element = node.nodeType === 1 ? node : node.parentElement;
  if (element.closest("[data-media-kind]")) return;
  setBlockFormat(element.closest("h2,h3")?.tagName.toLowerCase() || "p");
}
function closeBlockMenu(returnFocus = false) {
  const menu = $2("#block-format-menu");
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  $2("#block-format").setAttribute("aria-expanded", "false");
  if (returnFocus) $2("#block-format").focus({ preventScroll: true });
}
function showBlockMenu(edge) {
  pageReferencePicker?.close();
  closeWritingMenu();
  rememberSelection();
  syncBlockFormat();
  $2("#block-format-menu").hidden = false;
  $2("#block-format").setAttribute("aria-expanded", "true");
  const choices = [...document.querySelectorAll("[data-block]")];
  const target = edge === "first" ? choices[0] : edge === "last" ? choices.at(-1) : choices.find((button) => button.getAttribute("aria-checked") === "true");
  target.focus({ preventScroll: true });
}
function closeWritingMenu(returnFocus = false) {
  const menu = $2("#writing-menu");
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  if (returnFocus) restoreSelection();
}
function showWritingMenu(event) {
  pageReferencePicker?.close();
  event.preventDefault();
  closeBlockMenu();
  const menu = $2("#writing-menu");
  let range;
  const fromKeyboard = event.clientX === 0 && event.clientY === 0;
  if (!fromKeyboard) {
    if (document.caretPositionFromPoint) {
      const caret = document.caretPositionFromPoint(event.clientX, event.clientY);
      if (caret && body.contains(caret.offsetNode)) {
        range = document.createRange();
        range.setStart(caret.offsetNode, caret.offset);
        range.collapse(true);
      }
    } else if (document.caretRangeFromPoint) {
      const caret = document.caretRangeFromPoint(event.clientX, event.clientY);
      if (caret && body.contains(caret.startContainer)) range = caret;
    }
  } else {
    rememberSelection();
    if (savedRange && body.contains(savedRange.commonAncestorContainer)) range = savedRange.cloneRange();
  }
  if (!range) {
    range = document.createRange();
    range.selectNodeContents(body);
  }
  range.collapse(false);
  const media = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement)?.closest("[data-media-kind]");
  if (media) {
    range.setStartAfter(media);
    range.collapse(true);
  }
  body.focus({ preventScroll: true });
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  savedRange = range.cloneRange();
  menu.hidden = false;
  const caretRect = range.getBoundingClientRect();
  const bodyRect = body.getBoundingClientRect();
  const hasCaretRect = caretRect.width || caretRect.height;
  const keyboardX = hasCaretRect ? caretRect.left : bodyRect.left;
  const keyboardY = hasCaretRect ? caretRect.bottom : bodyRect.top;
  const x2 = fromKeyboard ? keyboardX : event.clientX;
  const y2 = fromKeyboard ? keyboardY : event.clientY;
  menu.style.left = `${Math.max(8, Math.min(x2, window.innerWidth - menu.offsetWidth - 8))}px`;
  menu.style.top = `${Math.max(8, Math.min(y2, window.innerHeight - menu.offsetHeight - 8))}px`;
  menu.querySelector("button").focus({ preventScroll: true });
}
function insertNode(node) {
  restoreSelection();
  const selection = window.getSelection(), range = selection.getRangeAt(0);
  range.deleteContents();
  let block = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
  while (block && block.parentElement !== body) block = block.parentElement;
  if (block && /^(P|H[1-6]|DIV)$/.test(block.tagName) && !block.dataset.mediaKind) {
    const tailRange = range.cloneRange();
    tailRange.setEndAfter(block.lastChild || block);
    const tail = tailRange.extractContents();
    const after = document.createElement("p");
    after.append(tail);
    if (!after.textContent && !after.querySelector("img")) after.innerHTML = "<br>";
    block.after(node, after);
    range.setStart(after, 0);
  } else {
    range.insertNode(node);
    const after = document.createElement("p");
    after.innerHTML = "<br>";
    node.after(after);
    range.setStart(after, 0);
  }
  ensureTrailingTextLine(body);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  savedRange = range.cloneRange();
  saveEditor();
  mountYouTubePlayers(node).catch((error) => notice(error.message, true));
}
function textInsert(text2) {
  restoreSelection();
  document.execCommand("insertText", false, text2);
  saveEditor();
}
function showInsert(mode) {
  rememberSelection();
  insertMode = mode;
  const selection = window.getSelection().toString();
  $2("#insert-form").reset();
  $2("#insert-error").textContent = "";
  $2("#insert-title").textContent = mode === "youtube" ? "Add a YouTube video" : "Add a link";
  $2("#url-label").textContent = mode === "youtube" ? "YouTube URL" : "URL or garden page link";
  $2("#caption-label").hidden = $2("#insert-caption").hidden = mode === "youtube";
  $2("#insert-caption").value = selection;
  $2("#insert-help").textContent = mode === "youtube" ? "Paste a YouTube link to preview it here." : "Use https://example.com or a garden link such as /page/note.";
  $2("#insert-dialog").showModal();
  $2("#insert-url").focus();
}
async function addFiles(files, kind) {
  if (!editorAuthorized) return;
  const owner = activeId;
  rememberSelection();
  for (const file of files) {
    if (kind === "image" && !/^image\/(png|jpeg|gif|webp|avif)$/.test(file.type)) {
      notice("Choose a PNG, JPEG, GIF, WebP, or AVIF image.", true);
      continue;
    }
    if (kind === "video" && !file.type.startsWith("video/")) {
      notice("Choose a video file for a local preview.", true);
      continue;
    }
    if (file.size > 40 * 1024 * 1024) {
      notice("For this prototype, choose a file smaller than 40 MB.", true);
      continue;
    }
    const path = `assets/${crypto.randomUUID()}-${slug(file.name)}`;
    const asset = { path, name: file.name, blob: file };
    try {
      await writeRecords("assets", [asset]);
      assets.set(path, asset);
      if (activeId !== owner || $2("#editor-shell").hidden) {
        notice("The page changed before the file was inserted. Select it again in the intended page.");
        return;
      }
      insertNode(mediaBlock(kind, path, file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "), true));
    } catch {
      notice("There is not enough browser storage for this file. Try a smaller one.", true);
    }
  }
}
function download(blob, name) {
  const url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 3e4);
}
function exportedMarkdown(entry) {
  return `# ${titleFor(entry).replace(/[\r\n]/g, " ")}

${cleanMarkdownLinks(entry.markdown)}
`;
}
async function exportEntry(bundle) {
  saveEditor();
  const entry = { ...currentEntry() }, filename = `${slug(titleFor(entry))}.md`;
  if (!bundle) {
    download(new Blob([exportedMarkdown(entry)], { type: "text/markdown;charset=utf-8" }), filename);
    notice("Markdown exported. Local media paths need the matching files; use the ZIP to include them.");
    return;
  }
  try {
    const files = { [filename]: strToU8(exportedMarkdown(entry)) };
    const fragment = renderMarkdown(entry.markdown);
    const refs = [...fragment.querySelectorAll("[data-ref]")].map((node) => node.dataset.ref);
    const missing = [];
    for (const ref of new Set(refs)) {
      if (assets.has(ref)) files[ref] = new Uint8Array(await assets.get(ref).blob.arrayBuffer());
      else if (ref === "./sample.svg" || ref === "sample.svg") files["sample.svg"] = new Uint8Array(await (await fetch("/sample.svg")).arrayBuffer());
      else if (!youtubeID(ref)) missing.push(ref);
    }
    files["README.txt"] = strToU8("This local garden export contains a Markdown page and its available local media.\nImport the ZIP into the local editor to restore both. The first # heading is the title.\nImages: ![description](assets/file.png)\nVideos: [Video: description](assets/file.mp4)\nYouTube: a plain URL on its own line; no player or upload is included.\n" + (missing.length ? `
Unavailable media (references retained):
${missing.join("\n")}
` : ""));
    download(new Blob([zipSync(files, { level: 0 })], { type: "application/zip" }), `${slug(titleFor(entry))}.zip`);
    notice(missing.length ? "ZIP exported. Some references have no local file; see README.txt in the ZIP." : "Exported Markdown and local media together.");
  } catch {
    notice("Export failed. Try exporting Markdown alone.", true);
  }
}
async function createEntry(title = "", markdown = "") {
  if (!editorAuthorized) return;
  const entry = { id: crypto.randomUUID(), title, markdown, related: entries2.keys().next().value, order: Math.max(-1, ...[...entries2.values()].map((item) => item.order ?? 0)) + 1 };
  entries2.set(entry.id, entry);
  history.pushState(null, "", `/editor/${entry.id}`);
  await route(true);
  if (!editorAuthorized) return;
  titleInput.focus();
  await persist(entry);
}
async function deleteCurrentEntry() {
  if (!editorAuthorized) return;
  const id = activeId;
  if (!id || id === HOME_ID || !entries2.has(id) || deletingId) return;
  deletingId = id;
  $2("#delete-entry").disabled = true;
  pendingWrites++;
  try {
    await writeRecords("entries", [{ id, deleted: true }]);
    entries2.delete(id);
    if (activeId === id) {
      const nextId = entries2.keys().next().value;
      history.replaceState(null, "", nextId ? `/editor/${nextId}` : "/editor");
      await route(true);
    } else if ($2("#editor-shell").hidden) route();
    else renderNavigation();
  } catch {
    notice("Could not delete this page. It has been kept.", true);
  } finally {
    pendingWrites--;
    deletingId = null;
    $2("#delete-entry").disabled = false;
  }
}
async function importFile(file) {
  if (!file || !editorAuthorized) return;
  const importingHome = activeId === HOME_ID;
  if (file.size > 100 * 1024 * 1024) {
    notice("Choose a Markdown file or garden ZIP smaller than 100 MB.", true);
    return;
  }
  try {
    let markdown, filename = file.name;
    if (/\.zip$/i.test(file.name)) {
      const raw = new Uint8Array(await file.arrayBuffer());
      let expandedBytes = 0, fileCount = 0;
      const zipFiles = unzipSync(raw, { filter: (item) => {
        expandedBytes += item.originalSize;
        fileCount++;
        if (item.originalSize > 45 * 1024 * 1024 || expandedBytes > 120 * 1024 * 1024 || fileCount > 100) throw new Error("The ZIP is too large for this prototype.");
        return true;
      } });
      const names = Object.keys(zipFiles);
      if (names.length > 100 || names.reduce((sum, name) => sum + zipFiles[name].length, 0) > 120 * 1024 * 1024) throw new Error("The ZIP is too large for this prototype.");
      const mdFiles = names.filter((name) => /\.(md|markdown)$/i.test(name));
      if (mdFiles.length !== 1) throw new Error("Choose a garden ZIP containing exactly one Markdown page.");
      filename = mdFiles[0];
      markdown = strFromU8(zipFiles[filename]);
      const imported = [];
      for (const name of names) {
        if (!/^(assets\/[^/]+|sample\.svg)$/.test(name) || name.includes("..")) continue;
        const extension = name.split(".").pop().toLowerCase();
        const type = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", avif: "image/avif", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/mp4", ogv: "video/ogg" }[extension];
        if (!type) continue;
        const path = `assets/${crypto.randomUUID()}-${slug(name.split("/").pop())}`;
        imported.push({ path, name, blob: new Blob([zipFiles[name]], { type }) });
        markdown = markdown.split(`](${name})`).join(`](${path})`).split(`](./${name})`).join(`](${path})`);
      }
      if (imported.length) {
        await writeRecords("assets", imported);
        imported.forEach((asset) => assets.set(asset.path, asset));
      }
    } else {
      if (!/\.(md|markdown)$/i.test(filename)) throw new Error("Choose a .md file or a garden .zip export.");
      if (file.size > 2 * 1024 * 1024) throw new Error("Choose a Markdown file smaller than 2 MB.");
      markdown = await file.text();
    }
    markdown = markdown.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
    const firstHeading = markdown.match(/^# (.+)\n?/);
    const title = firstHeading ? firstHeading[1].trim() : filename.split("/").pop().replace(/\.(md|markdown)$/i, "").replace(/[-_]/g, " ");
    if (firstHeading) markdown = markdown.slice(firstHeading[0].length).trimStart();
    if (importingHome) {
      homeEntry = { ...homeEntry, title, markdown };
      await persist(homeEntry);
      history.pushState(null, "", "/editor/home");
      await route(true);
      notice("Home imported.");
    } else {
      await createEntry(title, markdown);
      notice("Imported as a new page. Your other pages are kept.");
    }
  } catch (error) {
    notice(error.message || "Could not import this file.", true);
  }
}
function bindEvents() {
  window.addEventListener("popstate", () => {
    migrateLegacyURL();
    route(true);
  });
  window.addEventListener("hashchange", () => {
    if (migrateLegacyURL()) route(true);
  });
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("download") || link.target && link.target !== "_self") return;
    if (link.classList.contains("skip-link")) {
      event.preventDefault();
      (body && !$2("#editor-shell").hidden ? body : $2("#main")).focus();
      return;
    }
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.hash || !gardenPath(url.pathname)) return;
    event.preventDefault();
    if (editorPath(url.pathname) !== !!body) {
      location.assign(url.pathname + url.search);
      return;
    }
    if (url.pathname !== location.pathname || url.search !== location.search || location.hash) history.pushState(null, "", url.pathname + url.search);
    route(true);
  });
  window.addEventListener("beforeunload", (event) => {
    if (pendingWrites || saveFailed) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  if (!body) return;
  document.execCommand("defaultParagraphSeparator", false, "p");
  pageReferencePicker = createPageReferencePicker({
    editor: body,
    menu: $2("#page-reference-menu"),
    getPages: () => [
      { id: HOME_ID, title: titleFor(homeEntry), href: "/" },
      ...[...entries2.values()].filter((entry) => !entry.deleted).map((entry) => ({ id: entry.id, title: titleFor(entry), href: `/page/${entry.id}` }))
    ],
    onOpen: () => {
      closeWritingMenu();
      closeBlockMenu();
    },
    onChange: () => {
      rememberSelection();
      saveEditor();
    }
  });
  let checkingSession = false;
  const recheckSession = async () => {
    if (checkingSession || !editorAuthorized || document.hidden) return;
    checkingSession = true;
    try {
      if (!await checkEditorAccess()) lockEditor();
    } finally {
      checkingSession = false;
    }
  };
  window.addEventListener("focus", recheckSession);
  document.addEventListener("visibilitychange", recheckSession);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      $2("#editor-shell").inert = false;
      route();
    }
  });
  window.setInterval(recheckSession, 6e4);
  let signingOut = false;
  $2("#sign-out").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (signingOut) return;
    signingOut = true;
    const saved = await saveEditor();
    if (saved === false) {
      signingOut = false;
      return;
    }
    editorAuthorized = false;
    $2("#editor-shell").inert = true;
    $2("#sign-out").submit();
  });
  document.addEventListener("selectionchange", () => {
    rememberSelection();
    if ($2("#block-format-menu").hidden) syncBlockFormat();
  });
  const blockPicker = $2("#block-format-picker");
  const blockMenu = $2("#block-format-menu");
  blockPicker.addEventListener("mousedown", (event) => event.preventDefault());
  $2("#block-format").addEventListener("click", () => {
    if (blockMenu.hidden) showBlockMenu();
    else closeBlockMenu(true);
  });
  $2("#block-format").addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      showBlockMenu(event.key === "ArrowDown" ? "first" : "last");
    }
  });
  blockMenu.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-block]");
    if (!choice) return;
    closeBlockMenu();
    restoreSelection();
    document.execCommand("formatBlock", false, choice.dataset.block);
    rememberSelection();
    setBlockFormat(choice.dataset.block);
    saveEditor();
  });
  blockMenu.addEventListener("keydown", (event) => {
    const choices = [...blockMenu.querySelectorAll("button")];
    const index = choices.indexOf(document.activeElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next2 = event.key === "Home" ? 0 : event.key === "End" ? choices.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + choices.length) % choices.length;
      choices[next2].focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeBlockMenu(true);
    } else if (event.key === "Tab") closeBlockMenu(true);
  });
  document.addEventListener("pointerdown", (event) => {
    if (!blockPicker.contains(event.target)) closeBlockMenu();
  });
  document.addEventListener("focusin", (event) => {
    if (!blockPicker.contains(event.target)) closeBlockMenu();
  });
  window.addEventListener("resize", () => closeBlockMenu());
  window.addEventListener("blur", () => closeBlockMenu());
  body.addEventListener("contextmenu", showWritingMenu);
  const writingMenu = $2("#writing-menu");
  writingMenu.addEventListener("mousedown", (event) => event.preventDefault());
  writingMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-insert]");
    if (!button) return;
    closeWritingMenu(true);
    const kind = button.dataset.insert;
    if (kind === "youtube") showInsert("youtube");
    else if (kind === "image" || kind === "video") {
      rememberSelection();
      $2(`#${kind}-file`).click();
    }
  });
  writingMenu.addEventListener("keydown", (event) => {
    const buttons = [...writingMenu.querySelectorAll("button")];
    const index = buttons.indexOf(document.activeElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next2 = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next2].focus();
    } else if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      closeWritingMenu(true);
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (!writingMenu.contains(event.target)) closeWritingMenu();
  });
  document.addEventListener("focusin", (event) => {
    if (!writingMenu.contains(event.target)) closeWritingMenu();
  });
  window.addEventListener("scroll", () => closeWritingMenu(), true);
  window.addEventListener("resize", () => closeWritingMenu());
  window.addEventListener("blur", () => closeWritingMenu());
  body.addEventListener("input", saveEditor);
  body.addEventListener("click", (event) => {
    const remove2 = event.target.closest(".media-delete");
    if (remove2) {
      event.preventDefault();
      removeMedia(remove2.closest("[data-media-kind]"));
      return;
    }
    const media = event.target.closest("[data-media-kind]");
    if (media && !event.target.closest("video, iframe, a, button")) media.focus({ preventScroll: true });
    if (event.target === body) {
      ensureTrailingTextLine(body);
      const last = body.lastElementChild;
      if (last) {
        const previous = last.previousElementSibling;
        const bottom = isEmptyTextLine(last) && previous?.hasAttribute("data-media-kind") ? previous.getBoundingClientRect().bottom : last.getBoundingClientRect().bottom;
        if (event.clientY >= bottom) savedRange = focusTextCaret(body, last.hasAttribute("data-media-kind") ? body : last, true).cloneRange();
      }
    }
    if (event.target.closest("a")) event.preventDefault();
  });
  body.addEventListener("keydown", (event) => {
    if (event.target.matches("[data-media-kind]") && !event.isComposing && !event.metaKey && !event.ctrlKey && !event.altKey && ["Enter", "ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      const before = event.key === "ArrowUp";
      savedRange = focusTextCaret(body, caretTargetBesideMedia(event.target, before), before).cloneRange();
      ensureTrailingTextLine(body);
      syncBlockFormat();
      return;
    }
    if (event.target.matches("[data-media-kind]") && ["Backspace", "Delete"].includes(event.key)) {
      event.preventDefault();
      removeMedia(event.target);
    }
  });
  body.addEventListener("paste", (event) => {
    event.preventDefault();
    rememberSelection();
    const files = [...event.clipboardData?.files || []].filter((file) => file.type.startsWith("image/"));
    if (files.length) {
      addFiles(files, "image");
      return;
    }
    const text2 = event.clipboardData?.getData("text/plain") || "";
    if (youtubeID(text2.trim())) insertNode(mediaBlock("youtube", text2.trim(), "", true));
    else textInsert(text2);
  });
  body.addEventListener("dragover", (event) => event.preventDefault());
  body.addEventListener("drop", (event) => {
    event.preventDefault();
    notice("Use Add image, paste an image, or Upload video to insert local media.");
  });
  titleInput.addEventListener("input", saveEditor);
  document.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => {
      restoreSelection();
      document.execCommand(button.dataset.command);
      saveEditor();
    });
  });
  $2("#cancel-insert").addEventListener("click", () => $2("#insert-dialog").close());
  $2("#insert-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const url = $2("#insert-url").value.trim();
    if (insertMode === "youtube" ? !youtubeID(url) : !safeURL(url)) {
      $2("#insert-error").textContent = insertMode === "youtube" ? "Enter a YouTube watch, short, or youtu.be URL." : "Use an https://, http://, mailto:, or /page/ URL.";
      return;
    }
    $2("#insert-dialog").close();
    if (insertMode === "youtube") insertNode(mediaBlock("youtube", url, "", true));
    else {
      restoreSelection();
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.textContent = $2("#insert-caption").value.trim() || url;
      const selection = window.getSelection(), range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(anchor);
      range.setStartAfter(anchor);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      savedRange = range.cloneRange();
      saveEditor();
    }
  });
  for (const kind of ["image", "video"]) {
    $2(`#${kind}-file`).addEventListener("change", (event) => {
      addFiles([...event.target.files], kind);
      event.target.value = "";
    });
  }
  $2("#new-entry").addEventListener("click", () => createEntry());
  $2("#delete-entry").addEventListener("click", deleteCurrentEntry);
  $2("#import-markdown").addEventListener("click", () => $2("#markdown-file").click());
  $2("#markdown-file").addEventListener("change", (event) => {
    importFile(event.target.files[0]);
    event.target.value = "";
  });
  $2("#export-markdown").addEventListener("click", () => exportEntry(false));
  $2("#export-bundle").addEventListener("click", () => exportEntry(true));
}
async function boot() {
  try {
    db = await openDB();
    const [storedEntries, storedAssets] = await Promise.all([allRecords("entries"), allRecords("assets")]);
    storedAssets.forEach((asset) => assets.set(asset.path, asset));
    let initial = storedEntries;
    if (!initial.length) {
      const response = await fetch("/content/entries.json");
      if (!response.ok) throw new Error("Could not load the sample pages.");
      initial = (await response.json()).map((entry, order) => ({ ...entry, order }));
      await writeRecords("entries", initial);
    }
    homeEntry = initial.find((entry) => entry.id === HOME_ID && !entry.deleted);
    if (!homeEntry) {
      const response = await fetch("/content/home.json");
      if (!response.ok) throw new Error("Could not load Home.");
      homeEntry = { ...await response.json(), id: HOME_ID };
      await writeRecords("entries", [homeEntry]);
    }
    const originalOrder = ["untitled", "note", "link", "image", "unfinished"];
    initial.forEach((entry) => {
      entry.order ??= originalOrder.includes(entry.id) ? originalOrder.indexOf(entry.id) : 5;
    });
    initial.filter((entry) => entry.id !== HOME_ID && !entry.deleted).sort((a3, b) => a3.order - b.order).forEach((entry) => entries2.set(entry.id, entry));
    bindEvents();
    migrateLegacyURL();
    await route();
  } catch (error) {
    notice(`The local editor could not start. ${error.message || "Browser storage is unavailable."} Try a regular browser window with storage enabled.`, true);
    console.error(error);
  }
}
boot();
/*! Bundled license information:

dompurify/dist/purify.es.mjs:
  (*! @license DOMPurify 3.4.17 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.17/LICENSE *)
  (*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE *)
*/
