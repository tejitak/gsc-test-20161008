var express = require('express');
var router = express.Router();
var request = require('request');
var apiai = require('apiai');
/* GET home page. */

//verification code
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/webhook', function(req, res) {

 if (req.query['hub.verify_token'] === 'token0000') {
   res.send(req.query['hub.challenge']);
 } else {
   res.send('Error, wrong validation token');
 }
});
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const API_AI_ACCESS_TOKEN = process.env.API_AI_ACCESS_TOKEN

router.post('/webhook', function (req, res) {
  const events = req.body.entry[0].messaging;
  var app = apiai(API_AI_ACCESS_TOKEN);
  for (i = 0; i < events.length; i++) {
    const event = req.body.entry[0].messaging[i];
    const sender = event.sender.id;
    if (event.message && event.message.text) {
      const text = event.message.text;
      var airequest = app.textRequest(text);
      airequest.on('response', function(response) {
        console.log(response);
        sendTextMessage(sender, response.result.fulfillment.speech);
      });
      airequest.on('error', function(error) {
        console.log(error);
      });
      airequest.end();
    }
  }
  res.sendStatus(200);
});
function sendTextMessage(sender, text) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {
        id: sender
      },
      message: {
        text: text
      }
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}
module.exports = router;