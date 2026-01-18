/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Quizzes Table
    await knex.schema.createTableIfNotExists('quizzes', function (table) {
        table.increments('id').primary();
        table.string('headline').notNullable();
        table.text('description');
        table.boolean('inActive').defaultTo(0);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });

    // Questions Table
    await knex.schema.createTableIfNotExists('questions', function (table) {
        table.increments('id').primary();
        table.integer('quizId').unsigned().notNullable()
            .references('id').inTable('quizzes')
            .onDelete('CASCADE');
        table.text('questionText').notNullable();
        table.string('option1').notNullable();
        table.string('option2').notNullable();
        table.string('option3').notNullable();
        table.string('option4').notNullable();
        table.integer('correctOption').notNullable(); // 1, 2, 3, or 4
        table.boolean('inActive').defaultTo(0);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('questions');
    await knex.schema.dropTableIfExists('quizzes');
};
