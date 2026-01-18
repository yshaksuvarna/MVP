/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTableIfNotExists('notes', function (table) {
        table.increments('id').primary();
        table.string('headline').notNullable();
        table.text('description');
        table.string('file');
        table.boolean('inActive').defaultTo(0);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('notes');
};
