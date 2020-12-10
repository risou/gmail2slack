const SLACK_WEBHOOK_URL = PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL");
const GMAIL_TARGET_LABEL = PropertiesService.getScriptProperties().getProperty("GMAIL_TARGET_LABEL");

function myFunction() {
    var threads = GmailApp.search('in:unread AND label:' + GMAIL_TARGET_LABEL).reverse();

    for (const thread of threads) {
	var messages = thread.getMessages();
	for (const message of messages) {
	    postToSlack(loadMail(message));
	}
	thread.markRead();
    }
}

function loadMail(message) {
    var title = message.getSubject();
    var from = message.getFrom();
    var sendDate = message.getDate();
    var body = message.getPlainBody();

    var timestamp = Math.floor(sendDate.valueOf() / 1000);
    var fallbackText = Utilities.formatDate(sendDate, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

    var mdStr = `*${title}*\n\n${body}`;
    var formattedSendDate = `<!date^${timestamp}^{date} at {time}|${fallbackText}>`;

    return {
	'blocks': [
	    {
		'type': 'section',
		'text': {
		    'type': 'mrkdwn',
		    'text': mdStr
		}
	    },
	    {
		'type': 'context',
		'elements': [
		    {
			'type': 'plain_text',
			'text': from
		    },
		    {
			'type': 'mrkdwn',
			'text': formattedSendDate
		    }
		]
	    },
	]
    };
}

function postToSlack(json) {
    UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
	'method': 'GET',
	'contentType': 'application/json',
	'payload': JSON.stringify(json)
    });
}
