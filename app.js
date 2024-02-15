function initializeTable() {
  var jsonOutput = document.getElementById("jsonOutput");
  var jsonData = {
    pessoas: []
  };
  jsonOutput.value = JSON.stringify(jsonData, null, 2);
}

function createTable(name) {
  var table = document.getElementById("tableNames");
  newBody = document.createElement("tbody");
  var tbodyId = "tbody-" + Math.floor(Math.random() * 1000);
  newBody.setAttribute("id", tbodyId);
  table.appendChild(newBody);

  var row = newBody.insertRow();
  var cellName = row.insertCell(0);
  cellName.textContent = name;
  cellName.className = "cellName-class";

  var cellBotao0 = row.insertCell(1);
  var btnRemover = document.createElement("button");
  btnRemover.innerHTML = "Remover";
  btnRemover.className = "btn-remove";

  btnRemover.onclick = function () {
    deleteTbody(tbodyId);
  };
  cellBotao0.appendChild(btnRemover);

  buttonAdd(newBody);

  return { newBody, tbodyId, btnAddId: newBody.id };
}

function addName() {
  var name = document.getElementById("nameInput").value.trim();

  if (name.trim() !== "") {
    createTable(name);

    document.getElementById("nameInput").value = "";
    saveJson();
  }
}

function buttonAdd(tbody) {
  var row = tbody.insertRow();
  var cellBotao1 = row.insertCell(0);
  var btnAddSon = document.createElement("button");
  var btnAddId = "btnadd-" + Math.floor(Math.random() * 1000);
  btnAddSon.setAttribute("id", btnAddId);
  btnAddSon.innerHTML = "Adicionar Filho";
  btnAddSon.className = "btn-addSon";

  btnAddSon.onclick = function () {
    addChild(tbody, btnAddId);
  };
  cellBotao1.appendChild(btnAddSon);
}

function createChild(sonName, tbody, btnAddId) {
  var row = tbody.insertRow();

  var sonCell = row.insertCell(0);
  sonCell.textContent = sonName;
  sonCell.className = "sonName-class";
  var sonCellId = "sonCell-" + Math.floor(Math.random() * 1000);
  sonCell.setAttribute("id", sonCellId);

  var cellRemoveSon = row.insertCell(1);
  var btnRemoveSon = document.createElement("button");
  btnRemoveSon.innerHTML = "Remover Filho";
  btnRemoveSon.className = "btn-removeSon";

  saveJson();

  btnRemoveSon.onclick = function () {
    row.remove();
    saveJson();
  };
  cellRemoveSon.appendChild(btnRemoveSon);

  var elementoAntigo = document.getElementById(btnAddId);

  if (elementoAntigo) {
    var paiDoElemento = elementoAntigo.parentNode;

    var novaCelula = paiDoElemento.insertCell(1);
    novaCelula.appendChild(sonCell);

    var cellBotao2 = paiDoElemento.insertCell(2);
    buttonAdd(tbody, cellBotao2);

    paiDoElemento.removeChild(elementoAntigo);
  } else {
    console.error("Elemento antigo não encontrado com o ID:", btnAddId);
  }
}

function addChild(tbody, btnAddId) {
  var sonName = prompt("Digite o nome do filho:").trim();

  if (sonName.trim() !== "") {
    createChild(sonName, tbody, btnAddId);
  }
}

function deleteTbody(tbodyId) {
  var tbody = document.getElementById(tbodyId);

  if (tbody) {
    tbody.parentNode.removeChild(tbody);
  }
  saveJson();
}

function deleteAllTbodies() {
  var table = document.getElementById("tableNames");
  var tbodies = table.getElementsByTagName("tbody");

  for (var i = tbodies.length - 1; i >= 0; i--) {
    table.removeChild(tbodies[i]);
  }
  saveJson();
}

function saveJson() {
  var data = getTableData();
  var jsonOutput = document.getElementById("jsonOutput");
  var jsonData = {
    pessoas: data
  };
  jsonOutput.value = JSON.stringify(jsonData, null, 2);
}

function getTableData() {
  var table = document.getElementById("tableNames");
  var tbodyElements = table.getElementsByTagName("tbody");
  var data = [];

  for (var j = 0; j < tbodyElements.length; j++) {
    var rows = tbodyElements[j].getElementsByTagName("tr");
    var cells = rows[0].getElementsByClassName("cellName-class");

    if (cells.length > 0) {
      var name = cells[0].textContent.trim();

      if (name !== "") {
        var rowData = {
          nome: name,
          filhos: getChildData(tbodyElements[j])
        };
        data.push(rowData);
      }
    }
  }

  return data;
}

function getChildData(tbody) {
  var rows = tbody.getElementsByTagName("tr");
  var childs = [];

  for (var i = 0; i < rows.length; i++) {
    var cells = rows[i].getElementsByClassName("sonName-class");

    if (cells.length > 0) {
      var childName = cells[0].textContent.trim();

      if (childName !== "") {
        childs.push(childName);
      }
    }
  }

  return childs;
}

function sendJson() {
  var jsonText = document.getElementById('jsonOutput').value;

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://127.0.0.1:5000/post_json', true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        alert("Envio bem sucedido!");
      } else {
        alert("Erro no envio. Código de status: " + xhr.status);
      }
    }
  };

  xhr.send(jsonText);
}

function catchJson() {
  deleteAllTbodies();
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://127.0.0.1:5000/get_json', true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        alert("Recebimento bem sucedido!");
        var jsonResponse = JSON.parse(xhr.responseText);
        var jsonText = JSON.stringify(jsonResponse, null, 2);

        document.getElementById('jsonOutput').value = jsonText;
        displayJsonInTable(jsonResponse);
      } else {
        alert("Erro no recebimento. Código de status: " + xhr.status);
      }
    };

  }
  xhr.send();
}

function displayJsonInTable(jsonResponse) {

  for (var i = 0; i < jsonResponse.pessoas.length; i++) {
    var person = jsonResponse.pessoas[i];
    var { newBody, tbodyId, btnAddId } = createTable(person.nome);

    if (person.filhos && person.filhos.length > 0) {
      for (var j = 0; j < person.filhos.length; j++) {
        createChild(person.filhos[j], newBody);
      }
    }
  }
}

window.onload = initializeTable;