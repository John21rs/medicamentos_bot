-- Criação do banco de dados
DROP DATABASE ControleMedicamentos;
CREATE DATABASE ControleMedicamentos;
USE ControleMedicamentos;

-- Criação da tabela de Usuários
CREATE TABLE Usuarios (
    ID_Usuario INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Idade INT NOT NULL,
    Telefone VARCHAR(15) NOT NULL UNIQUE,
    Data_Cadastro DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE Usuarios AUTO_INCREMENT = 1;

-- Criação da tabela de Medicamentos
CREATE TABLE Medicamentos (
    ID_Medicamento INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL UNIQUE,
    Dosagem VARCHAR(50) NOT NULL,
    Forma_Farmaceutica VARCHAR(50) NOT NULL,     -- Forma farmacêutica, como comprimido, líquido, etc.
    Frequencia VARCHAR(20) NOT NULL,
    Data_Cadastro DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL  -- Data de cadastro do medicamento
);
ALTER TABLE Medicamentos AUTO_INCREMENT = 1;

-- Criação da tabela de Lembretes
CREATE TABLE Lembretes (
    ID_Lembrete INT AUTO_INCREMENT PRIMARY KEY,
    ID_Usuario INT NOT NULL,
    ID_Medicamento INT NOT NULL,
    Data_Hora TIME NOT NULL,
    Status ENUM('Pendente', 'Concluído') DEFAULT 'Pendente',  -- Status do lembrete
    FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_Usuario) ON DELETE CASCADE,
    FOREIGN KEY (ID_Medicamento) REFERENCES Medicamentos(ID_Medicamento) ON DELETE CASCADE
);
ALTER TABLE Lembretes AUTO_INCREMENT = 1;

-- Criação da tabela de Contatos
CREATE TABLE Contatos (
    ID_Contato INT AUTO_INCREMENT PRIMARY KEY,
    ID_Usuario INT NOT NULL,
    Nome VARCHAR(100) NOT NULL,
    Telefone VARCHAR(15) NOT NULL,
    Relacao ENUM('Familia', 'Amigo', 'Outro') DEFAULT 'Outro',  -- Tipo de relação com o usuário
    FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_Usuario) ON DELETE CASCADE
);
ALTER TABLE Contatos AUTO_INCREMENT = 1;