const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/thread/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete Comment action correctly', async () => {
    // dummy user id
    const userid = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockThreadRepository.validateThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.validateCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert

    await expect(deleteCommentUseCase.execute(threadId, commentId, userid))
      .resolves
      .toBeUndefined();

    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(commentId, userid);
    expect(mockThreadRepository.validateThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.validateCommentById).toBeCalledWith(commentId);
  });
});
