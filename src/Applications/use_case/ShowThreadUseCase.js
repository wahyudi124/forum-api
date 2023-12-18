class ShowThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    await this._threadRepository.validateThreadById(threadId);
    const thread = await this._threadRepository.findThreadWithOwnerById(threadId);
    const commentRawDetail = await this._commentRepository.findAllCommentByThreadId(threadId);
    const mapppedComments = commentRawDetail.map(this._changeDeletedComments);
    
    return {...thread, comments: mapppedComments}
  }


  _changeDeletedComments({
    id, username, date, content, is_delete,
  }) {
    if (is_delete) {
      return {
        id,
        username,
        date,
        content: '**komentar telah dihapus**',
      };
    }
    return {
      id,
      username,
      date,
      content,
    };
  }
}




module.exports = ShowThreadUseCase;
