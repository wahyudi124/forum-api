const ShowThreadUseCase = require('../ShowThreadUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/thread/ThreadRepository');

describe('ShowThreadUseCase', () => {
  it('should orchestrating the show Thread action correctly', async () => {
    // dummy
    const threadId = 'thread-123';

    const showdetailThread = {
      id: 'thread-123',
      title: 'thread baru',
      body: 'ini sebuah thread',
      date: 'current_date',
      username: 'dicoding',
      comments:[
        {
          id: 'comment-123',
          username: 'dicoding',
          date: 'current_date',
          content: '**komentar telah dihapus**'
        },
        {
          id: 'comment-124',
          username: 'jhon',
          date: 'current_date',
          content: 'ini sebuah comment',
        }
      ]
    };

    const mockDetailCommentWithIsDelete = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: 'current_date',
        is_delete: true,
        content: 'ini sebuah comment',
      },
      {
        id: 'comment-124',
        username: 'jhon',
        date: 'current_date',
        is_delete: false,
        content: 'ini sebuah comment',
      }
    ]

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.validateThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    mockThreadRepository.findThreadWithOwnerById = jest
      .fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'thread baru',
        body: 'ini sebuah thread',
        date: 'current_date',
        username: 'dicoding',
      }));

    mockCommentRepository.findAllCommentByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockDetailCommentWithIsDelete));

    const showThreadUseCase = new ShowThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const detailThread = await showThreadUseCase.execute(threadId);
    expect(detailThread).toStrictEqual(showdetailThread);

    expect(mockThreadRepository.validateThreadById).toBeCalledWith(threadId);
    expect(mockThreadRepository.findThreadWithOwnerById).toBeCalledWith(threadId);
    expect(mockCommentRepository.findAllCommentByThreadId).toBeCalledWith(threadId);
  });
});
