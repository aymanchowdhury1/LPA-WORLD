let db = JSON.parse(localStorage.getItem('lpa_db')) || { users: {}, items: {}, columns: {} };

window.onload = function() {
    renderUserList();
    let user = localStorage.getItem('currentUser');
    if (user && document.getElementById('auth-links')) {
        document.getElementById('auth-links').innerHTML = `<span>Welcome, ${user}</span> <button onclick="logout()">Logout</button>`;
        document.getElementById('controls').classList.remove('hidden');
        renderInventory(user);
    }
};

function renderInventory(nick) {
    let tbody = document.getElementById('tableBody');
    let headerRow = document.getElementById('headerRow');
    let items = db.items[nick] || [];
    let cols = db.columns[nick] || ['Name', 'Image', 'Desc', 'Qty', 'Loc', 'Price'];

    headerRow.innerHTML = cols.map(c => `<th>${c}</th>`).join('') + '<th>Actions</th>';
    tbody.innerHTML = items.map((item, i) => `
        <tr>
            ${cols.map(c => (c.toLowerCase() === 'image') ? `<td><img src="${item[c]}" width="50" height="50" style="object-fit:cover;" onerror="this.src='https://via.placeholder.com/50'"></td>` : `<td>${item[c] || ''}</td>`).join('')}
            <td><button onclick="openModal(${i})">Edit</button> <button onclick="deleteItem('${nick}', ${i})">Delete</button></td>
        </tr>
    `).join('');
}

function renderUserList() {
    let list = document.getElementById('userList');
    if (list) list.innerHTML = Object.keys(db.users).map(u => `<div class="user-item" onclick="renderInventory('${u}')">👤 ${u}</div>`).join('');
}

function filterTable() {
    let filter = document.getElementById('searchBox').value.toLowerCase();
    let rows = document.getElementById('tableBody').getElementsByTagName('tr');
    Array.from(rows).forEach(row => row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none");
}

function saveItem() {
    let nick = localStorage.getItem('currentUser');
    let idx = parseInt(document.getElementById('editIndex').value);
    let item = {};
    db.columns[nick].forEach(c => item[c] = document.getElementById('inp-' + c).value);
    if (idx === -1) db.items[nick].push(item); else db.items[nick][idx] = item;
    localStorage.setItem('lpa_db', JSON.stringify(db));
    document.getElementById('itemModal').classList.add('hidden');
    renderInventory(nick);
}

function openModal(index = -1) {
    let nick = localStorage.getItem('currentUser');
    if (!nick) return alert("Login first");
    let container = document.getElementById('modalInputs'); container.innerHTML = '';
    db.columns[nick].forEach(c => {
        let val = (index !== -1) ? (db.items[nick][index][c] || '') : '';
        container.innerHTML += `<label>${c}</label><input id="inp-${c}" value="${val}">`;
    });
    document.getElementById('editIndex').value = index;
    document.getElementById('itemModal').classList.remove('hidden');
}

function addColumn() {
    let nick = localStorage.getItem('currentUser');
    let col = prompt("New Column Name:");
    if (col && !db.columns[nick].includes(col)) {
        db.columns[nick].push(col);
        localStorage.setItem('lpa_db', JSON.stringify(db));
        renderInventory(nick);
    }
}

function deleteItem(nick, idx) {
    if (confirm("Delete this item?")) {
        db.items[nick].splice(idx, 1);
        localStorage.setItem('lpa_db', JSON.stringify(db));
        renderInventory(nick);
    }
}

function register() {
    let nick = document.getElementById('r-nick').value;
    db.users[nick] = { pass: document.getElementById('r-pass').value };
    db.items[nick] = [];
    db.columns[nick] = ['Name', 'Image', 'Desc', 'Qty', 'Loc', 'Price'];
    localStorage.setItem('lpa_db', JSON.stringify(db));
    window.location.href = 'login.html';
}

function login() {
    let nick = document.getElementById('l-nick').value;
    if(db.users[nick] && db.users[nick].pass === document.getElementById('l-pass').value) {
        localStorage.setItem('currentUser', nick);
        window.location.href = 'index.html';
    } else alert("Invalid");
}

function logout() { localStorage.removeItem('currentUser'); window.location.href = 'index.html'; }