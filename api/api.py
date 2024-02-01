# type: ignore
import json
import os

import dotenv
import mysql.connector
from flask import Flask, Response, request
from flask_cors import CORS


class DatabaseInitializer:
    def __init__(self):
        dotenv.load_dotenv()

        self.mydb = mysql.connector.connect(
            host=os.environ['MYSQL_HOST'],
            user=os.environ['MYSQL_USER'],
            password=os.environ['MYSQL_PASSWORD'],
            database=os.environ['MYSQL_DATABASE'],
        )

    def create_tables(self):
        cursor = self.mydb.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS pessoas (
                pessoa_id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS filhos (
                filho_id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                pessoa_id INT,
                FOREIGN KEY (pessoa_id) REFERENCES pessoas(pessoa_id)
            )
        """)
        self.mydb.commit()
        cursor.close()


class DatabaseManager:
    def __init__(self):
        dotenv.load_dotenv()

        self.mydb = mysql.connector.connect(
            host=os.environ['MYSQL_HOST'],
            user=os.environ['MYSQL_USER'],
            password=os.environ['MYSQL_PASSWORD'],
            database=os.environ['MYSQL_DATABASE'],
        )

    def insert_person(self, cursor, person_data):
        cursor.execute("INSERT INTO pessoas (nome) VALUES (%s)",
                       (person_data['nome'],))
        self.mydb.commit()
        return cursor.lastrowid

    def insert_child(self, cursor, child_data, pessoa_id):
        cursor.execute(
            "INSERT INTO filhos (nome, pessoa_id) VALUES (%s, %s)",
            (child_data,
             pessoa_id))

        self.mydb.commit()

    def delete_data(self, cursor):
        cursor.execute("DELETE FROM filhos")
        cursor.execute("DELETE FROM pessoas")
        self.mydb.commit()

    def get_people_data(self, cursor):
        cursor.execute("SELECT * FROM pessoas ORDER BY pessoa_id")
        return cursor.fetchall()


class App:
    def __init__(self, db_manager):
        self.app = Flask(__name__)
        CORS(self.app)
        self.db_manager = db_manager

        @self.app.route('/post_json', methods=['POST'])
        def post_json():
            json_data_str = request.get_data(as_text=True)

            print('Dados brutos recebidos:', json_data_str)

            try:
                json_data = json.loads(json_data_str)
                print('JSON Recebido:', json_data)

                cursor = self.db_manager.mydb.cursor()

                if json_data == {'pessoas': []}:
                    self.db_manager.delete_data(cursor)
                    return 'Banco de dados apagado com sucesso!'

                self.db_manager.delete_data(cursor)

                for person_data in json_data.get('pessoas', []):
                    pessoa_id = self.db_manager.insert_person(
                        cursor, person_data)

                    for filho_nome in person_data.get('filhos', []):
                        self.db_manager.insert_child(
                            cursor, filho_nome, pessoa_id)

                cursor.close()

                return 'JSON Recebido com sucesso!'

            except json.JSONDecodeError as e:
                print('Erro ao decodificar JSON:', e)
                return 'Erro ao decodificar JSON', 400

        @self.app.route("/get_json", methods=["GET"])
        def get_json():
            cursor = self.db_manager.mydb.cursor(dictionary=True)

            pessoas_data = self.db_manager.get_people_data(cursor)

            data = {'pessoas': []}

            for pessoa in pessoas_data:
                cursor.execute(
                    "SELECT nome FROM filhos WHERE pessoa_id = %s",
                    (pessoa
                     ['pessoa_id'],))

                filhos_data = cursor.fetchall()
                filhos = [filho['nome'] for filho in filhos_data]

                pessoa_info = {'nome': pessoa['nome'], 'filhos': filhos}
                data['pessoas'].append(pessoa_info)

            cursor.close()

            json_data = json.dumps(data, sort_keys=False)
            response = Response(json_data, content_type='application/json')

            return response

        if __name__ == '__main__':
            self.app.run()


if __name__ == '__main__':
    initializer = DatabaseInitializer()
    initializer.create_tables()
    db_manager = DatabaseManager()
    app = App(db_manager)
