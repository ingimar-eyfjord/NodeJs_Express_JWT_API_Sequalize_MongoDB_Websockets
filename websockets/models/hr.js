import { Schema, model as _model } from "mongoose";

const Hr_notifications = new Schema(
  {
    Intent: {type: String, required: true },
    Sender: { type: String, required: true },
    SenderId: { type: String, required: true },
    Title: { type: String, required: true },
    Message: { type: String, required: true },
    Group: { type: Schema.Types.Mixed, required: true },
    Date: { type: Date, default: Date.now },
    People_read: [
        {user_uuid: { type: String, required: true },
        date_read: { type: Date, default: Date.now },
        }
      ],
  },
  { collection: "Hr_notifications" }
);

const model = _model("Hr_notifications", Hr_notifications);
export default model;