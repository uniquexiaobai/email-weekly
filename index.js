const express = require('express');
const axios = require('axios');
const nodeMailjet = require('node-mailjet');

const app = express();

const mailjet = nodeMailjet.connect(
	process.env.MAIL_KEY,
	process.env.MAIL_SECRET
);

const getHtml = list => {
	let ret = '<ol style="font-size: 15px">';
	ret += list
		.map(({ title, url, desc }) => {
			return `<li style="margin-mottom: 10px"><a href="${url}">${title}</a></li>`;
		})
		.join('');
	ret += '</ol>';
	return ret;
};

const sendEmail = (title, data) => {
	return mailjet.post('send', { version: 'v3.1' }).request({
		Messages: [
			{
				From: {
					Email: 'lokibai@qq.com',
					Name: 'Loki',
				},
				To: [
					{
						Email: 'uniquexiaobai@gmail.com',
						Name: 'Loki',
					},
				],
				Subject: title,
				HTMLPart: data,
				CustomID: 'AppGettingStartedTest',
			},
		],
	});
};

const fetchData = async target => {
	const { data } = await axios.get(
		`https://top-api.lokibai.com/?target=${target}`
	);

	return data.list;
};

app.get('/', async (req, res) => {
	const [echojsList, yuqueList] = await Promise.all([
		fetchData('echojs'),
		fetchData('yuque'),
	]);
	const echojsHtml = getHtml(echojsList);
	const yuqueHtml = getHtml(yuqueList);

	Promise.all([sendEmail('EchoJS', echojsHtml), sendEmail('语雀', yuqueHtml)])
		.then(result => {
			res.json({ code: 0 });
		})
		.catch(err => {
			res.json({ code: 1, msg: err.message });
		});
});

app.use((req, res, next) => {
	next();
});

app.use((err, req, res, next) => {
	console.error(err);
	res.json({ code: 1, msg: err.message });
});

process.on('uncaughtException', err => {
	console.error(err);
	res.json({ code: 1, msg: err.message });
});

if (process.env.NODE_ENV === 'dev') {
	app.listen('3000', () => {
		console.log('Express is running in http://localhost:3000');
	});
}

module.exports = app;
