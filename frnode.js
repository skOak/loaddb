var http = require('http');
var fs = require('fs');
var url = require('url');
if (!url) {
	console.log("require('url') invalid");
	return;
}
var querystring = require('querystring');

var fsoption = {
	encoding: 'utf8',
	autoClose: true
}
var hellohtml = fs.readFileSync('frhello.html', 'utf8');
var selecthtml = fs.readFileSync('select.html', 'utf8');
var dbconfigs = JSON.parse(fs.readFileSync('dbconfig.json', 'utf8'));
console.log("dbconfigs:", dbconfigs);
var dbhostlist = new Map();
var dbcandlist = new Array(dbconfigs.dblist.length);
var dbcandliststr = '(';
for (x in dbconfigs.dblist) {
	console.log("x:", x, "\tdbtype:", dbconfigs.dblist[x].dbtype, "\tdbconfig:", dbconfigs.dblist[x].dbconfig);
	dbcandlist[x] = dbconfigs.dblist[x].dbtype;
	dbcandliststr = dbcandliststr + '\'' + dbconfigs.dblist[x].dbtype + '\'';
	dbhostlist.set(dbconfigs.dblist[x].dbtype, dbconfigs.dblist[x].dbconfig);
}
dbcandliststr = dbcandliststr.replace(/\'\'/g, '\'\,\'') + ')';
selecthtml = selecthtml.replace(/\{DBTYPELIST\}/g, dbcandliststr);
//console.log("dbcandlist:",dbcandlist);
//console.log("dbhostlist['fr_01']:",dbhostlist.get('fr_01'));
var dbconnlist = new Map();
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
				break;
			case '/':
				//connectDB("FR");
				res.writeHead(200, {
					'Content-Type': 'text/html; charset=UTF-8'
				});
				res.end(selecthtml);
				break;
			default:
				res.writeHead(200, {
					'Content-Type': 'text/plain'
				});
				res.end('Hello World!GET ' + req.url);
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
			var dbtype = url.parse(req.url, true).query.dbtype;
			req.on('data', function(chunk) {
				try {
					var fullbody = chunk.toString();
					//console.log('fullbody:', fullbody);
					console.log("Received body data size:", fullbody.length);
					if (first) {
						var decodedBody = querystring.parse(fullbody);
						//console.log("decodeBody: ", decodedBody);
						if (fileName === '') {
							fileName = dbtype + '_' + decodedBody['tablename'] + '.txt';
						}
						if (dbName === '') {
							dbName = decodedBody['dbname'];
						}
						if (tableName === '') {
							tableName = decodedBody['tablename'];
						}
						//console.log('decodedBody[\'content\']:', decodedBody['content'].replace(/\@\_\@/g,"%"));
						fs.writeFileSync(fileName, decodedBody['content'].replace(/\@\_\@/g, "%"), fsoption);
						first = false;
					} else {
						fs.appendFileSync(fileName, fullbody, fsoption);
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
					if (dbconnlist.get(dbtype) == null) {
						connectDB(dbtype);
						if (dbconnlist.get(dbtype) == null) {
							console.log("unknow dbtype: ", dbtype);
							res.writeHead(500, "unknow dbtype:" + dbtype, {
								'Content-Type': 'text/plain'
							});
							return;
						}
					}
					var oldFileContent = fs.readFileSync(fileName, 'utf8');
					newFileContent = oldFileContent.replace(/^(\s)+$/g, "")
					if (oldFileContent.length != newFileContent.length) {
						fs.writeFileSync(fileName, newFileContent, fsoption)
					}
					loadFileToDB(res, dbconnlist.get(dbtype), fileName, dbName, tableName);

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
console.log('Server running!');


function parseHTML(data, src_str, dst_str) {
	return data.replace(src_str, dst_str);
}

function connectDB(connType) {

	switch (connType) {
		case dbcandlist[0]:
		case dbcandlist[1]:
		case dbcandlist[2]:
		case dbcandlist[3]:
		case dbcandlist[4]:
		case dbcandlist[5]:
			if (dbconnlist.get(connType) == null) {
				dbconnlist.set(connType, mysql.createConnection({
					host: dbhostlist.get(connType).host,
					user: dbhostlist.get(connType).user,
					password: dbhostlist.get(connType).password,
					charset: dbhostlist.get(connType).chaset
				}));

				dbconnlist.get(connType).connect(function(err) {
					if (err) {
						console.log("connection.connect failed for connType: ", connType);
						throw err;
					}
				});

				dbconnlist.get(connType).on('error', function(err) {
					if (err) {
						console.log("connection error", "(", err.message, ")", "caught for connType: ", connType);
						closeDB(connType);
					}
				});
				console.log("connectDB :", connType + "@" + dbconnlist.get(connType).config.host);
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
			if (dbconnlist.get(connType) != null) {
				try {
					dbconnlist.get(connType).end();
					console.log("closeDB :", connType + "@" + dbconnlist.get(connType).config.host);
				} catch (err) {
					console.log("connection end failed for connType: ", connType);
				}
				dbconnlist.delete(connType);
			}
			break;
		default:
			console.log("closeDB, unknow connType : ", connType);
	}
}

function loadFileToDB(httpres, connection, fileName, dbName, tableName) {

	console.log("loadFileToDB To", dbName + ":" + tableName + "@" + connection.config.host);

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
					console.log("logDataInFile:", loadDataInFile);
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
							console.log('success!', new Date());

							httpres.writeHead(200, dbName + ":" + tableName + " OK", {
								'Content-Type': 'text/plain'
							});
							httpres.end();

						});
					});
				});
			});
		});
	});

}