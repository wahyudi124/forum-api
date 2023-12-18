/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadTableTestHelper = {
  async addThread({
    id = 'thread-123', title = 'thread baru', body = 'ini sebuah thread', owner = 'user-123', created_at = new Date().toISOString(),
  }) {
    const query = {
      text: 'INSERT INTO thread VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, owner, created_at],
    };

    await pool.query(query);
  },

  async findThreadById(id) {
    const query = {
      text: 'SELECT * FROM thread WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM thread WHERE 1=1');
  },
};

module.exports = ThreadTableTestHelper;
