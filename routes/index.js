/**
 * Memo with Text Search アプリのルーティング
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var context = require('../utils/context');
var memo = require('../models/memo');

// package.json を読込む。(version、description の値をメモ一覧で使用するため)
var packageJson = require('../package.json');

/** メモ一覧を表示する。 */
var renderIndex = function(q, res, body) {
	res.render('index', {
		"packageJson" : packageJson,
		"q" : q,
		"list" : body.rows
	});
};

/** メモ一覧を表示する。 */
exports.list = function(req, res) {
	var q = req.query.q;
    var promise;
	if (typeof q === 'undefined' || q === '') {
        promise = memo.list();
	} else {
        promise = memo.search(q);
	}
    promise.then(function(body){
		renderIndex(q, res, body);
    });
};

/** メモ一覧を表示する。(検索キーワード継続) */
var redirectHome = function(req, res) {
	res.redirect('/?q=' + encodeURIComponent(req.body.q));
};

/** メモを保存して、メモ一覧を表示する。(検索キーワード継続)。 */
var saveMemo = function(memo, doc, req, res) {
	memo.save(doc, function() {
		redirectHome(req, res);
	});
};

/** メモをDBに新規作成して、メモ一覧を表示する。 */
exports.create = function(req, res) {
	var doc = {
		"content" : req.body.content,
		"updatedAt" : req.body.updatedAt
	};
	saveMemo(memo, doc, req, res);
};

/** メモをDBに更新して、メモ一覧を表示する。 */
exports.update = function(req, res) {
	var doc = {
		"_id" : req.params._id,
		"_rev" : req.params._rev,
		"content" : req.body.content,
		"updatedAt" : req.body.updatedAt
	};
	saveMemo(memo, doc, req, res);
};

/** メモをDBから削除して、現在のページのメモ一覧を表示する。 */
exports.remove = function(req, res) {
	memo.remove(req.params._id, req.params._rev, function() {
		redirectHome(req, res);
	});
};
