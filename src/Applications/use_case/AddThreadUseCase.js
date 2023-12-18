const AddThread = require('../../Domains/thread/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, owner) {
    const addThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(addThread, owner);
  }
}

module.exports = AddThreadUseCase;
