const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const ShowThreadUseCase = require('../../../../Applications/use_case/ShowThreadUseCase')

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentOnThreadHandler = this.postCommentOnThreadHandler.bind(this);
    this.deleteCommentOnThreadHandler = this.deleteCommentOnThreadHandler.bind(this);
    this.getAllCommentOnThreadHandler = this.getAllCommentOnThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { id: userId } = request.auth.credentials;
    const newThread = await addThreadUseCase.execute(request.payload, userId);
    const response = h.response({
      status: 'success',
      data: {
        addedThread: newThread,
      },
    });
    response.code(201);
    return response;
  }

  async postCommentOnThreadHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const { id: userId } = request.auth.credentials;
    const { threadId } = request.params;
    const newComment = await addCommentUseCase.execute(request.payload, threadId, userId);
    const response = h.response({
      status: 'success',
      data: {
        addedComment: newComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentOnThreadHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    await deleteCommentUseCase.execute(threadId, commentId, userId);
    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }

  async getAllCommentOnThreadHandler(request,h){
    const showThreadUseCase = this._container.getInstance(ShowThreadUseCase.name);
    const {threadId} = request.params;
    const datas = await showThreadUseCase.execute(threadId);
    const response = h.response({
      status: 'success',
      data: {thread : datas}
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadHandler;
