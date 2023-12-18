const CommentHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'thread',
  register: async (server, { container }) => {
    const commentHandler = new CommentHandler(container);
    server.route(routes(commentHandler));
  },
};
