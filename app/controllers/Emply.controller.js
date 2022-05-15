
const fetch = require("node-fetch");
const API = process.env.Emply_api;
let handleQueryError = function (err) {
  return new Response(
    JSON.stringify({
      code: 400,
      message: "Network Error",
    })
  );
};

exports.RetrieveDepartments = async (req, res) => {
  // #swagger.tags = ['Emply intergration']
  // #swagger.description = 'Endpoint para obter um usuário.'
  let accessTokenReqOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  let response = await fetch(
    `https://api.emply.com/v1/dialogueone/departments?apiKey=${API}`,
    accessTokenReqOptions
  ).catch(handleQueryError);
  let data = await response.json();
  if (!response.ok) {
    res.status(400).json({ error: "something went wrong" });
  } else {
    res.send(data);
  }
};

exports.GetUUID = async (req, res) => {
  // #swagger.tags = ['Emply intergration']
  // #swagger.description = 'Endpoint para obter um usuário.'
  const UUID = req.params.UserUUID;
  let accessTokenReqOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  let response = await fetch(
    `https://api.emply.com/v1/dialogueone/users/uuid=${UUID}?apiKey=${API}`,
    accessTokenReqOptions
  ).catch(handleQueryError);
  let data = await response.json();
  if (!response.ok) {
    res.status(400).json({ error: "something went wrong" });
  } else {
    res.send(data);
  }
};

exports.GetMasterDataID = async (req, res) => {
  // #swagger.tags = ['Emply intergration']
  // #swagger.description = 'Endpoint para obter um usuário.'
  const masterDataID = 'a6b66138-7686-4f90-9357-caa0189f5fae'
  const UUID = req.params.EmplyUUID;
  let accessTokenReqOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  let response = await fetch(
    `https://api.emply.com/v1/dialogueone/employees/${UUID}/form-data/${masterDataID}?apiKey=${API}`,
    accessTokenReqOptions
  ).catch(handleQueryError);
  let data = await response.json();
  if (!response.ok) {
    res.status(400).json({ error: "something went wrong" });
  } else {
    res.send(data);
  }
};


exports.GetContactDataID = async (req, res) => {
  // #swagger.tags = ['Emply intergration']
  // #swagger.description = 'Endpoint para obter um usuário.'
  const contactFormID = '142e8990-b3a3-405b-bd7f-b6f52e95ede9'
  const UUID = req.params.EmplyUUID;
  let accessTokenReqOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  let response = await fetch(
    `https://api.emply.com/v1/dialogueone/form-data/${UUID}/4/${contactFormID}?apiKey=${API}`,
    accessTokenReqOptions
  ).catch(handleQueryError);
  let data = await response.json();
  if (!response.ok) {
    res.status(400).json({ error: "something went wrong" });
  } else {
    res.send(data);
  }
};

exports.GetUserByEmail = async (req, res) => {
  // #swagger.tags = ['Emply intergration']
  // #swagger.description = 'Endpoint para obter um usuário.'
  const Email = req.params.email;
  let accessTokenReqOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
    },
  };
  const url = `https://api.emply.com/v1/dialogueone/employees/find-by-name?email=${Email}&apiKey=${API}`
  let response = await fetch(
    encodeURI(url),
    accessTokenReqOptions
  ).catch(handleQueryError);
  let data;
  try {
    data = await response.json()
  } catch (error) {
    data = error
  }
  if (!response.ok) {
    res.status(400).json({ error: "something went wrong" });
  } else {
    res.send(data);
  }
};


exports.GetAllEmployees = async (req, res) => {
  // #swagger.tags = ['Emply intergration']
  // #swagger.description = 'Endpoint para obter um usuário.'
  let accessTokenReqOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
    },
  };
  const url = `https://api.emply.com/v1/dialogueone/employees?apiKey=${API}`
  let response = await fetch(
    encodeURI(url),
    accessTokenReqOptions
  ).catch(handleQueryError);
  let data;
  try {
    data = await response.json()
  } catch (error) {
    data = error
  }
  if (!response.ok) {
    res.status(400).json({ error: "something went wrong" });
  } else {
    res.send(data);
  }
}

exports.GetAllUsers = async (req, res) => {
  // #swagger.tags = ['Emply intergration']
  // #swagger.description = 'Endpoint para obter um usuário.'
  let accessTokenReqOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
    },
  };
  const url = `https://api.emply.com/v1/dialogueone/users?active=true&apiKey=${API}`
  let response = await fetch(
    encodeURI(url),
    accessTokenReqOptions
  ).catch(handleQueryError);
  let data;
  try {
    data = await response.json()
  } catch (error) {
    data = error
    console.log(error)
  }
  if (!response.ok) {
    res.status(400).json({ error: "something went wrong" });
  } else {
    res.send(data);
  }
}



exports.UpdateEmployeeData = async (req, res) => {
  // #swagger.tags = ['Emply intergration']
  // #swagger.description = 'Endpoint para obter um usuário.'
  const masterDataID = 'a6b66138-7686-4f90-9357-caa0189f5fae'
  const employeeID = req.params.EmplyUUID
  const body = req.body;

  let accessTokenReqOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json-patch+json",
    },
    body: JSON.stringify(req.body)
  };
  let response = await fetch(
    `https://api.emply.com/v1/dialogueone/employees/${employeeID}/form-data/${masterDataID}?apiKey=${API}`,
    accessTokenReqOptions
  ).catch(handleQueryError);
  res.send(await response);
};
