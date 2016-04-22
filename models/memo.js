/**
 * Memo with Text Search アプリのモデル
 *
 * @module models/memo
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var context = require('../utils/context');

// データベース「memo」を使用する。
var cloudant = context.cloudant;
var db = cloudant.db.use(context.MEMO_DB_NAME);

// ビューパラメータ
var VIEW_PARAM = {
	descending : true
};

/** 降順で比較する。 */
var compareDescending = function(a, b) {
	if (a > b)
		return -1;
	if (a < b)
		return 1;
	return 0;
};

/**
 * コールバックを受け取る非同期なAPIをPromiseを返却するAPIに変換する。
 */
var promisify = function(instance, func) {
    return function promisified() {
        // promisified() に渡る引数を配列に変換する
        var args = [].slice.call(arguments);
        return new Promise(function(resolve, reject) {
            args.push(function(err, result) {
                if (err) {
                    return reject(err);
                }
                // このarguments には、err と result(単体のオブジェクト、または配列)が入っている
                if (arguments.length <= 2) {
                    resolve(result);
                } else {
                    // arguments の index の1以降を配列として resolve の引数に渡す
                    resolve([].slice.call(arguments, 1));
                }
            });
            // 上で詰めたコールバック関数も含めて、引数にAPIを適用する
            func.apply(instance, args);
        });
    };
};

/**
 * メモの検索する。(Promise版)
 *
 * @see db.search 関数
 *      {@link https://github.com/apache/couchdb-nano#dbsearchdesignname-searchname-params-callback}
 */
exports.search = function(q) {
    var viewForPromise = promisify(db, db.view);
    var searchForPromise = promisify(db, db.search);

    return searchForPromise('memos', 'searchText', {
        q: q
    }).then(function(body){
	    var keys = [];
       	body.rows.forEach(function(row) {
	    	keys.push(row['fields']['default'][0]);
       	});
       	keys.sort(compareDescending);
        return viewForPromise('memos', 'list', {
            keys: keys
        });
    });
};

/**
 * メモの一覧を取得する。(Promise版)
 *
 * @see db.view 関数
 *      {@link https://github.com/apache/couchdb-nano#dbviewdesignname-viewname-params-callback}
 */
exports.list = function(callback) {
    var viewForPromise = promisify(db, db.view);
    return viewForPromise('memo', 'list', VIEW_PARAM);
};

/**
 * メモを保存する。
 *
 * @see db.insert 関数
 *      {@link https://github.com/apache/couchdb-nano#dbinsertdoc-params-callback}
 */
exports.save = function(doc, callback) {
	db.insert(doc, callback);
};

/**
 * メモを削除する。
 *
 * @see db.destroy 関数
 *      {@link https://github.com/apache/couchdb-nano#dbdestroydocname-rev-callback}
 */
exports.remove = function(_id, _rev, callback) {
	db.destroy(_id, _rev, callback);
};
