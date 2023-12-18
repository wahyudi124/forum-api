const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return new comment correctly', async () => {
      // Arrange
      // dummy userid
      const payload = {
        content: 'ini sebuah comment',
      };

      const userid = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadTableTestHelper.addThread({ title: 'thread baru' });
      const fakeIdGenerator = () => '123'; // stub!
      const coomentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await coomentRepositoryPostgres.addComment(payload, threadId, userid);
      const comment = await CommentTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return new comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'ini sebuah content',
      });

      const userid = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: userid });
      await ThreadTableTestHelper.addThread({ id: threadId });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const comment = await commentRepositoryPostgres.addComment(addComment, threadId, userid);

      expect(comment).toStrictEqual(new NewComment({
        id: comment.id,
        content: comment.content,
        owner: comment.owner,
      }));
    });
  });
  describe('Verify exsist Comment function', () => {
    it('should throw NOTFOUND ERROR if comment  not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const commentId = 'comment-123';

      // Action & Assert
      await expect(commentRepositoryPostgres.validateCommentById(commentId))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NOTFOUND ERROR if comment available', async () => {
      const userid = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({});
      await ThreadTableTestHelper.addThread({});
      await CommentTableTestHelper.addComment({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action & Assert
      await expect(commentRepositoryPostgres.validateCommentById(commentId))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('Verify Comment Owner function', () => {
    it('should throw Authorize ERROR if comment not owner', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const commentId = 'comment-123';
      const owner = 'user-123';

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(commentId, owner))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not Authorize ERROR if comment owned', async () => {
      const userid = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({});
      await ThreadTableTestHelper.addThread({});
      await CommentTableTestHelper.addComment({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(commentId, userid))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('Delete Comment function', () => {
    it('should delete comment correctly', async () => {
      const userid = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const IsDelete = true;
      await UsersTableTestHelper.addUser({ id: userid });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({ id: commentId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action & Assert
      await expect(commentRepositoryPostgres.deleteComment(commentId, userid))
        .resolves
        .toBeUndefined();
    });

    it('should delete comment is_delete truly true', async () => {
      const userid = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userid });
      await ThreadTableTestHelper.addThread({ id: threadId });
      await CommentTableTestHelper.addComment({ id: commentId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action & Assert
      await commentRepositoryPostgres.deleteComment(commentId, userid);
      const delcomment = await commentRepositoryPostgres.findAllCommentByThreadId(threadId);
      expect(delcomment[0].is_delete).toStrictEqual(true);


    });
  });

  describe('findAllCommentByThreadId funtion', () => {
    it('Sould No Comment',async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        const userPayload = { id: 'user-123', username: 'wahyudi' };
        const threadPayload = {
          id: 'thread-123',
          title: 'sebuah judul thread',
          body: 'sebuah thread',
          owner: 'user-123',
        };

        await UsersTableTestHelper.addUser(userPayload);
        await ThreadTableTestHelper.addThread(threadPayload);

        const comments = await commentRepositoryPostgres.findAllCommentByThreadId(threadPayload.id);

        expect(Array.isArray(comments)).toBe(true); // Check if comments is an array
        expect(comments).toHaveLength(0); // Check if the array is not empty


    })

    it('should All Comment Correctly', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        const userPayload = { id: 'user-123', username: 'wahyudi' };
        const threadPayload = {
          id: 'thread-123',
          title: 'sebuah judul thread',
          body: 'sebuah thread',
          owner: 'user-123',
        };
        const commentPayload = {
          id: 'comment-123',
          content: 'sebuah komentar',
          thread: threadPayload.id,
          owner: userPayload.id,
        };

        await UsersTableTestHelper.addUser(userPayload);
        await ThreadTableTestHelper.addThread(threadPayload);
        await CommentTableTestHelper.addComment(commentPayload);

        const comments = await commentRepositoryPostgres.findAllCommentByThreadId(threadPayload.id);

        expect(Array.isArray(comments)).toBe(true);
        expect(comments[0].id).toEqual(commentPayload.id);
        expect(comments[0].username).toEqual(userPayload.username);
        expect(comments[0].content).toEqual('sebuah komentar');
        expect(comments[0].date).toBeDefined();
    });
  });
});
