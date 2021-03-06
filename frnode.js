var http = require('http');
var fs = require('fs');
var url = require('url');
if (!url) {
	console.log("require('url') invalid");
	return;
}
var querystring = require('querystring');
var randomstring = require('randomstring');
var atob = function(b64Encoded) { return new Buffer(b64Encoded,'base64').toString(); };
var fsoption = {
	encoding: 'utf8',
	autoClose: true
}
/**
 * [hellohtml description]
 * @type {[type]}
 */
var hellohtml = fs.readFileSync('frhello.html', 'utf8');
var selecthtml = fs.readFileSync('select.html', 'utf8');
//var faviconico = fs.readFileSync('favicon.ico');
var dbconfigs = JSON.parse(fs.readFileSync('dbconfig.json', 'utf8'));
console.log("dbconfigs:", dbconfigs);
var dbhostlist = {};
var dbcandlist = new Array(dbconfigs.dblist.length);
var dbcandhost = new Array(dbconfigs.dblist.length);
var dbcandscheme = new Array(dbconfigs.dblist.length);
var dbcandliststr = '(';
var dbcandhoststr = '(';
var dbcandschemestr = '(';
for (x in dbconfigs.dblist) {
	//console.log("x:", x, "\tdbtype:", dbconfigs.dblist[x].dbtype, "\tdbconfig:", dbconfigs.dblist[x].dbconfig);
	dbcandlist[x] = dbconfigs.dblist[x].dbtype;
	dbcandliststr = dbcandliststr + '\'' + dbconfigs.dblist[x].dbtype + '\'';
	dbcandhoststr = dbcandhoststr + '\'' + dbconfigs.dblist[x].dbconfig.host + '\'';
	dbcandschemestr = dbcandschemestr + '\'' + dbconfigs.dblist[x].dbconfig.table + '\'';
	dbhostlist[dbconfigs.dblist[x].dbtype] = dbconfigs.dblist[x].dbconfig;
}
console.log(dbhostlist);
dbcandliststr = dbcandliststr.replace(/\'\'/g, '\'\,\'') + ')';
dbcandhoststr = dbcandhoststr.replace(/\'\'/g, '\'\,\'') + ')';
dbcandschemestr = dbcandschemestr.replace(/\'\'/g, '\'\,\'') + ')';
selecthtml = selecthtml.replace(/\{DBTYPELIST\}/g, dbcandliststr);
selecthtml = selecthtml.replace(/\{DBHOSTLIST\}/g, dbcandhoststr);
selecthtml = selecthtml.replace(/\{DBSCHEMELIST\}/g, dbcandschemestr);
//console.log("dbcandlist:",dbcandlist);
//console.log("dbhostlist['fr_01']:",dbhostlist.get('fr_01'));
var dbconnlist = {};
/*
var dbcandlist = new Array('fr_01', 'fr_beta', 'fr_cehua', 'tg_beta', 'tg_dev');
dbhostlist.set(dbcandlist[0], {
	host: 'palmjoifr01.mysql.rds.aliyuncs.com',
	user: 'dev',
	password: 'Dev_123',
	charset: 'UTF8'
});
dbhostlist.set(dbcandlist[1], {
	host: 'palmjoifrbeta.mysql.rds.aliyuncs.com',
	user: 'dev',
	password: 'Dev_123',
	charset: 'UTF8'
});
dbhostlist.set(dbcandlist[2], {
	host: '10.10.0.100',
	user: 'cehua',
	password: 'cehua123',
	charset: 'UTF8'
});
dbhostlist.set(dbcandlist[3], {
	host: 'palmjoifrbeta.mysql.rds.aliyuncs.com',
	user: 'dev',
	password: 'Dev_123',
	charset: 'UTF8'
});
dbhostlist.set(dbcandlist[4], {
	host: 'palmjoidev.mysql.rds.aliyuncs.com',
	user: 'dev',
	password: 'Dev_123',
	charset: 'UTF8'
});
*/

var mysql = require('mysql');
/*
var tgconnection = null;
var frconnection = null;
var tgdbconninfo = {
	host: 'palmjoidev.mysql.rds.aliyuncs.com',
	user: 'dev',
	password: 'Dev_123',
	charset: 'UTF8'
};
var frdbconninfo = {
	host: 'palmjoifr01.mysql.rds.aliyuncs.com',
	user: 'dev',
	password: 'Dev_123',
	// host: '10.10.0.100',
	// user: 'cehua',
	// password: 'cehua123',
	charset: 'UTF8'
};
*/

process.on('uncaughtException', function(err) {
	console.error('Error caught in uncaughtException event:', err);
});

http.createServer(function(req, res) {
	//console.log('req: ', req.headers);
	var respbodytmp = '';
	if (req.method === 'GET') {
		console.log('req.url: ', req.url);
		var pathname = url.parse(req.url).pathname;
		switch (pathname) {
			case '/quit':
				closeDB(url.parse(req.url, true).query.dbtype);
				res.writeHead(200, {
					'Content-Type': 'text/plain; charset=UTF-8'
				});
				res.end("Quited");
				break;
			case '/xlsx/dist/jszip.js':
				res.writeHead(200, {
					'Content-Type': 'text/javascript; charset=UTF-8'
				});
				res.end(fs.readFileSync('xlsx/dist/jszip.js', 'utf8'));
				break;
			case '/xlsx/dist/xlsx.js':
				res.writeHead(200, {
					'Content-Type': 'text/javascript; charset=UTF-8'
				});
				console.log("xlsx/dist/xlsx.js:",fs.realpathSync('xlsx/dist/xlsx.js'));
				res.end(fs.readFileSync('xlsx/dist/xlsx.js', 'utf8'));
				break;
			case '/filesaver/FileSaver.js':
				res.writeHead(200, {
					'Content-Type': 'text/javascript; charset=UTF-8'
				});
				res.end(fs.readFileSync('filesaver/FileSaver.js', 'utf8'));
				break;
			/*case '/plp_dev':
				res.writeHead(200, {
					'Content-Type': 'text/html; charset=UTF-8'
				});
				respbodytmp = parseHTML(hellohtml, /\{DBNAME\}/g, 'plp_game');
				res.end(parseHTML(respbodytmp, /\{DBTYPE\}/g, 'plp_dev'));
				break;
			case '/fr_beta':
				res.writeHead(200, {
					'Content-Type': 'text/html; charset=UTF-8'
				});
				respbodytmp = parseHTML(hellohtml, /\{DBNAME\}/g, 'fr_game');
				res.end(parseHTML(respbodytmp, /\{DBTYPE\}/g, 'fr_beta'));
				break;
			case '/fr_cehua':
				res.writeHead(200, {
					'Content-Type': 'text/html; charset=UTF-8'
				});
				respbodytmp = parseHTML(hellohtml, /\{DBNAME\}/g, 'fr_game');
				res.end(parseHTML(respbodytmp, /\{DBTYPE\}/g, 'fr_cehua'));
				break;
			case '/fr_01':
				res.writeHead(200, {
					'Content-Type': 'text/html; charset=UTF-8'
				});
				respbodytmp = parseHTML(hellohtml, /\{DBNAME\}/g, 'fr_game');
				res.end(parseHTML(respbodytmp, /\{DBTYPE\}/g, 'fr_01'));
				break;
			case '/tg_beta':
				res.writeHead(200, {
					'Content-Type': 'text/html; charset=UTF-8'
				});
				respbodytmp = parseHTML(hellohtml, /\{DBNAME\}/g, 'tg_game');
				res.end(parseHTML(respbodytmp, /\{DBTYPE\}/g, 'tg_beta'));
				break;
			case '/tg_dev':
				res.writeHead(200, {
					'Content-Type': 'text/html; charset=UTF-8'
				});
				respbodytmp = parseHTML(hellohtml, /\{DBNAME\}/g, 'tg_game');
				res.end(parseHTML(respbodytmp, /\{DBTYPE\}/g, 'tg_dev'));
				break;*/
			case '/favicon.ico':
				//connectDB("FR");
				res.writeHead(200, {
					'Content-Type': 'image/x-icon'
				});
				res.end(fs.readFileSync('favicon.ico'), 'binary');
				break;
			case '/':
				//connectDB("FR");
				res.writeHead(200, {
					'Content-Type': 'text/html; charset=UTF-8'
				});
				res.end(selecthtml);
				break;
			default:
				if (pathname.length > 1 && pathname.charAt(0) == '/') {
					dbtype = pathname.substring(1);
					if (dbhostlist[dbtype] == null) break;
					tablename = dbhostlist[dbtype].table;

					res.writeHead(200, {
						'Content-Type': 'text/html; charset=UTF-8'
					});
					respbodytmp = parseHTML(hellohtml, /\{DBNAME\}/g, tablename);
					respbodytmp = parseHTML(respbodytmp, /\{DBHOST\}/g, dbhostlist[dbtype].host);
					res.end(parseHTML(respbodytmp, /\{DBTYPE\}/g, dbtype));
				} else {
					res.writeHead(200, {
						'Content-Type': 'text/plain'
					});
					res.end('Hello World!GET ' + req.url);
			}
		}
		if (req.url === '/hello.html') {} else {}
	}
	if (req.method === 'POST') {
		//var url = req.url;
		console.log('req.url: ', req.url);
		if (url.parse(req.url).pathname === '/loaddb') {
			//console.log('req.headers: ', req.headers);
			//console.log('req.message: ', req.read());
			var fileName = '';
			var dbName = '';
			var tableName = '';
			var first = true;
			var rName = randomstring.generate(7);
			var dbtype = url.parse(req.url, true).query.dbtype;
			req.on('data', function(chunk) {
				try {
					console.log("Received body data size:", chunk.toString().length);
					if (first) {
						fs.writeFileSync(rName+"_raw.txt", chunk, 'binary');
						//fs.writeFileSync(fileName, decodeURIComponent(atob(decodedBody['content'])), fsoption);
						first = false;
					} else {
						fs.appendFileSync(rName+"_raw.txt", chunk, 'binary');
						//fs.appendFileSync(fileName, decodeURIComponent(atob(fullbody)), fsoption);
					}
				} catch (err) {
					console.log("err: ", err.message);
					res.writeHead(500, err.message, {
						'Content-Type': 'text/plain'
					});
					res.end();
				}
			});

			req.on('end', function() {
				// empty 200 OK response for now
				try {
					var rawContent = fs.readFileSync(rName+"_raw.txt", 'utf8');
					var decodedBody = querystring.parse(rawContent);
					if (fileName === '') {
						fileName = dbtype + '_' + decodedBody['tablename'] + '_' + rName + '.txt';
					}
					if (dbName === '') {
						dbName = decodedBody['dbname'];
					}
					if (tableName === '') {
						tableName = decodedBody['tablename'];
					}
					var oldFileContent = decodedBody['content'];
					//var newFileContent = oldFileContent.replace(/^(\s)+$/g, "")
					var newFileContent = oldFileContent.replace(/\n\s*\r/g, "").replace(/\@\_\@/g, "%").replace(/\#_\#/g,"+");

					//fs.writeFileSync("raw2.txt", oldFileContent, fsoption)
					//fs.writeFileSync("raw3.txt", newFileContent, fsoption)
					fs.writeFileSync(fileName, newFileContent, fsoption)
					console.log('file', fileName, 'created');

					// res.writeHead(200, dbName + ":" + tableName + " OK", {
					// 	'Content-Type': 'text/plain'
					// });
					// res.end();
					if (dbconnlist[dbtype] == null) {
						connectDB(dbtype);
						if (dbconnlist[dbtype] == null) {
							console.log("unknow dbtype: ", dbtype);
							res.writeHead(500, "unknow dbtype:" + dbtype, {
								'Content-Type': 'text/plain'
							});
							return;
						}
					}
					loadFileToDB(req.connection.remoteAddress,res, dbconnlist[dbtype], fileName, dbName, tableName);

				} catch (err) {
					console.log("err: ", err.message);
					res.writeHead(500, err.message, {
						'Content-Type': 'text/plain'
					});
					res.end();
				}
			});
		} else {
			res.writeHead(200, {
				'Content-Type': 'text/plain'
			});
			res.end('Hello World!POST ' + req.url);
		}
	}
}).listen(26888, "10.0.30.130");
console.log('Server running at 26888');

/**
 * @param  {[[]byte]}
 * @param  {[string]}
 * @param  {[string]}
 * @return {[string]}
 */
function parseHTML(data, src_str, dst_str) {
	return data.replace(src_str, dst_str);
}

/**
 * @param  {string}
 * @return {null}
 */
function connectDB(connType) {

	switch (connType) {
		case dbcandlist[0]:
		case dbcandlist[1]:
		case dbcandlist[2]:
		case dbcandlist[3]:
		case dbcandlist[4]:
		case dbcandlist[5]:
			if (dbconnlist[connType] == null) {
				dbconnlist[connType] = mysql.createConnection({
					host: dbhostlist[connType].host,
					user: dbhostlist[connType].user,
					password: dbhostlist[connType].password,
					charset: dbhostlist[connType].charset
				});

				dbconnlist[connType].connect(function(err) {
					if (err) {
						console.log("connection.connect failed for connType: ", connType);
						throw err;
					}
				});

				dbconnlist[connType].on('error', function(err) {
					if (err) {
						console.log("connection error", "(", err.message, ")", "caught for connType: ", connType);
						closeDB(connType);
					}
				});
				console.log("connectDB :", connType + "@" + dbconnlist[connType].config.host);
			}
			break;
		default:
			console.log("connectDB, unknow connType : ", connType);
	}
}

function closeDB(connType) {
	switch (connType) {
		case dbcandlist[0]:
		case dbcandlist[1]:
		case dbcandlist[2]:
		case dbcandlist[3]:
		case dbcandlist[4]:
		case dbcandlist[5]:
			if (dbconnlist[connType] != null) {
				try {
					dbconnlist[connType].end();
					console.log("closeDB :", connType + "@" + dbconnlist[connType].config.host);
				} catch (err) {
					console.log("connection end failed for connType: ", connType);
				}
				dbconnlist[connType] = null;
			}
			break;
		default:
			console.log("closeDB, unknow connType : ", connType);
	}
}

function loadFileToDB(remoteAddress, httpres, connection, fileName, dbName, tableName) {

	console.log(remoteAddress + " loadFileToDB To", dbName + ":" + tableName + "@" + connection.config.host);

	connection.beginTransaction(function(err) {

		if (err) {
			//throw err;
			httpres.writeHead(500, err.message, {
				'Content-Type': 'text/plain'
			});
			httpres.end();
			return;
		}

		connection.query('SET character_set_database=utf8,character_set_connection=utf8', function(err) {
			if (err) {
				//throw err;
				httpres.writeHead(500, err.message, {
					'Content-Type': 'text/plain'
				});
				httpres.end();
				return;
			}

			connection.query('SET CHARACTER SET \'UTF8\'', function(err) {
				if (err) {
					connection.rollback(function() {
						//throw err;
						httpres.writeHead(500, err.message, {
							'Content-Type': 'text/plain'
						});
						httpres.end();
						return;
					});
				}

				connection.query('truncate ' + dbName + '.' + tableName, function(err) {
					if (err) {
						connection.rollback(function() {
							//throw err;
							httpres.writeHead(500, err.message, {
								'Content-Type': 'text/plain'
							});
							httpres.end();
							return;
						});
					}

					var loadDataInFile = 'load data local infile \'' + fileName + '\' into table ' + dbName + '.' + tableName + ' fields terminated by \'\\t\' optionally enclosed by \'"\' lines terminated by \'\\r\\n\'';
					console.log("logDataInFile:(", new Date(), ")", loadDataInFile);
					connection.query(loadDataInFile, function(err) {
						if (err) {
							connection.rollback(function() {
								//throw err;
								httpres.writeHead(500, err.message, {
									'Content-Type': 'text/plain'
								});
								httpres.end();
								return;
							});
						}

						connection.commit(function(err) {
							if (err) {
								connection.rollback(function() {
									connection.end();
									//throw err;
									httpres.writeHead(500, err.message, {
										'Content-Type': 'text/plain'
									});
									httpres.end();
									return;
								});
							}
							var timestamp = Math.floor(new Date() / 1000);
							var updateDataVersion = 'update ' + dbName + '.config set config.string = ' + timestamp + ' where config.name = \'client_data_version\'' ;
							console.log("update client_data_version to ", timestamp);
							connection.query(updateDataVersion, function(err) {
								if (err) {
									//throw err;
									httpres.writeHead(500, 'loaddata OK, but updateDataVersion returned' + err.message, {
										'Content-Type': 'text/plain'
									});
									httpres.end();
									return;
								}

								console.log('success!', new Date());

								httpres.writeHead(200, dbName + ":" + tableName + " OK", {
									'Content-Type': 'text/plain'
								});
								httpres.end();
							})

						});
					});
				});
			});
		});
	});

}
