'use strict';
var https = require('https');
const Alexa = require('alexa-sdk');
const fs = require('fs');
var contents = fs.readFileSync("data.json");

var jsonContent = JSON.parse(contents);
const APP_ID = 'amzn1.ask.skill.e2f11871-685c-4948-bcb1-cbd13d7f1545';
const SKILL_NAME = 'SUG Chennai Meetup';
const ISSERVICEUP = false;

const HELP_MESSAGE = 'How can I help you with? you can ask me about Agenda, Presenters, Sponsors and Venu details.';
const HELP_REPROMPT = 'How can I help you with? you can ask me about Agenda, Presenters, Sponsors and Venu details.';
const STOP_MESSAGE = 'Thank you using voice activated SUG Chennai Meetup Skill, Goodbye!';
const ERROR_MESSAGE = 'Something went wong, please try again after some time !!';

const SitecoreServiceURL = "https://sitecore9208312019-437910-single.azurewebsites.net/sitecore/api/ssc/aggregate/content/";
const ODATAAPIKey = "60BCF112-CAE9-48C3-8269-CBA1E7DDDF8A";

function buildHandelers(event) {

    //Default response object
    let response = {
        "version": "1.0",
        "response": {
            "outputSpeech": {
                "type": "PlainText"
            }
        }
    };

    //copy session over
    if ("session" in event && "attributes" in event.session) {
        response.sessionAttributes = event.session.attributes;
    } else response.sessionAttributes = {};

    var handlers = {
       
        'LaunchRequest': function() {
            var launchImage = {
                smallImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/Intro.jpg',
                largeImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/Intro.jpg'
            };

            if (ISSERVICEUP) {
                var responseString = '';
                var mythis = this;
                https.get(SitecoreServiceURL + "Items('{77A46524-1AB9-4C0E-AEE2-ABDD6E84B155}')?$expand=FieldValues($select=Name,welcomePrompt,welcomeRePrompt,welcomeCardTitle,welcomeCardContent)&sc_apikey=" + ODATAAPIKey, (res) => {
                    console.log('statusCode:', res.statusCode);
                    console.log('headers:', res.headers);

                    res.on('data', (d) => {
                        responseString += d;
                    });

                    res.on('end', function(res) {
                        const launchDetails = (JSON.parse(responseString));
                        console.log('responseString:', responseString);
                        if (launchDetails != null) {
                            mythis.emit(':askWithCard', launchDetails.FieldValues.welcomePrompt, launchDetails.FieldValues.welcomeRePrompt, launchDetails.FieldValues.welcomeCardTitle, launchDetails.FieldValues.welcomeCardContent, launchImage);
                        } else
                            mythis.emit(':tell', ERROR_MESSAGE)
                    });
                }).on('error', (e) => {
                    console.error(e);
                });
            } else {
                this.emit(':askWithCard', jsonContent.welcomePrompt, jsonContent.welcomeRePrompt, jsonContent.welcomeCardTitle, jsonContent.welcomeCardContent, launchImage);
            }
        },
        'AgendaIntent': function() {
            var agendaImage = {
                smallImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/agenda.jpg',
                largeImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/agenda.jpg'
            };
            if (ISSERVICEUP) {

                var responseString = '';
                var mythis = this;
                https.get(SitecoreServiceURL + "Items('{026DFB9B-FA69-46A1-A9D4-F3431285295F}')/Children?$expand=FieldValues($select=Name,Presenter,Duration)&sc_apikey=" + ODATAAPIKey, (res) => {
                    console.log('statusCode:', res.statusCode);
                    console.log('headers:', res.headers);

                    res.on('data', (d) => {
                        responseString += d;
                    });

                    res.on('end', function(res) {
                        const agendaDetails = (JSON.parse(responseString));
                        if (agendaDetails != null) {
                            var res = 'The Sessions will be started at 10 AM and end at 1PM. ';
                            for (var i = 0; i < agendaDetails.value.length; i++) {
                                res += 'Session' + (i + 1) + ' is ';
                                res += agendaDetails.value[i].FieldValues.Name;
                                res += ' by ';
                                res += agendaDetails.value[i].FieldValues.Presenter + ', duration is ';
                                res += agendaDetails.value[i].FieldValues.Duration + ' ';
                                res += 'mins. ';
                            }

                            mythis.emit(':askWithCard', res, res, jsonContent.AgendaCardTitle, jsonContent.AgendaCardContent, agendaImage);
                        } else
                            mythis.emit(':tell', ERROR_MESSAGE)
                    });
                }).on('error', (e) => {
                    console.error(e);
                });
            } else {
                this.emit(':askWithCard', jsonContent.AgendaPrompt, jsonContent.AgendaRePrompt, jsonContent.AgendaCardTitle, jsonContent.AgendaCardContent, agendaImage);
            }
        },
        'SponsorsIntent': function() {
            var sponserImage = {
                smallImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/AMEEX%2BSITECORE.png',
                largeImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/AMEEX%2BSITECORE.png'
            };
            if (ISSERVICEUP) {

                var responseString = '';
                var mythis = this;
                https.get(SitecoreServiceURL + "Items('{07C57BC6-9B21-41EA-84E6-AC9FC6C0A6C7}')/Children?$expand=FieldValues($select=Name,Details)&sc_apikey=" + ODATAAPIKey, (res) => {
                    console.log('statusCode:', res.statusCode);
                    console.log('headers:', res.headers);

                    res.on('data', (d) => {
                        responseString += d;
                    });

                    res.on('end', function(res) {
                        const sponsorDetails = (JSON.parse(responseString));
                        console.log('responseString:', responseString);
                        if (sponsorDetails != null) {
                            var res = '';
                            for (var i = 0; i < sponsorDetails.value.length; i++) {
                                res += sponsorDetails.value[i].FieldValues.Name+ ' ';
                                res += sponsorDetails.value[i].FieldValues.Details + ' ';
                                if (i != sponsorDetails.value.length - 1)
                                    res += ', ';
                                else
                                    res += '.';
                            }

                            mythis.emit(':askWithCard', res, res, jsonContent.sponsorCardTitle, jsonContent.sponsorCardContent, sponserImage);
                        } else
                            mythis.emit(':tell', ERROR_MESSAGE)
                    });
                }).on('error', (e) => {
                    console.error(e);
                });
            } else {
                this.emit(':askWithCard', jsonContent.sponsorPrompt, jsonContent.sponsorRePrompt, jsonContent.sponsorCardTitle, jsonContent.sponsorCardContent, sponserImage);
            }
        },
        'FindSessionIntent': function() {
            var sessionImage = {
                smallImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/sess.jpg',
                largeImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/sess.jpg'
            };

            if (this.event.request.intent.slots != null && this.event.request.intent.slots != "" && this.event.request.intent.slots.presenter != null && this.event.request.intent.slots.presenter != "" && this.event.request.intent.slots.presenter.value != "") {
                var res = '';
                var presenter = this.event.request.intent.slots.presenter.value.toString().trim().toLowerCase();
                if (presenter == 'nizar')
                    res = "Nizar is presenting about How to become Sitecore MVP";
                else if (presenter == 'kishore')
                    res = "Kishore is presenting about Sitecore User Group Chennai";
                else
                    res = "He/She is not presenting anyting today";

                this.emit(':askWithCard', res, res, jsonContent.sessionCardTitle, res, sessionImage);
            }

        },
        'PresentersIntent': function() {

            var presentersImage = {
                smallImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/presenter.jpg',
                largeImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/presenter.jpg'
            };
            if (ISSERVICEUP) {
                var responseString = '';
                var mythis = this;
                https.get(SitecoreServiceURL + "Items('{026DFB9B-FA69-46A1-A9D4-F3431285295F}')/Children?$expand=FieldValues($select=Name,Presenter,Duration)&sc_apikey=" + ODATAAPIKey, (res) => {
                    console.log('statusCode:', res.statusCode);
                    console.log('headers:', res.headers);

                    res.on('data', (d) => {
                        responseString += d;
                    });

                    res.on('end', function(res) {
                        const presenterDetails = (JSON.parse(responseString));
                        if (presenterDetails != null) {
                            var res = '';
                            for (var i = 0; i < presenterDetails.value.length; i++) {
                                res += presenterDetails.value[i].FieldValues.Presenter + ' is presenting ' + presenterDetails.value[i].FieldValues.Name;
                                if (i != presenterDetails.value.length - 1)
                                    res += '. ';
                                else
                                    res += '.';
                            }
                            mythis.emit(':askWithCard', res, res, jsonContent.presentersCardTitle, jsonContent.presentersCardContent, presentersImage);
                        } else
                            mythis.emit(':tell', ERROR_MESSAGE)
                    });
                }).on('error', (e) => {
                    console.error(e);
                });

            } else {
                this.emit(':askWithCard', jsonContent.presentersPrompt, jsonContent.presentersRePrompt, jsonContent.presentersCardTitle, jsonContent.presentersCardContent, presentersImage);
            }
        },
        'VenueIntent': function() {
            var locationImage = {
                smallImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/location.jpg',
                largeImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/location.jpg'
            };
            if (ISSERVICEUP) {

                var responseString = '';
                var mythis = this;
                https.get(SitecoreServiceURL + "Items('{A93A2A1D-C26B-4B13-BEA7-4E24FF19BA93}')?$expand=FieldValues($select=Address)&sc_apikey=" + ODATAAPIKey, (res) => {
                    console.log('statusCode:', res.statusCode);
                    console.log('headers:', res.headers);

                    res.on('data', (d) => {
                        responseString += d;
                    });

                    res.on('end', function(res) {
                        const venuDetails = (JSON.parse(responseString));
                        console.log('responseString:', venuDetails.FieldValues.Address);
                        if (venuDetails != null) {
                            mythis.emit(':askWithCard', venuDetails.FieldValues.Address, venuDetails.FieldValues.Address, jsonContent.venuCardTitle, jsonContent.venuCardContent, locationImage);
                        } else
                            mythis.emit(':tell', ERROR_MESSAGE)
                    });
                }).on('error', (e) => {
                    console.error(e);
                });
            } else {
                this.emit(':askWithCard', jsonContent.venuPrompt, jsonContent.venuRePrompt, jsonContent.venuCardTitle, jsonContent.venuCardContent, locationImage);
            }

        },
        'ParticipantsIntent': function() {
            var participantsImage = {
                smallImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/Participants.jpg',
                largeImageUrl: 'https://alexa-sugchennai-meetup.s3-us-west-2.amazonaws.com/Participants.jpg'
            };
            if (ISSERVICEUP) {

                var responseString = '';
                var mythis = this;
                https.get(SitecoreServiceURL + "Items('{9B133739-FD5D-4D00-A745-BAAA628A31CA}')?$expand=FieldValues($select=TotalCount)&sc_apikey=" + ODATAAPIKey, (res) => {
                    console.log('statusCode:', res.statusCode);
                    console.log('headers:', res.headers);

                    res.on('data', (d) => {
                        responseString += d;
                    });

                    res.on('end', function(res) {
                        const venuDetails = (JSON.parse(responseString));
                        console.log('responseString:', venuDetails.FieldValues.TotalCount);
                        if (venuDetails != null) {
                            mythis.emit(':askWithCard', 'Number of Participants today is '+venuDetails.FieldValues.TotalCount, 'Number of Participants today is '+venuDetails.FieldValues.TotalCount, jsonContent.totalCountCardTitle, jsonContent.totalCountCardContent, participantsImage);
                        } else
                            mythis.emit(':tell', ERROR_MESSAGE)
                    });
                }).on('error', (e) => {
                    console.error(e);
                });
            } else {
                this.emit(':askWithCard', jsonContent.totalCountPrompt, jsonContent.totalCountRePrompt, jsonContent.totalCountCardTitle, jsonContent.totalCountCardContent, participantsImage);
            }

        },

        'AMAZON.HelpIntent': function() {
            const speechOutput = HELP_MESSAGE;
            const reprompt = HELP_REPROMPT;
            this.response.speak(speechOutput).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent': function() {
            this.response.speak(STOP_MESSAGE);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent': function() {
            this.response.speak(STOP_MESSAGE);
            this.emit(':responseReady');
        },

        'SessionEndedRequest': function() {
            this.emit(':ask', 'session end');
        },

        'Unhandled': function() {
            this.emit(':ask', 'Goodbye!!');
        }

    };
    return handlers;
}

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(buildHandelers(event));
    alexa.execute();
};

function supportsDisplay() {
    var hasDisplay =
        this.event.context &&
        this.event.context.System &&
        this.event.context.System.device &&
        this.event.context.System.device.supportedInterfaces &&
        this.event.context.System.device.supportedInterfaces.Display

    return hasDisplay;
}

function isSimulator() {
    var isSimulator = !this.event.context; //simulator doesn't send context
    return isSimulator;
}