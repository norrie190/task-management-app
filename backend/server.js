require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcryptjs = require('bcryptjs');
const cors = require('cors');
const app = express();
app.use(express.json());

const { loginUser } = require('./auth');

const db = new sqlite3.Database('./taskmanagement.db', (err) => {
  if (err) console.error('Error opening database:', err.message);
  else console.log('Connected to SQLite DB.');
});

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  bcryptjs.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: err.message });

    db.run(
      `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hashedPassword],
      function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ message: 'User registered', userId: this.lastID });
      }
    );
  });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  try {
    const { user, token } = await loginUser(email, password);
    res.status(200).json({ user, token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(401).json({ error: err.message });
  }
});

app.get('/user/profile', (req, res) => {
  res.send('Welcome to your profile');
});

app.get('/admin/dashboard', (req, res) => {
  res.send('Welcome to the Admin Dashboard');
});

app.get('/api/task-lists/:userId', (req, res) => {
  db.all(
    `SELECT * FROM task_lists WHERE owner_id = ?`,
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(rows);
    }
  );
});

app.post('/api/create-task-list', (req, res) => {
  const { name, owner_id, is_group } = req.body;
  db.run(
    `INSERT INTO task_lists (name, owner_id, is_group) VALUES (?, ?, ?)`,
    [name, owner_id, is_group],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Task list created', taskListId: this.lastID });
    }
  );
});

app.post('/api/tasks', (req, res) => {
  const { title, description, due_date, priority, assigned_user, list_id } = req.body;
  db.run(
    `INSERT INTO tasks (title, description, due_date, priority, task_list_id) VALUES (?, ?, ?, ?, ?)`,
    [title, description, due_date, priority, list_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const taskId = this.lastID;
      db.run(
        `INSERT INTO task_assignments (task_id, user_id) VALUES (?, ?)`,
        [taskId, assigned_user],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ success: true, taskId });
        }
      );
    }
  );
});

app.post('/api/assign-task', (req, res) => {
  const { task_id, user_ids } = req.body;

  if (!task_id || !Array.isArray(user_ids) || user_ids.length === 0) {
    return res.status(400).json({ error: 'Invalid task_id or user_ids' });
  }

  const placeholders = user_ids.map(() => '(?, ?)').join(', ');
  const values = user_ids.flatMap(user_id => [task_id, user_id]);

  const sql = `INSERT OR REPLACE INTO task_assignments (task_id, user_id) VALUES ${placeholders}`;

  db.run(sql, values, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Task assigned to selected users' });
  });
});

app.get('/api/tasks', (req, res) => {
  db.all(`SELECT * FROM tasks`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/toggle-task-completed', (req, res) => {
  const { task_id, completed } = req.body;
  db.run(
    `UPDATE tasks SET completed = ? WHERE id = ?`,
    [completed ? 1 : 0, task_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.put('/api/tasks/:id/toggle-complete', (req, res) => {
  const taskId = req.params.id;
  db.get(`SELECT completed FROM tasks WHERE id = ?`, [taskId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Task not found' });

    const newStatus = row.completed ? 0 : 1;
    db.run(`UPDATE tasks SET completed = ? WHERE id = ?`, [newStatus, taskId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, newStatus });
    });
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  db.run(`DELETE FROM task_assignments WHERE task_id = ?`, [taskId], function (err) {
    if (err) return res.status(500).json({ success: false, error: err.message });

    db.run(`DELETE FROM tasks WHERE id = ?`, [taskId], function (err) {
      if (err) return res.status(500).json({ success: false, error: err.message });

      res.json({ success: true });
    });
  });
});

app.get('/api/personal-tasks', (req, res) => {
  const userId = req.user.id;
  db.all(`SELECT * FROM personal_tasks WHERE user_id = ?`, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/personal-tasks', (req, res) => {
  const { title, description, due_date, priority } = req.body;
  const userId = req.user.id;

  db.run(
    `INSERT INTO personal_tasks (user_id, title, description, due_date, priority) VALUES (?, ?, ?, ?, ?)`,
    [userId, title, description, due_date, priority],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, title, description, due_date, priority });
    }
  );
});

app.put('/api/personal-tasks/:id', (req, res) => {
  const { title, description, due_date, priority, completed } = req.body;
  const taskId = req.params.id;
  const userId = req.user.id;

  db.run(
    `UPDATE personal_tasks SET title = ?, description = ?, due_date = ?, priority = ?, completed = ? WHERE id = ? AND user_id = ?`,
    [title, description, due_date, priority, completed, taskId, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
      res.json({ message: 'Task updated' });
    }
  );
});

app.delete('/api/personal-tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const userId = req.user.id;

  db.run(
    `DELETE FROM personal_tasks WHERE id = ? AND user_id = ?`,
    [taskId, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
      res.json({ message: 'Task deleted' });
    }
  );
});

const isAdminLite = (req, res, next) => {
  const role = req.query.role || 'user';
  if (role !== 'admin') return res.status(403).json({ error: 'Access denied: Admins only' });
  next();
};

app.get('/api/users', isAdminLite, (req, res) => {
  db.all(`SELECT id, username, email FROM users`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ users: rows });
  });
});

app.get('/api/task-lists', isAdminLite, (req, res) => {
  db.all(`SELECT id, name, owner_id, is_group FROM task_lists`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ taskLists: rows });
  });
});

app.get('/api/all-tasks', isAdminLite, (req, res) => {
  const sql = `
    SELECT tasks.id, tasks.title, tasks.description, tasks.completed, tasks.due_date,
           task_lists.name AS list_name, users.username AS assigned_user
    FROM tasks
    LEFT JOIN task_lists ON tasks.task_list_id = task_lists.id
    LEFT JOIN task_assignments ON tasks.id = task_assignments.task_id
    LEFT JOIN users ON task_assignments.user_id = users.id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ tasks: rows });
  });
});

app.all('*', (req, res) => {
  res.status(404).send('404 Not Found');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  seedDemoData();
});

function seedDemoData() {
  db.serialize(() => {
    db.run(`DELETE FROM task_assignments`);
    db.run(`DELETE FROM tasks`);
    db.run(`DELETE FROM task_lists`);
    db.run(`DELETE FROM users`);

    db.run(
      `
      INSERT INTO users (username, email, password, is_admin, role) VALUES
      ('admin1', 'admin1@example.com', 'demo', 1, 'admin'),
      ('user1', 'user1@example.com', 'demo', 0, 'user'),
      ('user2', 'user2@example.com', 'demo', 0, 'user')
    `,
      function () {
        db.run(
          `
        INSERT INTO task_lists (name, owner_id, is_group) VALUES
        ('Admin Project', 1, 1),
        ('User1 List', 2, 0),
        ('User2 List', 3, 0)
      `,
          function () {
            db.run(
              `
          INSERT INTO tasks (title, description, due_date, priority, completed, task_list_id) VALUES
          ('Setup Dashboard', 'Initialize dashboard UI', '2025-06-01', 'High', 0, 1),
          ('Write Backend', 'Implement API routes', '2025-06-02', 'Medium', 0, 1),
          ('User1 Task', 'Personal task', '2025-06-03', 'Low', 0, 2),
          ('User2 Task', 'Another personal task', '2025-06-04', 'Medium', 0, 3)
        `,
              function () {
                db.run(
                  `
              INSERT INTO task_assignments (task_id, user_id) VALUES
              (1, 1),
              (2, 1),
              (3, 2),
              (4, 3)
            `
                );
              }
            );
          }
        );
      }
    );
  });
}
