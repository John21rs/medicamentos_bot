const db = require("./db/db");

// Função para enviar mensagem aos contatos relacionados a um usuário
async function enviarMensagemParaContatos(usuarioId, mensagem) {
  try {
    const contatos = await db.selectContatos();
    const contatosRelacionados = contatos.filter(
      (contato) => contato.ID_Usuario === usuarioId
    );

    for (const contato of contatosRelacionados) {
      const numeroContato = contato.Telefone;
      await socket.sendMessage(`${numeroContato}@s.whatsapp.net`, {
        text: mensagem,
      });
    }
  } catch (error) {
    console.error("Erro ao enviar mensagem para os contatos:", error);
  }
}

exports.load = (socket) => {
  socket.ev.on("messages.upsert", async ({ messages }) => {
    var remoteJid = messages[0]?.key?.remoteJid;
    var conversation = messages[0]?.message?.conversation;

    if (conversation === "Testando") {
      await socket.sendMessage(remoteJid, { text: `Testando` });
    }

    try {
      // Buscar todos os lembretes pendentes
      const lembretes = await db.selectLembretes();
      for (const lembrete of lembretes) {
        if (lembrete.Status === "Pendente") {
          const usuarioId = lembrete.ID_Usuario;
          lembrete.Status = "Em Espera";
          await db.updateLembrete(lembrete.ID_Usuario, lembrete);
          // Buscar o usuário e seu número de telefone
          const usuarios = await db.selectUsuarios_id(usuarioId);
          console.log(usuarios);
          if (usuarios.length > 0) {
            const usuario = usuarios[0];
            const telefone = usuario.Telefone;

            // Enviar mensagem solicitando confirmação
            const mensagem = `Você tomou o medicamento ${lembrete.ID_Medicamento}? Responda 'sim' para confirmar.`;
            await socket.sendMessage(`${telefone}@s.whatsapp.net`, {
              text: mensagem,
            });

            // Esperar até 10 minutos pela resposta
            const timeout = 10 * 60 * 1000;
            const start = Date.now();

            const esperaResposta = new Promise((resolve) => {
              socket.ev.on("messages.upsert", ({ messages }) => {
                const resposta = messages[0]?.message?.conversation;
                if (
                  messages[0]?.key?.remoteJid === telefone &&
                  resposta.toLowerCase() === "sim"
                ) {
                  async () => {
                    lembrete.Status = "Concluído";
                    await db.updateLembrete(lembrete.ID_Usuario, lembrete);
                  };
                  resolve(true);
                }
                if (Date.now() - start > timeout) {
                  resolve(false);
                }
              });
            });

            const respostaRecebida = await esperaResposta;

            if (!respostaRecebida) {
              // Caso o usuário não tenha respondido, encaminhar para todos os seus contatos
              const mensagemContatos = `O usuário não confirmou que tomou o medicamento ${lembrete.ID_Medicamento}.`;
              await enviarMensagemParaContatos(usuarioId, mensagemContatos);
            }
          }
        }
      }
    } catch (error) {
      console.error("Erro ao processar lembretes:", error);
    }
  });
};
