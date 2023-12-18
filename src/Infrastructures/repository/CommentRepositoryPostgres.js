const CommentRepository = require('../../Domains/thread/ThreadRepository');
const NewComment = require('../../Domains/comments/entities/NewComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addCommentPayload, threadId, owner) {
    const { content } = addCommentPayload;
    const id = `comment-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    const isDelete = false;
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, threadId, content, owner, createdAt, isDelete],
    };
    const result = await this._pool.query(query);
    const data = new NewComment({ ...result.rows[0] });
    return data;
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError('tidak dapat mengkases resource ini');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = $1 WHERE id = $2',
      values: [true, commentId],
    };
    await this._pool.query(query);
  }

  async validateCommentById(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async findAllCommentByThreadId(thread_id){
    const query = {
      text: 'SELECT comments.id, users.username, comments.created_at as date, comments.content, comments.is_delete FROM comments LEFT JOIN users ON users.id = comments.owner WHERE thread_id = $1 ORDER BY comments.created_at ASC',
      values: [thread_id],
    };
    const { rows } = await this._pool.query(query);
    return rows;
  }
}

module.exports = CommentRepositoryPostgres;
