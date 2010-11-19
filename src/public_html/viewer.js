function $(id) {
	return document.getElementById(id);
}

// Controller
$('query').addEventListener('input', input, false);
$('query').addEventListener('keyup', input, false);
$('query').addEventListener('keypress', input, false);
$('query').addEventListener('focus', input, false);
$('fulltext').addEventListener('click', fullsearch, false);
window.addEventListener('scroll', scroll, true);
window.addEventListener('mouseup', select, true);
window.addEventListener('mousemove', select, true);

var searchDelay = Debounce(80); // hold 80 ms before searching (when typed in)

var fullsearch_id_offset; // when the last search was full text search, remember the offset

var query_string; // serialized query option (will become URL fragment under certain conditions)

function newsearch(opt) {
	var undef;
	if (opt.query === undef) return;

	opt.query = opt.query.replace(/^▽|▼/g, ''); // for SKK
	if (!opt.page) opt.page = 1;
	opt.full = !!opt.full;
	if (opt.full && opt.page > 1) opt.id_offset = fullsearch_id_offset || 0;

	query_string = serializeToQuery(opt);

	setHashDelay.cancel();

	searchDelay(function() {
		searchRequest(opt, searchFinished);
		$('loading').className = ''; // show loading icon
	});
}

var setHashDelay = DelayHashChange(hashchange, 3000);

function hashchange() {
	var hash = location.hash.replace(/^#/, '');console.log(hash);
	if (hash === query_string) return;
	var opt = parseQuery(hash);
	opt.page = 1;
	if ($('query').value !== opt.query && opt.query) $('query').value = opt.query;
	newsearch(opt);
}

function searchFinished(res) {
	//console.log(res);
	if (res.query !== parseQuery(query_string).query) return;
	if (res.id_offset) fullsearch_id_offset = res.id_offset;

	setHashDelay(query_string, function() {
		showResults(res);
	});
}

var last_query; // only used in input() function
function input() {
	var q = $('query').value;
	if (q === last_query) return;
	last_query = q;
	newsearch({query: q});
}

function fullsearch() {
	$('res-list').innerHTML = '';
	newsearch({query: $('query').value, full: true});
}

function more() {
	var opt = parseQuery(query_string);
	++opt.page;
	newsearch(opt);
}

function scroll(e) {
	var m = $('loading');
	if (m.className !== 'hidden') {
		if (m.getBoundingClientRect().top < window.innerHeight) {
		 	 more();
		}
	}
}

function select(e) {
	if (document.activeElement === $('query')) return;
	var sel = (document.getSelection() + '').replace(/^\s+|\s+$/g, '');
	if (sel) {
		$('query').value = sel;
	} else {
		var opt = parseQuery(query_string);
		if ($('query').value !== opt.query) $('query').value = opt.query;
	}
}


// View
function showResults(res) {
	var dl = $('res-list');
	var m = $('loading');
	if (res.page === 1) {
		dl.innerHTML = '';
	}

	var html = res.results.map(function(line) {
		return parseLine(line);
	}).join('\n');
	var range = document.createRange();
	range.selectNodeContents(dl);
	var df = range.createContextualFragment(html);
	dl.appendChild(df);

	if (res.more) {
		m.className = '';
		m.title = 'page ' + (res.page + 1);
		scroll();
	} else {
		m.className = 'hidden';
	}
}

var re_line = /■(.*?)(?:  ?{(.*?)})? : (.*)/;
var re_sep = /■・|●/;
function parseLine(line) {
	var m = re_line.exec(line);
	if (!m) return htmlEscape(line);
	var word = m[1];
	var kind = m[2];
	var trans = m[3].split(re_sep);
	return '<dt class="entry-box">' +
			'<span class="entry">' + makeImplicitSearchLinks(htmlEscape(word)) + "</span>" +
			(!kind ? '' : '<span class="kind"><span class="bracket">{</span>' + htmlEscape(kind) + '<span class="bracket">}</span></span>') + 
			' <span class="separator">:</span> ' +
		'</dt>' +
		trans.map(function(t) {
				return '<dd class="translation">' + parseTranslation(t) + '</dd>';
			}).join('');
}

var re_kanji = '(?:[々〇〻\u3400-\u9FFF\uF900-\uFAFF]|[\uD840-\uD87F][\uDC00-\uDFFF])+'; // http://tama-san.com/?p=196
var re_trivial = /【(?:レベル|発音！?|＠|大学入試|分節|変化)】/;
var re_henka = /【変化】[^【]+/;
var re_hatsuon = /(【発音！?】)([^【]+)/;
var re_hatsuon_sep = / *(、|《.*?》)+ */;
var re_redirect = /<→(.*?)>/;
var re_file = /◆file:\S+$/;
var re_ruby = /(.*?)｛(.*?)｝/g;
var re_okuri = /(.*?)([ぁ-ん]+)$/;
var re_additional = /(（.*?）)/;
var re_synonym = /(【(?:[反対名類動同略]|参考|語源|標準英語)】)([-a-zA-Z'.? ;]+)/g;
var re_semicolon = / *; */;
var re_url = /【URL】([^ ]+(?: ; (?:[^ ]+))*)/g;
function parseTranslation(text) {
	if (re_trivial.test(text)) {
		return htmlEscape(text)
			.replace(re_henka, makeImplicitSearchLinks)
			.replace(re_hatsuon, function(m0, m1, m2) {
				return m1 + m2.split(re_hatsuon_sep).map(function(l, i) {
						if (i % 2 !== 0) return l;
						return convertPhonetic(l);
					}).join('');
			});
	}
	if (re_redirect.test(text)) {
		return text.replace(re_redirect, function(_, word) {
				return '&lt;→<a title="'+htmlEscape(word)+'" href="#" class="explicit searchlink">'+htmlEscape(word)+'</a>&gt;'
			});
	}
	if (text.indexOf('＝') === 0) {
		return '＝' + text.slice(1).split(re_semicolon).map(function(l) {
				return '<a href="#" title="' + htmlEscape(l) + '" class="explicit searchlink">' + htmlEscape(l) + '</a>';
			}).join(' ; ');
	}

	text = text.replace(re_file,'');
	// else
	var html = htmlEscape(text)
		.replace(re_ruby, function($0, head, ruby) {
			var m, okuri = '', kanji;
			if (m = head.match(re_okuri)) {
				// 心得る｛こころえる｝ -> <ruby>心得<rp>｛</rp><rt>こころえ</rt><rp>｝</rp></ruby>る
				okuri = m[2]; // === 'る'
				var l = ruby.length - okuri.length; // === 'こころえ'.length === 4
				if (ruby.lastIndexOf(okuri) === l) {
					head = m[1]; // '心得'
					ruby = ruby.slice(0, l); // 'こころえる'.slice(0, 4)
				} else {
					// maybe this case does not exist
					console.log(text);
					return head + '<span class="ruby">｛' + ruby + '｝</span>';
				}
			}
			// "density" => 密集（度）｛みっしゅう（ど）｝
			var re = RegExp('(.*?)(' + 
				ruby.split(re_additional).map(function(m){
					return !m.length ? '' : (m.charAt(0) === '（' ? '（' + re_kanji + '）' : re_kanji);
				}).join('') + ')$'
			);
			if (m = head.match(re)) {
				head = m[1];
				kanji = m[2];
				return head + '<ruby>' + kanji + '<rp>｛</rp><rt>' + ruby + '</rt><rp>｝</rp></ruby>' + okuri;
			} else {
				// maybe this case does not exist
				console.log(text);
				return head + kanji + '<span class="ruby">｛' + ruby + '｝</span>' + okuri;
			}
		})
		.replace(re_synonym, function($0, $1, $2) {
			return $1 + $2.split(re_semicolon).map(function(l) {
				return '<a title="' + l + '" href="#" class="explicit searchlink">' + l + '</a>';
			}).join(' ; ');
		})
		.replace(re_url, function($0, $1) {
			return '【URL】' + $1.split(re_semicolon).map(function(l) {
					return '<a href="' + l + '">' + l + '</a>';
				}).join(' ; ');
		});
	return makeImplicitSearchLinks(html);

}

var phonetic = {'t∫':'ʧ', 'dз':'ʤ', 'ae':'æ', '∫':'ʃ', 'η':'ŋ', 'з':'ʒ', 'δ':'ð', '\'':'\u0301', '`':'\u0300', 'α':'ɑ', 'э':'ə', 'Λ':'ʌ', 'ｏ':'ɔ', ':':'ː', '(':'<i>', ')':'</i>'};
var re_phonetic = /(t∫|dз|ae|[∫ηзδ'`αэΛｏ:()])/g;
function convertPhonetic(text) {
	if (!text) return '';
	return '<span class="phonetic">' + text.replace(re_phonetic, function(m) {return phonetic[m];}) + '</span>';
}

function makeImplicitSearchLinks(html) {
	return html.split(/(<a.*?<\/a>|<.*?>|&(?:quot|lt|gt|amp);)/).map(function(m, i) {
			return (i % 2 === 0) ? m.replace(/[a-zA-Z][-a-zA-Z']*/g, '<a title="$&" href="#" class="implicit searchlink">$&</a>') : m;
		}).join('');
}


// clicking a word to do next search
document.addEventListener('click', openSearchLink, true);

function openSearchLink(e) {
	if (e.target.className.indexOf('searchlink') >= 0 && e.target.title) {
		e.preventDefault();
		e.stopPropagation();
		var query = e.target.title;
		if ($('query').value !== query && query) $('query').value = query;
		newsearch({query: query});
	}
}

var htmlEscapePattern = {
	'>': '&gt;',
	'<': '&lt;',
	'&': '&amp;',
	'"': '&quot;',
	"'": '&apos;'
};

function htmlEscape(text) {
	//return (text+'').replace(/[&'"><]/g, function(m){return htmlEscapePattern[m];});
		// omit the apostrophe because I have to deal with apostrophes by regexp
	return (text+'').replace(/[&"><]/g, function(m){return htmlEscapePattern[m];});
}



// Initialize
// switch views
$('switch').addEventListener('click', sw, false);

function sw() {
	if ($('config').className.indexOf('hidden') >= 0) {
		$('config').className = $('config').className.replace('hidden', '');
		$('main').className += 'hidden';
	} else {
		$('main').className = $('main').className.replace('hidden', '');
		$('config').className += 'hidden';
	}
}

// whether to show ruby or not
(function() {
	var n = $('noruby');
	if (localStorage['noruby']) {
		n.checked = true;
		$('results').className += ' noruby';
	}
	n.addEventListener('change', function(e) {
		if (n.checked) {
			localStorage['noruby'] = true;
			$('results').className += ' noruby';
		} else {
			localStorage.removeItem('noruby');
			$('results').className = $('results').className.replace(' noruby', '');
		}
	}, false);
}());

// whether to use normal size font or not
(function() {
	var n = $('largefont');
	if (localStorage['largefont']) {
		n.checked = true;
		$('results').className += ' largefont';
	}
	n.addEventListener('change', function(e) {
		if (n.checked) {
			localStorage['largefont'] = true;
			$('results').className += ' largefont';
		} else {
			localStorage.removeItem('largefont');
			$('results').className = $('results').className.replace(' largefont', '');
		}
	}, false);
}());

// if hash is set already, do search
(function init() {
	// autofocus on Chrome is very weird, so implement by myself
	$('query').focus();

	console.log(location.hash);
	var opt = parseQuery(location.hash.replace(/^#/, ''));
	if ($('query').value !== opt.query && opt.query) $('query').value = opt.query;
	newsearch(opt);
}());


// Utility
function parseQuery(query) {
	if (!query) return {};
	var ret = {};
	query.split('&').forEach(function(kv) {
		kv = kv.split('=');
		ret[kv[0]] = decodeURI(kv[1]);
	});
	return ret;
}

function serializeToQuery(obj) {
	var ret = [], undef;
	for (var x in obj) if (obj.hasOwnProperty && obj[x] !== undef && obj[x] !== false && obj[x] !== null) {
		ret.push(x + '=' + encodeURIComponent(obj[x]));
	}
	return ret.join('&');
}


// handle hashchange as it is, but when doing frequent action, delay hashchange
function DelayHashChange (hashchange, wait) {
	var currentId = null;
	if (!wait) wait = 5000;
	var timer;
	var reallySetHash;
	function doAction(id, action) {
		timer = clearTimeout(timer); // clearTimeout returns undefined
		currentId = id;
		action();
		timer = setTimeout(setHash, wait);
		reallySetHash = true;
	}
	doAction.cancel = function() {timer = clearTimeout(timer)};
	function _hashchange(e) {
		if (timer) reallySetHash = false;
		hashchange(e);
	}
	window.addEventListener('hashchange', _hashchange, false);
	function setHash() {
		window.removeEventListener('hashchange', _hashchange, false);
		if (reallySetHash) location.hash = currentId;
		window.addEventListener('hashchange', _hashchange, false);
	}
	return doAction;
};

// debouncing
function Debounce(wait) {
	var timer;
	function doAction(action) {
		clearTimeout(timer);
		timer = setTimeout(action, wait);
	}
	return doAction;
}
