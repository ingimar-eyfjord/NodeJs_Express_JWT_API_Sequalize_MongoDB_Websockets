// const Message = require("../models/messages");
import fetch from "node-fetch";
import model from "../models/hr"

let handleQueryError = function (err) {
  return new Response(
    JSON.stringify({
      code: 400,
      message: "Network Error",
    })
  );
};

class HR {

  async InformOfChange(client, message, clients) {
    let accessTokenReqOptions = {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${client.Bearer}`,
      },
    };
    let response = await fetch(
      'https://graph.microsoft.com/v1.0/groups/5c5c149a-ff6e-4966-9c2f-802de9688cd6/members',
      accessTokenReqOptions
    ).catch(handleQueryError);
    let data = await response.json();

    let IDarray = []
    for (const e of data.value) {
      IDarray.push(e.id)
    }

    const Notify = new model({
      Intent: "Inform HR Master Data Change",
      Sender: message.Sender,
      SenderId: message.SenderId,
      Title: "I've changed my master data",
      Message: "This is an automated message to inform HR that I've changed my master data",
      Group: {
        channel: "HR",
        channelID: "5c5c149a-ff6e-4966-9c2f-802de9688cd6",
        team: "Azure group",
        teamID: null,
      },
    });


    const outboundMessage = {
      Intent: "Inform HR Master Data Change",
      message: "This is an automated message to inform HR that I've changed my master data",
      Sender: message.Sender,
      SenderId: message.SenderId,
      Title: "I've changed my master data",
      Group: {
        channel: "HR",
        channelID: "5c5c149a-ff6e-4966-9c2f-802de9688cd6",
        team: "Azure group",
        teamID: null,
      },
      mongoId: null
    };

    try {
      Promise.resolve(Notify.save());
      const id = Notify._id
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
            model: model
          }
          client.send(JSON.stringify(message));
        }
      }
    )
  }


  async GetUnread(client) {

    let accessTokenReqOptions = {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${client.Bearer}`,
      },
    };
    let response = await fetch(
      'https://graph.microsoft.com/v1.0/groups/5c5c149a-ff6e-4966-9c2f-802de9688cd6/members',
      accessTokenReqOptions
    ).catch(handleQueryError);
    let data = await response.json();

    let IDarray = []
    for (const e of data.value) {
      IDarray.push(e.id)
    }

    if (!IDarray.includes(client.UserID)) {
      return
    }


    model.find({ "People_read": { $not: { $elemMatch: { user_uuid: `${client.UserID}` } } } },
      function (err, model) {
        if (err) {
          console.log(err)
        }
        else {
          const UnreadMessages = {
            Intent: "Unread Messages",
            messages: model
          }
          client.send(JSON.stringify(UnreadMessages));
        }
      }
    )
  }

}
// db.Hr_notifications.find({_id: ObjectId("619cbec91f08f2f252271fe3")})

export default new HR();
