const AddThreadUseCase = require('../AddThreadUseCase');
const AddThread = require('../../../Domains/thread/entities/AddThread');
const NewThread = require('../../../Domains/thread/entities/NewThread');
const ThreadRepository = require('../../../Domains/thread/ThreadRepository');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add user action correctly', async () => {
    const useCasePayload = {
      title: 'thread baru',
      body: 'ini adalah thread baru',
    };

    // dummy user id
    const userid = 'user-123';

    const mockNewThread = new NewThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockNewThread));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Actions

    const newThread = await addThreadUseCase.execute(useCasePayload, userid);

    expect(newThread).toStrictEqual(new NewThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: 'user-123',
    }));

    expect(mockThreadRepository.addThread).toBeCalledWith(new AddThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
    }), userid);
  });
});
