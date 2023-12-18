/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    is_delete: {
      type: 'BOOL',
      notNull: true,
    },
  });
  pgm.addConstraint('comments', 'fk_owner.users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('comments', 'fk_thread_id.thread.id', 'FOREIGN KEY(thread_id) REFERENCES thread(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('comments', 'fk_owner.users.id');
  pgm.dropConstraint('comments', 'fk_thread_id.thread.id');
  pgm.dropTable('comments');
};
