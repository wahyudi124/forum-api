const AddCommentUseCase = require('../AddCommentUseCase');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/thread/ThreadRepository');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add Comment action correctly', async () => {
    const useCasePayload = {
      content: 'ini sebuah comment',
    };

    // dummy user id
    const userid = 'user-123';
    const threadId = 'thread-123';

    const mockNewComment = new NewComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockNewComment));

    mockThreadRepository.validateThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Actions

    const newComment = await addCommentUseCase.execute(useCasePayload, threadId, userid);

    expect(newComment).toStrictEqual(new NewComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    }) );

    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment({
      content: useCasePayload.content,
    }), threadId, userid);

    expect(mockThreadRepository.validateThreadById).toBeCalledWith(threadId);
  });
});
