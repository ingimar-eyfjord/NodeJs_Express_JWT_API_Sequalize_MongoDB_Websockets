import fs from "fs";
require("dotenv").config();

export default JSON.parse(
    fs.readFileSync(`settings-${process.env.APP_SETTINGS}.json`, "utf-8") ||
    "{}"
);