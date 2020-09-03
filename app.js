const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const { buildSchema } = require("graphql");
const mongoose = require('mongoose');
const Event = require('./models/events');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphQlHttp.graphqlHTTP({ // change /graphql to /api
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find().then(events => {
                return events.map(event => {
                    return { ...event._doc, _id: event.id };
                });
            }).catch(err => {
                throw err;
            });
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            });            
            return  event.save().then(result => {
                console.log(result)
                return {...result._doc};
            }).catch(err => {
                console.log(err);
                throw err;
            });
        }
    },
    graphiql: true
}));

mongoose.connect(
    `mongodb+srv://BenTaiba:UHkzFaL6jKMuvJb@cluster0.8wlvn.mongodb.net/jacktrader-db?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
).then(()=>{
    app.listen(3000, () => {
        console.log('app started: listening at port 3000');
    });
})
.catch(err=>{
    console.log(err)
});
