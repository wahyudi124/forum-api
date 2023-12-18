const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/thread/ThreadRepository');
const NewThread = require('../../Domains/thread/entities/NewThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThreadPayload, owner) {
    const { title, body } = addThreadPayload;
    const id = `thread-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO thread VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, owner, createdAt],
    };
    const result = await this._pool.query(query);
    return new NewThread({ ...result.rows[0] });
  }

  async validateThreadById(threadId) {
    const query = {
      text: 'SELECT * FROM thread WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async findThreadWithOwnerById(threadId) {
    const query = {
      text: `SELECT thread.id, thread.title, thread.body, thread.created_at, users.username
              FROM thread 
              JOIN users ON thread.owner = users.id
              WHERE thread.id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return {
        id: result.rows[0].id,
        title: result.rows[0].title,
        body: result.rows[0].body,
        date: result.rows[0].created_at,
        username: result.rows[0].username,
      }
  }
}

module.exports = ThreadRepositoryPostgres;
