const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddThread = require('../../../Domains/thread/entities/AddThread');
const NewThread = require('../../../Domains/thread/entities/NewThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist thread and return new thread correctly', async () => {
      // Arrange
      // dummy userid
      const payload = {
        title: 'thread baru',
        body: 'ini sebuah thread',
      };

      const userid = 'user-123';
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await threadRepositoryPostgres.addThread(payload, userid);
      const thread = await ThreadTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return new thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'thread baru',
        body: 'ini sebuah thread',
      });

      const userid = 'user-123';
      await UsersTableTestHelper.addUser({ id: userid });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const thread = await threadRepositoryPostgres.addThread(addThread, userid);

      expect(thread).toStrictEqual(new NewThread({
        id: thread.id,
        title: thread.title,
        owner: thread.owner,
      }));
    });
  });
  describe('Verify exsist Thread function', () => {
    it('should throw NOTFOUND ERROR if thread  not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const threadId = 'thread-123';

      // Action & Assert
      await expect(threadRepositoryPostgres.validateThreadById(threadId))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NOTFOUND ERROR if thread available', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'thread baru',
        body: 'ini sebuah thread',
      });

      const userid = 'user-123';
      await UsersTableTestHelper.addUser({ id: userid });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const thread = await threadRepositoryPostgres.addThread(addThread, userid);

      // Action & Assert
      await expect(threadRepositoryPostgres.validateThreadById(thread.id))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('findThreadWithOwnerById Funtion', () => {
    it('should return detail thread correctly', async () => {
      // Arrange
      // dummy userid
      const payload = {
        id: 'thread-123',
        title: 'thread baru',
        body: 'ini sebuah thread',
        created_at: new Date().toISOString(),
      };
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      await ThreadTableTestHelper.addThread(payload);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const threadDetail = await threadRepositoryPostgres.findThreadWithOwnerById(payload.id);
      expect(threadDetail.id).toEqual(payload.id);
      expect(threadDetail.title).toEqual(payload.title);
      expect(threadDetail.body).toEqual(payload.body);
      expect(threadDetail.date).toEqual(payload.created_at);
      expect(threadDetail.username).toEqual('dicoding');
    });
  });
});
