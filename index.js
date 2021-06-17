const ngrok = require('ngrok');
const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('we are live');
});

function demo(agent) {
    agent.add('Sending response from webhook server');
}

function confirmAgreement(agent) {
    let confirmed = null;
    
    try {
        confirmed = !!JSON.parse(agent.parameters['confirmed'].toLowerCase());
    } catch (e) {
        confirmed = false;
    }

    if (!confirmed) {
        console.log('getting here');
        
        agent.context.set({
            name: 'ConfirmAgreementCustomFallback',
            lifespan: 1,
            parameters: {
                confirmed: 'False'
            }
        });
        
        agent.setFollowupEvent('Confirm_Agreement_No');
    }

    agent.add("");
}

function confirmAgreementNo(agent) {
    agent.add("");
}

app.post('/', (req, res) => {
    const agent = new WebhookClient({request: req, response: res});

    console.log(agent.intent);

    const intentMap = new Map();
    intentMap.set('Webhook Demo', demo);
    intentMap.set('Confirm Agreement - Yes', confirmAgreement);
    intentMap.set('Confirm Agreement - No', confirmAgreementNo);

    agent.handleRequest(intentMap);
});

app.listen(3333).on('connection', () => {
    console.log('opened');
});

(async function () {
    const url = await ngrok.connect({
        port: 3333
    });

    console.log(url);
})();



