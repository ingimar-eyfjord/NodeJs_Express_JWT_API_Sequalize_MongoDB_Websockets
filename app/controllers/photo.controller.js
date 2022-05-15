import axios from "axios";


const { sequelize } = require("../models/index.js");
const db = require("../models/index.js");
const Photos = db.photo;

const Op = db.Sequelize.Op;

const http = axios.create({
  baseURL: "https://graph.microsoft.com/v1.0",
  headers: {
    "Content-type": "application/json",
  },
});


export async function GetProfilePhoto(req, res) {
  // #swagger.tags = ["Photos"]
  // #swagger.description = 'Endpoint para obter um usuário.'
  const uuid = req.params.UserUUID 
  var condition = uuid ? { User_UUID: { [Op.like]: `%${uuid}%` } } : null;
  try {
    var photo = await Photos.findAll({ where: condition })
    res.send(photo)
  } catch (e) {
    console.log(e)
    res.status(400).send({ message: "Something went wrong when retrieving photo", data_row: null })
  }
}

export async function CreateProfilePhoto(req, res) {
  // #swagger.tags = ["Photos"]
  // #swagger.description = 'Endpoint para obter um usuário.'
  const uuid = req.body.uuid;
  const email = req.body.email;
  const base64ImgData = req.body.base64ImgData;


  // if not in db, request to graph api


  try {

    const record = {
      User_UUID: uuid,
      Email: email,
      Profile_Photo: base64ImgData,
    }

    //save to database
    const photoData = await Photos.create(record);

    res.status(200).send({ message: "Photo created!", data: photoData })

  } catch (e) {
    console.log(e)

    res.status(400).send({ message: "Server error" })

  }

}


export async function UpdateToLatestPhoto(req, res) {
  // #swagger.tags = ["Photos"]
  // #swagger.description = 'Endpoint para obter um usuário.'

  const uuid = req.params.UserUUID;
  const base64img = req.body.photo_data;

  try {

    const record = {
      Profile_Photo: base64img,
    }

    console.log("HELLOOOOOO")
 
    //save to database
    const photoData = await Photos.update(record, {
      where: { User_UUID: uuid },
    });


    res.status(200).send({ message: "Photo updated", data: photoData })

  } catch (e) {

    res.status(400).send({ message: "Something went wrong." })
  }

}