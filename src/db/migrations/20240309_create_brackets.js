exports.up = function(knex) {
  return knex.schema.createTable('brackets', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.json('data').notNullable();
    table.string('user_id').notNullable();
    table.timestamps(true, true);
    table.string('status').defaultTo('pending');
    table.integer('score').defaultTo(0);
    table.json('metadata').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('brackets');
};