// const Message = require("../models/messages");
import fetch from "node-fetch";
import model from "../models/public"
import {get_period_for_announce} from "../../app/controllers/salary.controller"

let handleQueryError = function (err) {
  return new Response(
    JSON.stringify({
      code: 400,
      message: "Network Error",
    })
  );
};
class Global {
  Public(message, clients) {


    const Anounce = new model({
      Intent: "Public announcement",
      Sender: message.Sender,
      SenderId: message.SenderId,
      Title: message.Title,
      Message: message.Message,
      Group: message.Group,
    });


    const outboundMessage = {
      Intent: "Public announcement",
      Message: message.Message,
      Sender: message.Sender,
      SenderId: message.SenderId,
      Title: message.Title,
      Group: message.Group,
      mongoId: null
    };

    try {
      Promise.resolve(Anounce.save());
      const id = Anounce._id
      outboundMessage.mongoId = id
      const outbound = JSON.stringify(outboundMessage);
      [...clients.keys()].forEach((client) => {
        client.send(outbound);
      });
    } catch (error) {
      console.log(error)
    }
  }

  async Channels(client, message, clients) {


    let accessTokenReqOptions = {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${client.Bearer}`,
      },
    };
    let response = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${message.Group.teamID}/channels/${message.Group.channelID}/members`,
      accessTokenReqOptions
    ).catch(handleQueryError);
    let data = await response.json();
    let IDarray = [];
    for (const e of data.value) {
      IDarray.push(e.userId);
    }
    const Anounce = new model({
      Intent: message.Intent,
      Sender: message.Sender,
      SenderId: message.SenderId,
      Title: message.Title,
      Message: message.Message,
      Group: message.Group,
    });
    const outboundMessage = {
      Intent: message.Intent,
      Group: message.Group,
      Message: message.Message,
      Sender: message.Sender,
      SenderId: message.SenderId,
      Title: message.Title,
      mongoId: null
    };
    try {
      Promise.resolve(Anounce.save());
      const id = Anounce._id
      outboundMessage.mongoId = id
      const outbound = JSON.stringify(outboundMessage);
      [...clients.keys()].forEach((client) => {
        if (IDarray.includes(client.UserID)) {
          client.send(outbound);
        }
      });
    } catch (error) {
      console.log(error)
    }
  }

  MarkAsRead(client, message) {
    const read = { user_uuid: client.UserID }
    model.findOneAndUpdate(
      { _id: message.mongoId },
      { $push: { "People_read": read } },
      { safe: true, upsert: true, new: true },
      function (err, model) {
        if (err) {
          const message = {
            Intent: "Failure",
            message: err
          }
          client.send(JSON.stringify(message));
        }
        else {
          const message = {
            Intent: "Marked read",
            model: { model }
          }
          client.send(JSON.stringify(message));
        }
      }
    )
  }

  GetUnread(client) {
    // first find all the messages where Client.UserId does not exists in the People read array
    model.find({ "People_read": { $not: { $elemMatch: { user_uuid: `${client.UserID}` } } } },
      async function (err, model) {
        if (err) {
          console.log(err)
        }
        else {
          //Loop through messages and filter them
          let modelsTosend = []
          for (const e of model) {
            if (e.Group !== "Public") {
              let accessTokenReqOptions = {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${client.Bearer}`,
                },
              };
              // if the group is not Public then it's a teams channel, lets get everyone in the team.
              let response = await fetch(
                `https://graph.microsoft.com/v1.0/teams/${e.Group.teamID}/channels/${e.Group.channelID}/members`,
                accessTokenReqOptions
              ).catch(handleQueryError);
              let data = await response.json();
              let IDarray = [];
              if(data.value === undefined){
                //! Todo, send to sender that this message failed.
                const message = {
                  Intent: "Failure",
                  message: "Group error please try again"
                }
                client.send(JSON.stringify(message));
                continue;
              }
              // Get all the users id's in the team inside IDarray
              for (const e of data.value) {
                IDarray.push(e.userId);
              }
              // If client.UserID exists inside the array then the user can receive the message
              if (IDarray.includes(client.UserID)) {
                modelsTosend.push(e)
              }
            } else {
              // If it's a public message then the user can receive the message regardless
              modelsTosend.push(e)
            }
          }
          const UnreadMessages = {
            Intent: "Unread Messages",
            messages: modelsTosend
          }
          client.send(JSON.stringify(UnreadMessages));
        }
      }
    )
  }

  CreateAndSendLogScheduleReminder(){
    const Anounce = new model({
      Intent: "Public announcement",
      Sender: "Dialogue Time",
      SenderId: "Dialogue Time",
      Title: "Scheduler reminder",
      Message: "Please rembember to lock in your schedule for next month",
      Group: "Public",
    });
    try {
      Promise.resolve(Anounce.save());
      const id = Anounce._id
      // outboundMessage.mongoId = id
      console.log(id)
    } catch (error) {
      console.log(error)
    }
  }

  async CreateAndSendLogHoursReminder(){
    const data = await get_period_for_announce()
    console.log(data)
  }


}

export default new Global();
