CREATE TABLE IF NOT EXISTS pessoas (
    pessoa_id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS filhos (
    filho_id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    pessoa_id INT,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(pessoa_id)
);

-- Teste das Tabelas
INSERT INTO pessoas (nome) VALUES ('José');

SET @pessoa_id = LAST_INSERT_ID();

INSERT INTO filhos (pessoa_id, nome) VALUES (@pessoa_id, 'José Filho');
