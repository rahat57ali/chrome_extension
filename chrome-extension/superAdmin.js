document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.querySelector('#usersTable tbody');

  const { token } = await chrome.storage.local.get(['token']);
  if (!token) return alert('No token found.');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const users = await fetch('http://localhost:5000/api/admin/users', { headers })
    .then(res => res.json());

  users.forEach(user => {
    const tr = document.createElement('tr');

    const emailCell = document.createElement('td');
    emailCell.textContent = user.email;

    const roleCell = document.createElement('td');
    roleCell.textContent = user.role;

    const changeRoleCell = document.createElement('td');
    const roleSelect = document.createElement('select');
    ['user', 'admin', 'superadmin'].forEach(role => {
      const option = document.createElement('option');
      option.value = role;
      option.text = role;
      if (role === user.role) option.selected = true;
      roleSelect.appendChild(option);
    });

    roleSelect.addEventListener('change', async () => {
      await fetch(`http://localhost:5000/api/admin/users/${user.id}/role`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role: roleSelect.value })
      });
      alert('Role updated.');
    });
    changeRoleCell.appendChild(roleSelect);

    const deleteCell = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = async () => {
      if (!confirm('Are you sure?')) return;
      await fetch(`http://localhost:5000/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers
      });
      tr.remove();
    };
    deleteCell.appendChild(delBtn);

    tr.append(emailCell, roleCell, changeRoleCell, deleteCell);
    tableBody.appendChild(tr);
  });
});
