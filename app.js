console.log('Starting password manager');

var crypto = require('crypto-js');
var storage = require('node-persist');
storage.initSync();

var argv = require('yargs')
	.command('create', 'Creates new account', function (yargs) {
		yargs.options({
			name: {
				demand: true,
				alias: 'n',
				description: 'Your name goes here',
				type: 'string'
			},
			username: {
				demand: true,
				alias: 'u',
				description: 'Your username goes here',
				type: 'string'
			},
			password: {
				demand: true,
				alias: 'p',
				description: 'Your password goes here',
				type: 'string'
			},
			masterPassword: {
				demand: true,
				alias: 'm',
				description: 'Master password',
				type: 'string'
			}
		}).help('help');
	})
	.command('get', 'Gets existing account', function (yargs) {
		yargs.options({
			name:{
				demand: true,
				alias: 'n',
				description: 'Your name goes here',
				type: 'string'
			},
			masterPassword: {
				demand: true,
				alias: 'm',
				description: 'Master password',
				type: 'string'
			}
		}).help('help');
	})
	.help('help')
	.argv;
var command = argv._[0];

function getAccounts (masterPassword) {
	var encryptedAccount = storage.getItemSync('accounts');
	var accounts = [];

	if (typeof encryptedAccount !== 'undefined') {
		var bytes = crypto.AES.decrypt(encryptedAccount, masterPassword);
		var accounts = JSON.parse(bytes.toString(crypto.enc.Utf8));
	}

	return accounts;
}

function saveAccounts (accounts, masterPassword) {
	var encryptedAccounts = crypto.AES.encrypt(JSON.stringify(accounts), masterPassword);

	storage.setItemSync('accounts', encryptedAccounts.toString());
	
	return accounts;
}

function createAccount (account, masterPassword) {
	var accounts = getAccounts(masterPassword);

	accounts.push(account);

	saveAccounts(accounts, masterPassword);

	return account;
}

function getAccount (accountName, masterPassword) {
	var accounts = getAccounts(masterPassword);
	var matchedAccount;

	accounts.forEach(function (account) {
		if (account.name === accountName){
			matchedAccount = account;
		}
	});

	return matchedAccount;
}

if (command === 'create') {
	try {
		var createdAccount = createAccount({
			name: argv.name,
			username: argv.username,
			password: argv.password
		}, argv.masterPassword);
		console.log('Account created!');
		console.log(createdAccount);
	} catch (e) {
		console.log('Unable to create account');
	}
} else if (command === 'get') {
	try {
		var fetchedAccount = getAccount(argv.name, argv.masterPassword);
		if (typeof fetchedAccount === 'undefined') {
			console.log('Account not found');
		} else {
			console.log('Account found!');
			console.log(fetchedAccount);
		}
	} catch (e) {
		console.log('Unable to get account');
	}
} else {
	console.log('Your request could not be processed try --help');
}





