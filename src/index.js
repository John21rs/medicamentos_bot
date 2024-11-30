const { connect } = require("./connection");
const { load } = require("./loader");

async function start() {
  try {
    console.log("Iniciando meus componentes internos...");

    const socket = await connect();

    load(socket);
  } catch (error) {
    console.log(error);
  }
}

start();
