const path = require("path");
const { question, onlyNumbers } = require("./utils");
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidStatusBroadcast,
  proto,
  makeInMemoryStore,
  isJidNewsletter,
} = require("baileys");
const NodeCache = require("node-cache");
const pino = require("pino");
const { load } = require("./loader");

const msgRetryCounterCache = new NodeCache();

const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

async function getMessage(key) {
  if (!store) {
    return proto.Message.fromObject({});
  }

  const msg = await store.loadMessage(key.remoteJid, key.id);

  return msg ? msg.message : undefined;
}

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve(__dirname, "..", "assets", "auth", "baileys")
  );

  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    logger: pino({ level: "error" }),
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 60 * 1000,
    auth: state,
    shouldIgnoreJid: (jid) =>
      isJidBroadcast(jid) || isJidStatusBroadcast(jid) || isJidNewsletter(jid),
    keepAliveIntervalMs: 60 * 1000,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    shouldSyncHistoryMessage: () => false,
    getMessage,
  });

  if (!socket.authState.creds.registered) {
    console.error("Credenciais ainda não configuradas!");

    console.log('Informe o seu número de telefone (exemplo: "5511920202020"):');

    const phoneNumber = await question("Informe o seu número de telefone: ");

    if (!phoneNumber) {
      console.error(
        'Número de telefone inválido! Tente novamente com o comando "npm start".'
      );

      process.exit(1);
    }

    const code = await socket.requestPairingCode(onlyNumbers(phoneNumber));

    console.log(`Código de pareamento: ${code}`);
  }

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (statusCode === DisconnectReason.loggedOut) {
        console.error("Bot desconectado!");
      } else {
        switch (statusCode) {
          case DisconnectReason.badSession:
            console.warn("Sessão inválida!");
            break;
          case DisconnectReason.connectionClosed:
            console.warn("Conexão fechada!");
            break;
          case DisconnectReason.connectionLost:
            console.warn("Conexão perdida!");
            break;
          case DisconnectReason.connectionReplaced:
            console.warn("Conexão substituída!");
            break;
          case DisconnectReason.multideviceMismatch:
            console.warn("Dispositivo incompatível!");
            break;
          case DisconnectReason.forbidden:
            console.warn("Conexão proibida!");
            break;
          case DisconnectReason.restartRequired:
            console.log('Me reinicie por favor! Digite "npm start".');
            break;
          case DisconnectReason.unavailableService:
            console.warn("Serviço indisponível!");
            break;
        }

        const newSocket = await connect();
        load(newSocket);
      }
    } else if (connection === "open") {
      console.log("Fui conectado com sucesso!");
    } else {
      console.log("Atualizando conexão...");
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

exports.connect = connect;
