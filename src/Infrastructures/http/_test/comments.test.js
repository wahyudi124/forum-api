const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/comments endpoint', () => {
    afterAll(async () => {
      await pool.end();
    });
  
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });
    
    describe('when POST /threads add comment', () => {
      it('should response 201 and persisted comment', async () => {
        // Arrange
        const server = await createServer(container);
  
        // Add Comment Payload
        const addCommentPayload = {
          content: 'ini sebuah comment',
        };
  
        // add User
        await server.inject({
          method: 'POST',
          url: '/users',
          payload: {
            username: 'dicoding',
            password: 'secret',
            fullname: 'Dicoding Indonesia',
          },
        });
  
        // user login
        const loginResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'dicoding',
            password: 'secret',
          },
        });
  
        // Add Thread
        const newthread = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: {
            title: 'thread baru',
            body: 'ini sebuah thread',
          },
          headers: {
            Authorization: `Bearer ${loginResponse.result.data.accessToken}`,
          },
        });
        // Actions
        const response = await server.inject({
          method: 'POST',
          url: `/threads/${newthread.result.data.addedThread.id}/comments`,
          payload: addCommentPayload,
          headers: {
            Authorization: `Bearer ${loginResponse.result.data.accessToken}`,
          },
        });
  
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.addedComment.id).toBeDefined();
        expect(responseJson.data.addedComment.content).toBeDefined();
        expect(responseJson.data.addedComment.owner).toBeDefined();
      });
    });
  
    describe('when DELETE comment', () => {
      it('should response 200 and persisted comment', async () => {
        // Arrange
        const server = await createServer(container);
  
        // add User
        await server.inject({
          method: 'POST',
          url: '/users',
          payload: {
            username: 'dicoding',
            password: 'secret',
            fullname: 'Dicoding Indonesia',
          },
        });
  
        // user login
        const loginResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'dicoding',
            password: 'secret',
          },
        });
  
        // Add Thread
        const newthread = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: {
            title: 'thread baru',
            body: 'ini sebuah thread',
          },
          headers: {
            Authorization: `Bearer ${loginResponse.result.data.accessToken}`,
          },
        });
        // Add Comment
        const newComment = await server.inject({
          method: 'POST',
          url: `/threads/${newthread.result.data.addedThread.id}/comments`,
          payload: { content: 'ini sebuah comment' },
          headers: {
            Authorization: `Bearer ${loginResponse.result.data.accessToken}`,
          },
        });
  
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${newthread.result.data.addedThread.id}/comments/${newComment.result.data.addedComment.id}`,
          headers: {
            Authorization: `Bearer ${loginResponse.result.data.accessToken}`,
          },
        });
  
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
      });
      it('should response if not authentication comment', async () => {
        // Arrange
        const server = await createServer(container);
  
        // add User
        await server.inject({
          method: 'POST',
          url: '/users',
          payload: {
            username: 'dicoding',
            password: 'secret',
            fullname: 'Dicoding Indonesia',
          },
        });
  
        // user login
        const loginResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'dicoding',
            password: 'secret',
          },
        });
  
        const response = await server.inject({
          method: 'DELETE',
          url: '/threads/xxx/comments/xxx',
        });
  
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toBeDefined();
      });
      it('should response if not found comment', async () => {
        // Arrange
        const server = await createServer(container);
  
        // add User
        await server.inject({
          method: 'POST',
          url: '/users',
          payload: {
            username: 'dicoding',
            password: 'secret',
            fullname: 'Dicoding Indonesia',
          },
        });
  
        // user login
        const loginResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'dicoding',
            password: 'secret',
          },
        });
        // Add Thread
        const newthread = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: {
            title: 'thread baru',
            body: 'ini sebuah thread',
          },
          headers: {
            Authorization: `Bearer ${loginResponse.result.data.accessToken}`,
          },
        });
  
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${newthread.result.data.addedThread.id}/comments/xxx`,
          headers: {
            Authorization: `Bearer ${loginResponse.result.data.accessToken}`,
          },
        });
  
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.message).toBeDefined();
      });
      it('should response if  comment not owned', async () => {
        // Arrange
        const server = await createServer(container);
  
        // add User
        await server.inject({
          method: 'POST',
          url: '/users',
          payload: {
            username: 'dicoding',
            password: 'secret',
            fullname: 'Dicoding Indonesia',
          },
        });
        // add user 2
        await server.inject({
          method: 'POST',
          url: '/users',
          payload: {
            username: 'budi',
            password: 'secret',
            fullname: 'Dicoding Indonesia',
          },
        });
  
        // user login
        const loginResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'dicoding',
            password: 'secret',
          },
        });
  
        // user2 login
        const loginResponse2 = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'budi',
            password: 'secret',
          },
        });
  
        // Add Thread
        const newthread = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: {
            title: 'thread baru',
            body: 'ini sebuah thread',
          },
          headers: {
            Authorization: `Bearer ${loginResponse.result.data.accessToken}`,
          },
        });
  
        // Add Comment
        const newComment = await server.inject({
          method: 'POST',
          url: `/threads/${newthread.result.data.addedThread.id}/comments`,
          payload: { content: 'ini sebuah comment' },
          headers: {
            Authorization: `Bearer ${loginResponse.result.data.accessToken}`,
          },
        });
  
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${newthread.result.data.addedThread.id}/comments/${newComment.result.data.addedComment.id}`,
          headers: {
            Authorization: `Bearer ${loginResponse2.result.data.accessToken}`,
          },
        });
  
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(403);
        expect(responseJson.message).toBeDefined();
      });
    });
  
    describe('when GET /thread detail with comment', () => {
      it('should response thread detail', async () => {
        // Arrange
        const server = await createServer(container);
  
        // add User
        await server.inject({
          method: 'POST',
          url: '/users',
          payload: {
            username: 'dicoding',
            password: 'secret',
            fullname: 'Dicoding Indonesia',
          },
        });
        // add user 2
        await server.inject({
          method: 'POST',
          url: '/users',
          payload: {
            username: 'budi',
            password: 'secret',
            fullname: 'Dicoding Indonesia',
          },
        });
  
        // user login
        const loginResponse = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'dicoding',
            password: 'secret',
          },
        });
  
        // user2 login
        const loginResponse2 = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: 'budi',
            password: 'secret',
          },
        });
  
        // Add Thread
        const newthread = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: {
            title: 'thread baru',
            body: 'ini sebuah thread',
          },
          headers: {
            Authorization: `Bearer ${loginResponse.result.data.accessToken}`,
          },
        });
  
        // Add Comment
        const newComment1 = await server.inject({
          method: 'POST',
          url: `/threads/${newthread.result.data.addedThread.id}/comments`,
          payload: { content: 'ini sebuah comment' },
          headers: {
            Authorization: `Bearer ${loginResponse.result.data.accessToken}`,
          },
        });
        // Add Comment2
        const newComment2 = await server.inject({
          method: 'POST',
          url: `/threads/${newthread.result.data.addedThread.id}/comments`,
          payload: { content: 'ini sebuah comment' },
          headers: {
            Authorization: `Bearer ${loginResponse.result.data.accessToken}`,
          },
        });
  
        //Arrange
        allComments = CommentsTableTestHelper.findAllCommentByThread();
  
        const response = await server.inject({
          method: 'GET',
          url: `/threads/${newthread.result.data.addedThread.id}`,
        });
  
  
        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
        const addedComment = responseJson.data.thread.comments[0];
  
        expect(addedComment.id).toBeDefined();
        expect(addedComment.username).toBeDefined();
        expect(addedComment.date).toBeDefined();
  
      });
    })
  });