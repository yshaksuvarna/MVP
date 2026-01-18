/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Articles Table
    await knex.schema.createTableIfNotExists('articles', function (table) {
        table.increments('id').primary();
        table.string('headline').notNullable();
        table.text('content').notNullable();
        table.string('image');
        table.boolean('inActive').defaultTo(0);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });

    // Subheadlines Table
    await knex.schema.createTableIfNotExists('article_subheadlines', function (table) {
        table.increments('id').primary();
        table.integer('articleId').unsigned().notNullable()
            .references('id').inTable('articles')
            .onDelete('CASCADE');
        table.string('subheadline').notNullable();
        table.boolean('inActive').defaultTo(0);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('article_subheadlines');
    await knex.schema.dropTableIfExists('articles');
};
