import queryString from "query-string";
import WebSocket from "ws";
import Global from "./controllers/public_notification";
import HR from './controllers/hr_notification'
import jwt from "jsonwebtoken";
import schedule from 'node-schedule';
// import {VerifyToken} from "./middleware/authJwt.js"

require("dotenv").config();


const job = schedule.scheduleJob('10 1 10 * *', function () {
  Global.CreateAndSendLogScheduleReminder()
});


// const job2 = schedule.scheduleJob('0 0 20 * *', function(){
const job2 = schedule.scheduleJob('10 1 20 * *', function () {
  Global.CreateAndSendLogHoursReminder()
});



export default async (expressServer) => {
  const websocketServer = new WebSocket.Server({
    noServer: true,
    path: "/websockets",
  });

  expressServer.on("upgrade", (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit("connection", websocket, request);
    });
  });



  const clients = new Map();

  websocketServer.on("connection", function connection(websocketConnection, connectionRequest) {
    const [_path, params] = connectionRequest.url.split("?");
    const connectionParams = queryString.parse(params);

    const id = uuidv4();
    const color = Math.floor(Math.random() * 360);
    const metadata = { id, color };

    clients.set(websocketConnection, metadata);

    // NOTE: connectParams are not used here but good to understand how to get
    // to them if you need to pass data with the connection to identify it (e.g., a userId).

    websocketConnection.on("message", (message) => {

      const parsedMessage = JSON.parse(message);

      if (!parsedMessage.APIToken) {
        clients.delete(websocketConnection);
        return websocketConnection.send(JSON.stringify({ auth: false, message: "No token provided." }));
      }

      jwt.verify(parsedMessage.APIToken, process.env.API_secret, function (err, decoded) {
        if (err) {
          websocketConnection.send(JSON.stringify({ auth: false, message: "Failed to authenticate token." }));
          clients.delete(websocketConnection);
          return
        }
        if (parsedMessage.Intent === "Sign") {
          websocketConnection.UserID = parsedMessage.UserID;
          websocketConnection.Bearer = parsedMessage.Bearer;
          websocketConnection.APIToken = parsedMessage.APIToken;
        }
        if (parsedMessage.Intent === "Mark as read") {
          if (parsedMessage.Group.channel === "HR") {
            HR.MarkAsRead(websocketConnection, parsedMessage)
          } else {
            Global.MarkAsRead(websocketConnection, parsedMessage)
          }
        }
        if (parsedMessage.Intent === "Public announcement") {
          if (parsedMessage.Group === "Public") {
            Global.Public(parsedMessage, clients);
          } else {
            Global.Channels(websocketConnection, parsedMessage, clients);
          }
        }
        if (parsedMessage.Intent === 'Get unread messages') {
          HR.GetUnread(websocketConnection);
          Global.GetUnread(websocketConnection);
        }
        if (parsedMessage.Intent === 'Inform HR Master Data Change') {
          HR.InformOfChange(websocketConnection, parsedMessage, clients)
        }
      })
    });

    websocketConnection.on("close", () => {
      clients.delete(websocketConnection);
    });

  });

  function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  return websocketServer;


};
