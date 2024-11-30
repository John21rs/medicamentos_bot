const mysql = require("mysql2/promise");

// Função para conectar ao banco
async function connect() {
  if (global.connection && global.connection.state !== "disconnected")
    return global.connection;

  const connection = await mysql.createConnection(
    "mysql://root:210104Jv!@localhost:3306/controlemedicamentos"
  );
  global.connection = connection;
  return connection;
}

// Funções para tabela `Usuarios`
async function selectUsuarios() {
  try {
    const conn = await connect();
    const [rows] = await conn.query("SELECT * FROM Usuarios");
    if (rows.length === 0) {
      return 0;
    }
    return rows;
  } catch (error) {
    throw new Error("Não foi possível buscar os usuários.");
  }
}

async function selectUsuarios_id(id) {
  try {
    const conn = await connect();
    const [rows] = await conn.query(
      "SELECT * FROM Usuarios WHERE ID_Usuario = ?",
      [id]
    );
    if (rows.length === 0) {
      return 0;
    }
    return rows;
  } catch (error) {
    throw new Error("Não foi possível buscar os usuários. " + error.message);
  }
}

async function insertUsuario(usuario) {
  const conn = await connect();
  const sql = "INSERT INTO Usuarios (Nome, Idade, Telefone) VALUES (?, ?, ?);";
  const values = [usuario.Nome, usuario.Idade, usuario.Telefone];
  return await conn.query(sql, values);
}

async function updateUsuario(id, usuario) {
  const conn = await connect();
  const sql =
    "UPDATE Usuarios SET Nome=?, Idade=?, Telefone=? WHERE ID_Usuario=?";
  const values = [usuario.Nome, usuario.Idade, usuario.Telefone, id];
  return await conn.query(sql, values);
}

async function deleteUsuario(id) {
  const conn = await connect();
  const sql = "DELETE FROM Usuarios WHERE ID_Usuario=?;";
  return await conn.query(sql, [id]);
}

// Funções para tabela `Medicamentos`
async function selectMedicamentos() {
  const conn = await connect();
  const [rows] = await conn.query("SELECT * FROM Medicamentos");
  if (rows.length === 0) {
    return 0;
  }
  return rows;
}

async function selectMedicamentos_id(id) {
  try {
    const conn = await connect();
    const [rows] = await conn.query(
      "SELECT * FROM Medicamentos WHERE ID_Medicamento = ?",
      [id]
    );
    if (rows.length === 0) {
      return 0;
    }
    return rows;
  } catch (error) {
    throw new Error(
      "Não foi possível buscar os medicamentos. " + error.message
    );
  }
}

async function insertMedicamento(medicamento) {
  const conn = await connect();
  const sql = `INSERT INTO Medicamentos (Nome, Dosagem, Forma_Farmaceutica, Frequencia)
               VALUES (?, ?, ?, ?);`;
  const values = [
    medicamento.Nome,
    medicamento.Dosagem,
    medicamento.Forma_Farmaceutica,
    medicamento.Frequencia,
  ];
  return await conn.query(sql, values);
}

async function updateMedicamento(id, medicamento) {
  const conn = await connect();
  const sql = `UPDATE Medicamentos 
               SET Nome=?, Dosagem=?, Forma_Farmaceutica=?, Frequencia=?
               WHERE ID_Medicamento=?`;
  const values = [
    medicamento.Nome,
    medicamento.Dosagem,
    medicamento.Forma_Farmaceutica,
    medicamento.Frequencia,
    id,
  ];
  return await conn.query(sql, values);
}

async function deleteMedicamento(id) {
  const conn = await connect();
  const sql = "DELETE FROM Medicamentos WHERE ID_Medicamento=?;";
  return await conn.query(sql, [id]);
}

// Funções para tabela `Lembretes`
async function selectLembretes() {
  const conn = await connect();
  const [rows] = await conn.query("SELECT * FROM Lembretes LIMIT 0, 1000");
  if (rows.length === 0) {
    return 0;
  }
  return rows;
}

async function selectLembretes_id(id) {
  try {
    const conn = await connect();
    const [rows] = await conn.query(
      "SELECT * FROM Lembretes WHERE ID_Lembrete = ?",
      [id]
    );
    if (rows.length === 0) {
      return 0;
    }
    return rows;
  } catch (error) {
    throw new Error("Não foi possível buscar os lembretes. " + error.message);
  }
}

async function insertLembrete(lembrete) {
  const conn = await connect();
  const sql = `INSERT INTO Lembretes (ID_Usuario, ID_Medicamento, Data_Hora, Status) 
               VALUES (?, ?, ?, ?);`;
  const values = [
    lembrete.ID_Usuario,
    lembrete.ID_Medicamento,
    lembrete.Data_Hora,
    lembrete.Status,
  ];
  return await conn.query(sql, values);
}

async function updateLembrete(id, lembrete) {
  const conn = await connect();
  const sql = `UPDATE Lembretes 
               SET ID_Usuario=?, ID_Medicamento=?, Data_Hora=?, Status=? 
               WHERE ID_Lembrete=?`;
  const values = [
    lembrete.ID_Usuario,
    lembrete.ID_Medicamento,
    lembrete.Data_Hora,
    lembrete.Status,
    id,
  ];
  return await conn.query(sql, values);
}

async function deleteLembrete(id) {
  const conn = await connect();
  const sql = "DELETE FROM Lembretes WHERE ID_Lembrete=?;";
  return await conn.query(sql, [id]);
}

// Funções para tabela `Contatos`
async function selectContatos() {
  const conn = await connect();
  const [rows] = await conn.query("SELECT * FROM Contatos");
  if (rows.length === 0) {
    return 0;
  }
  return rows;
}

async function selectContatos_id(id) {
  try {
    const conn = await connect();
    const [rows] = await conn.query(
      "SELECT * FROM Contatos WHERE ID_Contato = ?",
      [id]
    );
    if (rows.length === 0) {
      return 0;
    }
    return rows;
  } catch (error) {
    throw new Error("Não foi possível buscar os contatos. " + error.message);
  }
}

async function insertContato(contato) {
  const conn = await connect();
  const sql = `INSERT INTO Contatos (Nome, Telefone, Relacao, ID_Usuario)
               VALUES (?, ?, ?, ?);`;
  const values = [
    contato.Nome,
    contato.Telefone,
    contato.Relacao,
    contato.ID_Usuario,
  ];
  return await conn.query(sql, values);
}

async function updateContato(id, contato) {
  const conn = await connect();
  const sql = `UPDATE Contatos 
               SET ID_Usuario=?, Nome=?, Telefone=?, Relacao=? 
               WHERE ID_Contato=?;`;
  const values = [
    contato.ID_Usuario,
    contato.Nome,
    contato.Telefone,
    contato.Relacao,
    id,
  ];
  return await conn.query(sql, values);
}

async function deleteContato(id) {
  const conn = await connect();
  const sql = "DELETE FROM Contatos WHERE ID_Contato=?;";
  return await conn.query(sql, [id]);
}

module.exports = {
  connect,
  selectUsuarios,
  selectUsuarios_id,
  insertUsuario,
  updateUsuario,
  deleteUsuario,
  selectMedicamentos,
  selectMedicamentos_id,
  insertMedicamento,
  updateMedicamento,
  deleteMedicamento,
  selectLembretes,
  selectLembretes_id,
  insertLembrete,
  updateLembrete,
  deleteLembrete,
  selectContatos,
  selectContatos_id,
  insertContato,
  updateContato,
  deleteContato,
};
