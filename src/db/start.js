const db = require("./db");
const readline = require("readline");
const moment = require("moment");
const horarioAtual = moment().format("HH:mm:ss");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function getInput(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function handleMenu(options, callbacks) {
  console.log(options);
  const choice = await getInput("Escolha uma opção: ");
  const callback = callbacks[choice];
  if (callback) {
    try {
      await callback();
    } catch (error) {
      console.error("Erro:", error.message);
    }
  } else {
    console.log("Opção inválida. Tente novamente.");
  }
}

async function listItems(fetchFunction, itemName, tamanho = false) {
  try {
    const items = await fetchFunction();
    if (tamanho) {
      return items.length;
    }
    if (items.length > 0) {
      console.table(items);
    } else {
      console.log(`Nenhum ${itemName} encontrado.`);
    }
  } catch (error) {
    console.error(`Erro ao listar ${itemName}:`, error.message);
  }
}

async function addItem(insertFunction, itemData) {
  try {
    await insertFunction(itemData);
    console.log("Item adicionado com sucesso!");
  } catch (error) {
    console.error("Erro ao adicionar item:", error.message);
  }
}

async function addItemWithValidation(insertFunction, itemData) {
  if (itemData.Data_Hora) {
    console.log(itemData.Data_Hora);
    if (!moment(itemData.Data_Hora, "HH:mm", true).isValid()) {
      console.error("Erro: hora inválida. Use o formato HH:mm.");
      return;
    }
  }

  try {
    await insertFunction(itemData);
    console.log("Item adicionado com sucesso!");
  } catch (error) {
    console.error("Erro ao adicionar item:", error.message);
  }
}

async function mainMenu() {
  const menu = `
Horário: ${horarioAtual}
=== Painel de Controle ===
1. Gerenciar Usuários
2. Gerenciar Medicamentos
3. Gerenciar Lembretes
4. Gerenciar Contatos
5. Sair
`;
  await handleMenu(menu, {
    1: userMenu,
    2: medicamentoMenu,
    3: lembreteMenu,
    4: contatoMenu,
    5: () => {
      console.log("Saindo...");
      rl.close();
      process.exit(0);
    },
  });
  await mainMenu();
}

// Menus específicos
async function userMenu() {
  const menu = `
=== Gerenciar Usuários ===
1. Listar Usuários
2. Adicionar Usuário
3. Atualizar Usuário
4. Remover Usuário
5. Voltar
`;
  await handleMenu(menu, {
    1: async () => {
      await listItems(db.selectUsuarios, "usuário");
      await userMenu();
    },
    2: async () => {
      const nome = await getInput("Nome: ");
      const idade = parseInt(await getInput("Idade: "));
      const telefone = await getInput(
        "Adicione como no exemplo tendo 13 dígitos: 5511999999999.\nTelefone: "
      );
      if (
        isNaN(idade) ||
        idade < 0 ||
        telefone.length !== 13 ||
        nome.length === 0
      ) {
        console.error("Erro: Dados inválidos.");
        return await userMenu();
      }
      await addItem(db.insertUsuario, {
        Nome: nome,
        Idade: idade,
        Telefone: telefone,
      });
      await userMenu();
    },
    3: async () => {
      if ((await db.selectUsuarios()) === 0) {
        console.error(`Não há usuários cadastrados.`);
        return await userMenu();
      }
      await listItems(db.selectUsuarios, "usuário");
      const id = parseInt(await getInput("ID do Usuário para atualizar: "));
      const usuario = await db.selectUsuarios_id(id);
      if (usuario === 0) {
        console.error(`Usuário com ID ${id} não encontrado.`);
        return await userMenu();
      }
      const nome = await getInput("Novo Nome: ");
      const idade = parseInt(await getInput("Nova Idade: "));
      const telefone = await getInput("Novo Telefone: ");
      await db.updateUsuario(id, {
        Nome: nome,
        Idade: idade,
        Telefone: telefone,
      });
      console.log("Usuário atualizado!");
      await userMenu();
    },
    4: async () => {
      if ((await db.selectUsuarios()) === 0) {
        console.error(`Não há usuários cadastrados.`);
        return await userMenu();
      }
      await listItems(db.selectUsuarios, "usuário");
      const id = parseInt(await getInput("ID do Usuário para remover: "));
      const usuario = await db.selectUsuarios_id(id);
      if (usuario === 0) {
        console.error(`Usuário com ID ${id} não encontrado.`);
        return await userMenu();
      }
      await db.deleteUsuario(id);
      console.log("Usuário removido!");
      await userMenu();
    },
    5: mainMenu,
  });
}

// Funções para outros menus seguem a mesma estrutura modular
async function medicamentoMenu() {
  const opcoes = ["comprimido", "líquido", "outro"];
  const frequencias = ["8/8h", "12/12h", "24/24h"];
  const menu = `
=== Gerenciar Medicamentos ===
1. Listar Medicamentos
2. Adicionar Medicamento
3. Atualizar Medicamento
4. Remover Medicamento
5. Voltar
`;
  await handleMenu(menu, {
    1: async () => {
      await listItems(db.selectMedicamentos, "medicamento");
      await medicamentoMenu();
    },
    2: async () => {
      const nome = await getInput("Nome: ");
      const dosagem = await getInput("Dosagem: ");
      const forma = await getInput(
        "Forma Farmacêutica: (comprimido, líquido ou outro) "
      );
      const frequencia = await getInput(
        "Frequencia de administração recomendada: (Ex: 8/8h, 12/12h, 24/24h) "
      );
      if (!frequencias.includes(frequencia)) {
        console.error("Erro: Frequência inválida. (Ex: 8/8h, 12/12h, 24/24h)");
        return await medicamentoMenu();
      }
      if (!opcoes.includes(forma)) {
        console.error(
          "Erro: Forma farmacêutica inválida. (comprimido, líquido ou outro)"
        );
        return await medicamentoMenu();
      }
      if (!isNaN(nome) || !isNaN(dosagem)) {
        console.error("Erro: Dados inválidos.");
        return await medicamentoMenu();
      }
      await addItem(db.insertMedicamento, {
        Nome: nome,
        Dosagem: dosagem,
        Forma_Farmaceutica: forma,
        Frequencia: frequencia,
      });
      await medicamentoMenu();
    },
    3: async () => {
      if ((await db.selectMedicamentos()) === 0) {
        console.error(`Não há medicamentos cadastrados.`);
        return await medicamentoMenu();
      }
      await listItems(db.selectMedicamentos, "medicamento");
      const id = parseInt(await getInput("ID do Medicamento para atualizar: "));
      const medicamento = await db.selectMedicamentos_id(id);
      if (medicamento === 0) {
        console.error(`Medicamento com ID ${id} não encontrado.`);
        return await medicamentoMenu();
      }
      const nome = await getInput("Novo Nome: ");
      const dosagem = await getInput("Nova Dosagem: ");
      const forma = await getInput("Nova Forma Farmacêutica: ");
      const frequencia = await getInput(
        "Frequencia de administração recomendada: (Ex: 8/8h, 12/12h, 24/24h) "
      );
      if (!frequencias.includes(frequencia)) {
        console.error("Erro: Frequência inválida. (Ex: 8/8h, 12/12h, 24/24h)");
        return await medicamentoMenu();
      }
      if (!opcoes.includes(forma)) {
        console.error(
          "Erro: Forma farmacêutica inválida. (comprimido, líquido ou outro)"
        );
        return await medicamentoMenu();
      }
      if (!isNaN(nome) || !isNaN(dosagem)) {
        console.error("Erro: Dados inválidos.");
        return await medicamentoMenu();
      }
      await db.updateMedicamento(id, {
        Nome: nome,
        Dosagem: dosagem,
        Forma_Farmaceutica: forma,
        Frequencia: frequencia,
      });
      console.log("Medicamento atualizado!");
      await medicamentoMenu();
    },
    4: async () => {
      if ((await db.selectMedicamentos()) === 0) {
        console.error(`Não há medicamentos cadastrados.`);
        return await lembreteMenu();
      }
      await listItems(db.selectMedicamentos, "medicamento");
      const id = parseInt(await getInput("ID do Medicamento para remover: "));
      const medicamento = await db.selectMedicamentos_id(id);
      if (medicamento === 0) {
        console.error(`Medicamento com ID ${id} não encontrado.`);
        return await medicamentoMenu();
      }
      await db.deleteMedicamento(id);
      console.log("Medicamento removido!");
      await medicamentoMenu();
    },
    5: mainMenu,
  });
}

async function lembreteMenu() {
  const status_lembrete = ["Pendente", "Concluído"];
  const menu = `
=== Gerenciar Lembretes ===
1. Listar Lembretes
2. Adicionar Lembrete
3. Atualizar Lembrete
4. Remover Lembrete
5. Voltar
`;
  await handleMenu(menu, {
    1: async () => {
      await listItems(db.selectLembretes, "lembrete");
      await lembreteMenu();
    },
    2: async () => {
      if ((await db.selectUsuarios()) === 0) {
        console.error(`Não há usuários cadastrados.`);
        return await lembreteMenu();
      }
      if ((await db.selectMedicamentos()) === 0) {
        console.error(`Não há medicamentos cadastrados.`);
        return await lembreteMenu();
      }
      await listItems(db.selectMedicamentos, "medicamento");
      console.log("\n");
      await listItems(db.selectUsuarios, "usuário");
      const idUsuario = parseInt(await getInput("ID do Usuário: "));
      const usuario = await db.selectUsuarios_id(idUsuario);
      if (usuario === 0) {
        console.error(`Usuário com ID ${idUsuario} não encontrado.`);
        return await lembreteMenu();
      }
      const idMedicamento = parseInt(await getInput("ID do Medicamento: "));
      const medicamento = await db.selectMedicamentos_id(idMedicamento);
      if (medicamento === 0) {
        console.error(`Medicamento com ID ${idMedicamento} não encontrado.`);
        return await lembreteMenu();
      }
      const dataHora = await getInput("Hora (HH:MM): ");
      await addItemWithValidation(db.insertLembrete, {
        ID_Usuario: idUsuario,
        ID_Medicamento: idMedicamento,
        Data_Hora: moment(dataHora, "HH:mm", true).format("HH:mm"),
        Status: "Pendente",
      });
      await lembreteMenu();
    },
    3: async () => {
      if ((await db.selectUsuarios()) === 0) {
        console.error(`Não há usuários cadastrados.`);
        return await lembreteMenu();
      }
      if ((await db.selectMedicamentos()) === 0) {
        console.error(`Não há usuários cadastrados.`);
        return await lembreteMenu();
      }
      if ((await db.selectLembretes()) === 0) {
        console.error(`Não há usuários cadastrados.`);
        return await lembreteMenu();
      }
      await listItems(db.selectLembretes, "lembrete");
      console.log("\n");
      await listItems(db.selectUsuarios, "usuário");
      console.log("\n");
      await listItems(db.selectMedicamentos, "medicamento");
      console.log("\n");
      const id = parseInt(await getInput("ID do Lembrete para atualizar: "));
      const lembrete = await db.selectLembretes_id(id);
      if (lembrete === 0) {
        console.error(`Lembrete com ID ${id} não encontrado.`);
        return await lembreteMenu();
      }
      const idUsuario = parseInt(await getInput("ID do Usuário: "));
      const usuario = await db.selectUsuarios_id(idUsuario);
      if (usuario === 0) {
        console.error(`Usuário com ID ${idUsuario} não encontrado.`);
        return await lembreteMenu();
      }
      const idMedicamento = parseInt(await getInput("ID do Medicamento: "));
      const medicamento = await db.selectMedicamentos_id(idMedicamento);
      if (medicamento === 0) {
        console.error(`Medicamento com ID ${idMedicamento} não encontrado.`);
        return await lembreteMenu();
      }
      const dataHora = await getInput("Hora (HH:MM): ");
      if (!moment(dataHora, "HH:mm", true).isValid()) {
        console.error("Erro: Data e hora inválidas. Use o formato HH:mm.");
        return await lembreteMenu();
      }
      const status = await getInput("Novo Status ('Pendente', 'Concluído'): ");
      if (!status_lembrete.includes(status)) {
        console.error("Erro: Status inválido. ('Pendente', 'Concluído')");
        return await lembreteMenu();
      }
      await db.updateLembrete(id, {
        ID_Usuario: idUsuario,
        ID_Medicamento: idMedicamento,
        Data_Hora: dataHora,
        Status: status,
      });
      console.log("Lembrete atualizado!");
      await lembreteMenu();
    },
    4: async () => {
      if ((await db.selectLembretes()) === 0) {
        console.error(`Não há usuários cadastrados.`);
        return await lembreteMenu();
      }
      const id = parseInt(await getInput("ID do Lembrete para remover: "));
      const lembrete = await db.selectLembretes_id(id);
      if (lembrete === 0) {
        console.error(`Lembrete com ID ${id} não encontrado.`);
        return await lembreteMenu();
      }
      await db.deleteLembrete(id);
      console.log("Lembrete removido!");
      await lembreteMenu();
    },
    5: mainMenu,
  });
}

async function contatoMenu() {
  const relacoes = ["Família", "Amigo", "Outro"];
  const menu = `
=== Gerenciar Contatos ===
1. Listar Contatos
2. Adicionar Contato
3. Atualizar Contato
4. Remover Contato
5. Voltar
`;
  await handleMenu(menu, {
    1: async () => {
      await listItems(db.selectContatos, "contato");
      await contatoMenu();
    },
    2: async () => {
      await listItems(db.selectUsuarios, "usuário");
      const nome = await getInput("Nome: ");
      const telefone = await getInput("Telefone: (13 dígitos) ");
      if (telefone.length !== 13) {
        console.error("Erro: Número de telefone inválido.");
        return await contatoMenu();
      }
      const relacao = await getInput("Relação (Ex: Família, Amigo ou outro): ");
      if (!relacoes.includes(relacao)) {
        console.error("Erro: Relação inválida. (Ex: Família, Amigo ou outro)");
        return await contatoMenu();
      }
      const idUsuario = parseInt(await getInput("ID do Usuário: "));
      const usuario = await db.selectUsuarios_id(idUsuario);
      if (usuario === 0) {
        console.error(`Usuário com ID ${idUsuario} não encontrado.`);
        return await contatoMenu();
      }
      await addItem(db.insertContato, {
        Nome: nome,
        Telefone: telefone,
        Relacao: relacao,
        ID_Usuario: idUsuario,
      });
      await contatoMenu();
    },
    3: async () => {
      const validar = await db.selectContatos();
      if (validar === 0) {
        console.error(`Contatos vazio.`);
        return await contatoMenu();
      }
      await listItems(db.selectUsuarios, "usuário");
      console.log("\n");
      await listItems(db.selectContatos, "contato");
      console.log("\n");
      const id = parseInt(await getInput("ID do Contato para atualizar: "));
      const contato = await db.selectContatos_id(id);
      if (contato === 0) {
        console.error(`Contato com ID ${id} não encontrado.`);
        return await contatoMenu();
      }
      const idUsuario = parseInt(await getInput("Novo ID do Usuário: "));
      const usuario = await db.selectUsuarios_id(idUsuario);
      if (usuario === 0) {
        console.error(`Usuário com ID ${idUsuario} não encontrado.`);
        return await contatoMenu();
      }
      const nome = await getInput("Novo Nome: ");
      const telefone = await getInput("Novo Telefone: ");
      if (telefone.length !== 13) {
        console.error("Erro: Número de telefone inválido.");
        return await contatoMenu();
      }
      const relacao = await getInput(
        "Nova Relação: (família, amigo ou outro) "
      );
      if (!relacoes.includes(relacao)) {
        console.error("Erro: Relação inválida. (Ex: Família, Amigo ou outro)");
        return await contatoMenu();
      }
      await db.updateContato(id, {
        ID_Usuario: idUsuario,
        Nome: nome,
        Telefone: telefone,
        Relacao: relacao,
      });
      console.log("Contato atualizado!");
      await contatoMenu();
    },
    4: async () => {
      const validar = await db.selectContatos();
      if (validar === 0) {
        console.error(`Contatos vazio.`);
        return await contatoMenu();
      }
      const id = parseInt(await getInput("ID do Contato para remover: "));
      const contato = await db.selectContatos_id(id);
      if (contato === 0) {
        console.error(`Contato com ID ${id} não encontrado.`);
        return await contatoMenu();
      }
      await db.deleteContato(id);
      console.log("Contato removido!");
      await contatoMenu();
    },
    5: mainMenu,
  });
}

// Inicia o programa
mainMenu();
