import express from "express";
import * as bodyParser from "body-parser"; // used to parse the form data that you pass in the request
import routes from "./routes";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import mongo from "connect-mongo";
import mongoose from "mongoose";
import bluebird from "bluebird";

import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";

const MongoStore = mongo(session);

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env" });

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl, { useNewUrlParser: true,  useUnifiedTopology: true }).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    // process.exit();
});

class App {
  public app: express.Application;

  constructor() {
    this.app = express(); // run the express instance and store in app
    this.config();
  }

  private config(): void {
     this.app.use(cors());
    // support application/json type post data
    this.app.use(bodyParser.json());
    // support application/x-www-form-urlencoded post data
    this.app.use(
      bodyParser.urlencoded({
        extended: false
      })
    );

    this.app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: SESSION_SECRET,
        store: new MongoStore({
            url: mongoUrl,
            autoReconnect: true
        })
    }));

    this.app.use("/api/v1", routes);
  }
}

export default new App().app;
